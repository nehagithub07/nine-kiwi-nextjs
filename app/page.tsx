"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll<HTMLElement>(".animated-element").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative bg-kiwi-light font-body text-kiwi-gray overflow-x-hidden">
      <div className="kiwi-shape -top-20 -left-20" />
      <div className="kiwi-shape bottom-10 right-10 rotate-45 w-40 h-40" />

      <main>
        <section className="relative py-20 md:py-28">
          <div className="hero-pattern absolute inset-0 z-0 opacity-50" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="max-w-4xl mx-auto animated-element">
              <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-kiwi-dark mb-6 leading-tight">
                Project Management for the <span className="text-kiwi-green">Real World</span>
              </h1>
              <p className="text-lg md:text-xl text-kiwi-gray max-w-2xl mx-auto mb-10">
                Modern, multilingual, mobile-first project management built for the world's diverse construction ecosystem.
              </p>
              <a
                href="mailto:hello@ninekiwi.com?subject=Early%20Access%20Request"
                className="inline-block bg-kiwi-green hover:bg-kiwi-dark text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Join Waitlist
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="report-card-gradient rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 p-8 md:p-16">
                <div className="text-white z-10 animated-element">
                  <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Free Report Generator</h2>
                  <p className="text-lg text-kiwi-light mb-6">
                    Instantly generate professional PDF reports for your construction projects.
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 text-kiwi-light">✔</span> Create professional inspection reports
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 text-kiwi-light">✔</span> Add photos and notes directly from site
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 text-kiwi-light">✔</span> Free with unlimited usage
                    </li>
                  </ul>
                  <Link href="/report" className="bg-white text-kiwi-dark hover:bg-kiwi-light font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 w-fit inline-block">
                    Try The Tool
                  </Link>
                </div>

                <div className="relative h-full flex items-center justify-center animated-element">
                  <div className="w-full max-w-xs p-3 bg-kiwi-black rounded-3xl shadow-2xl">
                    <div className="bg-white rounded-2xl p-4 space-y-3 h-96 overflow-y-auto">
                      <p className="font-bold text-kiwi-dark">NineKiwi Report Generator</p>
                      <div className="h-12 bg-kiwi-light rounded-lg" />
                      <div className="h-16 bg-kiwi-light rounded-lg" />
                      <div className="bg-kiwi-light h-20 rounded-lg flex items-center justify-center text-sm text-kiwi-gray">
                        Photo Upload
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 bg-kiwi-light rounded-full w-full" />
                        <div className="h-3 bg-kiwi-light rounded-full w-5/6" />
                      </div>
                      <div className="bg-kiwi-green text-white text-center py-2 rounded-lg font-semibold">Generate PDF</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-kiwi-light">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 animated-element">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-kiwi-dark mb-4">
                Built for the Realities of Global Work Sites
              </h2>
              <p className="text-lg md:text-xl text-kiwi-gray">
                Combining cutting-edge technology with practical solutions for construction teams worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                ["Works Offline", "Network issues on site won't stop productivity. Sync when you're back online."],
                ["Multilingual Support", "Break language barriers with real-time translation for diverse workforces."],
                ["Voice-to-Text Reports", "Dictate reports on site with powerful voice recognition."],
                ["Photo Evidence with GPS", "Geotagged photos provide trust and transparency for clients and teams."],
                ["Cost-efficient SaaS", "Easy for small contractors to adopt with flexible pricing plans."],
                ["Real-time Collaboration", "Project managers get instant updates from site teams as work progresses."],
              ].map(([title, desc], idx) => (
                <div key={String(title)} className="group feature-card bg-white rounded-2xl p-8 shadow-lg border border-gray-200 animated-element" style={{ animationDelay: `${idx * 0.1}s` as any }}>
                  <div className="text-kiwi-green mb-4">★</div>
                  <h3 className="text-xl font-bold text-kiwi-dark mb-2">{title}</h3>
                  <p className="text-kiwi-gray">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-kiwi-dark text-white text-center relative overflow-hidden">
          <div className="hero-pattern absolute inset-0 z-0 opacity-20" style={{ filter: "invert(1)" }} />
          <div className="container mx-auto px-6 relative z-10 animated-element">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Be the First to Build with NineKiwi</h2>
            <p className="text-lg md:text-xl text-kiwi-light mb-10 max-w-2xl mx-auto">Join our early access list and help shape the future of construction technology for the global workforce.</p>
            <a href="mailto:hello@ninekiwi.com?subject=Early%20Access%20Request" className="bg-kiwi-green hover:bg-white hover:text-kiwi-dark font-bold py-4 px-10 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-lg">
              Request Early Access
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-kiwi-black text-kiwi-light py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center space-x-3">
              <Image src="/logo.png" alt="NineKiwi Logo" width={40} height={40} />
              <span className="text-2xl font-heading font-bold text-white">nine<span className="text-kiwi-green">kiwi</span></span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href="/report" className="hover:text-kiwi-green transition">Free Report Tool</Link>
              <a href="mailto:hello@ninekiwi.com" className="hover:text-kiwi-green transition">Contact</a>
            </div>
            <div className="text-center text-sm">
              <p className="text-kiwi-tan">© 2025 NineKiwi. All rights reserved.</p>
              <p className="text-kiwi-gray mt-2">Currently in development - our team is busy learning Flutter and improving our social skills!</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

