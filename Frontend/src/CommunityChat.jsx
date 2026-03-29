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
  ChevronDown
} from 'lucide-react';

const MOCK_CHANNELS = [
  { id: '1', name: 'general', type: 'text', category: 'General' },
  { id: '2', name: 'gaming', type: 'text', category: 'Interests' },
  { id: '3', name: 'study-group', type: 'text', category: 'Interests' },
  { id: '4', name: 'projects', type: 'text', category: 'Work' },
  { id: '5', name: 'off-topic', type: 'text', category: 'General' },
];

const MOCK_USERS = [
  { id: '1', name: 'Alice Smith', status: 'online', role: 'Admin', initial: 'A', bio: 'Passionate developer and gamer.' },
  { id: '2', name: 'Bob Johnson', status: 'online', role: 'Moderator', initial: 'B', bio: 'Loves teaching and helping others.' },
  { id: '3', name: 'Charlie Brown', status: 'idle', role: 'Member', initial: 'C', bio: 'Just here to learn.' },
  { id: '4', name: 'Diana Prince', status: 'offline', role: 'Member', initial: 'D', bio: 'Nature lover.' },
];

const MOCK_MESSAGES = [
  { id: '1', user: 'Alice Smith', content: 'Hey everyone! Welcome to the TeamUp community chat.', time: '10:00 AM', initial: 'A', color: 'bg-emerald-600' },
  { id: '2', user: 'Bob Johnson', content: 'Hi Alice! Great to be here. Any projects we are starting today?', time: '10:02 AM', initial: 'B', color: 'bg-blue-600' },
  { id: '3', user: 'Charlie Brown', content: 'I was thinking of starting a new React study group.', time: '10:05 AM', initial: 'C', color: 'bg-purple-600' },
];

export default function CommunityChat() {
  const [activeChannel, setActiveChannel] = useState(MOCK_CHANNELS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserListOpen, setIsUserListOpen] = useState(true);
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});
  const [newPrivateMessage, setNewPrivateMessage] = useState('');
  const [chatSize, setChatSize] = useState({ width: 320, height: 450 });
  const [isResizing, setIsResizing] = useState(false);
  const chatEndRef = useRef(null);
  const privateChatEndRef = useRef(null);
  const resizeRef = useRef(null);

  const [userData, setUserData] = useState({ 
    name: 'You', 
    initial: 'Y', 
    profileImage: null 
  });

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
        setUserData({
          name: parsedUser.name || 'You',
          initial: (parsedUser.name?.charAt(0) || 'Y').toUpperCase(),
          profileImage: parsedUser.profileImage || null
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

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
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now().toString(),
      user: userData.name,
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      initial: userData.initial,
      isMe: true,
      color: 'bg-emerald-700'
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const handleSendPrivateMessage = (e) => {
    e.preventDefault();
    if (!newPrivateMessage.trim() || !privateChatUser) return;

    const msg = {
      id: Date.now().toString(),
      user: userData.name,
      content: newPrivateMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      initial: userData.initial,
      isMe: true
    };

    const userId = privateChatUser.id || privateChatUser.name;
    setPrivateMessages(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), msg]
    }));
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

  return (
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden font-sans">
      {/* Sidebar - Clean Light Theme */}
      <div className="w-64 md:w-72 bg-gray-50 border-r border-gray-200 flex flex-col hidden sm:flex">
        {/* Header */}
        <div className="h-16 px-4 flex items-center border-b border-gray-200">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="p-2 hover:bg-gray-200 rounded-xl text-gray-500 transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Back to Dashboard</span>
          </button>
        </div>

        {/* Channel Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {['General', 'Interests', 'Work'].map(category => (
            <div key={category}>
              <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{category}</h3>
              <div className="space-y-1">
                {MOCK_CHANNELS.filter(c => c.category === category).map(channel => (
                  <div 
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`flex items-center px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 group ${activeChannel.id === channel.id ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <Hash className={`w-4 h-4 mr-3 ${activeChannel.id === channel.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className="font-semibold text-sm">{channel.name}</span>
                    {activeChannel.id === channel.id && <div className="ml-auto w-1.5 h-1.5 bg-emerald-600 rounded-full" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User Status Card */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div 
              className="relative cursor-pointer group"
              onClick={() => handlePfpClick({ name: userData.name, initial: userData.initial, role: 'You', bio: 'This is your profile' })}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
                {userData.initial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{userData.name}</div>
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Active Now</div>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Main Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="p-2 hover:bg-gray-100 rounded-xl sm:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Hash className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 truncate">{activeChannel.name}</h2>
              <p className="text-[10px] text-gray-400 font-medium">Welcome to the {activeChannel.name} discussion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="bg-gray-50 text-sm pl-10 pr-4 py-2 rounded-xl w-48 lg:w-64 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none border border-transparent transition-all"
              />
            </div>
            <button 
              onClick={() => setIsUserListOpen(!isUserListOpen)}
              className={`p-2 rounded-xl transition-colors ${isUserListOpen ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages List */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Welcome Intro */}
          <div className="py-10 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
              <Hash className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to #{activeChannel.name}!</h1>
            <p className="text-gray-500 leading-relaxed">This is the beginning of a great conversation. Start by saying hello to your fellow TeamUp members!</p>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Today</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-4 group">
              <div 
                className={`w-12 h-12 rounded-2xl ${msg.color || 'bg-emerald-600'} flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => handlePfpClick({ name: msg.user, initial: msg.initial, status: 'online', role: 'Member', bio: 'TeamUp Community member.' })}
              >
                {msg.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="font-bold text-gray-900 hover:text-emerald-700 cursor-pointer transition-colors"
                    onClick={() => handlePfpClick({ name: msg.user, initial: msg.initial, status: 'online', role: 'Member', bio: 'TeamUp Community member.' })}
                  >
                    {msg.user}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{msg.time}</span>
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 inline-block max-w-2xl border border-gray-100 shadow-sm group-hover:bg-white transition-colors">
                  <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </main>

        {/* Input Area */}
        <footer className="p-6 pt-2">
          <form 
            onSubmit={handleSendMessage}
            className="bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 focus-within:bg-white transition-all flex items-center px-4 py-2 gap-3"
          >
            <button type="button" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Type a message in #${activeChannel.name}...`}
              className="flex-1 bg-transparent border-none outline-none text-gray-800 py-3 text-[15px] placeholder-gray-400"
            />
            <div className="flex items-center gap-2">
              <button type="button" className="p-2 text-gray-400 hover:text-emerald-600 hidden md:block">
                <Mic className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className={`p-3 rounded-xl transition-all ${newMessage.trim() ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700' : 'text-gray-300'}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </footer>
      </div>

      {/* Right Sidebar - Active Members */}
      {isUserListOpen && (
        <div className="w-64 bg-gray-50 border-l border-gray-200 flex flex-col hidden lg:flex">
          <div className="h-16 px-6 flex items-center border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Active Members</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Online — {MOCK_USERS.filter(u => u.status !== 'offline').length}</h4>
              <div className="space-y-1">
                {MOCK_USERS.filter(u => u.status !== 'offline').map(user => (
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
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Offline — {MOCK_USERS.filter(u => u.status === 'offline').length}</h4>
              <div className="space-y-1">
                {MOCK_USERS.filter(u => u.status === 'offline').map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handlePfpClick(user)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer group opacity-60 grayscale-[0.5] transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-400 flex items-center justify-center font-bold text-white text-sm">
                      {user.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-500 truncate">{user.name}</div>
                      <div className="text-[10px] font-medium text-gray-400 truncate">{user.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Profile Popover */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={closeProfile}>
          <div 
            className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="h-32 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 relative">
              <button 
                onClick={closeProfile}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-all backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content Container */}
            <div className="px-8 pb-8 relative">
              {/* Avatar Section */}
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

              {/* Identity Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedUser.name}</h2>
                <p className="text-sm text-gray-400 font-semibold tracking-tight">@{selectedUser.name.toLowerCase().replace(' ', '')}</p>
              </div>
              
              {/* Info Section */}
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

                {/* Actions Section */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 group"
                    onClick={() => startPrivateChat(selectedUser)}
                  >
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Chat
                  </button>
                  <button 
                    className="flex-1 bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 active:scale-95 group"
                    onClick={() => {
                      alert(`Friend request sent to ${selectedUser.name}!`);
                      closeProfile();
                    }}
                  >
                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Connect
                  </button>
                </div>
                
                <button className="w-full text-gray-300 hover:text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] transition-all py-2 hover:bg-emerald-50 rounded-xl">
                  View Full Profile
                </button>
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
          {/* Resize Handle - Top Left (more subtle) */}
          <div 
            onMouseDown={() => setIsResizing(true)}
            className="absolute top-0 left-0 w-8 h-8 cursor-nw-resize z-20 group"
          >
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/20 group-hover:border-white/60 transition-colors" />
          </div>

          {/* Header */}
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
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
                <Settings className="w-4 h-4 opacity-70" />
              </button>
              <button 
                onClick={() => setPrivateChatUser(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 no-scrollbar min-h-0 relative">
            {(privateMessages[privateChatUser.id || privateChatUser.name] || []).map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-[14px] leading-relaxed ${
                  msg.isMe 
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-600/10' 
                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={privateChatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendPrivateMessage} className="bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 focus-within:bg-white transition-all flex items-center pl-4 pr-2 py-1.5 gap-2">
              <input 
                type="text"
                value={newPrivateMessage}
                onChange={(e) => setNewPrivateMessage(e.target.value)}
                placeholder="Aa"
                className="flex-1 bg-transparent text-[14px] py-2 outline-none text-gray-800 placeholder-gray-400 font-medium"
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
