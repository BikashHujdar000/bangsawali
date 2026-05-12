/**
 * Enterprise card shell — rounded-2xl, light border, soft shadow, hover lift.
 */
export default function Card({ children, className = "", padding = "p-6 md:p-8", title, description, headerRight }) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${padding} ${className}`.trim()}
    >
      {(title || description || headerRight) && (
        <div className={`mb-6 flex flex-wrap items-start justify-between gap-3 ${title || description ? "" : "mb-0"}`}>
          <div>
            {title ? <h2 className="text-lg font-semibold tracking-tight text-[#0F172A]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[#64748B]">{description}</p> : null}
          </div>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
