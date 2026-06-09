import Link from 'next/link';
import { MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-3xl font-bold text-[#1E3A5F]">
              DirectWA
            </Link>
            <p className="mt-4 text-gray-600 max-w-sm">
              South Africa’s simple WhatsApp-first marketplace. 
              Buy and sell locally with no middleman fees.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-4 mt-6">
              <a 
                href="https://wa.me/27712345678" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </a>
              <a 
                href="https://instagram.com/directwa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-pink-600" />
              </a>
              <a 
                href="https://facebook.com/directwa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
              </a>
              <a 
                href="https://twitter.com/directwa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-sky-500" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-600">
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
            <h4 className="font-semibold text-[#1E3A5F] mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-600">
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
            <h4 className="font-semibold text-[#1E3A5F] mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-600">
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
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
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