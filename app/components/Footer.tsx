import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-[#1E3A5F]">
              DirectWA
            </Link>
            <p className="mt-3 text-sm text-gray-600 max-w-xs">
              South Africa’s simple WhatsApp-first marketplace. 
              Buy and sell locally with no middleman fees.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-4 text-sm tracking-wide">Platform</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/listings" className="block text-gray-600 hover:text-[#1E3A5F]">Browse Listings</Link>
              <Link href="/sell" className="block text-gray-600 hover:text-[#1E3A5F]">Start Selling</Link>
              <Link href="/how-it-works" className="block text-gray-600 hover:text-[#1E3A5F]">How it Works</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-4 text-sm tracking-wide">Company</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/about" className="block text-gray-600 hover:text-[#1E3A5F]">About Us</Link>
              <Link href="/escrow-protection" className="block text-gray-600 hover:text-[#1E3A5F]">Escrow Protection</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-4 text-sm tracking-wide">Legal</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/terms" className="block text-gray-600 hover:text-[#1E3A5F]">Terms of Service</Link>
              <Link href="/privacy" className="block text-gray-600 hover:text-[#1E3A5F]">Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} DirectWA. All rights reserved.</p>
          <p className="text-xs">Made for South Africans, by South Africans.</p>
        </div>
      </div>
    </footer>
  );
}