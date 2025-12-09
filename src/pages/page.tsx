import { BookOpen, GitMerge, Twitter } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF9F0] text-black">
      <div className="container mx-auto px-4 sm:px-6 py-7 max-w-7xl">
        {/* Hero Section */}
        <section className="mb-32 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img
              src="https://res.cloudinary.com/dma1c8i6n/image/upload/v1764289640/reactpad_swlsov.png"
              alt="ReactPad Logo"
              width={60}
              height={60}
              className="object-contain"
            />
            <div className="text-4xl font-black tracking-wider uppercase">
              ReactPad
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none mb-8 tracking-tight">
            LAUNCH IDEAS.<br />
            MOON PROJECTS.
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-12 max-w-3xl mx-auto font-bold px-4">
            Discover, back, and launch the most promising projects on the Reactive Network.
          </p>
          <a
            href="/projects"
            className="inline-block bg-[#7DF9FF] text-black font-black py-4 px-8 sm:py-5 sm:px-12 text-base sm:text-lg border-4 border-black uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
          >
            EXPLORE PROJECTS →
          </a>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <div className="bg-[#7DF9FF] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
            <p className="text-sm font-black tracking-wider mb-4 uppercase">Total Projects</p>
            <p className="text-6xl font-black">42</p>
          </div>
          <div className="bg-[#2FFF2F] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
            <p className="text-sm font-black tracking-wider mb-4 uppercase">Total Raised</p>
            <p className="text-6xl font-black">$12.3M</p>
          </div>
          <div className="bg-[#FF00F5] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
            <p className="text-sm font-black tracking-wider mb-4 uppercase">Top Backers</p>
            <p className="text-6xl font-black">1,234</p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-32">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase mb-16 tracking-tight text-center">
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-4 border-black p-8 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-6xl font-black mb-4">1</div>
              <h3 className="text-2xl font-black uppercase mb-4">DISCOVER</h3>
              <p className="font-bold text-lg">Browse a curated list of innovative projects seeking funding on the Reactive Network.</p>
            </div>
            <div className="border-4 border-black p-8 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-6xl font-black mb-4">2</div>
              <h3 className="text-2xl font-black uppercase mb-4">BACK</h3>
              <p className="font-bold text-lg">Support the projects you believe in by participating in their token presale.</p>
            </div>
            <div className="border-4 border-black p-8 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-6xl font-black mb-4">3</div>
              <h3 className="text-2xl font-black uppercase mb-4">LAUNCH</h3>
              <p className="font-bold text-lg">Help projects reach their funding goals and watch them launch into the stratosphere.</p>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="mb-32">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase mb-16 tracking-tight">
            FEATURED LAUNCHES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#7DF9FF] border-4 border-black p-8 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
              <h3 className="text-2xl font-black uppercase mb-4">PROJECT ALPHA</h3>
              <p className="font-bold text-lg mb-6">A revolutionary new DeFi protocol.</p>
              <span className="text-sm font-black uppercase">LEARN MORE →</span>
            </div>
            <div className="bg-[#FF4911] border-4 border-black p-8 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
              <h3 className="text-2xl font-black uppercase mb-4">PROJECT BETA</h3>
              <p className="font-bold text-lg mb-6">The next generation of NFT marketplace.</p>
              <span className="text-sm font-black uppercase">LEARN MORE →</span>
            </div>
            <div className="bg-[#3300FF] border-4 border-black p-8 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 text-white">
              <h3 className="text-2xl font-black uppercase mb-4">PROJECT GAMMA</h3>
              <p className="font-bold text-lg mb-6">A decentralized social media platform.</p>
              <span className="text-sm font-black uppercase">LEARN MORE →</span>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-black text-white border-4 border-black p-8 sm:p-12 md:p-16 text-center mb-16 shadow-[8px_8px_0px_0px_#7DF9FF]">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase mb-6 tracking-tight">
            Ready to Launch?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto px-4">
            Got the next big idea? Launch your project on ReactPad and get the funding you need to make it a reality.
          </p>
          <a
            href="/dashboard/create"
            className="inline-block bg-[#FF00F5] text-black font-black py-4 px-8 sm:py-5 sm:px-12 text-base sm:text-lg border-4 border-black uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
          >
            CREATE A PROJECT
          </a>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white border-t-4 border-black">
        <div className="container mx-auto px-6 py-8 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-bold uppercase tracking-wider text-center md:text-left">&copy; {new Date().getFullYear()} ReactPad</p>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#7DF9FF] transition-colors">
              <Twitter size={24} />
            </a>
            <a href="https://reactpad.gitbook.io/" target="_blank" rel="noopener noreferrer" className="hover:text-[#7DF9FF] transition-colors">
              <BookOpen size={24} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#7DF9FF] transition-colors">
              <GitMerge size={24} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}