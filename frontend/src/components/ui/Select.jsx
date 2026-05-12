import { forwardRef } from "react";

const selectClass =
  "h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-[#0F172A] outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50";

const Select = forwardRef(function Select({ className = "", ...props }, ref) {
  return <select ref={ref} className={`${selectClass} ${className}`.trim()} {...props} />;
});

export default Select;
