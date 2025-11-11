export default function Footer() {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto text-center text-sm text-white/80">
        <p>
          © {new Date().getFullYear()} <strong>BearTask</strong> · Powered by students 
        </p>
        <p className="mt-2">
          <a
            
            className="text-amber-300 hover:underline"
          >
            
          </a>
        </p>
      </div>
    </footer>
  );
}
