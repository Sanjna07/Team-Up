import { useState, useEffect } from 'react';
import { ArrowLeft, Search, UserPlus, MessageCircle, ChevronDown, X, Sparkles, Loader2, Github, Linkedin, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `${API_URL}`;
const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'AI', 'Tailwind',
  'FastAPI', 'UI/UX', 'Figma', 'Go', 'Docker',
  'Java', 'Spring Boot', 'SQL', 'Next.js'
].sort();

const COMMON_DOMAINS = [
  'Web Development', 'AI/ML', 'DevOps', 'Design',
  'Backend', 'Frontend', 'App Development'
].sort();

export default function Matchmaking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedSkill, selectedDomain]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedSkill) queryParams.append('skills', selectedSkill);
      if (selectedDomain) queryParams.append('domains', selectedDomain);

      // We rely on the auth token in localStorage. Make sure this key matches your app's actual localStorage key
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/api/matchmaking?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setRecommendedUsers(data.recommendations);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  // Local search filter combined with backend's returned data
  const filteredUsers = recommendedUsers.filter(user => {
    if (!searchTerm) return true;
    return user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.personality?.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleAddFriend = async (user) => {
    try {
      const currentUserStr = localStorage.getItem("user");
      if (!currentUserStr) return alert("Please log in first.");
      const currentUser = JSON.parse(currentUserStr);

      if (!friends.includes(user.id)) {
        await fetch(`${API_URL}/api/auth/friend-request`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fromId: currentUser.id || currentUser._id, toId: user.id })
        });
        setFriends([...friends, user.id]);
        alert(`Friend request sent to ${user.name}!`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send friend request.");
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setSelectedDomain('');
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-32">
      {/* Decorative blurred blobs for amazing premium feel */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-[30rem] h-[30rem] bg-teal-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      <div className="absolute -bottom-20 left-1/3 w-[40rem] h-[40rem] bg-cyan-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pt-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center gap-2 text-slate-400 font-black hover:text-emerald-700 transition-colors group text-xs uppercase tracking-widest mb-6 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-white"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <h1 className="text-6xl md:text-7xl font-black text-slate-800 tracking-tighter mb-4">
            Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Match</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> Powered by AI vectors and contextual graph networks.
          </p>
        </div>

        {/* Filters Section Component (Glassmorphism) */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-[3rem] p-6 mb-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col xl:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input
              type="text"
              placeholder="Search explicitly by name, skill, or persona..."
              className="w-full pl-16 pr-6 py-5 bg-white/50 border border-white/60 rounded-full font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-10 w-[2px] bg-slate-200 hidden xl:block" />

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto px-2">
            <div className="relative group w-full sm:w-56">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full pl-6 pr-12 py-4 bg-white/50 hover:bg-white border border-white/60 rounded-full font-bold text-slate-600 text-sm appearance-none cursor-pointer transition-all outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
              >
                <option value="">Any Skill</option>
                {COMMON_SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </div>

            <div className="relative group w-full sm:w-56">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full pl-6 pr-12 py-4 bg-white/50 hover:bg-white border border-white/60 rounded-full font-bold text-slate-600 text-sm appearance-none cursor-pointer transition-all outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
              >
                <option value="">Any Domain</option>
                {COMMON_DOMAINS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </div>

            {(searchTerm || selectedSkill || selectedDomain) && (
              <button 
                onClick={clearFilters}
                title="Clear Filters"
                className="w-14 h-14 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all flex items-center justify-center shrink-0 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              <Sparkles className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="font-bold mt-6 text-lg tracking-tight">Traversing graph embeddings to find matches...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredUsers.map((user) => {
               // Calculate display score (normalize to 100%)
               const matchPercentage = Math.min(100, Math.round(((user.scores?.total || 1) / 15) * 100));

               return (
              <div key={user.id} className="backdrop-blur-2xl bg-white/70 rounded-[2.5rem] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-500 group relative">
                 <div className="absolute top-5 right-5">
                    {user.scores?.mutualFriends > 0 && (
                        <span className="text-[10px] text-slate-500 font-bold px-3 py-1.5 bg-white/80 rounded-full shadow-sm border border-slate-100">
                            {user.scores.mutualFriends} Mutual
                        </span>
                    )}
                 </div>

                 <div className="flex flex-col items-center mb-4 pt-3">
                     <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl group-hover:border-emerald-200 transition-all duration-500 mb-3 relative">
                        <img 
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff&bold=true`} 
                          alt={user.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 tracking-tight text-center leading-none">{user.name}</h3>
                     {user.personality?.label && (
                        <span className="mt-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                           {user.personality.label}
                        </span>
                     )}
                 </div>

                 {/* Social Highlights Block ALWAYS VISIBLE */}
                 <div className="flex justify-center gap-2 mb-4 w-full">
                     <a href={user.github ? (user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`) : "#"} target="_blank" rel="noreferrer" title="GitHub" className={`p-2.5 rounded-2xl transition-all shadow-sm ${user.github ? 'bg-slate-100/80 text-slate-600 hover:bg-slate-900 hover:text-white' : 'bg-gray-50 text-gray-300 pointer-events-none'}`}>
                         <Github className="w-4 h-4" />
                     </a>
                     <a href={user.linkedIn ? (user.linkedIn.startsWith('http') ? user.linkedIn : `https://linkedin.com/in/${user.linkedIn}`) : "#"} target="_blank" rel="noreferrer" title="LinkedIn" className={`p-2.5 rounded-2xl transition-all shadow-sm ${user.linkedIn ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-gray-50 text-gray-300 pointer-events-none'}`}>
                         <Linkedin className="w-4 h-4" />
                     </a>
                 </div>

                 {/* Badges / Experience */}
                 <div className="flex flex-wrap gap-1.5 justify-center mb-5">
                    {(user.domains || []).slice(0, 1).map((domain) => (
                      <span key={domain} className="px-3 py-1 bg-slate-800 text-white rounded-lg text-[9px] font-bold shadow-sm">
                        {domain}
                      </span>
                    ))}
                    {(user.skills || []).slice(0, 3).map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black border border-emerald-100">
                        {skill}
                      </span>
                    ))}
                 </div>

                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAddFriend(user)}
                      disabled={friends.includes(user.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                        friends.includes(user.id) 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/20 hover:-translate-y-1'
                      }`}
                    >
                      {friends.includes(user.id) ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      {friends.includes(user.id) ? 'Requested' : 'Connect'}
                    </button>
                    <button 
                      onClick={() => window.location.href = `/friends-chat/${user.id}`}
                      className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all shadow-sm">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-40 backdrop-blur-2xl bg-white/40 rounded-[4rem] border-2 border-dashed border-white shadow-xl relative overflow-hidden">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Search className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">No matches found</h3>
            <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto mb-10">Try loosening your filters to connect with broader perspectives.</p>
            <button 
              onClick={clearFilters}
              className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold text-sm hover:bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-800/20"
            >
              Reset Search Parameters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
