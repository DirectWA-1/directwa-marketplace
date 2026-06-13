'use client';

import { useState } from 'react';

export default function CheckoutContent() {
  const [test, setTest] = useState('Hello');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout Test</h1>
      <p>If you see this, the build should work.</p>
      <p>State test: {test}</p>
      <button 
        onClick={() => setTest('Updated!')} 
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Click me
      </button>
    </div>
  );
}