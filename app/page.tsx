import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Image src="/lala-logo.png" alt="LALA" width={32} height={32} className="rounded-sm" />
              <span className="font-bold text-xl tracking-tight text-blue-900">LALA Match</span>
            </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium bg-blue-900 text-white px-4 py-2 rounded-full hover:bg-blue-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-powered talent matching
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 max-w-3xl">
            The next generation of leaders,
            <span className="text-amber-400"> matched</span> with the right companies.
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mb-10 leading-relaxed">
            LALA Match connects LaLideres, the region&apos;s most promising young leaders,
            with companies looking to build exceptional teams. Powered by AI, designed for impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/signup?role=laLider"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors text-sm"
            >
              I&apos;m a LaLider
              <span className="text-base">→</span>
            </Link>
            <Link
              href="/auth/signup?role=company"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm"
            >
              I represent a company
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-950 text-white py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-white/10 text-center">
          {[
            { value: "3,000+", label: "LaLideres across Latin America" },
            { value: "17", label: "Countries represented" },
            { value: "AI-powered", label: "Matching technology" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-2">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-blue-300 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">How it works</p>
            <h2 className="text-3xl font-bold">From profile to placement in three steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Build your profile",
                body: "LaLideres detail their education, experience, and ambitions. Companies describe their open positions and ideal candidates.",
              },
              {
                step: "02",
                title: "AI finds the fit",
                body: "Claude analyzes every profile against every position, scoring compatibility and explaining the reasoning in plain language.",
              },
              {
                step: "03",
                title: "Connect and grow",
                body: "Companies reach out to their top matches. LaLideres see which opportunities they've been selected for.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="text-4xl font-black text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For LaLideres / For Companies */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

          {/* LaLideres */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-4">For LaLideres</p>
            <h3 className="text-2xl font-bold mb-4">Your talent deserves to be seen.</h3>
            <p className="text-blue-200 text-sm leading-relaxed mb-8">
              Create a rich profile showcasing your education, experience, and goals.
              Get notified when companies match you for positions that fit your ambitions.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Free profile, visible to all partner companies",
                "AI matches you to relevant positions",
                "See which companies are interested in you",
                "Connect directly via LinkedIn",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-blue-100">
                  <span className="text-amber-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup?role=laLider"
              className="inline-flex items-center gap-2 bg-white text-blue-900 font-semibold px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors text-sm"
            >
              Create your profile →
            </Link>
          </div>

          {/* Companies */}
          <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">For Companies</p>
            <h3 className="text-2xl font-bold mb-4">Find exceptional talent.</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Post your open positions and let AI surface the most relevant LaLideres,
              ranked by fit with clear explanations, not just keyword matches.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Post unlimited positions",
                "AI ranks candidates with explanations",
                "Access profiles across 15+ countries",
                "Re-run matching as your needs evolve",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-600 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup?role=company"
              className="inline-flex items-center gap-2 bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-blue-800 transition-colors text-sm"
            >
              Start hiring →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-amber-400">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Image src="/lala-logo.png" alt="LALA" width={72} height={72} className="rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold text-blue-950 mb-4">
            Ready to make the connection?
          </h2>
          <p className="text-blue-900/70 mb-8 text-sm">
            Join LaLideres and companies already using LALA Match to build the future.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup?role=laLider"
              className="inline-flex items-center justify-center bg-blue-950 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-900 transition-colors text-sm"
            >
              I&apos;m a LaLider
            </Link>
            <Link
              href="/auth/signup?role=company"
              className="inline-flex items-center justify-center border-2 border-blue-950 text-blue-950 font-semibold px-6 py-3 rounded-full hover:bg-blue-950/5 transition-colors text-sm"
            >
              I represent a company
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-blue-300 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span className="font-bold text-white text-base tracking-tight">LALA Match</span>
          <p className="text-blue-400 text-xs">
            Built for LALA, empowering Latin American leaders since 2017.
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
