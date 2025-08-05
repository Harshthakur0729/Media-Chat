import React, { useState, useEffect, useRef } from "react";
import { TfiMenuAlt } from "react-icons/tfi";
import { MdOutlineSearchOff } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { HiChevronDown } from "react-icons/hi";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function HeaderWithSidebar() {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState({
    username: "",
    profileImage: "https://via.placeholder.com/150",
  });

  const sidebarRef = useRef(null);
  const menuRef = useRef(null);

  // Fetch logged-in user profile
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

  useEffect(() => {
    fetchUser();

    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setShowSidebar(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = () => {
    setShowSidebar(false);
    setShowMenu(false);
  };

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/logout`,
          {},
          { withCredentials: true }
        );
        Swal.fire("Logged Out", "You have been logged out.", "success").then(
          () => (window.location.href = "/login")
        );
      } catch (error) {
        Swal.fire("Error", "Logout failed", "error");
      }
    }
  };




  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-3">
          {/* Left: Menu Icon */}
          <div
            className="text-2xl cursor-pointer hover:text-gray-600"
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            <TfiMenuAlt />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 relative" ref={menuRef}>
            {/* Search Bar */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${showSearch ? "w-72 opacity-100 mr-2" : "w-0 opacity-0"
                }`}
            >
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-300 px-3 py-1 rounded-md focus:outline-none w-full"
              />
            </div>

            {/* Search Toggle Icon */}
            <div
              className="text-2xl cursor-pointer hover:text-gray-600"
              onClick={() => setShowSearch((prev) => !prev)}
            >
              {showSearch ? <MdOutlineSearchOff /> : <FiSearch />}
            </div>

            {/* User Info (Image + Name + Arrow) */}
            <div
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <img
                src={user.profileImage}
                alt="User"
                className="w-10 h-10 rounded-full border object-cover"
              />
              <h1 className="text-sm font-medium">{user.username}</h1>
              <span
                className={`text-xl transition-transform duration-300 ${showMenu ? "rotate-180" : "rotate-0"
                  }`}
              >
                <HiChevronDown />
              </span>
            </div>

            {/* Dropdown Menu */}
            <div
              className={`absolute top-14 right-0 bg-white border shadow-lg rounded-md w-40 py-2 transition-all duration-300 ease-in-out origin-top-right transform ${showMenu
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
                }`}
            >
              <Link to="/profile">  <p
                onClick={handleOptionClick}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Profile
              </p>
              </Link>
              <p
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
              >
                Logout
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg p-[6px] font-semibold">Menu</h2>
          <button
            className="text-xl font-bold hover:text-red-500"
            onClick={() => setShowSidebar(false)}
          >
            ×
          </button>
        </div>

        {/* Sidebar Options */}
        <ul className="flex flex-col py-4">
          <Link to="/profile"> <li
            onClick={handleOptionClick}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Profile
          </li>
          </Link>
          <Link to="/">  <li
            onClick={handleOptionClick}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Dashboard
          </li>
          </Link>
          <Link to="/chat/:id">  <li
            onClick={handleOptionClick}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Messages
          </li></Link>
          <li
            onClick={handleOptionClick}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Settings
          </li>
          <li
            onClick={handleLogout}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Optional backdrop for sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </>
  );
}
