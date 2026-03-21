import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="pt-28 min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Contact{' '}
            <span className="bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              TeamUp
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, idea, or want to collaborate? Send a message and we will get back to you soon.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-900">hello@teamup.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">+1 (555) 218-9922</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Office</p>
                  <p className="text-lg font-semibold text-gray-900">Innovation Hub, Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-700 text-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold mb-2">Why reach out?</h3>
              <p className="text-emerald-100 leading-relaxed">
                We love hearing from builders. Share feedback, request a demo, or tell us about your next hackathon idea.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 rounded-2xl p-8 shadow-lg space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows="5"
                placeholder="Tell us about your idea"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Send Message
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
