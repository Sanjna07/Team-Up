import { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageCircle, 
  CalendarDays, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle,
  X,
  RefreshCw 
} from 'lucide-react';
import CreateRoomModal from './components/CreateRoomModal';
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || `${API_URL}`;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `${API_URL}`;

const socket = io(SOCKET_URL);

export default function Dashboard() {
  const [userData, setUserData] = useState({ 
    _id: '',
    name: 'there', 
    email: '', 
    initial: 'U', 
    profileImage: null,
    personalityTag: null
  });
  const [activeList, setActiveList] = useState('rooms');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
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
  const [events, setEvents] = useState([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  const totalRoomsUnread = rooms.reduce((sum, room) => sum + (unreadCounts[room._id] || 0), 0) + (unreadCounts['general'] || 0);
  const totalFriendsUnread = friends.reduce((sum, friend) => sum + (unreadCounts[friend._id] || 0), 0);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        const userId = parsedUser._id || parsedUser.id;
        if (parsedUser?.name) {
          setUserData({
            _id: userId,
            name: parsedUser.name,
            email: parsedUser.email || '',
            initial: parsedUser.name.trim().charAt(0).toUpperCase() || 'U',
            profileImage: parsedUser.profileImage || null,
            personalityTag: parsedUser.personality?.label || null
          });
          
          socket.emit("join_room", userId);
          fetchFriends(userId);
        }
      }
      
      // Fetch dynamic rooms
      fetchRooms();
      // Fetch events
      fetchEvents();
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  const fetchEvents = async () => {
    setIsEventsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/events/upcoming`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEvents(result.data);
        }
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsEventsLoading(false);
    }
  };

  useEffect(() => {
    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev]);
      if (data.type === "friend_accepted") {
        fetchFriends(userData._id);
      }
    });

    socket.on("refresh_friends", () => {
      fetchFriends(userData._id);
    });

    socket.on("receive_message", (data) => {
      console.log("New message in dashboard:", data);
      const { type, room, sender } = data;
      const senderId = sender?._id || sender;
      
      // Don't count our own messages
      if (senderId === userData._id) return;

      if (type === "community") {
        const roomId = room || 'general';
        setUnreadCounts(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1
        }));
      } else if (type === "personal") {
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    });

    return () => {
      socket.off("notification");
      socket.off("refresh_friends");
      socket.off("receive_message");
    };
  }, [userData._id]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`);
      const data = await response.json();
      
      const rawUser = localStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      const userId = user?._id || user?.id;

      // Filter rooms user is a member of for the dashboard list
      const joinedRooms = data.filter(room => 
        room.members?.some(m => (m._id || m) === userId)
      );
      setRooms(joinedRooms);
      
      // Join rooms user is a member of for notifications
      joinedRooms.forEach(room => {
        socket.emit("join_room", room._id);
      });
      // Always join 'general'
      socket.emit("join_room", "general");
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchFriends = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/auth/friends/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const handleAcceptFriend = async (notif) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/friend-request/accept`, {
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
        fetchFriends(userData._id);
        alert("Friend request accepted!");
      }
    } catch (err) {
      console.error("Error accepting friend:", err);
    }
  };

  const handleDeclineFriend = async (notif) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/friend-request/decline`, {
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

  const handleRemoveNotification = (notif) => {
    setNotifications(prev => prev.filter(n => n !== notif));
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
    } else if (notif.type === "friend_request") {
      setActiveList('friends');
      setShowNotifications(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center cursor-pointer">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              Team
            </h1>
            <img
              src="https://res.cloudinary.com/dx0r0pbgb/image/upload/v1771960017/output-onlinepngtools_yyxzd0.png"
              alt="TeamUp Logo"
              className="ml-1 w-8 h-12"
            />
          </a>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-[60]">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-900">Notifications</p>
                    {notifications.some(n => !n.read) && (
                      <button 
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map((notif, i) => (
                        <div 
                          key={i} 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer group relative ${notif.read ? 'opacity-60' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-medium text-gray-900 flex-1">{notif.content}</p>
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
                          <p className="text-[10px] text-gray-400 mt-1">{new Date().toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="w-11 h-11 rounded-full bg-emerald-700 text-white font-semibold flex items-center justify-center overflow-hidden border-2 border-emerald-50"
              >
                {userData.profileImage ? (
                  <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userData.initial
                )}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                      {userData.profileImage ? (
                        <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userData.initial
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{userData.name}</p>
                      <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                    </div>
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'My Profile', icon: User, path: '/profile' },
                      { label: 'Community Chat', icon: MessageCircle, path: '/community' },
                      { label: 'Settings', icon: Settings, path: '/settings' },
                      { label: 'Help', icon: HelpCircle, path: '/contact' }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (item.path) {
                            window.location.href = item.path;
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                      >
                        <item.icon className="w-4 h-4 text-gray-400" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-2xl lg:text-3xl uppercase tracking-widest text-emerald-700 font-semibold">Welcome , </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {userData.name}
            </h2>
            {userData.personalityTag && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full mb-1">
                {userData.personalityTag}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button 
              onClick={() => window.location.href = '/community'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors relative"
            >
              <MessageCircle className="w-4 h-4" />
              Community Chat
              {totalRoomsUnread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-lg shadow-emerald-600/20 ">
                  {totalRoomsUnread > 9 ? '9+' : totalRoomsUnread}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsCreateRoomOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              Create Room
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-widest text-emerald-700 font-semibold">
                    Upcoming events and hackathons
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <CalendarDays className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-2xl font-semibold text-gray-900">Stay on track</h3>
                  </div>
                </div>
                <button 
                  onClick={fetchEvents}
                  disabled={isEventsLoading}
                  className={`p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all ${isEventsLoading ? 'animate-spin' : ''}`}
                  title="Refresh events"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto pr-2 no-scrollbar space-y-4">
                {isEventsLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 font-medium">Surfing the web for hackathons...</p>
                  </div>
                ) : events.length > 0 ? (
                  events.slice(0, 15).map((event) => (
                    <div key={event._id} className="flex items-center justify-between border border-emerald-100 rounded-2xl px-4 py-3 hover:shadow-sm transition-shadow group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-emerald-700 font-bold uppercase tracking-tight">
                          Deadline: {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                        </p>
                        <p className="text-gray-800 font-bold truncate pr-2" title={event.title}>{event.title}</p>
                        <div className="mt-1 space-y-0.5">
                           <p className="text-[11px] text-gray-500 font-medium">
                             <span className="font-bold text-gray-700">Location:</span> {event.location && event.location !== "Unknown" ? event.location : "Location not specified"}
                           </p>
                           <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
                             Source: {event.source}
                           </p>
                        </div>
                      </div>
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 border border-emerald-200 px-5 py-2 rounded-xl text-sm font-black hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 shadow-sm"
                      >
                        Link
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No upcoming events found. Try refreshing!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Find teammates</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our matchmaking feature helps you find the perfect collaborators fast.
              </p>
              <button 
                onClick={() => window.location.href = '/matchmaking'}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Explore matches
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-3">
                Know your working style
              </p>
              <p className="text-gray-600 mb-3 max-w-sm mx-auto">
                Discover how you collaborate best and match with teammates who complement you. So take a personality Test .
              </p>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Get tailored insights on roles, communication style, and team fit.
              </p>
              <button 
                onClick={() => window.location.href = '/quiz'}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-lg font-medium transition-colors mx-auto"
              >
                Take quiz
              </button>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-widest text-emerald-700 font-semibold">My Space </p>
                  <h3 className="text-2xl font-semibold text-gray-900 mt-2"></h3>
                </div>
                <div className="relative flex bg-emerald-50 rounded-full p-1">
                  <div
                    className={`absolute top-1 left-1 h-8 w-24 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      activeList === 'friends' ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  />
                  <button
                    onClick={() => setActiveList('rooms')}
                    className={`relative z-10 w-24 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      activeList === 'rooms' ? 'text-emerald-700' : 'text-emerald-600'
                    }`}
                  >
                    Rooms
                    {totalRoomsUnread > 0 && (
                      <span className="w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {totalRoomsUnread > 9 ? '9+' : totalRoomsUnread}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveList('friends')}
                    className={`relative z-10 w-24 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      activeList === 'friends' ? 'text-emerald-700' : 'text-emerald-600'
                    }`}
                  >
                    Friends
                    {totalFriendsUnread > 0 && (
                      <span className="w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {totalFriendsUnread > 9 ? '9+' : totalFriendsUnread}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div
                className={`space-y-4 transition-all duration-300 ${
                  activeList === 'rooms' ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-100'
                }`}
              >
                {activeList === 'rooms'
                  ? rooms.length > 0 ? rooms.map((room) => (
                      <div key={room._id} className="flex items-center gap-4 border border-emerald-100 rounded-2xl px-4 py-3 hover:bg-emerald-50 transition-colors cursor-pointer group relative" onClick={() => window.location.href = `/community/${room._id}`}>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold uppercase group-hover:bg-emerald-200 transition-colors">
                          {room.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-semibold truncate group-hover:text-emerald-700 transition-colors">{room.name}</p>
                          <p className="text-xs text-gray-600 truncate">{room.domain} • {room.membersCount} members</p>
                        </div>
                        {unreadCounts[room._id] > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            {unreadCounts[room._id] > 9 ? '9+' : unreadCounts[room._id]}
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No rooms found. Create one!</p>
                      </div>
                    )
                  : friends.length > 0 ? friends.map((friend) => (
                      <div key={friend._id} className="flex items-center gap-4 border border-emerald-100 rounded-2xl px-4 py-3 hover:bg-emerald-50 transition-colors cursor-pointer group relative" onClick={() => window.location.href = `/friends-chat/${friend._id}`}>
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold uppercase group-hover:scale-105 transition-transform">
                            {friend.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-semibold truncate group-hover:text-emerald-700 transition-colors">{friend.name}</p>
                          <p className="text-xs text-gray-600 truncate">{friend.personality?.label || 'Member'}</p>
                        </div>
                        {unreadCounts[friend._id] > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 ">
                            {unreadCounts[friend._id] > 9 ? '9+' : unreadCounts[friend._id]}
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No friends yet. Connect with people in community chat!</p>
                      </div>
                    )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <CreateRoomModal 
        isOpen={isCreateRoomOpen} 
        onClose={() => setIsCreateRoomOpen(false)} 
      />
    </div>
  );
}
