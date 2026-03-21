import { Target, Users, Sparkles, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <section className="pt-28 min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            About{' '}
            <span className="bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              TeamUp
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We help innovators find the right teammates, build trust quickly, and launch hackathon-ready projects with clarity and momentum.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                TeamUp exists to remove the friction of finding great collaborators. We match skills, goals, and working styles so teams can spend more time building and less time searching.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">What We Believe</h3>
              <p className="text-gray-600 leading-relaxed">
                Great ideas are amplified by diverse teams. We design for clarity, fairness, and momentum so builders can focus on shipping meaningful work.
              </p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-lg">
            <div className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-4">
              Early Stage, Big Vision
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              TeamUp is new, so we are focusing on building with the community. Your feedback shapes every release.
            </p>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-base font-semibold text-gray-900">Founding Community</p>
                <p className="text-sm text-gray-600 mt-2">Be one of the first builders and set the standard.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-base font-semibold text-gray-900">Weekly Improvements</p>
                <p className="text-sm text-gray-600 mt-2">New features ship quickly based on user input.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-base font-semibold text-gray-900">Open Collaboration</p>
                <p className="text-sm text-gray-600 mt-2">Partners and organizers are welcome to co-create.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-base font-semibold text-gray-900">Supportive Launch</p>
                <p className="text-sm text-gray-600 mt-2">Direct access to the team for onboarding and help.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <Target className="w-7 h-7 text-emerald-600 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Purposeful Matching</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Align roles, tech stacks, and availability for higher-quality collaborations.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <Users className="w-7 h-7 text-emerald-600 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Community First</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Supportive spaces to share ideas, learn together, and grow your network.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <Sparkles className="w-7 h-7 text-emerald-600 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Fast Momentum</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Clear onboarding and guided steps that keep teams moving quickly.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <ShieldCheck className="w-7 h-7 text-emerald-600 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Trusted Spaces</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Verified profiles and respectful collaboration guidelines for teams.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
