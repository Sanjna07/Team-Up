import { useState, useEffect, useRef } from 'react';
import { 
  Hash, 
  Settings, 
  Mic, 
  Headphones, 
  Plus, 
  Users, 
  Search, 
  Send, 
  Bell,
  MoreVertical, 
  UserPlus, 
  MessageSquare, 
  ArrowLeft,
  X,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function CommunityChat({ roomId }) {
  const [activeChannel, setActiveChannel] = useState({ 
    id: roomId || 'general', 
    name: roomId ? 'Loading...' : 'General Community' 
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserListOpen, setIsUserListOpen] = useState(true);
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});
  const [newPrivateMessage, setNewPrivateMessage] = useState('');
  const [chatSize, setChatSize] = useState({ width: 320, height: 450 });
  const [isResizing, setIsResizing] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading notifications:", e);
      return [];
    }
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('unreadCounts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error loading unread counts:", e);
      return {};
    }
  });
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);

  const [userData, setUserData] = useState({ 
    _id: '',
    name: 'You', 
    initial: 'Y', 
    profileImage: null 
  });

  const isMember = roomId === 'general' || roomMembers.some(m => (m._id || m.id) === userData._id);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  const [roomDetails, setRoomDetails] = useState(roomId ? null : {
    name: 'General Community',
    domain: 'Public Discussion',
    membersCount: 0
  });
  const chatEndRef = useRef(null);
  const privateChatEndRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    if (activeChannel.id) {
      // Clear unread counts for current room
      setUnreadCounts(prev => ({
        ...prev,
        [activeChannel.id]: 0
      }));
    }
  }, [activeChannel.id]);

  useEffect(() => {
    if (privateChatUser) {
      const otherId = privateChatUser.id || privateChatUser._id;
      // Clear unread counts for private chat friend
      setUnreadCounts(prev => ({
        ...prev,
        [otherId]: 0
      }));
    }
  }, [privateChatUser]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(280, window.innerWidth - e.clientX - 24);
      const newHeight = Math.max(350, window.innerHeight - e.clientY - 24);
      
      setChatSize({
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsedUser = JSON.parse(rawUser);
        const userId = parsedUser._id || parsedUser.id;
        setUserData({
          _id: userId,
          name: parsedUser.name || 'You',
          initial: (parsedUser.name?.charAt(0) || 'Y').toUpperCase(),
          profileImage: parsedUser.profileImage || null
        });

        socket.emit("join_room", userId);
        fetchRooms(); // Join other rooms for notifications
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Fetch all users for the sidebar
    fetchUsers();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms');
      const data = await response.json();
      
      const rawUser = localStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      const userId = user?._id || user?.id;

      data.forEach(room => {
        const isMember = room.members?.some(m => (m._id || m) === userId);
        if (isMember) {
          socket.emit("join_room", room._id);
        }
      });
      socket.emit("join_room", "general");
    } catch (err) {
      console.error("Error joining rooms in community chat:", err);
    }
  };

  useEffect(() => {
    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/users");
      const data = await response.json();
      setAllUsers(data.map(u => ({
        ...u,
        id: u._id,
        initial: u.name.charAt(0).toUpperCase(),
        status: 'online', // Mocking online status for now
        role: u.personality?.label || 'Member',
        bio: u.bio || 'TeamUp Community member.'
      })));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (roomId && roomId !== 'general') {
      fetchRoomDetails(roomId);
    } else {
      // If no roomId or roomId is 'general', show General Community and use all users as members
      setActiveChannel({ id: 'general', name: 'General Community' });
      setRoomDetails({
        name: 'General Community',
        domain: 'Public Discussion',
        membersCount: allUsers.length
      });
      setRoomMembers(allUsers);
    }
  }, [roomId, allUsers]);

  const fetchRoomDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRoomDetails(data);
        setActiveChannel({ id: data._id, name: data.name });
        
        // Update room members list
        if (data.members) {
          setRoomMembers(data.members.map(u => ({
            ...u,
            id: u._id,
            initial: u.name.charAt(0).toUpperCase(),
            status: 'online', // Mocking online for now
            role: u.personality?.label || 'Member',
            bio: u.bio || 'TeamUp Community member.'
          })));
        }
      }
    } catch (err) {
      console.error("Error fetching room details:", err);
    }
  };

  useEffect(() => {
    if (activeChannel.id && isMember) {
      socket.emit("join_room", activeChannel.id);
      fetchCommunityHistory(activeChannel.id);
    } else {
      setMessages([]); // Clear messages if not a member
    }
  }, [activeChannel.id, isMember]);

  useEffect(() => {
    if (privateChatUser && userData._id) {
      fetchPersonalHistory(privateChatUser.id || privateChatUser._id);
    }
  }, [privateChatUser, userData._id]);

  const fetchCommunityHistory = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/community/${roomId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedMsgs = data.map(msg => ({
          ...msg,
          user: msg.sender?.name,
          initial: msg.sender?.name?.charAt(0).toUpperCase(),
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formattedMsgs);
      }
    } catch (err) {
      console.error("Error fetching community history:", err);
    }
  };

  const fetchPersonalHistory = async (otherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/personal/${userData._id}/${otherId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedMsgs = data.map(msg => ({
          ...msg,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setPrivateMessages(prev => ({
          ...prev,
          [otherId]: formattedMsgs
        }));
      }
    } catch (err) {
      console.error("Error fetching personal history:", err);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("Message received from socket:", data);
      const formattedMsg = {
        ...data,
        user: data.user || data.sender?.name,
        initial: data.initial || (data.user || data.sender?.name)?.charAt(0).toUpperCase(),
        time: data.createdAt ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : data.time
      };

      if (data.type === "community") {
        if (data.room === activeChannel.id) {
          setMessages(prev => [...prev, formattedMsg]);
        } else {
          const roomId = data.room || 'general';
          setUnreadCounts(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1
          }));
        }
      } else if (data.type === "personal") {
        const senderId = data.sender?._id || data.sender;
        const otherId = senderId === userData._id ? data.receiver : senderId;
        
        const isCurrentPrivateChat = privateChatUser && (privateChatUser.id === otherId || privateChatUser._id === otherId);

        if (isCurrentPrivateChat) {
          setPrivateMessages(prev => ({
            ...prev,
            [otherId]: [...(prev[otherId] || []), formattedMsg]
          }));
        } else if (senderId !== userData._id) {
          setUnreadCounts(prev => ({
            ...prev,
            [otherId]: (prev[otherId] || 0) + 1
          }));
        }
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [activeChannel, privateChatUser, userData._id]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    privateChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [privateMessages, privateChatUser]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !isMember) return;

    const msg = {
      id: Date.now().toString(),
      sender: {
        _id: userData._id,
        name: userData.name
      },
      user: userData.name,
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      initial: userData.initial,
      room: activeChannel.id,
      type: "community"
    };

    socket.emit("send_message", msg);
    setNewMessage('');
  };

  const handleSendPrivateMessage = (e) => {
    if (e) e.preventDefault();
    if (!newPrivateMessage.trim() || !privateChatUser) return;

    const receiverId = privateChatUser._id || privateChatUser.id;
    const msg = {
      id: Date.now().toString(),
      sender: {
        _id: userData._id,
        name: userData.name
      },
      user: userData.name,
      content: newPrivateMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      initial: userData.initial,
      receiver: receiverId,
      type: "personal"
    };

    socket.emit("send_message", msg);
    setNewPrivateMessage('');
  };

  const handlePfpClick = (user) => {
    setSelectedUser(user);
  };

  const closeProfile = () => {
    setSelectedUser(null);
  };

  const startPrivateChat = (user) => {
    setPrivateChatUser(user);
    setSelectedUser(null);
  };

  const handleConnect = async (user) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromId: userData._id, toId: user._id || user.id })
      });

      if (response.ok) {
        socket.emit("send_friend_request", {
          fromUser: { _id: userData._id, name: userData.name },
          toId: user._id || user.id
        });
        alert("Friend request sent!");
        closeProfile();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to send request");
      }
    } catch (err) {
      console.error("Error connecting:", err);
    }
  };

  const handleAcceptFriend = async (notif) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/friend-request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData._id, fromId: notif.fromId })
      });

      if (response.ok) {
        socket.emit("accept_friend_request", {
          fromId: notif.fromId,
          toUser: { _id: userData._id, name: userData.name }
        });
        setNotifications(prev => prev.filter(n => n !== notif));
        alert("Friend request accepted!");
      }
    } catch (err) {
      console.error("Error accepting friend:", err);
    }
  };

  const handleDeclineFriend = async (notif) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/friend-request/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData._id, fromId: notif.fromId })
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n !== notif));
        alert("Friend request declined.");
      }
    } catch (err) {
      console.error("Error declining friend:", err);
    }
  };

  const handleMarkAsRead = (notif) => {
    setNotifications(prev => prev.map(n => n === notif ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (notif) => {
    if (!notif) return;

    // Mark as read when clicked
    handleMarkAsRead(notif);

    if (notif.type === "community") {
      window.location.href = `/community/${notif.roomId || 'general'}`;
    } else if (notif.type === "personal") {
      if (notif.senderId) {
        window.location.href = `/friends-chat/${notif.senderId}`;
      }
    }
  };

  const handleRemoveNotification = (notif) => {
    setNotifications(prev => prev.filter(n => n !== notif));
  };

  const handleLeaveRoom = async () => {
    if (!roomId || roomId === 'general') return;
    
    if (window.confirm("Are you sure you want to leave this room?")) {
      try {
        const response = await fetch("http://localhost:5000/api/rooms/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, userId: userData._id })
        });

        if (response.ok) {
          socket.emit("leave_room", roomId);
          alert("You have left the room.");
          window.location.href = "/dashboard";
        } else {
          const data = await response.json();
          alert(data.message || "Failed to leave room");
        }
      } catch (err) {
        console.error("Error leaving room:", err);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId || roomId === 'general') return;
    
    try {
      const response = await fetch("http://localhost:5000/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userId: userData._id })
      });

      if (response.ok) {
        alert("You have joined the room!");
        fetchRoomDetails(roomId); // Refresh room members
      } else {
        const data = await response.json();
        alert(data.message || "Failed to join room");
      }
    } catch (err) {
      console.error("Error joining room:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const renderMessageContent = (content, isMe) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`${isMe ? 'text-emerald-100 hover:text-white' : 'text-emerald-600 hover:underline'} underline font-bold break-all`}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'community') {
        handleSendMessage();
      } else {
        handleSendPrivateMessage();
      }
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Main Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="p-2.5 hover:bg-gray-100 rounded-2xl text-gray-500 transition-all group flex items-center gap-2"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Hash className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 truncate">{activeChannel.name}</h2>
              <p className="text-[10px] text-gray-400 font-medium">
                {roomDetails ? `${roomDetails.domain} • ${roomDetails.membersCount} members` : "Loading discussion..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsUserListOpen(!isUserListOpen)}
              className={`p-2 rounded-xl transition-colors ${isUserListOpen ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Users className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl transition-colors relative ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[60] text-left animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Notifications</p>
                    {notifications.some(n => !n.read) && (
                      <button 
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">No new alerts</p>
                      </div>
                    ) : (
                      notifications.map((notif, i) => (
                        <div 
                          key={i} 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                          className={`px-5 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group relative ${notif.read ? 'opacity-60' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors leading-tight flex-1">{notif.content}</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveNotification(notif); }}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {notif.type === "friend_request" && (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAcceptFriend(notif); }}
                                  className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeclineFriend(notif); }}
                                  className="px-3 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {!notif.read && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif); }}
                                className="text-[10px] font-bold text-emerald-600 hover:underline uppercase"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Messages List */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {isMember ? (
            <>
              {messages.map((msg) => {
                const isMe = msg.sender?._id === userData._id || msg.sender === userData._id;
                return (
                  <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div 
                      className={`w-12 h-12 rounded-2xl ${msg.color || (isMe ? 'bg-emerald-700' : 'bg-emerald-600')} flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm cursor-pointer hover:scale-105 transition-transform`}
                      onClick={() => !isMe && handlePfpClick({ 
                        _id: msg.sender?._id || msg.sender,
                        id: msg.sender?._id || msg.sender,
                        name: msg.user || msg.sender?.name, 
                        initial: msg.initial || (msg.user || msg.sender?.name)?.charAt(0).toUpperCase(), 
                        status: 'online', 
                        role: 'Member', 
                        bio: 'TeamUp Community member.' 
                      })}
                    >
                      {msg.initial || (msg.user || msg.sender?.name)?.charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex-1 min-w-0 ${isMe ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                        <span 
                          className="font-bold text-gray-900 hover:text-emerald-700 cursor-pointer transition-colors"
                          onClick={() => !isMe && handlePfpClick({ 
                            _id: msg.sender?._id || msg.sender,
                            id: msg.sender?._id || msg.sender,
                            name: msg.user || msg.sender?.name, 
                            initial: msg.initial || (msg.user || msg.sender?.name)?.charAt(0).toUpperCase(), 
                            status: 'online', 
                            role: 'Member', 
                            bio: 'TeamUp Community member.' 
                          })}
                        >
                          {msg.user || msg.sender?.name}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{msg.time}</span>
                      </div>
                      <div className={`bg-gray-50 rounded-2xl p-4 inline-block max-w-2xl border border-gray-100 shadow-sm group-hover:bg-white transition-colors ${isMe ? 'rounded-tr-none bg-emerald-50' : 'rounded-tl-none'}`}>
                        <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {renderMessageContent(msg.content, isMe)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Hash className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chat Locked</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">You must be a member of this room to view the conversation and history.</p>
              </div>
            </div>
          )}
        </main>

        {/* Input Area */}
        <footer className="p-6 pt-2">
          {isMember ? (
            <form 
              onSubmit={handleSendMessage}
              className="bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 focus-within:bg-white transition-all flex items-center px-4 py-2 gap-3"
            >
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'community')}
                placeholder={`Type a message in #${activeChannel.name}...`}
                className="flex-1 bg-transparent border-none outline-none text-gray-800 py-3 text-[15px] placeholder-gray-400 resize-none max-h-32 no-scrollbar"
                rows={1}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className={`p-3 rounded-xl transition-all ${newMessage.trim() ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700' : 'text-gray-300'}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-black text-gray-900 mb-1">Join the Conversation</h3>
                <p className="text-xs text-gray-500 font-medium">You need to be a member of this room to send messages.</p>
              </div>
              <button 
                onClick={handleJoinRoom}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
              >
                Join Room
              </button>
            </div>
          )}
        </footer>
      </div>

      {/* Right Sidebar - Active Members */}
      {isUserListOpen && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col hidden lg:flex">
          <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
            {isMemberSearchOpen ? (
              <div className="flex items-center gap-2 w-full animate-in slide-in-from-right-2 duration-200">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  autoFocus
                  placeholder="Search members..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                />
                <button onClick={() => { setIsMemberSearchOpen(false); setMemberSearchQuery(''); }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-900">Active Members</h3>
                <button 
                  onClick={() => setIsMemberSearchOpen(true)}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-emerald-600 transition-all"
                >
                  <Search className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h4 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                {memberSearchQuery ? 'Search Results' : `Members — ${roomMembers.length}`}
              </h4>
              <div className="space-y-1">
                {roomMembers
                  .filter(user => user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                  .map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handlePfpClick(user)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer group transition-all"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                        {user.initial}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-50 ${user.status === 'online' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 truncate transition-colors">{user.name}</div>
                      <div className="text-[10px] font-medium text-gray-400 truncate">{user.role}</div>
                    </div>
                    {unreadCounts[user.id || user._id] > 0 && (
                      <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 ">
                        {unreadCounts[user.id || user._id] > 9 ? '9+' : unreadCounts[user.id || user._id]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {roomId && roomId !== 'general' && isMember && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <button 
                onClick={handleLeaveRoom}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-bold text-sm transition-all group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Leave Room
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modern Profile Popover */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={closeProfile}>
          <div 
            className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-32 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 relative">
              <button 
                onClick={closeProfile}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-all backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-8 pb-8 relative">
              <div className="flex justify-between items-end -mt-12 mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-emerald-600 border-[6px] border-white flex items-center justify-center text-4xl font-black text-white shadow-xl overflow-hidden transition-transform group-hover:scale-105 duration-300">
                    {selectedUser.initial}
                  </div>
                  {selectedUser.status && (
                    <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${selectedUser.status === 'online' ? 'bg-emerald-500' : selectedUser.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                  )}
                </div>
                <div className="pb-1">
                  <span className="text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-100/50 shadow-sm">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedUser.name}</h2>
                <p className="text-sm text-gray-400 font-semibold tracking-tight">@{selectedUser.name.toLowerCase().replace(' ', '')}</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">About Me</h3>
                  <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors duration-300" />
                    <p className="text-sm text-gray-600 leading-relaxed font-medium italic pl-1">
                      "{selectedUser.bio || "This user is still crafting their story..."}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 group"
                    onClick={() => startPrivateChat(selectedUser)}
                  >
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Chat
                  </button>
                  <button 
                      className="flex-1 bg-gray-900 hover:bg-black text-white py-4 px-4 rounded-2xl font-bold transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 active:scale-95 group"
                      onClick={() => handleConnect(selectedUser)}
                    >
                      <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Connect
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Private Chat Window */}
      {privateChatUser && (
        <div 
          style={{ width: `${chatSize.width}px`, height: `${chatSize.height}px` }}
          className="fixed bottom-6 right-6 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col z-[150] animate-in slide-in-from-bottom-10 duration-300 overflow-hidden"
        >
          <div 
            onMouseDown={() => setIsResizing(true)}
            className="absolute top-0 left-0 w-8 h-8 cursor-nw-resize z-20 group"
          >
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/20 group-hover:border-white/60 transition-colors" />
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 flex items-center justify-between text-white shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg border border-white/20">
                  {privateChatUser.initial}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-emerald-600 shadow-sm" />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-black leading-none mb-1 truncate">{privateChatUser.name}</div>
                <div className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Connected</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPrivateChatUser(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 no-scrollbar min-h-0 relative">
            {(privateMessages[privateChatUser.id || privateChatUser._id] || []).map((msg) => {
              const isMe = msg.sender?._id === userData._id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-[14px] leading-relaxed ${
                    isMe 
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-600/10' 
                      : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                  }`}>
                    {renderMessageContent(msg.content, isMe)}
                  </div>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}
            <div ref={privateChatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendPrivateMessage} className="bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 focus-within:bg-white transition-all flex items-center pl-4 pr-2 py-1.5 gap-2">
              <textarea 
                value={newPrivateMessage}
                onChange={(e) => setNewPrivateMessage(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'private')}
                placeholder="Aa"
                className="flex-1 bg-transparent text-[14px] py-2 outline-none text-gray-800 placeholder-gray-400 font-medium resize-none max-h-24 no-scrollbar"
                rows={1}
              />
              <button 
                type="submit"
                disabled={!newPrivateMessage.trim()}
                className={`p-2.5 rounded-xl transition-all ${
                  newPrivateMessage.trim() 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95' 
                    : 'text-gray-300'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
