import { useState } from 'react';
import { X, Link } from 'lucide-react';

export default function CreateRoomModal({ isOpen, onClose }) {
  const [roomData, setRoomData] = useState({
    name: '',
    members: '2',
    domain: '',
    interest: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  const inviteLink = `teamup.com/rooms/join/${Math.random().toString(36).substring(7)}`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-200 relative border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Create Room</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Room Name</label>
            <input
              type="text"
              required
              placeholder="Enter name"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={roomData.name}
              onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Members</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                value={roomData.members}
                onChange={(e) => setRoomData({ ...roomData, members: e.target.value })}
              >
                {[2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Domain</label>
              <input
                type="text"
                placeholder="e.g. AI"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                value={roomData.domain}
                onChange={(e) => setRoomData({ ...roomData, domain: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Invite Link</p>
              <button 
                type="button"
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <Link className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] font-medium text-emerald-600 truncate opacity-80">{inviteLink}</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-[0.98]"
          >
            Create Room
          </button>
        </form>
      </div>
    </div>
  );
}
