import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Bell, 
  ArrowLeft, 
  X, 
  Settings, 
  MessageSquare, 
  UserPlus,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function FriendsChat({ initialFriendId }) {
  const [userData, setUserData] = useState({ _id: '', name: 'You', initial: 'Y' });
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsedUser = JSON.parse(rawUser);
        const userId = parsedUser._id || parsedUser.id;
        setUserData({
          _id: userId,
          name: parsedUser.name || 'You',
          initial: (parsedUser.name?.charAt(0) || 'Y').toUpperCase()
        });
        socket.emit("join_room", userId);
        fetchFriends(userId);
        fetchRooms();
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
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
      console.error("Error joining rooms in friends chat:", err);
    }
  };

  const fetchFriends = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/friends/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
        if (initialFriendId) {
          const friend = data.find(f => (f._id || f.id) === initialFriendId);
          if (friend) setSelectedFriend(friend);
        } else if (data.length > 0 && !selectedFriend) {
          setSelectedFriend(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  useEffect(() => {
    if (selectedFriend && userData._id) {
      const friendId = selectedFriend._id || selectedFriend.id;
      fetchChatHistory(friendId);
      
      // Clear unread counts for selected friend
      setUnreadCounts(prev => ({
        ...prev,
        [friendId]: 0
      }));
    }
  }, [selectedFriend, userData._id]);

  const fetchChatHistory = async (otherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/personal/${userData._id}/${otherId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data.map(msg => ({
          ...msg,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      const senderId = data.sender?._id || data.sender;
      if (senderId === userData._id) return; // Ignore own messages

      if (data.type === "personal") {
        const receiverId = data.receiver;
        
        // If message is for/from current selected friend
        const currentFriendId = selectedFriend?._id || selectedFriend?.id;
        if (senderId === currentFriendId || (senderId === userData._id && receiverId === currentFriendId)) {
          setMessages(prev => [...prev, {
            ...data,
            time: data.createdAt ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        } else {
          // If message is from someone else, increment unread count
          setUnreadCounts(prev => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1
          }));
        }
      } else if (data.type === "community") {
        const roomId = data.room || 'general';
        setUnreadCounts(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1
        }));
      }
    });

    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("notification");
    };
  }, [selectedFriend, userData._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    const receiverId = selectedFriend._id || selectedFriend.id;
    const msg = {
      id: Date.now().toString(),
      sender: { _id: userData._id, name: userData.name },
      content: newMessage.trim(),
      receiver: receiverId,
      type: "personal"
    };

    socket.emit("send_message", msg);
    setNewMessage('');
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
    }
  };

  const handleMarkAsRead = (notif) => {
    setNotifications(prev => prev.map(n => n === notif ? { ...n, read: true } : n));
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
        fetchFriends(userData._id);
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

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden font-sans">
      {/* Left Sidebar - Friends List */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-white">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-black text-lg text-gray-900">Messages</h2>
          <button className="p-2 hover:bg-gray-100 rounded-xl text-emerald-600 transition-colors">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search friends..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-1 px-3 no-scrollbar">
          {filteredFriends.map(friend => (
            <div 
              key={friend._id || friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${selectedFriend?._id === friend._id || selectedFriend?.id === friend.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'hover:bg-white hover:shadow-sm text-gray-600'}`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${selectedFriend?._id === friend._id || selectedFriend?.id === friend.id ? 'bg-white/20 border border-white/20' : 'bg-emerald-600 text-white'}`}>
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${selectedFriend?._id === friend._id || selectedFriend?.id === friend.id ? 'border-emerald-600 bg-white' : 'border-gray-50 bg-emerald-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className={`text-sm font-black truncate ${selectedFriend?._id === friend._id || selectedFriend?.id === friend.id ? 'text-white' : 'text-gray-900'}`}>{friend.name}</h3>
                  <span className={`text-[10px] font-bold uppercase ${selectedFriend?._id === friend._id || selectedFriend?.id === friend.id ? 'text-white/70' : 'text-gray-400'}`}>12:45 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-xs truncate ${selectedFriend?._id === friend._id || selectedFriend?.id === friend.id ? 'text-emerald-50' : 'text-gray-500'}`}>
                    {friend.personality?.label || 'Member'}
                  </p>
                  {unreadCounts[friend._id || friend.id] > 0 && (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${selectedFriend?._id === friend._id || selectedFriend?.id === friend.id ? 'bg-white text-emerald-600 shadow-white/20' : 'bg-emerald-600 text-white shadow-emerald-600/20'}`}>
                      {unreadCounts[friend._id || friend.id] > 9 ? '9+' : unreadCounts[friend._id || friend.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white shadow-sm">
              {userData.initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-gray-900 truncate">{userData.name}</div>
              <div className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Online</div>
            </div>
            <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedFriend ? (
          <>
            <header className="h-16 px-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4 min-w-0">
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl mr-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white shadow-sm">
                    {selectedFriend.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-gray-900 truncate leading-none mb-1">{selectedFriend.name}</h2>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Active Now</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all hidden sm:block">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all hidden sm:block">
                  <Video className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-100 mx-1 hidden sm:block" />
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
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
                <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gray-50/30">
              {messages.map((msg, i) => {
                const isMe = msg.sender?._id === userData._id || msg.sender === userData._id;
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-3xl shadow-sm text-sm font-medium leading-relaxed ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}`}>
                      {renderMessageContent(msg.content, isMe)}
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mt-1.5 px-2">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </main>

            <footer className="p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 focus-within:bg-white transition-all flex items-center pl-4 pr-2 py-2 gap-3">
                <button type="button" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                  <X className="w-5 h-5 rotate-45" />
                </button>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Write a message to ${selectedFriend.name}...`}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 py-2.5 text-sm font-medium placeholder-gray-400 resize-none max-h-32 no-scrollbar"
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-xl transition-all ${newMessage.trim() ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95' : 'text-gray-300'}`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-emerald-100 shadow-sm duration-1000">
              <MessageSquare className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Select a Conversation</h2>
            <p className="text-gray-500 max-w-xs font-medium">Pick a friend from the left sidebar to start sharing your thoughts and projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
