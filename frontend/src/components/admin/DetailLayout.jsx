/**
 * Read-only layout primitives — same visual language as guided forms (labels, cards, tables).
 * Does not replace <Input /> / <select /> on edit flows; use on detail / list views.
 */

export const adminBtnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100";

export const adminBtnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow focus:outline-none focus:ring-4 focus:ring-blue-100";

export const adminBtnAmber =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-100";

/** Compact actions (e.g. table row). */
export const adminBtnSmPrimary =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow";
export const adminBtnSmAmber =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Outer white card (one main panel per page or per major block). */
export function MainPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function PanelToolbar({ title, hint, actions }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 md:px-6">
      <div>
        <h2 className="text-base font-semibold text-[#0F172A]">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-[#64748B]">{hint}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function PanelBody({ children, className = "" }) {
  return <div className={`space-y-6 px-5 py-5 md:px-6 md:py-6 ${className}`.trim()}>{children}</div>;
}

/** Section inside a panel (eyebrow + title + optional description). */
export function DetailSection({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={className}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">{eyebrow}</p>
      ) : null}
      <h3 className="mt-1 text-base font-semibold text-[#0F172A]">{title}</h3>
      {description ? <p className="mt-1 text-sm text-[#64748B]">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Read-only “field” cell (mirrors form field weight without inputs). */
export function DetailField({ label, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 transition-colors duration-200">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-[#0F172A]">{children}</div>
    </div>
  );
}

export function DetailFieldGrid({ children }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function DataTableShell({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 transition-shadow duration-200 hover:shadow-sm">
      {children}
    </div>
  );
}

export const dataTableClass = "w-full border-collapse text-left text-sm";
export const dataTableHeadRowClass =
  "border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-600";
export const dataTableThClass = "whitespace-nowrap px-4 py-3";
export const dataTableTdClass = "border-b border-gray-100 px-4 py-3 align-top text-[#0F172A]";
export const dataTableRowClass = "transition-colors duration-200 hover:bg-gray-50/90";
