export const inputBaseClass =
  "h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#0F172A] outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-gray-50 read-only:text-gray-700";

export default function Input({ className = "", ...props }) {
  return <input className={`${inputBaseClass} ${className}`.trim()} {...props} />;
}
