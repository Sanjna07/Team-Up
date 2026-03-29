import { useState, useEffect } from 'react';
import { ArrowLeft, Search, UserPlus, MessageCircle, ChevronDown, X, Code, Sparkles } from 'lucide-react';

const MOCK_USERS = [
  {
    id: '1',
    name: 'Aanya Kapoor',
    personality: 'Night Owl',
    skills: ['React', 'Tailwind', 'Node.js'],
    bio: 'Full-stack dev who loves building late at night.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '2',
    name: 'Rishi Mehta',
    personality: 'Code Ninja',
    skills: ['Python', 'AI', 'FastAPI'],
    bio: 'Problem solver and machine learning enthusiast.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '3',
    name: 'Neha Singh',
    personality: 'Vibe Manager',
    skills: ['UI/UX', 'Figma', 'Prototyping'],
    bio: 'Creative mind focused on clean and accessible designs.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: '4',
    name: 'Kabir Verma',
    personality: 'Speedrunner',
    skills: ['Go', 'Kubernetes', 'Docker'],
    bio: 'DevOps wizard building scalable infra at light speed.',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    id: '5',
    name: 'Ishani Roy',
    personality: 'Architect',
    skills: ['Java', 'Spring Boot', 'SQL'],
    bio: 'Loves designing complex systems and robust APIs.',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    id: '6',
    name: 'Arjun Das',
    personality: 'AI Whisperer',
    skills: ['Next.js', 'LangChain', 'OpenAI'],
    bio: 'Building the next generation of AI-powered apps.',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg'
  }
];

const ALL_SKILLS = Array.from(new Set(MOCK_USERS.flatMap(u => u.skills))).sort();
const ALL_PERSONALITIES = Array.from(new Set(MOCK_USERS.map(u => u.personality))).sort();

export default function Matchmaking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(MOCK_USERS);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const results = MOCK_USERS.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.personality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSkill = !selectedSkill || user.skills.includes(selectedSkill);
      const matchesPersonality = !selectedPersonality || user.personality === selectedPersonality;

      return matchesSearch && matchesSkill && matchesPersonality;
    });
    setFilteredUsers(results);
  }, [searchTerm, selectedSkill, selectedPersonality]);

  const handleAddFriend = (userId) => {
    if (!friends.includes(userId)) {
      setFriends([...friends, userId]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setSelectedPersonality('');
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
          <p className="text-gray-500 font-medium">Find the perfect squad based on vibe and skill</p>
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
                {ALL_SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative group w-full sm:w-48">
              <select
                value={selectedPersonality}
                onChange={(e) => setSelectedPersonality(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 hover:bg-emerald-50 border-none rounded-2xl font-bold text-gray-600 text-sm appearance-none cursor-pointer transition-colors outline-none"
              >
                <option value="">Any Style</option>
                {ALL_PERSONALITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {(searchTerm || selectedSkill || selectedPersonality) && (
              <button 
                onClick={clearFilters}
                className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:shadow-emerald-100/30 transition-all duration-300 group relative overflow-hidden hover:-translate-y-2">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-gray-50 group-hover:border-emerald-50 transition-all">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAddFriend(user.id)}
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
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-sm">
                        {user.personality}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {user.bio}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span key={skill} className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[11px] font-bold border border-gray-100 group-hover:border-emerald-100 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No matches in sight</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">Try loosening your filters to find more potential squad members</p>
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
