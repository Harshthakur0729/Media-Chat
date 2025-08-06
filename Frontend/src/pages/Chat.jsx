import React, { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { ImAttachment } from "react-icons/im";
import { MdInsertEmoticon } from "react-icons/md";
import { IoIosMic, IoIosMicOff } from "react-icons/io";
import { FaSackDollar } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import socket from "../template/Socket.io";
import EmojiPicker from "emoji-picker-react";

export default function Chat() {
  const [attachments, setAttachments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);


  const [isMicOn, setIsMicOn] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [activeMsgMenu, setActiveMsgMenu] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editInput, setEditInput] = useState("");



















  const [emojiOpen, setEmojiOpen] = useState(false);
  const [messageWithEmoji, setMessageWithEmoji] = useState("");
  const emojiRef = useRef(null);

  // Add emoji to message input
  const handleEmojiClick = (emojiData) => {
    setMessageWithEmoji((prev) => prev + emojiData.emoji);
    setEmojiOpen(false);
  };
















  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const chunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        chunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
            type: "audio/webm",
          });
          setRecordedAudio(audioFile);
          stream.getTracks().forEach((track) => track.stop()); // Mic release
        };

        // Start Recording
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setIsMicOn(false);
        setRecordingTime(0);

        // Timer Start
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Mic access denied", err);
        Swal.fire("Error", "Please allow microphone access!", "error");
      }
    } else {
      // Stop Recording
      mediaRecorder?.stop();
      setIsRecording(false);
      setIsMicOn(true);

      // Stop timer
      clearInterval(recordingIntervalRef.current);
    }
  };






















  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const headerMenuRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setHeaderMenuOpen(false);
      }
      if (!e.target.closest(".msg-menu")) {
        setActiveMsgMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
          { withCredentials: true }
        );
        setLoggedInUser(res.data.user);
        socket.emit("join", res.data.user._id);
      } catch {
        Swal.fire("Error", "Please login again", "error");
      }
    };
    fetchCurrentUser();
  }, []);

  // Socket listeners for online users
  useEffect(() => {
    socket.on("onlineUsers", (onlineIds) => setOnlineUsers(onlineIds));
    socket.on("userOnline", (userId) =>
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    );
    socket.on("userOffline", (userId) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    );

    return () => {
      socket.off("onlineUsers");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, []);

  // Fetch users list
  useEffect(() => {
    if (!loggedInUser?._id) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/all/users`,
          { withCredentials: true }
        );
        const allUsers = res.data.users || [];
        setUsers(allUsers.filter((u) => u._id !== loggedInUser._id));
      } catch {
        Swal.fire("Error", "Failed to fetch users", "error");
      }
    };
    fetchUsers();
  }, [loggedInUser]);





  // Auto-select user from URL
  useEffect(() => {
    if (!selectedUser && users.length) {
      const foundUser = id && users.find((u) => u._id === id);
      if (foundUser) setSelectedUser(foundUser);
    }
  }, [id, users]);


  // Fetch conversation function
  const fetchConversation = async (receiverId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/conversation/${loggedInUser._id}/${receiverId}`,
        { withCredentials: true }
      );
      setMessages(res.data.messages || []);
      setTimeout(() => scrollToBottom(false), 200);
    } catch (error) {
      console.error("Conversation fetch error:", error);
    }
  };


  // Fetch conversation when user changes
  useEffect(() => {
    if (selectedUser && loggedInUser?._id) {
      fetchConversation(selectedUser._id);

      // Reset unread count
      setUnreadCounts((prev) => {
        const updated = { ...prev };
        delete updated[selectedUser._id];
        return updated;
      });
    }
  }, [selectedUser, loggedInUser]);




  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      const isCurrentChat =
        selectedUser &&
        (msg.sender === selectedUser._id || msg.receiver === selectedUser._id);

      setMessages((prev) => {
        // ✅ Duplicate check
        const exists = prev.some(
          (m) => m._id === msg._id || (msg.tempId && m.tempId === msg.tempId)
        );
        if (exists) return prev;

        // ✅ Append only if current chat
        return isCurrentChat ? [...prev, msg] : prev;
      });

      if (!isCurrentChat) {
        // ✅ Update user list and unread counts in background
        setUsers((prev) =>
          prev.map((u) =>
            u._id === msg.sender ? { ...u, lastMessage: msg.message } : u
          )
        );
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }

      if (isCurrentChat) {
        setTimeout(() => scrollToBottom(true), 100);
      }
    };

    const handleEdited = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMsg._id ? updatedMsg : msg))
      );
    };

    const handleDeleted = (msgId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
    };

    // ✅ Attach once
    socket.on("receiverMessage", handleReceive);
    socket.on("messageEdited", handleEdited);
    socket.on("messageDeleted", handleDeleted);

    return () => {
      socket.off("receiverMessage", handleReceive);
      socket.off("messageEdited", handleEdited);
      socket.off("messageDeleted", handleDeleted);
    };
  }, [socket, selectedUser?._id]);

















  // Send message
  const sendMessage = async () => {
    if (
      (!message || message.trim() === "") &&
      attachments.length === 0 &&
      !recordedAudio
    )
      return;
    if (!selectedUser || !loggedInUser?._id) return;

    const allAttachments = [...attachments];
    if (recordedAudio) {
      allAttachments.push(recordedAudio);
    }
    const tempId = Date.now();
    const tempMsg = {
      _id: tempId,
      tempId,
      sender: loggedInUser._id,
      receiver: selectedUser._id,
      messageType: allAttachments.length > 0 ? "file" : "text",
      message,
      files: allAttachments.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("image")
          ? "image"
          : file.type.startsWith("video")
            ? "video"
            : file.type.startsWith("audio")
              ? "audio"
              : "document",
        progress: 0,
      })),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setUsers((prev) =>
      prev.map((u) =>
        u._id === selectedUser._id
          ? { ...u, lastMessage: message || "Attachment" }
          : u
      )
    );

    const formData = new FormData();
    formData.append("receiverId", selectedUser._id);
    formData.append("message", message);

    allAttachments.forEach((file) => {
      formData.append("files", file);
    });

    setMessage("");
    setAttachments([]);
    setRecordedAudio(null);
    setTimeout(() => scrollToBottom(true), 100);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload/files`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setMessages((prev) =>
              prev.map((msg) =>
                msg.tempId === tempId
                  ? {
                    ...msg,
                    files: msg.files.map((file) => ({
                      ...file,
                      progress: percent,
                    })),
                  }
                  : msg
              )
            );
          },
        }
      );

      const newMessage = res.data.message;

      setMessages((prev) =>
        prev.map((msg) => (msg.tempId === tempId ? newMessage : msg))
      );


    } catch (error) {
      console.error("Message send failed:", error);
      Swal.fire("Error", "Message send failed", "error");
    }
  };





  // Wrap text
  const wrapText = (text) => {
    const words = text.split(" ");
    let result = "";
    let line = "";
    words.forEach((word) => {
      if ((line + " " + word).trim().split(" ").length > 8 || word.length > 20) {
        result += line.trim() + "\n";
        line = word;
      } else {
        line += " " + word;
      }
    });
    return result + (line ? line.trim() : "");
  };

  const handleClearChat = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/clear/${selectedUser._id}`,
        { withCredentials: true }
      );
      setMessages([]);
      Swal.fire("Success", "Chat cleared", "success");
      setHeaderMenuOpen(false);
    } catch {
      Swal.fire("Error", "Failed to clear chat", "error");
    }
  };

  const handleDeleteForMe = async (msgId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete/me/${msgId}`,
        { withCredentials: true }
      );
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setActiveMsgMenu(null);
    } catch {
      Swal.fire("Error", "Delete for me failed", "error");
    }
  };

  const handleDeleteForEveryone = async (msgId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete/everyone/${msgId}`,
        { withCredentials: true }
      );

      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setActiveMsgMenu(null);
      socket.emit("deleteMessage", { msgId });
    } catch {
      Swal.fire("Error", "Delete for everyone failed", "error");
    }
  };


  const handleEditMessage = (msg) => {
    setEditingMsgId(msg._id);
    setEditInput(msg.message);
    setActiveMsgMenu(null);
  };

  const submitEditMessage = async (msgId) => {
    if (!editInput.trim()) return;

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/edit/message/${msgId}`,
        { message: editInput },
        { withCredentials: true }
      );

      const updatedMsg = res.data.updatedMessage; // Backend se latest message lo
      if (!updatedMsg) {
        Swal.fire("Error", "Update failed", "error");
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? updatedMsg : m))
      );
      socket.emit("editMessage", updatedMsg);
      await fetchConversation(selectedUser._id);

      setEditingMsgId(null);
      setEditInput("");
    } catch (error) {
      Swal.fire("Error", "Failed to edit message", "error");
    }
  };







  return (
    <div className="flex w-screen h-[32rem] bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-1/4 bg-white shadow-lg flex flex-col border-r h-full`}
      >
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold">Chats</h2>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✖
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {users.map((user) => {
            const unreadCount = unreadCounts[user._id] || 0;
            const lastMsg = user.lastMessage
              ? user.lastMessage.length > 12
                ? user.lastMessage.slice(0, 12) + "..."
                : user.lastMessage
              : "No messages yet";

            return (
              <div
                key={user._id}
                onClick={() => {
                  setSelectedUser(user);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b transition 
                  ${selectedUser?._id === user._id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                  }`}
              >
                <img
                  src={user.profileImage || "https://via.placeholder.com/50"}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border"
                />

                <div className="flex-1 flex justify-between items-center">
                  <div className="flex flex-col items-start">
                    <h1 className="text-sm font-semibold text-gray-800">
                      {user.username}
                    </h1>
                    <p className="text-xs text-gray-500 truncate max-w-[80px]">
                      {lastMsg}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full mb-1">
                      {`Message +${unreadCount}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 bg-white flex flex-col h-full relative">
        {!isSidebarOpen && (
          <button
            className="absolute top-2 left-2 md:hidden bg-blue-500 text-white px-3 py-1 rounded-full"
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedUser.profileImage ||
                    "https://via.placeholder.com/50"
                  }
                  alt={selectedUser.username}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h1 className="text-base font-semibold text-gray-800">
                    {selectedUser.username}
                  </h1>
                  <h1 className="text-xs text-gray-500">
                    {onlineUsers.includes(selectedUser._id)
                      ? "Online"
                      : "Offline"}
                  </h1>
                </div>
              </div>

              {/* Header Menu */}
              <div className="relative" ref={headerMenuRef}>
                <BsThreeDotsVertical
                  className="cursor-pointer text-gray-600 hover:text-gray-800"
                  onClick={() => setHeaderMenuOpen((p) => !p)}
                />
                {headerMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border shadow-md rounded-md z-10">
                    <p
                      onClick={handleClearChat}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Clear Chat
                    </p>
                  </div>
                )}
              </div>
            </div>







            {/* Chat Messages */}

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 scrollbar-hide">
              {messages
                // ✅ Duplicate Filter
                .filter(
                  (msg, index, self) =>
                    index === self.findIndex((m) => (m._id || `msg-${index}`) === (msg._id || `msg-${index}`))
                )
                .map((msg, index) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isSender = senderId === loggedInUser?._id;

                  const total = messages.length;
                  const menuPosition =
                    index < 2
                      ? "mt-2"
                      : index >= total - 2
                        ? "-translate-y-full mb-2"
                        : "mt-2";

                  return (
                    <div
                      key={msg._id || `msg-${index}`}
                      className={`flex ${isSender ? "justify-end" : "justify-start"} relative group`}
                    >
                      {/* Chat Bubble */}
                      <div
                        className={`px-3 py-2 rounded-2xl max-w-xs break-words whitespace-pre-line shadow-md
              ${isSender ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}
                      >
                        {/* Editing Mode */}
                        {editingMsgId === msg._id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                              className="flex-1 px-2 py-1 rounded border text-black"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  submitEditMessage(msg._id);
                                }
                              }}
                            />
                            <button
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                              onClick={() => submitEditMessage(msg._id)}
                            >
                              Save
                            </button>
                            <button
                              className="text-xs bg-gray-400 text-white px-2 py-1 rounded"
                              onClick={() => setEditingMsgId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Text */}
                            {msg.messageType === "text" && wrapText(msg.message)}

                            {/* Attachments */}
                            {msg.files && msg.files.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.files.map((file, fIndex) => {
                                  const isUploading = msg.isTemp && file.progress < 100;

                                  // Image
                                  if (file.type === "image") {
                                    return (
                                      <div key={fIndex} className="relative max-w-[200px]">
                                        <img
                                          src={file.url}
                                          alt="attachment"
                                          className="rounded-xl w-full cursor-pointer"
                                          onClick={() => setPreviewFile(file)}
                                        />
                                        {isUploading && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                            <span className="text-white text-sm">{file.progress}%</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  // Video
                                  if (file.type === "video") {
                                    return (
                                      <div key={fIndex} className="relative max-w-[200px] rounded-xl overflow-hidden">
                                        <video
                                          src={file.url}
                                          className="w-full cursor-pointer"
                                          preload="metadata"
                                          onClick={() => setPreviewFile(file)}
                                        />
                                        {isUploading && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                            <span className="text-white text-sm">{file.progress}%</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  // Audio
                                  if (file.type === "audio") {
                                    return (
                                      <div key={fIndex} className="relative flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                                        <audio src={file.url} controls className="h-8" />
                                        {isUploading && (
                                          <span className="absolute right-2 text-xs text-gray-600">{file.progress}%</span>
                                        )}
                                      </div>
                                    );
                                  }

                                  // Document
                                  return (
                                    <div key={fIndex} className="relative">
                                      <div
                                        onClick={() => setPreviewFile(file)}
                                        className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          className="w-5 h-5 text-blue-600"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-sm truncate max-w-[120px]">
                                          {file.public_id || "Document"}
                                        </span>
                                      </div>
                                      {isUploading && (
                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg text-xs">
                                          {file.progress}%
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {msg.isEdited && (
                              <span className="ml-1 text-xs italic opacity-70">(edited)</span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Hover Menu */}
                      {editingMsgId !== msg._id && (
                        <div className="msg-menu absolute top-1 opacity-0 group-hover:opacity-100 transition z-50">
                          <BsThreeDotsVertical
                            className="cursor-pointer text-gray-600 hover:text-gray-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMsgMenu(activeMsgMenu === msg._id ? null : msg._id);
                            }}
                          />
                          {activeMsgMenu === msg._id && (
                            <div
                              className={`absolute w-44 bg-white border shadow-md rounded-md z-50
                    ${isSender ? "right-0" : "left-0"} ${menuPosition}`}
                            >
                              <p
                                onClick={() => handleDeleteForMe(msg._id)}
                                className="px-3 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer"
                              >
                                Delete for Me
                              </p>

                              {isSender && (
                                <>
                                  <p
                                    onClick={() => handleDeleteForEveryone(msg._id)}
                                    className="px-3 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer"
                                  >
                                    Delete Permanently
                                  </p>

                                  {msg.messageType === "text" &&
                                    (!msg.files || msg.files.length === 0) && (
                                      <p
                                        onClick={() => handleEditMessage(msg)}
                                        className="px-3 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer"
                                      >
                                        Edit Message
                                      </p>
                                    )}
                                </>
                              )}

                              <p
                                onClick={() => setActiveMsgMenu(null)}
                                className="px-3 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer"
                              >
                                Cancel
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Full-Screen Preview Modal */}
            {previewFile && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                onClick={() => setPreviewFile(null)} // ✅ Close on background click
              >
                <div
                  className="relative max-w-4xl max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()} // ❌ Stop closing when clicking inside
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering background click
                      setPreviewFile(null);
                    }}
                    className="absolute top-4 right-4 z-50 text-white bg-black/50 px-3 py-1 rounded-full text-2xl font-bold hover:bg-black/70 transition"
                  >
                    ✕
                  </button>


                  {previewFile.type === "image" && (
                    <img src={previewFile.url} alt="Preview" className="max-h-[90vh] max-w-full rounded-lg" />
                  )}

                  {previewFile.type === "video" && (
                    <video src={previewFile.url} controls autoPlay className="max-h-[90vh] max-w-full rounded-lg" />
                  )}

                  {previewFile.type === "audio" && (
                    <audio src={previewFile.url} controls autoPlay className="bg-white p-4 rounded-lg" />
                  )}

                  {previewFile.type === "document" && (
                    <iframe
                      src={previewFile.url}
                      className="w-[80vw] h-[80vh] bg-white rounded-lg"
                      title="Document Preview"
                    />
                  )}
                </div>
              </div>
            )}










            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-2">
                {attachments.map((file, index) => {
                  const isImage = file.type.startsWith("image/");
                  const isVideo = file.type.startsWith("video/");
                  const isAudio = file.type.startsWith("audio/");

                  return (
                    <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
                      {isImage && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {isVideo && (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      {isAudio && (
                        <audio
                          src={URL.createObjectURL(file)}
                          className="w-full"
                          controls
                        />
                      )}
                      {!isImage && !isVideo && !isAudio && (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 p-1">
                          {file.name.slice(0, 10)}…
                        </div>
                      )}

                      {/* Remove (Cut) Button */}
                      <button
                        onClick={() =>
                          setAttachments((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl"
                      >
                        ✖
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Audio Recording Preview (After Stop) */}
            {recordedAudio && !isRecording && (
              <div className="flex items-center gap-3 mb-3 bg-white border rounded-lg shadow px-3 py-2">
                <audio
                  src={URL.createObjectURL(recordedAudio)}
                  controls
                  className="h-8 flex-1"
                />
                <button
                  onClick={() => setRecordedAudio(null)}
                  className="text-red-500 font-bold text-lg hover:text-red-600 transition"
                  title="Delete Recording"
                >
                  ✖
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center border rounded-full px-3 py-2 gap-3 bg-gray-50 relative">

                {/* Left Icons: Attach + Emoji */}
                <div className="flex items-center gap-3 text-gray-500 relative">

                  {/* File Input (hidden) */}
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    id="fileInput"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setAttachments((prev) => [...prev, ...files]);
                      e.target.value = ""; // reset for same file selection
                    }}
                  />
                  <label htmlFor="fileInput">
                    <ImAttachment className="cursor-pointer hover:text-gray-700" />
                  </label>

                  {/* Emoji Button */}
                  <div className="relative" ref={emojiRef}>
                    <MdInsertEmoticon
                      className="cursor-pointer hover:text-gray-700"
                      onClick={() => setEmojiOpen((prev) => !prev)}
                    />

                    {emojiOpen && (
                      <div className="absolute bottom-10 left-0 z-50">
                        <EmojiPicker
                          onEmojiClick={(emojiData) =>
                            setMessage((prev) => prev + emojiData.emoji)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Recording UI */}
                {isRecording && (
                  <div className="absolute inset-x-0 -top-12 mx-auto w-fit px-4 py-2 
                  rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 
                  text-white text-sm font-medium flex items-center gap-2 
                  shadow-lg animate-pulse border border-red-300/40">

                    <span className="w-3 h-3 bg-white rounded-full animate-ping" />
                    <span className="tracking-wide">Recording...</span>
                    <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-md">
                      {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                      {String(recordingTime % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}



                {/* Message Input */}
                <input
                  type="text"
                  name="message"
                  placeholder={isRecording ? "Recording in progress..." : "Start typing..."}
                  disabled={isRecording} // Disable typing while recording
                  className="flex-1 bg-transparent focus:outline-none px-2"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                {/* Right Icons: Mic + Money + Send */}
                <div className="flex items-center gap-3 text-gray-500">
                  {isMicOn ? (
                    <IoIosMic
                      className="cursor-pointer hover:text-gray-700 text-xl"
                      onClick={handleMicClick}
                    />
                  ) : (
                    <IoIosMicOff
                      className="cursor-pointer text-red-500 hover:text-red-600 text-xl"
                      onClick={handleMicClick}
                    />
                  )}


                  <IoSend
                    className="w-6 h-6 cursor-pointer text-blue-600 hover:text-blue-800"
                    onClick={sendMessage}
                  />
                </div>
              </div>
            </div>


          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            Select a chat to start messaging
          </div>
        )
        }
      </div>
    </div>
  );
}  