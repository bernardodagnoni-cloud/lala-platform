import Link from "next/link";
import Image from "next/image";
import { getServerT } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function LandingPage() {
  const { t } = await getServerT();

  return (
    <div className="min-h-screen bg-lala-cream text-lala-dark font-sans">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-lala-cream-dark">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/lala-logo.png" alt="LALA" width={32} height={32} className="rounded-sm" />
            <span className="font-bold text-xl tracking-tight text-lala-dark">{t.common.lalaMatch}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="text-lala-dark" />
            <Link
              href="/auth/login"
              className="text-sm font-medium text-lala-muted hover:text-lala-dark transition-colors px-4 py-2"
            >
              {t.landing.nav.signIn}
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium bg-lala-gold text-lala-dark px-4 py-2 rounded-full hover:bg-lala-gold-hover hover:text-white transition-colors"
            >
              {t.landing.nav.getStarted}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-lala-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-lala-gold-light text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-lala-gold animate-pulse" />
            {t.landing.hero.badge}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 max-w-3xl">
            {t.landing.hero.title}
            <span className="text-lala-gold"> {t.landing.hero.titleHighlight}</span> {t.landing.hero.titleEnd}
          </h1>
          <p className="text-lg text-lala-cream/80 max-w-2xl mb-10 leading-relaxed">
            {t.landing.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/signup?role=laLider"
              className="inline-flex items-center justify-center gap-2 bg-lala-gold text-lala-dark font-semibold px-6 py-3 rounded-full hover:bg-lala-gold-hover hover:text-white transition-colors text-sm"
            >
              {t.common.iAmLalider}
              <span className="text-base">→</span>
            </Link>
            <Link
              href="/auth/signup?role=company"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm"
            >
              {t.common.iRepresentCompany}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-lala-dark-2 text-white py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-white/10 text-center">
          {t.landing.stats.map((stat) => (
            <div key={stat.label} className="px-6 py-2">
              <div className="text-2xl font-bold text-lala-gold">{stat.value}</div>
              <div className="text-xs text-lala-cream/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-lala-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-lala-indigo mb-3">{t.landing.howItWorks.eyebrow}</p>
            <h2 className="text-3xl font-bold text-lala-dark">{t.landing.howItWorks.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {t.landing.howItWorks.steps.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 border border-lala-cream-dark shadow-sm">
                <div className="text-4xl font-black text-lala-gold/30 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2 text-lala-dark">{item.title}</h3>
                <p className="text-lala-muted text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For LaLideres / For Companies */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

          {/* LaLideres */}
          <div className="bg-lala-dark rounded-3xl p-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-lala-gold/70 mb-4">{t.landing.forLalideres.eyebrow}</p>
            <h3 className="text-2xl font-bold mb-4">{t.landing.forLalideres.title}</h3>
            <p className="text-lala-cream/80 text-sm leading-relaxed mb-8">
              {t.landing.forLalideres.description}
            </p>
            <ul className="space-y-3 mb-10">
              {t.landing.forLalideres.features.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-lala-cream/90">
                  <span className="text-lala-gold mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup?role=laLider"
              className="inline-flex items-center gap-2 bg-lala-gold text-lala-dark font-semibold px-5 py-2.5 rounded-full hover:bg-lala-gold-hover hover:text-white transition-colors text-sm"
            >
              {t.landing.forLalideres.cta}
            </Link>
          </div>

          {/* Companies */}
          <div className="bg-lala-cream rounded-3xl p-10 border border-lala-cream-dark">
            <p className="text-xs font-semibold uppercase tracking-widest text-lala-muted mb-4">{t.landing.forCompanies.eyebrow}</p>
            <h3 className="text-2xl font-bold mb-4 text-lala-dark">{t.landing.forCompanies.title}</h3>
            <p className="text-lala-muted text-sm leading-relaxed mb-8">
              {t.landing.forCompanies.description}
            </p>
            <ul className="space-y-3 mb-10">
              {t.landing.forCompanies.features.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-lala-dark">
                  <span className="text-lala-indigo mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup?role=company"
              className="inline-flex items-center gap-2 bg-lala-dark text-white font-semibold px-5 py-2.5 rounded-full hover:bg-lala-dark-2 transition-colors text-sm"
            >
              {t.landing.forCompanies.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-lala-gold">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Image src="/lala-logo.png" alt="LALA" width={72} height={72} className="rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold text-lala-dark mb-4">
            {t.landing.cta.title}
          </h2>
          <p className="text-lala-dark/70 mb-8 text-sm">
            {t.landing.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup?role=laLider"
              className="inline-flex items-center justify-center bg-lala-dark text-white font-semibold px-6 py-3 rounded-full hover:bg-lala-dark-2 transition-colors text-sm"
            >
              {t.common.iAmLalider}
            </Link>
            <Link
              href="/auth/signup?role=company"
              className="inline-flex items-center justify-center border-2 border-lala-dark text-lala-dark font-semibold px-6 py-3 rounded-full hover:bg-lala-dark/5 transition-colors text-sm"
            >
              {t.common.iRepresentCompany}
            </Link>
            <a
              href="https://latinamericanleadershipacademy.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border-2 border-lala-dark text-lala-dark font-semibold px-6 py-3 rounded-full hover:bg-lala-dark/5 transition-colors text-sm"
            >
              {t.common.aboutUs}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-lala-dark text-lala-cream/60 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span className="font-bold text-lala-cream text-base tracking-tight">{t.common.lalaMatch}</span>
          <p className="text-lala-cream/50 text-xs">
            {t.landing.footer.tagline}
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/auth/login" className="hover:text-white transition-colors">{t.common.signIn}</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">{t.common.signUp}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
