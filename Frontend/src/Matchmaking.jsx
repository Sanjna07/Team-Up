import { useState, useEffect } from 'react';
import { ArrowLeft, Search, UserPlus, MessageCircle, ChevronDown, X, Sparkles, Loader2 } from 'lucide-react';

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

      const response = await fetch(`http://localhost:5000/api/matchmaking?${queryParams.toString()}`, {
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
      // Optioanlly make an API call to send the formal friend request
      // await fetch("http://localhost:5000/api/auth/friend-request", ...)
      if (!friends.includes(user.id)) {
        setFriends([...friends, user.id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setSelectedDomain('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 text-gray-400 font-bold hover:text-emerald-700 transition-colors group text-xs uppercase tracking-widest mb-6"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Dashboard
          </button>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Matchmaking</h1>
          <p className="text-gray-500 font-medium">Powered by AI and graph connections.</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-[2.5rem] p-4 mb-12 shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search by name or keyword..."
              className="w-full pl-14 pr-6 py-4 bg-transparent rounded-3xl font-bold text-gray-700 outline-none placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-8 w-[1px] bg-gray-100 hidden lg:block" />

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto px-2">
            <div className="relative group w-full sm:w-48">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 hover:bg-emerald-50 border-none rounded-2xl font-bold text-gray-600 text-sm appearance-none cursor-pointer transition-colors outline-none"
              >
                <option value="">Any Skill</option>
                {COMMON_SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative group w-full sm:w-48">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 hover:bg-emerald-50 border-none rounded-2xl font-bold text-gray-600 text-sm appearance-none cursor-pointer transition-colors outline-none"
              >
                <option value="">Any Domain</option>
                {COMMON_DOMAINS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {(searchTerm || selectedSkill || selectedDomain) && (
              <button 
                onClick={clearFilters}
                title="Clear Filters"
                className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-12 h-12 mb-4 animate-spin text-emerald-500" />
            <p className="font-bold">Analyzing profiles and graph connections...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredUsers.map((user) => {
               // Calculate display score (normalize to 100%)
               const matchPercentage = Math.min(100, Math.round(((user.scores?.total || 1) / 15) * 100));

               return (
              <div key={user.id} className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:shadow-emerald-100/30 transition-all duration-300 group relative overflow-hidden hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-4">
                     <div className="flex flex-col items-end gap-1">
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            {matchPercentage}% Match
                        </span>
                        {user.scores?.mutualFriends > 0 && (
                           <span className="text-[10px] text-gray-400 font-bold px-2">
                             {user.scores.mutualFriends} Mutual Friend{user.scores.mutualFriends !== 1 ? 's' : ''}
                           </span>
                        )}
                     </div>
                </div>

                <div className="flex items-start justify-between mb-8 mt-2">
                  <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-gray-50 group-hover:border-emerald-50 transition-all flex shrink-0">
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAddFriend(user)}
                      disabled={friends.includes(user.id)}
                      className={`p-3 rounded-2xl transition-all ${
                        friends.includes(user.id) 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-gray-50 text-gray-400 hover:bg-emerald-700 hover:text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-50 text-gray-400 hover:bg-emerald-700 hover:text-white rounded-2xl transition-all hover:scale-105 active:scale-95">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h3>
                    {user.personality?.label && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-white shadow-sm">
                          {user.personality.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {(user.skills || []).map((skill) => (
                      <span key={skill} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-bold border border-emerald-100 transition-colors">
                        {skill}
                      </span>
                    ))}
                    {(user.domains || []).slice(0, 2).map((domain) => (
                      <span key={domain} className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[11px] font-bold border border-gray-100 transition-colors">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No matches in sight</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">Try loosening your filters to find more potential squad members.</p>
            <button 
              onClick={clearFilters}
              className="mt-8 px-8 py-3 bg-emerald-700 text-white rounded-full font-bold text-sm hover:bg-emerald-800 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
