const variants = {
  primary:
    "rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563EB] font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
  secondary:
    "rounded-xl border border-gray-300 bg-gray-50 font-semibold text-[#0F172A] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "rounded-xl bg-gradient-to-br from-red-600 to-red-700 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
  dangerSoft:
    "rounded-xl border border-red-200 bg-red-50 font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  amber:
    "rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
};

const sizes = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

export default function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  size = "md",
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return (
    <button type={type} className={`${v} ${s} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
