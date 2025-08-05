import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const UploadImage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userDetails = location.state;
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpload = async (skip = false) => {
        // ✅ Agar skip nahi hai aur image select nahi ki
        if (!skip && !image) {
            Swal.fire("Upload Image", "Please select a profile image first!", "warning");
            return;
        }

        try {
            const formData = new FormData();
            Object.entries(userDetails).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (!skip && image) {
                formData.append("profileImage", image);
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/register`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            Swal.fire("Success", res.data.message, "success");
            navigate("/login");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", error.response?.data?.message || "Registration failed", "error");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold mb-4">Upload Profile Image</h2>


                <input
                    type="file"
                    accept="image/*"
                    className=" text-sm border-2 border-gray-300 rounded-lg px-2 py-1 cursor-pointer mb-6 
                            file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 
                            file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    placeholder="Upload Image"
                    onChange={handleImageChange}
                />
                <div className="flex justify-between w-full space-x-4">
                    <button
                        onClick={() => handleUpload(true)}
                        className="w-1/2 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                    >
                        Skip
                    </button>
                    <button
                        onClick={() => handleUpload(false)}
                        className="w-1/2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Upload & Finish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadImage;
