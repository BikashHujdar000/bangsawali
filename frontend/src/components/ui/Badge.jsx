const variants = {
  success: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  neutral: "border border-gray-200 bg-gray-100 text-gray-700",
  role: "border border-indigo-100 bg-indigo-50 text-indigo-800",
  danger: "border border-red-200 bg-red-50 text-red-700",
};

export default function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${variants[variant] || variants.neutral} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
