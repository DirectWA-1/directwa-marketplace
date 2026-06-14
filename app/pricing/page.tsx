'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-[#1E3A5F] mb-4">Simple, Fair & Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          No listing fees. No monthly charges unless you choose Pro.<br />
          You only pay when you successfully sell.
        </p>
      </div>

      {/* Success Fee */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-center mb-8">Success Fee – Only When You Sell</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { range: "R1 – R1,000", fee: "8%", popular: false },
            { range: "R1,001 – R5,000", fee: "6%", popular: false },
            { range: "R5,001 – R20,000", fee: "5%", popular: true },
            { range: "R20,001+", fee: "4.5% (max R1,200)", popular: false },
          ].map((tier, i) => (
            <div 
              key={i} 
              className={`border rounded-3xl p-8 text-center ${tier.popular ? 'border-[#2E8B57] bg-[#2E8B57]/5 relative' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E8B57] text-white text-xs px-4 py-1 rounded-full font-semibold">
                  MOST POPULAR
                </div>
              )}
              <p className="text-sm text-gray-500">{tier.range}</p>
              <p className="text-5xl font-bold text-[#2E8B57] mt-4">{tier.fee}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Promoted Listings */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-center mb-8">Boost Your Sales</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border rounded-3xl p-8 hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-xl">Boost</h3>
            <p className="text-4xl font-bold mt-4">R49</p>
            <p className="text-gray-500">7 days</p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-center justify-center gap-2"><Check className="w-5 h-5 text-green-500" /> Higher in search</li>
            </ul>
          </div>

          <div className="border-2 border-[#2E8B57] rounded-3xl p-8 relative text-center">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2E8B57] text-white px-6 py-1 rounded-full text-sm font-semibold">RECOMMENDED</div>
            <h3 className="font-semibold text-xl">Featured</h3>
            <p className="text-4xl font-bold mt-4">R99</p>
            <p className="text-gray-500">14 days</p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-center justify-center gap-2"><Check className="w-5 h-5 text-green-500" /> Top of category</li>
              <li className="flex items-center justify-center gap-2"><Check className="w-5 h-5 text-green-500" /> Better search ranking</li>
            </ul>
          </div>

          <div className="border rounded-3xl p-8 hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-xl">Spotlight</h3>
            <p className="text-4xl font-bold mt-4">R199</p>
            <p className="text-gray-500">30 days</p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-center justify-center gap-2"><Check className="w-5 h-5 text-green-500" /> Homepage exposure</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seller Pro Plans */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-center mb-8">Seller Pro Plans</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="border rounded-3xl p-8 text-center">
            <h3 className="font-semibold text-xl">Free</h3>
            <p className="text-4xl font-bold mt-4">R0</p>
            <p className="text-gray-500">Forever free</p>
            <ul className="mt-8 space-y-3 text-sm text-left">
              <li>✓ Unlimited listings</li>
              <li>✓ Escrow protection</li>
              <li>✓ Basic analytics</li>
            </ul>
            <Link href="/create-listing" className="block mt-10 border py-3 rounded-2xl font-medium">Get Started Free</Link>
          </div>

          {/* Pro */}
          <div className="border-2 border-[#2E8B57] rounded-3xl p-8 text-center relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2E8B57] text-white px-6 py-1 rounded-full text-sm font-semibold">POPULAR</div>
            <h3 className="font-semibold text-xl">Pro Seller</h3>
            <p className="text-4xl font-bold mt-4">R199</p>
            <p className="text-gray-500">per month</p>
            <ul className="mt-8 space-y-3 text-sm text-left">
              <li>✓ Everything in Free</li>
              <li>✓ 5 Promoted listings/month</li>
              <li>✓ Verified Seller Badge</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="block w-full mt-10 bg-[#2E8B57] text-white py-3 rounded-2xl font-semibold">Upgrade to Pro</button>
          </div>

          {/* Business */}
          <div className="border rounded-3xl p-8 text-center">
            <h3 className="font-semibold text-xl">Business</h3>
            <p className="text-4xl font-bold mt-4">R499</p>
            <p className="text-gray-500">per month</p>
            <ul className="mt-8 space-y-3 text-sm text-left">
              <li>✓ Everything in Pro</li>
              <li>✓ 15 Promoted listings/month</li>
              <li>✓ Bulk listing tools</li>
              <li>✓ Dedicated support</li>
            </ul>
            <button className="block w-full mt-10 border py-3 rounded-2xl font-medium">Upgrade to Business</button>
          </div>
        </div>
      </div>

      {/* How Pricing Works */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10">
          <h2 className="text-2xl font-semibold text-center mb-8">How Pricing Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-[#2E8B57] text-white flex items-center justify-center flex-shrink-0 font-semibold">1</div>
              <div>
                <h3 className="font-semibold">List for Free</h3>
                <p className="text-gray-600">Create unlimited listings at no cost.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-[#2E8B57] text-white flex items-center justify-center flex-shrink-0 font-semibold">2</div>
              <div>
                <h3 className="font-semibold">Sell & Pay on Success</h3>
                <p className="text-gray-600">We only charge a small success fee when your item sells.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-[#2E8B57] text-white flex items-center justify-center flex-shrink-0 font-semibold">3</div>
              <div>
                <h3 className="font-semibold">Optional Boosts & Tools</h3>
                <p className="text-gray-600">Want more visibility? Buy Promoted Listings or upgrade to Pro.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 text-sm text-gray-500">
            All sales are protected by our Escrow system.<br />
            No hidden fees. You keep most of the money.
          </div>
        </div>
      </div>
    </div>
  );
}