import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { FcGoogle } from "react-icons/fc"; // 👈 Google Icon import
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [userDetails, setUserDetails] = useState({
        identifier: "",
        password: ""
    });
    const navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUserDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUserDetails({
            identifier: "",
            password: ""
        })

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/login`,
                userDetails,
                { withCredentials: true }
            );

            console.log("Login success:", res.data);
            Swal.fire("Success", res.data.message || "Logged In successful!", "success").then(() => navigate('/'))

        } catch (error) {
            console.error("Login failed:", error);
            const errorMessage = error.response?.data?.message || "Invalid credentials or server issue.";
            Swal.fire("Error", errorMessage, "error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-5 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/1029/1029183.png"
                        alt="Logo"
                        className="w-12 h-12 mb-2"
                    />
                    <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                    <p className="mt-1 text-sm text-gray-500 text-center">
                        Login to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username or Email
                        </label>
                        <input
                            type="text"
                            name="identifier"
                            placeholder="Username or Email"
                            className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userDetails.identifier}
                            onChange={handleInput}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userDetails.password}
                            onChange={handleInput}
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Reset Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        Sign In
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-300"></div>
                    <span className="px-2 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow h-px bg-gray-300"></div>
                </div>

                {/* Google Login Button */}
                <button
                    className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-200"
                >
                    <FcGoogle className="text-xl mr-2" /> Login with Google
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don’t have an account yet?{" "}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
