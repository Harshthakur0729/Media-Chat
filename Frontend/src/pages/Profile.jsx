import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Profile = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        bio: "",
        profileImage: "https://via.placeholder.com/150",
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const fetchUser = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
                { withCredentials: true }
            );
            setUser(res.data.user);
        } catch (error) {
            console.error("Profile fetch error:", error);
            Swal.fire("Error", "Failed to fetch profile data", "error");
        }
    };

    // Fetch user profile on mount
    useEffect(() => {
        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const resetPasswordFields = () => {
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            Object.entries(user).forEach(([key, value]) => {
                formData.append(key, value || "");
            });

            if (imageFile) formData.append("profileImage", imageFile);

            // Password update
            if (passwordData.newPassword) {
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    Swal.fire("Error", "New passwords do not match", "error");
                    return;
                }
                formData.append("oldPassword", passwordData.oldPassword);
                formData.append("newPassword", passwordData.newPassword);
            }

            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/update/profile`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            Swal.fire("Success", res.data.message || "Profile updated!", "success");
            setUser(res.data.user);
            setIsEditing(false);
            setImageFile(null);
            setImagePreview(null);
            resetPasswordFields();
        } catch (error) {
            console.error("Update error:", error);
            Swal.fire("Error", error.response?.data?.message || "Profile update failed", "error");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
        resetPasswordFields();
        fetchUser(); // reset fields to original
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
        }
    };

    const handleLogout = async () => {
        const confirm = await Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to logout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Logout",
        });

        if (confirm.isConfirmed) {
            try {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/user/logout`,
                    {},
                    { withCredentials: true }
                );
                Swal.fire("Logged Out", "You have been logged out.", "success").then(() =>
                    navigate("/login")
                );
            } catch (error) {
                Swal.fire("Error", "Logout failed", "error");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-6">
            <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8 flex space-x-10">

                {/* Left Side - Profile Image */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-md overflow-hidden">
                        <img
                            src={imagePreview || user.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {isEditing && (
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-3 text-sm border-2 border-gray-300 rounded-lg px-2 py-1 cursor-pointer 
                            file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 
                            file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            placeholder="Upload Image"
                            onChange={handleImageChange}
                        />
                    )}

                    {/* Logout Button */}
                    {!isEditing && (
                        <button
                            onClick={handleLogout}
                            className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition"
                        >
                            Logout
                        </button>
                    )}
                </div>

                {/* Right Side - Details */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                        <div className="flex space-x-3">
                            {isEditing && (
                                <button
                                    onClick={handleCancel}
                                    className="px-5 py-2 rounded-full text-white shadow transition-all duration-200 bg-gray-500 hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleEditToggle}
                                className={`px-5 py-2 rounded-full text-white shadow transition-all duration-200 ${isEditing
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {isEditing ? "Save Changes" : "Edit Profile"}
                            </button>
                        </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="space-y-5">
                        {[
                            { label: "First Name", key: "firstName", type: "text" },
                            { label: "Last Name", key: "lastName", type: "text" },
                            { label: "Username", key: "username", type: "text" },
                            { label: "Email", key: "email", type: "email" },
                            { label: "Phone Number", key: "phone", type: "text" },
                            { label: "Bio", key: "bio", type: "text" },
                        ].map((field) => (
                            <div key={field.key}>
                                <p className="text-gray-500 text-sm mb-1">{field.label}</p>
                                {isEditing ? (
                                    <input
                                        type={field.type}
                                        name={field.key}
                                        value={user[field.key] || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                    />
                                ) : (
                                    <p className="font-medium text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">
                                        {user[field.key] || "—"}
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Password Fields */}
                        {isEditing && (
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Old Password</p>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={passwordData.oldPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">New Password</p>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Confirm Password</p>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <Link
                                    to="/forgot-password"
                                    onClick={resetPasswordFields}
                                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
                                >
                                    Reset Password
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
