const labelClass = "block text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function FormField({ label, htmlFor, hint, error, children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {children}
    </div>
  );
}

/** Table header: human-readable column title only. */
export function TableColumnHead({ label, className = "" }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 ${className}`}>{label}</th>
  );
}
