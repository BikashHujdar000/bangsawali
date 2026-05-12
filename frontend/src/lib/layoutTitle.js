/** Breadcrumb trail for the main app header (matches dashboard mockups). */
export function breadcrumbForPath(pathname) {
  const p = pathname || "";
  if (p === "/dashboard") return [{ label: "Home", to: "/dashboard" }, { label: "Dashboard" }];
  if (p === "/families/add") return [{ label: "Families", to: "/families/view" }, { label: "Add Family" }];
  if (p === "/families/view") return [{ label: "Families", to: "/families/view" }, { label: "Directory" }];
  if (/^\/families\/\d+\/edit/.test(p)) return [{ label: "Families", to: "/families/view" }, { label: "Edit Family" }];
  if (/^\/families\/\d+$/.test(p)) return [{ label: "Families", to: "/families/view" }, { label: "Family details" }];
  if (p === "/persons") return [{ label: "Members", to: "/persons" }, { label: "Persons" }];
  if (p.startsWith("/persons/")) return [{ label: "Members", to: "/persons" }, { label: "Person details" }];
  if (p === "/users/create") return [{ label: "Administration", to: "/users" }, { label: "Create User" }];
  if (p === "/users") return [{ label: "Administration", to: "/users" }, { label: "Users" }];
  if (p === "/transactions") return [{ label: "Financials", to: "/dashboard" }, { label: "Transactions" }];
  if (p === "/reports") return [{ label: "Reports & audit", to: "/reports" }, { label: "Reports" }];
  if (p === "/audit-logs") return [{ label: "Reports & audit", to: "/audit-logs" }, { label: "Audit Logs" }];
  if (p === "/settings") return [{ label: "Configuration", to: "/settings" }, { label: "Settings" }];
  return [{ label: "Home", to: "/dashboard" }, { label: "Dashboard" }];
}

/** Short line under the main page title in the header. */
export function pageDescriptionForPath(pathname) {
  const p = pathname || "";
  if (p === "/dashboard") return "Key metrics and activity for your Bangsawali workspace.";
  if (p === "/families/add") return "Manage and register family information.";
  if (p === "/families/view") return "Browse and open registered families.";
  if (/^\/families\/\d+\/edit/.test(p)) return "Update family registration details.";
  if (/^\/families\/\d+$/.test(p)) return "View household summary and linked members.";
  if (p === "/persons") return "Search and maintain community members.";
  if (p.startsWith("/persons/")) return "Individual profile and relationships.";
  if (p === "/users/create") return "Provision accounts for staff and administrators.";
  if (p === "/users") return "Directory of system users and roles.";
  if (p === "/transactions") return "Deposits, withdrawals, and ledger activity.";
  if (p === "/reports") return "Scheduled and ad-hoc community reports.";
  if (p === "/audit-logs") return "Security and change history.";
  if (p === "/settings") return "Workspace preferences and configuration.";
  return "";
}

/** Page title for top navbar from pathname (no API impact). */
export function titleForPath(pathname) {
  const p = pathname || "";
  if (p === "/dashboard") return "Dashboard";
  if (p === "/users/create") return "Create User";
  if (p === "/users") return "Users";
  if (p === "/persons") return "Persons";
  if (p.startsWith("/persons/")) return "Person details";
  if (p === "/families/add") return "Add Family";
  if (p === "/families/view") return "Families";
  if (/^\/families\/\d+\/edit/.test(p)) return "Edit Family";
  if (/^\/families\/\d+$/.test(p)) return "Family details";
  if (p === "/transactions") return "Transactions";
  if (p === "/reports") return "Reports";
  if (p === "/audit-logs") return "Audit Logs";
  if (p === "/settings") return "Settings";
  if (p === "/families") return "Families";
  return "Bangsawali";
}

/** Greeting line under the Bangsawali eyebrow (design reference). */
export function subtitleForPath(pathname, sessionUsername = "") {
  const p = pathname || "";
  if (p === "/login" || p.startsWith("/login")) return "";
  const name = (sessionUsername || "").trim() || "there";
  return `Welcome back, ${name}`;
}

/** Display role under the user name in the header (from JWT authority list). */
export function roleLabelFromAuthorities(authorities = []) {
  const set = new Set(authorities);
  if (set.has("ROLE_SUPER_ADMIN")) return "Super Admin";
  if (set.has("ROLE_ADMIN")) return "Admin";
  if (set.has("ROLE_USER")) return "User";
  return "Member";
}
