import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#0F1C2E] text-gray-400 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-y-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2E8B57] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="font-bold text-xl text-white">DirectWA</span>
            </div>
            <p className="text-sm">South Africa’s hybrid marketplace.<br />Direct deals. WhatsApp simple.</p>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Marketplace</h4>
            <div className="space-y-2 text-sm">
              <div><Link href="/listings">Browse Listings</Link></div>
              <div><Link href="/sell">Sell an Item</Link></div>
              <div><Link href="/my-listings">My Listings</Link></div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <div className="space-y-2 text-sm">
              <div>About Us</div>
              <div>How it Works</div>
              <div>Trust &amp; Safety</div>
              <div>Contact</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <div className="space-y-2 text-sm">
              <div>Terms of Service</div>
              <div>Privacy Policy</div>
              <div>Escrow Protection</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-sm flex flex-col md:flex-row justify-between items-center">
          <div>© {new Date().getFullYear()} DirectWA. All rights reserved.</div>
          <div className="mt-4 md:mt-0">Built for South Africa • WhatsApp-first</div>
        </div>
      </div>
    </footer>
  );
}