import { useState, useEffect } from 'react';
import { X, Link, Search, UserPlus, Check } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL || `${API_URL}`;
export default function CreateRoomModal({ isOpen, onClose }) {
  const [roomData, setRoomData] = useState({
    name: '',
    domain: '',
    interest: ''
  });
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/api/auth/friends/${user._id || user.id}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...roomData,
          members: selectedFriends.map(f => f._id || f.id),
          createdBy: user._id || user.id,
          inviteLink
        }),
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const toggleFriendSelection = (friend) => {
    const friendId = friend._id || friend.id;
    if (selectedFriends.some(f => (f._id || f.id) === friendId)) {
      setSelectedFriends(selectedFriends.filter(f => (f._id || f.id) !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inviteLink = `teamup.com/rooms/join/${Math.random().toString(36).substring(7)}`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-gray-900 mb-6">Create New Space</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Room Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Design Ninjas"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              value={roomData.name}
              onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Domain</label>
            <input
              type="text"
              required
              placeholder="e.g. AI / UI Design"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              value={roomData.domain}
              onChange={(e) => setRoomData({ ...roomData, domain: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
              <span>Add Friends</span>
              <span className="text-emerald-600">{selectedFriends.length} selected</span>
            </label>
            
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1 pr-1">
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => {
                  const isSelected = selectedFriends.some(f => (f._id || f.id) === (friend._id || friend.id));
                  return (
                    <div 
                      key={friend._id || friend.id}
                      onClick={() => toggleFriendSelection(friend)}
                      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-gray-700 flex-1">{friend.name}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-200'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-gray-400 text-center py-4 font-bold uppercase tracking-tighter">No friends found</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 relative group">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Auto-Generated Invite Link</p>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert("Link copied!");
                }}
                className="text-emerald-700 hover:scale-110 transition-transform"
              >
                <Link className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] font-bold text-emerald-600 truncate opacity-80">{inviteLink}</p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-black text-sm hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Launch Space
          </button>
        </form>
      </div>
    </div>
  );
}
