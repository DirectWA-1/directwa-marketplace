import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10">
          
          {/* Logo + Description (Text-based) */}
          <div>
            <Link href="/" className="text-2xl font-bold text-[#1E3A5F] mb-4 block">
              Direct<span className="text-[#2E8B57]">WA</span>
            </Link>
            <p className="text-sm text-gray-600 max-w-xs">
              Buy and sell locally across South Africa. Simple. Safe. Direct.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/listings">Browse Listings</Link></li>
              <li><Link href="/create-listing">Sell an Item</Link></li>
              <li><Link href="/how-it-works">How it Works</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/escrow-protection">Escrow Protection</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-600">support@directwa.co.za</p>
            <p className="text-sm text-gray-600 mt-1">Johannesburg, South Africa</p>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} DirectWA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}