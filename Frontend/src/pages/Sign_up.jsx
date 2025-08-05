import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Sign_up = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        firstName: "",
        lastName: "",
        username: "",
        phone: "",
        email: "",
        password: "",
    });

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUserDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e) => {
        e.preventDefault();

        // Validate all fields
        if (Object.values(userDetails).some((val) => !val)) {
            Swal.fire("Error", "All fields are required!", "error");
            return;
        }

        // Navigate to next step with form data
        navigate("/upload-image", { state: userDetails });
    };

    const handleGoogleSignup = () => {
        // Redirect user to backend Google OAuth route
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/auth/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-2xl w-full bg-white p-5 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 p-5 text-center">Register</h2>

                <form onSubmit={handleNext} className="space-y-6">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            className="w-1/2 px-4 py-2 border rounded-md"
                            value={userDetails.firstName}
                            onChange={handleInput}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            className="w-1/2 px-4 py-2 border rounded-md"
                            value={userDetails.lastName}
                            onChange={handleInput}
                            required
                        />
                    </div>

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        className="w-full px-4 py-2 border rounded-md"
                        value={userDetails.username}
                        onChange={handleInput}
                        required
                    />

                    <div className="flex space-x-4">
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            className="w-1/2 px-4 py-2 border rounded-md"
                            value={userDetails.phone}
                            onChange={handleInput}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="w-1/2 px-4 py-2 border rounded-md"
                            value={userDetails.email}
                            onChange={handleInput}
                            required
                        />
                    </div>

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded-md"
                        value={userDetails.password}
                        onChange={handleInput}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        Next
                    </button>
                </form>

                {/* Google Sign-Up Button */}
                <div className="mt-6">
                    <button
                        onClick={handleGoogleSignup}
                        className="w-full py-2 flex items-center border border-gray-300 justify-center gap-3 bg-white text-black rounded-md hover:bg-gray-100 transition duration-200"
                    >
                        <FcGoogle className="text-xl mr-2" />
                        Sign Up with Google
                    </button>
                </div>

                {/* Already have account */}
                <div className="text-center mt-4">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-blue-600 hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sign_up;
