export default function Hero({ onGetStarted }) {
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-20">
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
              <button className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-200 rounded-3xl p-8 shadow-xl">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Sanjana</div>
                      <div className="text-sm text-gray-600">React • Node.js</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Arjun</div>
                      <div className="text-sm text-gray-600">Python • ML</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      P
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Priya</div>
                      <div className="text-sm text-gray-600">Design • UI/UX</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      R
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Rohan</div>
                      <div className="text-sm text-gray-600">Product • Pitch</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl p-10 shadow-md border border-gray-100 min-h-[200px]">
            <div className="text-lg font-semibold text-gray-900 mb-2">Skill-Based Matching</div>
            <p className="text-gray-600">
              Match with teammates based on tech stack, role, and project interests.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-10 shadow-md border border-gray-100 min-h-[200px]">
            <div className="text-lg font-semibold text-gray-900 mb-2">Hackathon Ready</div>
            <p className="text-gray-600">
              Find teams aligned with upcoming hackathons and deadlines.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-10 shadow-md border border-gray-100 min-h-[200px]">
            <div className="text-lg font-semibold text-gray-900 mb-2">Built-in Collaboration</div>
            <p className="text-gray-600">
              Organize roles, goals, and timelines from a single workspace.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-2">
                How It Works
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Launch your team in three steps</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 text-sm font-medium">
                Create Profile
              </span>
              <span className="px-4 py-2 rounded-full bg-green-50 text-green-800 text-sm font-medium">
                Match Teammates
              </span>
              <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                Start Building
              </span>
            </div>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-10">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 min-h-[170px]">
              <div className="text-sm font-semibold text-gray-900 mb-1">Step 1</div>
              <div className="text-gray-600">Tell us your skills, role, and hackathon goals.</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 min-h-[170px]">
              <div className="text-sm font-semibold text-gray-900 mb-1">Step 2</div>
              <div className="text-gray-600">Review curated matches and shortlist your favorites.</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 min-h-[170px]">
              <div className="text-sm font-semibold text-gray-900 mb-1">Step 3</div>
              <div className="text-gray-600">Kick off planning, tasks, and milestones with your team.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
