/** Table + shell matching enterprise list pattern */
export function DataTable({ children, className = "", flush = false }) {
  return (
    <div
      className={`overflow-x-auto transition-all duration-200 ${flush ? "" : "rounded-xl border border-gray-200"} ${className}`.trim()}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm text-[#0F172A]">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }) {
  return (
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableHeaderCell({ children, className = "" }) {
  return <th className={`whitespace-nowrap px-4 py-3 ${className}`.trim()}>{children}</th>;
}

export function DataTableRow({ children, className = "" }) {
  return (
    <tr
      className={`border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50/90 ${className}`.trim()}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`.trim()}>{children}</td>;
}
