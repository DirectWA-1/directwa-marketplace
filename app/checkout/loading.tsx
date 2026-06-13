export default function CheckoutLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Title */}
        <div className="h-9 w-48 bg-gray-200 rounded mb-8"></div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Shipping Address Skeleton */}
          <div className="bg-white border rounded-2xl p-8">
            <div className="h-7 w-40 bg-gray-200 rounded mb-6"></div>
            
            <div className="space-y-4">
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-white border rounded-2xl p-8">
            <div className="h-7 w-36 bg-gray-200 rounded mb-6"></div>

            {/* Cart items skeleton */}
            <div className="space-y-4 mb-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between py-3 border-b">
                  <div className="h-5 w-48 bg-gray-100 rounded"></div>
                  <div className="h-5 w-20 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between pt-4 border-t">
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>

            {/* Buttons */}
            <div className="mt-8 space-y-4">
              <div className="h-14 bg-gray-200 rounded-2xl"></div>
              <div className="h-14 bg-gray-100 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}