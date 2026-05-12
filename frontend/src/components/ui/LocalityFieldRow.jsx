import Input from "../common/Input";
import Switch from "../common/Switch";

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-gray-500";

/**
 * Locality: label on its own row; input + "Municipality" + switch share one row, vertically centered.
 */
export default function LocalityFieldRow({
  toggleId,
  toggleName,
  useMunicipality,
  onToggleChange,
  inputId,
  municipalityName = "municipality",
  vdcName = "vdc",
  municipalityValue = "",
  vdcValue = "",
  onChange,
  disabled = false,
  error,
}) {
  const activeName = useMunicipality ? municipalityName : vdcName;
  const displayValue = useMunicipality ? municipalityValue : vdcValue;
  const placeholder = useMunicipality ? "Enter municipality name" : "Enter VDC name";

  function handleInputChange(e) {
    const v = e.target.value;
    onChange({
      ...e,
      target: { ...e.target, name: activeName, value: v, type: "text" },
    });
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={labelClass}>
        Locality
      </label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
        <div className="min-w-0 md:col-span-8">
          <Input
            id={inputId}
            name={activeName}
            value={displayValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        <div className="flex min-h-[3rem] items-center gap-3 md:col-span-4 md:min-h-0 md:justify-end">
          <span
            className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
              useMunicipality ? "text-[#2563EB]" : "text-gray-500"
            }`}
          >
            Municipality
          </span>
          <Switch
            id={toggleId}
            name={toggleName}
            checked={useMunicipality}
            onChange={onToggleChange}
            disabled={disabled}
            size="sm"
            className="shrink-0"
            aria-label="Municipality mode"
          />
        </div>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
