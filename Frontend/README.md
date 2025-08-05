
// export const resetPassword = async (req, res) => {
//     try {
//         const { username, otp, newPassword } = req.body;
//         let user;

//         // 1️⃣ If logged-in user is available, fetch by req.user
//         if (req.user?._id) {
//             user = await userModel.findById(req.user._id);
//         } 
//         // 2️⃣ Else, fallback to username-based lookup (OTP Flow)
//         else if (username) {
//             user = await userModel.findOne({ username });
//         }

//         if (!user) return res.status(404).json({ message: "User not found" });

//         // If OTP is provided, verify for non-logged-in user
//         if (!req.user?._id) {
//             if (user.resetPasswordOTP !== otp) {
//                 return res.status(400).json({ message: "Invalid OTP" });
//             }
//             if (Date.now() > user.resetPasswordOTPExpire) {
//                 return res.status(400).json({ message: "OTP Expired" });
//             }
//         }

//         // Prevent using old password
//         const isSamePassword = await user.comparePassword(newPassword);
//         if (isSamePassword) {
//             return res.status(400).json({ message: "New password cannot be same as old password." });
//         }

//         // Hash and save
//         const hashing = await userModel.hashPassword(newPassword);
//         user.password = hashing;

//         // Clear OTP fields if present
//         user.resetPasswordOTP = undefined;
//         user.resetPasswordOTPExpire = undefined;

//         await user.save();

//         res.json({ message: "Password reset successful" });
//     } catch (error) {
//         console.error("Reset Password Error:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };






// login user show nhi hoga

import React, { useState, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { ImAttachment } from "react-icons/im";
import { MdInsertEmoticon } from "react-icons/md";
import { IoIosMic, IoIosMicOff } from "react-icons/io";
import { FaSackDollar } from "react-icons/fa6";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function Chat() {
    const [isMicOn, setIsMicOn] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    const { id } = useParams();
    const location = useLocation();

    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch current logged-in user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
                    { withCredentials: true }
                );
                setCurrentUser(res.data.user);
            } catch (error) {
                console.error("Profile fetch error:", error);
                Swal.fire("Error", "Failed to fetch logged-in user", "error");
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/user/all/users`,
                    { withCredentials: true }
                );
                setUsers(res.data.users || []);
            } catch (error) {
                console.error("All Users fetch error:", error);
                Swal.fire("Error", "Failed to fetch users", "error");
            }
        };

        fetchUsers();
    }, []);

    // Set selected user
    useEffect(() => {
        if (location.state) {
            setSelectedUser(location.state);
        } else if (id && users.length > 0) {
            const foundUser = users.find((u) => u._id === id);
            setSelectedUser(foundUser || null);
        }
    }, [id, location.state, users]);

    // Filtered users (exclude current user)
    const filteredUsers = currentUser
        ? users.filter((user) => user._id !== currentUser._id)
        : users;

    return (
        <div className="flex w-screen h-[32rem] bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-lg flex flex-col border-r h-full">
                <h2 className="text-lg font-bold p-4 border-b bg-gray-50">Chats</h2>

                {/* Scrollable users list */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b transition 
                                ${
                                    selectedUser?._id === user._id
                                        ? "bg-gray-100"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <img
                                    src={user.profileImage || "https://via.placeholder.com/50"}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full object-cover border"
                                />
                                <div className="flex-1">
                                    <h1 className="text-sm font-semibold text-gray-800">
                                        {user.username}
                                    </h1>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.lastMessage || "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 p-4">No other users found</p>
                    )}
                </div>
            </div>

            {/* Chat Box */}
            <div className="flex-1 bg-white flex flex-col h-full">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
                            <img
                                src={selectedUser.profileImage || "https://via.placeholder.com/50"}
                                alt={selectedUser.username}
                                className="w-12 h-12 rounded-full object-cover border"
                            />
                            <div>
                                <h1 className="text-base font-semibold text-gray-800">
                                    {selectedUser.username}
                                </h1>
                                <h1 className="text-xs text-gray-500">
                                    Last message: {selectedUser.lastMessage || "No messages yet"}
                                </h1>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 scrollbar-hide">
                            <div className="flex justify-end">
                                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs">
                                    Hello, {selectedUser.username}!
                                </div>
                            </div>

                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                                    Hi there! 👋
                                </div>
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex items-center border rounded-full px-3 py-2 gap-3 bg-gray-50">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <ImAttachment className="cursor-pointer hover:text-gray-700" />
                                    <MdInsertEmoticon className="cursor-pointer hover:text-gray-700" />
                                </div>

                                <input
                                    type="text"
                                    name="message"
                                    placeholder="Start typing..."
                                    className="flex-1 bg-transparent focus:outline-none px-2"
                                />

                                <div className="flex items-center gap-3 text-gray-500">
                                    {isMicOn ? (
                                        <IoIosMic
                                            className="cursor-pointer hover:text-gray-700"
                                            onClick={() => setIsMicOn(false)}
                                        />
                                    ) : (
                                        <IoIosMicOff
                                            className="cursor-pointer text-red-500 hover:text-red-600"
                                            onClick={() => setIsMicOn(true)}
                                        />
                                    )}
                                    <FaSackDollar className="cursor-pointer hover:text-gray-700" />
                                    <IoSend className="w-6 h-6 cursor-pointer text-blue-600 hover:text-blue-800" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}
