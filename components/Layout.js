import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
      <Navbar />
      <main className="flex-grow px-4 sm:px-8 py-8">{children}</main>
      <Footer />
    </div>
  );
}
