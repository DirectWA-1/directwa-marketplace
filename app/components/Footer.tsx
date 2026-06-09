import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#F8FAFC] border-t">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-10 gap-y-14">
          
          {/* Brand + Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-3xl font-bold tracking-tight text-[#1E3A5F]">
              DirectWA
            </Link>
            <p className="mt-4 max-w-sm text-gray-600 leading-relaxed">
              South Africa’s simple WhatsApp-first marketplace. 
              Buy and sell locally with no middleman fees.
            </p>

            {/* Subtle tagline */}
            <p className="mt-6 text-sm text-gray-500">
              Built with ❤️ in South Africa
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-5 tracking-wide text-sm uppercase">
              Platform
            </h4>
            <ul className="space-y-[10px] text-[15px] text-gray-600">
              <li>
                <Link href="/listings" className="hover:text-[#2E8B57] transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/create-listing" className="hover:text-[#2E8B57] transition-colors">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#2E8B57] transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/escrow-protection" className="hover:text-[#2E8B57] transition-colors">
                  Escrow Protection
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-5 tracking-wide text-sm uppercase">
              Company
            </h4>
            <ul className="space-y-[10px] text-[15px] text-gray-600">
              <li>
                <Link href="/about" className="hover:text-[#2E8B57] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-[#2E8B57] transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@directwa.co.za" 
                  className="hover:text-[#2E8B57] transition-colors"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-5 tracking-wide text-sm uppercase">
              Legal
            </h4>
            <ul className="space-y-[10px] text-[15px] text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-[#2E8B57] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#2E8B57] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/seller-agreement" className="hover:text-[#2E8B57] transition-colors">
                  Seller Agreement
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} DirectWA. All rights reserved.
          </p>
          <p className="text-center">
            Made for South Africans, by South Africans.
          </p>
        </div>
      </div>
    </footer>
  );
}