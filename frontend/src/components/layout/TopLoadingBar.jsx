import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { beginRoutePulse, subscribe } from "../../lib/requestLoading";

/**
 * Fixed top indeterminate bar while HTTP requests (or route pulses) are active.
 */
export default function TopLoadingBar() {
  const [active, setActive] = useState(false);
  const location = useLocation();
  const skipNextRoutePulse = useRef(true);

  useEffect(() => {
    return subscribe((n) => setActive(n > 0));
  }, []);

  useEffect(() => {
    if (skipNextRoutePulse.current) {
      skipNextRoutePulse.current = false;
      return;
    }
    beginRoutePulse();
  }, [location.pathname]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-slate-200/90 shadow-sm shadow-slate-300/40"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-full w-2/5 rounded-none bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#60a5fa] shadow-[0_0_12px_rgba(37,99,235,0.45)] animate-[loader_1.15s_ease-in-out_infinite]" />
    </div>
  );
}
