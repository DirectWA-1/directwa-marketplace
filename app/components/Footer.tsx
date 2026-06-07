import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 text-sm text-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-3">DirectWA</h4>
            <p className="text-xs leading-relaxed">
              South Africa’s simple WhatsApp-first marketplace.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-3">Platform</h4>
            <div className="space-y-1.5">
              <Link href="/listings" className="block hover:text-[#1E3A5F]">Browse Listings</Link>
              <Link href="/sell" className="block hover:text-[#1E3A5F]">Start Selling</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-3">Company</h4>
            <div className="space-y-1.5">
              <Link href="/about" className="block hover:text-[#1E3A5F]">About Us</Link>
              <Link href="/how-it-works" className="block hover:text-[#1E3A5F]">How it Works</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-3">Legal</h4>
            <div className="space-y-1.5">
              <Link href="/terms" className="block hover:text-[#1E3A5F]">Terms of Service</Link>
              <Link href="/privacy" className="block hover:text-[#1E3A5F]">Privacy Policy</Link>
              <Link href="/escrow-protection" className="block hover:text-[#1E3A5F]">Escrow Protection</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-xs text-center text-gray-500">
          © {new Date().getFullYear()} DirectWA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}