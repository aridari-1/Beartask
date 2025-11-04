import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
      <Navbar />
      {/* ✅ Improved mobile padding */}
      <main className="flex-grow px-3 sm:px-6 md:px-8 py-6 sm:py-8 w-full overflow-x-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
}
