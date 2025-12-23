import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 text-white flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Support students. Receive a digital collectible.
        </h1>

        <p className="text-lg text-white/90 mb-8">
          BearTask connects supporters and college students through curated digital
          collections. Each contribution supports students and grants a unique
          digital collectible.
        </p>

        <Link
          href="/collections"
          className="inline-block bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-8 py-4 rounded-2xl transition"
        >
          Explore Collections
        </Link>

        <p className="mt-6 text-sm text-white/70">
          Verified students may be eligible for support draws.
        </p>
      </div>
    </div>
  );
}
