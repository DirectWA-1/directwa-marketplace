export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-9 h-9 border-4 border-[#2E8B57] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}