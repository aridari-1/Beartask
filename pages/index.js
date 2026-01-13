import Link from "next/link";

export default function Home() {
  const nftImages = [
    "1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] via-[#2A0E61] to-[#3A0CA3] text-white overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="px-6 pt-24 pb-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight max-w-3xl mx-auto">
          Support students.  
          <span className="block text-amber-400 mt-2">
            Receive digital art.
          </span>
        </h1>

        <p className="mt-5 text-white/80 max-w-xl mx-auto text-base sm:text-lg">
          BearTask lets you support students, receive a unique digital artwork,
          and get a chance to win when a collection sells out.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/collections"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-8 py-4 rounded-2xl transition"
          >
            Explore Collections
          </Link>
        </div>
      </section>

      {/* ================= NFT MARQUEE ================= */}
      <section className="relative py-12 overflow-hidden">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {[...nftImages, ...nftImages].map((img, i) => (
            <div
              key={i}
              className="inline-block w-40 h-40 sm:w-56 sm:h-56 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md flex-shrink-0"
              style={{
                backgroundImage: `url(/nfts/${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 py-24 bg-black/30 backdrop-blur-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14">
          How BearTask works
        </h2>

        <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-3">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
            <h3 className="text-lg font-semibold mb-3">1. Support</h3>
            <p className="text-white/70 text-sm">
              Choose a collection and support it with the amount you want.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
            <h3 className="text-lg font-semibold mb-3">2. Receive Art</h3>
            <p className="text-white/70 text-sm">
              Get a unique digital artwork that represents your support.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
            <h3 className="text-lg font-semibold mb-3">3. Win Together</h3>
            <p className="text-white/70 text-sm">
              When a collection sells out, one student supporter wins the lottery.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ANIMATION ================= */}
      <style jsx>{`
        .animate-marquee {
          animation: marquee 35s linear infinite;
          width: max-content;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
