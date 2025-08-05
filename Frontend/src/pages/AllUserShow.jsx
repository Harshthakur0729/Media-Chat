import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AllUserShow = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/user/all/users`,
                    { withCredentials: true }
                );

                setUsers(res.data.users); // backend se array aa rahi hai
            } catch (error) {
                console.error("All Users fetch error:", error);
                Swal.fire("Error", "Failed to fetch users", "error");
            }
        };

        fetchUsers();
    }, []);

    const handleUserClick = (user) => {
        navigate(`/chat/${user._id}`, { state: user }); // Corrected _id
    };

    return (
        <div className="flex justify-center items-center w-full h-[32rem] bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/2 bg-white shadow-lg flex flex-col border-r h-full rounded-lg">
                <h2 className="text-lg font-bold p-4 border-b bg-gray-50 text-center">
                    Chats
                </h2>

                {/* Scrollable users list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => handleUserClick(user)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b"
                            >
                                <img
                                    src={user.profileImage || "https://via.placeholder.com/50"}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full object-cover border"
                                />
                                <div className="flex-1">
                                    <h1 className="text-sm font-semibold text-gray-800">
                                        {user.username || "Unknown"}
                                    </h1>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.lastMessage || "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 p-4">No users found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllUserShow;
