import Navbar from "@/app/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        {/* Footer will now show on all pages */}
        <footer className="bg-[#1E3A5F] text-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm">© 2026 DirectWA. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <a href="/about" className="hover:underline">About</a>
              <a href="/how-it-works" className="hover:underline">How it Works</a>
              <a href="/terms" className="hover:underline">Terms</a>
              <a href="/privacy" className="hover:underline">Privacy</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}