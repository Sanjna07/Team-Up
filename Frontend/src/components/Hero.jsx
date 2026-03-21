import { Target, Rocket, Users, MessageCircle } from 'lucide-react';

export default function Hero({ onGetStarted, onLearnMore }) {
  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build Amazing Projects with{' '}
              <span className="bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                the Right Team
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              TeamUp connects passionate developers, designers, and innovators.
              Find teammates who share your vision and compete together in hackathons.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={onLearnMore}
                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-200 rounded-3xl p-8 shadow-xl">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Sanjana"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Sanjana</div>
                      <div className="text-sm text-gray-600">
                        React • Node.js 
                        <span className="inline-block ml-2 px-3 py-0.5 bg-white-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-400">
                          Night Owl 
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Arjun"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Arjun</div>
                      <div className="text-sm text-gray-600">
                        Python • ML 
                        <span className="inline-block ml-2 px-3 py-0.5 bg-white-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-400">
                          Problem Solver 
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/65.jpg" 
                      alt="Priya"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Priya</div>
                      <div className="text-sm text-gray-600">
                        Design • UI/UX 
                        <span className="inline-block ml-2 px-3 py-0.5 bg-white-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-400">
                          Creative Mind 
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/46.jpg" 
                      alt="Rohan"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Rohan</div>
                      <div className="text-sm text-gray-600">
                        Product • Pitch 
                        <span className="inline-block ml-2 px-3 py-0.5 bg-white-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-400">
                          Team Player 
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 overflow-hidden">
          <div className="flex gap-6 animate-scroll">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 min-h-[200px] min-w-[240px] hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex-shrink-0">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Skill-Based Matching</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Match with teammates based on tech stack, role, and project interests.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 min-h-[200px] min-w-[240px] hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex-shrink-0">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                <Rocket className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Hackathon Ready</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Find teams aligned with upcoming hackathons and deadlines.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 min-h-[200px] min-w-[240px] hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex-shrink-0">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Built-in Collaboration</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Organize roles, goals, and timelines from a single workspace.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 min-h-[200px] min-w-[240px] hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex-shrink-0">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Live Chat Rooms</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join hackathon discussions and connect with teams in real-time.
              </p>
            </div>
            {/* Duplicate cards for seamless loop */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 min-h-[200px] min-w-[240px] hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex-shrink-0">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Skill-Based Matching</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Match with teammates based on tech stack, role, and project interests.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 min-h-[200px] min-w-[240px] hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex-shrink-0">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                <Rocket className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Hackathon Ready</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Find teams aligned with upcoming hackathons and deadlines.
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-240px * 4 - 1.5rem * 4));
            }
          }
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="mt-12 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-12">
            <div className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-2">
              How It Works
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Your Journey to the Perfect Team</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Step 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
              <div className="grid grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    <h3 className="text-xl font-bold text-gray-900">Create Your Account</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Sign up and tell us about your skills, tech stack, and hackathon goals. Complete a quick personality quiz to help us understand your working style and preferences.
                  </p>
                </div>
                <div className="flex justify-center">
                  <img 
                    src="https://res.cloudinary.com/dx0r0pbgb/image/upload/v1772007464/form-removebg-preview_unykws.png" 
                    alt="Create Account"
                    className="w-50 h-40  object-cover "
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
              <div className="grid grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    <h3 className="text-xl font-bold text-gray-900">Explore & Connect</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Jump into our live chat rooms to discuss hackathons, share ideas, and network with other developers, designers, and innovators from around the world.
                  </p>
                </div>
                <div className="flex justify-center">
                  <img 
                    src="https://res.cloudinary.com/dx0r0pbgb/image/upload/v1772007929/output-onlinepngtools__4_-removebg-preview_bzaypp.png" 
                    alt="Explore & Connect"
                    className="w-49 h-40 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
              <div className="grid grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                    <h3 className="text-xl font-bold text-gray-900">Get Matched with Teammates</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Our smart matchmaking algorithm recommends teammates based on your required tech stack, personality type, and working style preferences. Find your perfect team fit!
                  </p>
                </div>
                <div className="flex justify-center">
                  <img 
                    src="https://res.cloudinary.com/dx0r0pbgb/image/upload/v1772008993/output-onlinepngtools__1_-removebg-preview_bz1iap.png" 
                    alt="Get Matched"
                    className="w-50 h-40 object-cover "
                  />
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
              <div className="grid grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                    <h3 className="text-xl font-bold text-gray-900">Chat & Team Up</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Connect personally with your matches through direct messaging. Get to know each other, discuss project ideas, and when you're ready—voilà! You're all set to participate in any hackathon together.
                  </p>
                </div>
                <div className="flex justify-center">
                  <img 
                    src="https://res.cloudinary.com/dx0r0pbgb/image/upload/v1772008848/output-onlinepngtools-removebg-preview_fnwvz1.png" 
                    alt="Chat & Team Up"
                    className="w-50 h-40  object-cover "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="mt-16 text-center py-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Great Ideas Deserve Great Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-3">
            Because the best projects aren't built alone—they're built together.
          </p>
          <p className="text-lg text-emerald-700 font-semibold">
            TeamUp: Where Innovators Meet Their Match
          </p>
        </div>
      </div>
    </div>
  );
}
