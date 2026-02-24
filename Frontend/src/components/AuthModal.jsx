import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PREDEFINED_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL',
  'Docker', 'AWS', 'Vue.js', 'Angular', 'Django', 'FastAPI', 'GraphQL', 'REST API',
  'HTML/CSS', 'PHP', 'C++', 'Java', 'Go', 'Rust', 'Kubernetes', 'Git'
];

const PREDEFINED_DOMAINS = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'AI/ML', 'Backend', 'Frontend',
  'Full Stack', 'Blockchain', 'Game Development', 'IoT', 'Embedded Systems'
];

export default function AuthModal({ isOpen, onClose, initialMode }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    linkedIn: '',
    github: '',
    skills: [],
    domains: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tempSkill, setTempSkill] = useState('');
  const [tempDomain, setTempDomain] = useState('');
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showDomainsDropdown, setShowDomainsDropdown] = useState(false);
  const skillsRef = useRef(null);
  const domainsRef = useRef(null);

  // Reset form data when mode changes or modal opens
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      linkedIn: '',
      github: '',
      skills: [],
      domains: [],
    });
    setError('');
    setShowPassword(false);
    setTempSkill('');
    setTempDomain('');
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          linkedIn: formData.linkedIn,
          github: formData.github,
          skills: formData.skills,
          domains: formData.domains,
        };

        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // redirect to welcome page
        window.location.href = '/welcome';
        return;
      } else {
        const payload = {
          email: formData.email,
          password: formData.password,
        };

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // redirect to welcome page
        window.location.href = '/welcome';
        return;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addSkill = () => {
    const trimmed = tempSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmed],
      });
      setTempSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const addDomain = () => {
    const trimmed = tempDomain.trim();
    if (trimmed && !formData.domains.includes(trimmed)) {
      setFormData({
        ...formData,
        domains: [...formData.domains, trimmed],
      });
      setTempDomain('');
    }
  };

  const removeDomain = (domain) => {
    setFormData({
      ...formData,
      domains: formData.domains.filter((d) => d !== domain),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full p-6 sm:p-6 relative max-h-[calc(100vh-2rem)] overflow-y-auto ${
        mode === 'login' ? 'max-w-md' : 'max-w-xl'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
          {mode === 'login' ? 'Welcome Back' : 'Join TeamUp'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                placeholder="Your Name"
              />
            </div>
          )}

          {/* Email and Password side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                placeholder="name@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              {/* LinkedIn and GitHub side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Profile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              {/* Skills - Dropdown Multi-select */}
              <div ref={skillsRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <div
                  onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-gray-400"
                >
                  <span className="text-gray-700">
                    {formData.skills.length > 0
                      ? `${formData.skills.length} selected`
                      : 'Select skills...'}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      showSkillsDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {showSkillsDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 bg-white rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      value={tempSkill}
                      onChange={(e) => setTempSkill(e.target.value)}
                      placeholder="Type to filter or add custom..."
                      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <div className="p-2">
                      {PREDEFINED_SKILLS.filter(
                        (s) =>
                          s.toLowerCase().includes(tempSkill.toLowerCase()) &&
                          !formData.skills.includes(s)
                      ).map((skill) => (
                        <div
                          key={skill}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              skills: [...formData.skills, skill],
                            });
                            setTempSkill('');
                          }}
                          className="px-3 py-2 hover:bg-emerald-50 cursor-pointer rounded text-sm text-gray-700"
                        >
                          {skill}
                        </div>
                      ))}
                      {tempSkill.trim() &&
                        !PREDEFINED_SKILLS.includes(tempSkill.trim()) &&
                        !formData.skills.includes(tempSkill.trim()) && (
                          <div
                            onClick={() => {
                              setFormData({
                                ...formData,
                                skills: [...formData.skills, tempSkill.trim()],
                              });
                              setTempSkill('');
                            }}
                            className="px-3 py-2 hover:bg-emerald-50 cursor-pointer rounded text-sm text-emerald-700 font-medium border-t border-gray-200 mt-2 pt-2"
                          >
                            + Add "{tempSkill.trim()}"
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 text-emerald-600 hover:text-emerald-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domains - Dropdown Multi-select */}
              <div ref={domainsRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domains
                </label>
                <div
                  onClick={() => setShowDomainsDropdown(!showDomainsDropdown)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-gray-400"
                >
                  <span className="text-gray-700">
                    {formData.domains.length > 0
                      ? `${formData.domains.length} selected`
                      : 'Select domains...'}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      showDomainsDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {showDomainsDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 bg-white rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      value={tempDomain}
                      onChange={(e) => setTempDomain(e.target.value)}
                      placeholder="Type to filter or add custom..."
                      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <div className="p-2">
                      {PREDEFINED_DOMAINS.filter(
                        (d) =>
                          d.toLowerCase().includes(tempDomain.toLowerCase()) &&
                          !formData.domains.includes(d)
                      ).map((domain) => (
                        <div
                          key={domain}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              domains: [...formData.domains, domain],
                            });
                            setTempDomain('');
                          }}
                          className="px-3 py-2 hover:bg-emerald-50 cursor-pointer rounded text-sm text-gray-700"
                        >
                          {domain}
                        </div>
                      ))}
                      {tempDomain.trim() &&
                        !PREDEFINED_DOMAINS.includes(tempDomain.trim()) &&
                        !formData.domains.includes(tempDomain.trim()) && (
                          <div
                            onClick={() => {
                              setFormData({
                                ...formData,
                                domains: [...formData.domains, tempDomain.trim()],
                              });
                              setTempDomain('');
                            }}
                            className="px-3 py-2 hover:bg-emerald-50 cursor-pointer rounded text-sm text-emerald-700 font-medium border-t border-gray-200 mt-2 pt-2"
                          >
                            + Add "{tempDomain.trim()}"
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.domains.map((domain) => (
                    <div
                      key={domain}
                      className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                      {domain}
                      <button
                        type="button"
                        onClick={() => removeDomain(domain)}
                        className="ml-1 text-emerald-600 hover:text-emerald-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-700 to-green-600 text-white py-3 rounded-lg font-medium hover:from-emerald-800 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
