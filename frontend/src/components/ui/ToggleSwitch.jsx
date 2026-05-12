import Switch from "../common/Switch";

/**
 * Labelled switch row for forms (same Switch API: name, checked, onChange, disabled).
 */
export default function ToggleSwitch({ id, name, checked, onChange, disabled, label, description }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </div>
      <div className="shrink-0">
        <Switch id={id} name={name} checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}
