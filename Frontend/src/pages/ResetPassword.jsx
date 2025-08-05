import React, { useState } from 'react';
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [userDetails, setUserDetails] = useState({ username: "", email: "" });
    const navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUserDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleForm = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password`,
                userDetails,
                { withCredentials: true }
            );

            console.log("OTP sent:", res.data);
            Swal.fire("Success", res.data.message || "OTP sent to your email!", "success").then(()=>navigate("/reset-password"));
            setUserDetails({ username: "", email: "" });
        } catch (error) {
            console.error("OTP failed:", error);

            const status = error.response?.status;
            const errorMessage = error.response?.data?.message || "Invalid credentials or server issue.";

            if (status === 404) {
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
                    Enter your username and email to reset password
                </h1>

                <form onSubmit={handleForm} className="space-y-4">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userDetails.username}
                        onChange={handleInput}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userDetails.email}
                        onChange={handleInput}
                        required
                    />

                    <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
