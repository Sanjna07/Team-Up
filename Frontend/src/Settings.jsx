import { useState } from 'react';
import { 
  ArrowLeft, Bell, Lock, Shield, Smartphone, Globe, Save, 
  Trash2, User, Palette, Info, HelpCircle, ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      messages: true,
      teamUpdates: true
    },
    privacy: {
      publicProfile: true,
      showSkills: true,
      showLinkedIn: true,
      showGithub: true
    },
    appearance: {
      darkMode: false,
      compactView: false
    },
    language: 'English'
  });

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Preferences saved successfully' });
      setLoading(false);
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete account');

      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setShowDeleteConfirm(false);
    }
  };

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'platform', label: 'App & Platform', icon: Smartphone },
    { id: 'help', label: 'Help & Info', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar Nav */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 hidden lg:block">
        <div className="p-8">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-800 transition-colors group mb-10"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Dashboard
          </button>

          <h1 className="text-2xl font-black text-gray-900 mb-8 px-2">Settings</h1>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-8 lg:p-12 max-w-5xl">
        <div className="mb-10 lg:hidden">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 text-emerald-700 font-bold mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl text-sm font-bold border ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-12">
          {/* Section: Notifications */}
          {activeTab === 'notifications' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8">
                <h2 className="text-xl font-black text-gray-900 mb-2">Notification Preferences</h2>
                <p className="text-gray-500 font-medium">Choose how you want to be notified about updates</p>
              </div>
              <div className="grid gap-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-emerald-100 transition-all">
                    <div>
                      <p className="font-bold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">Receive notifications via {key}</p>
                    </div>
                    <button
                      onClick={() => handleToggle('notifications', key)}
                      className={`w-14 h-8 rounded-full transition-all relative ${value ? 'bg-emerald-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-7' : 'translate-x-1.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Privacy */}
          {activeTab === 'privacy' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8">
                <h2 className="text-xl font-black text-gray-900 mb-2">Privacy & Visibility</h2>
                <p className="text-gray-500 font-medium">Control what others can see on the platform</p>
              </div>
              <div className="grid gap-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-emerald-100 transition-all">
                    <p className="font-bold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <button
                      onClick={() => handleToggle('privacy', key)}
                      className={`w-14 h-8 rounded-full transition-all relative ${value ? 'bg-emerald-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-7' : 'translate-x-1.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Appearance */}
          {activeTab === 'appearance' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8">
                <h2 className="text-xl font-black text-gray-900 mb-2">Appearance Settings</h2>
                <p className="text-gray-500 font-medium">Customize your interface for better productivity</p>
              </div>
              <div className="grid gap-4">
                {Object.entries(settings.appearance).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-emerald-100 transition-all">
                    <p className="font-bold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <button
                      onClick={() => handleToggle('appearance', key)}
                      className={`w-14 h-8 rounded-full transition-all relative ${value ? 'bg-emerald-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-7' : 'translate-x-1.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Platform */}
          {activeTab === 'platform' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8">
                <h2 className="text-xl font-black text-gray-900 mb-2">App & Platform</h2>
                <p className="text-gray-500 font-medium">Global settings for your TeamUp experience</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Preferred Language</p>
                    <p className="text-sm text-gray-500 font-medium">System default language</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <select 
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="bg-transparent text-sm font-bold text-emerald-700 outline-none cursor-pointer"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Action Button */}
          {activeTab !== 'help' && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-10 py-4 bg-emerald-700 text-white rounded-2xl font-black hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mobile Delete Button */}
          <div className="lg:hidden pt-12 border-t">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-3 p-6 rounded-3xl text-red-500 bg-red-50 font-black hover:bg-red-100 transition-all"
            >
              <Trash2 className="w-6 h-6" />
              Delete Account Permanently
            </button>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-3xl font-black text-center text-gray-900 mb-4 leading-tight">Wait, don't go!</h3>
            <p className="text-center text-gray-500 font-medium mb-10 leading-relaxed">
              Are you sure you want to delete your account? This will permanently remove your profile, teams, and connections. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                className="w-full py-5 bg-red-500 text-white rounded-3xl font-black hover:bg-red-600 transition-all"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-5 bg-gray-50 text-gray-500 rounded-3xl font-black hover:bg-gray-100 transition-all"
              >
                No, Keep My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
