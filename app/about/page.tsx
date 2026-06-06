export default function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-6">About DirectWA</h1>

      <div className="prose prose-gray max-w-none text-gray-700">
        <p className="text-lg">
          DirectWA was built to solve a simple problem: making local buying and selling in South Africa easier, safer, and more direct.
        </p>

        <h2 className="mt-8">Our Mission</h2>
        <p>
          We believe that buying and selling locally shouldn’t require complicated apps, high fees, or middlemen. 
          DirectWA combines the simplicity of WhatsApp with the structure of a modern marketplace.
        </p>

        <h2 className="mt-8">Why We Built This</h2>
        <p>
          Many South Africans already buy and sell using WhatsApp groups and Facebook Marketplace. 
          While convenient, these methods lack safety, structure, and discoverability. 
          DirectWA was created to bring the best of both worlds together.
        </p>

        <h2 className="mt-8">Our Approach</h2>
        <ul>
          <li><strong>Simple:</strong> List items quickly and chat naturally on WhatsApp.</li>
          <li><strong>Safe:</strong> Optional escrow protection for higher-value transactions.</li>
          <li><strong>Local:</strong> Built specifically for South African buyers and sellers.</li>
          <li><strong>Fair:</strong> Low fees. You keep more of what you earn.</li>
        </ul>

        <p className="mt-10 text-sm text-gray-500">
          DirectWA is currently in active development. We’re constantly improving the platform based on user feedback.
        </p>
      </div>
    </div>
  );
}