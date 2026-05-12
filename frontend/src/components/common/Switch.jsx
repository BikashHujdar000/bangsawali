/**
 * Accessible toggle (role="switch"). Dispatches a checkbox-shaped synthetic event
 * so existing onChange handlers using event.target.name / checked keep working.
 */
export default function Switch({ id, name, checked, onChange, disabled, className = "", size = "md", ...rest }) {
  const isSm = size === "sm";
  const track = isSm ? "h-6 w-11" : "h-7 w-12";
  const thumb = isSm ? "h-4 w-4" : "h-5 w-5";
  const thumbOn = isSm ? "translate-x-[1.25rem]" : "translate-x-[1.375rem]";
  const thumbOff = "translate-x-0.5";

  return (
    <button
      type="button"
      id={id}
      role="switch"
      name={name}
      aria-checked={checked}
      disabled={disabled}
      onClick={() =>
        onChange({
          target: { name, type: "checkbox", checked: !checked },
        })
      }
      className={`relative inline-flex ${track} shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-gradient-to-r from-[#3b82f6] to-[#2563EB] shadow-sm" : "bg-gray-300"
      } ${className}`.trim()}
      {...rest}
    >
      <span
        className={`pointer-events-none mt-0.5 inline-block ${thumb} rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? thumbOn : thumbOff
        }`}
      />
    </button>
  );
}
