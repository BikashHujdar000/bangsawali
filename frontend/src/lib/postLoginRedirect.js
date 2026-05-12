/** Where to send the user after sign-in / password change (only in-app paths). */
export function safePostLoginPath(from) {
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) return "/dashboard";
  if (from === "/" || from === "/login" || from === "/account/change-password") return "/dashboard";
  return from;
}
