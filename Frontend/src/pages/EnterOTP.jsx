import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const EnterOTP = () => {
    const [formData, setFormData] = useState({
        username: "",
        newPassword: "",
        otp: "",
    });

    const navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password`,
                formData,
                { withCredentials: true }
            );
            const cookies = document.cookie;
            const hasToken = cookies.includes("token=");

            Swal.fire("Success", res.data.message || "Password reset successful!", "success")
                .then(() => {
                    if (hasToken) {
                        navigate("/profile"); // already logged in
                    } else {
                        navigate("/login"); // not logged in
                    }
                });

            setFormData({ username: "", newPassword: "", otp: "" });
        } catch (error) {
            console.error("Reset password failed:", error);

            const status = error.response?.status;
            const errorMessage =
                error.response?.data?.message || "Invalid OTP or server error.";

            // Status ke hisab se Swal type
            if (status === 400 || status === 404) {
                Swal.fire("Warning", errorMessage, "warning");
            } else {
                Swal.fire("Error", errorMessage, "error");
            }
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Set Your New Password
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInput}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={formData.newPassword}
                        onChange={handleInput}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="text"
                        name="otp"
                        placeholder="OTP"
                        value={formData.otp}
                        onChange={handleInput}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterOTP;
