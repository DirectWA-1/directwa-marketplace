export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-[#2E8B57] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}