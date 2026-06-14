export default function TrustBanner() {
  return (
    <section className="border-y bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-6">
          <span className="text-sm font-semibold text-[#1E3A5F]">
            Escrow Protected
          </span>
          <span className="hidden text-gray-300 md:inline">•</span>

          <span className="text-sm font-semibold text-[#1E3A5F]">
            WhatsApp Direct
          </span>
          <span className="hidden text-gray-300 md:inline">•</span>

          <span className="text-sm font-semibold text-[#1E3A5F]">
            Safe Local Deals
          </span>
        </div>
      </div>
    </section>
  );
}
