import { useState, useEffect } from 'react';
import { Bell, MessageCircle, CalendarDays, LogOut, User, Settings, HelpCircle } from 'lucide-react';

export default function Dashboard() {
  const [userData, setUserData] = useState({ name: 'there', email: '', initial: 'U' });
  const [activeList, setActiveList] = useState('rooms');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        if (parsedUser?.name) {
          setUserData({
            name: parsedUser.name,
            email: parsedUser.email || '',
            initial: parsedUser.name.trim().charAt(0).toUpperCase() || 'U'
          });
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

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
            <button className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="w-11 h-11 rounded-full bg-emerald-700 text-white font-semibold flex items-center justify-center"
              >
                {userData.initial}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'My Profile', icon: User },
                      { label: 'Settings', icon: Settings },
                      { label: 'Help', icon: HelpCircle }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setIsProfileOpen(false)}
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
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors">
              <MessageCircle className="w-4 h-4" />
              Community Chat
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors">
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
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Hack the Future Summit', date: 'Apr 18', url: '#' },
                  { name: 'AI Build Week', date: 'Apr 27', url: '#' },
                  { name: 'Green Tech Sprint', date: 'May 05', url: '#' },
                  { name: 'Fintech Fusion Hack', date: 'May 22', url: '#' },
                ].map((event) => (
                  <div key={event.name} className="flex items-center justify-between border border-emerald-100 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-sm text-emerald-700 font-semibold">{event.date}</p>
                      <p className="text-gray-800 font-medium">{event.name}</p>
                    </div>
                    <a
                      href={event.url}
                      className="text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors"
                    >
                      Link
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Find teammates</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our matchmaking feature helps you find the perfect collaborators fast.
              </p>
              <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg font-medium transition-colors">
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
              <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-lg font-medium transition-colors mx-auto">
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
                    className={`relative z-10 w-24 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      activeList === 'rooms' ? 'text-emerald-700' : 'text-emerald-600'
                    }`}
                  >
                    Rooms
                  </button>
                  <button
                    onClick={() => setActiveList('friends')}
                    className={`relative z-10 w-24 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      activeList === 'friends' ? 'text-emerald-700' : 'text-emerald-600'
                    }`}
                  >
                    Friends
                  </button>
                </div>
              </div>
              <div
                className={`space-y-4 transition-all duration-300 ${
                  activeList === 'rooms' ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-100'
                }`}
              >
                {activeList === 'rooms'
                  ? ['Prototype Sprint', 'Design Circle', 'Late Night Build'].map((room) => (
                      <div key={room} className="flex items-center gap-4 border border-emerald-100 rounded-2xl px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                          {room.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold">{room}</p>
                          <p className="text-sm text-gray-600">Active now</p>
                        </div>
                      </div>
                    ))
                  : [
                      {
                        name: 'Aanya Kapoor',
                        tag: 'Night Owl',
                        status: 'Building now',
                        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                      },
                      {
                        name: 'Rishi Mehta',
                        tag: 'Problem Solver',
                        status: 'Available to chat',
                        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                      },
                      {
                        name: 'Neha Singh',
                        tag: 'Creative Mind',
                        status: 'Working on idea',
                        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
                      },
                    ].map((friend) => (
                      <div key={friend.name} className="flex items-center gap-4 border border-emerald-100 rounded-2xl px-4 py-3">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-gray-800 font-semibold">{friend.name}</p>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-100">
                              {friend.tag}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{friend.status}</p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
