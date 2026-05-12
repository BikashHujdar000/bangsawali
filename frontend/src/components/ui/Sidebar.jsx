import { NavLink } from "react-router-dom";
import { getAuthorities, getSessionUsername } from "../../lib/authStorage";
import { roleLabelFromAuthorities } from "../../lib/layoutTitle";

function navRowClass(isActive) {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-br from-[#3b82f6] to-[#2563EB] text-white shadow-md"
      : "text-slate-200 hover:bg-white/10 hover:text-white"
  }`;
}

function Icon({ children, className = "" }) {
  return (
    <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center ${className}`}>
      {children}
    </span>
  );
}

function SidebarNavLink({ to, end, icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end === true}
      onClick={onNavigate}
      className={({ isActive }) => navRowClass(isActive)}
    >
      {icon}
      {label}
    </NavLink>
  );
}

const ic = {
  addFamily: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  viewFamilies: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  persons: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20v-1a4 4 0 014-4h6a4 4 0 014 4v1" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  createUser: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="9" cy="8" r="3" />
        <path d="M5 20v-1a4 4 0 014-4h1M16 11h6M19 8v6" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  users: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20v-1a5 5 0 015-5h2M14 20v-1a4 4 0 014-4" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  overview: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 19V5M4 19h16M4 19l4-5 4 4 4-6 4 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Icon>
  ),
  transactions: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M7 16V4M17 8v12M7 16h10M7 16l3-3m0 0l3 3M17 8l-3 3m0 0l-3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Icon>
  ),
  reports: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M9 17H5V3h14v6M9 21h10M9 13h10M9 9h5" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  audit: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M9 5H7a2 2 0 00-2 2v12l3-2 3 2 3-2 3 2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  settings: (
    <Icon>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
};

const section = "mb-2 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 first:mt-0";
const subNav = "mt-1.5 flex flex-col gap-0.5";

export default function Sidebar({ mobileOpen, onNavigate }) {
  const close = () => onNavigate?.();
  const sessionName = getSessionUsername().trim() || "User";
  const roleLabel = roleLabelFromAuthorities(getAuthorities());

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-800/80 bg-[#0F172A] px-4 py-5 text-white transition-transform duration-200 ease-out md:static md:z-0 md:translate-x-0 ${
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563EB] text-sm font-bold text-white shadow-md">
          B
        </div>
        <div className="min-w-0">
          <p className="truncate text-[0.62rem] font-bold uppercase tracking-[0.28em] text-blue-100/90">Bangsawali</p>
          <p className="truncate text-sm font-semibold text-white">{sessionName}</p>
          <p className="truncate text-xs text-slate-400">{roleLabel}</p>
        </div>
      </div>

      <nav className="mt-3 flex-1 overflow-y-auto pb-6">
        <p className={section}>Main services</p>
        <div className={subNav}>
          <SidebarNavLink to="/families/add" end icon={ic.addFamily} label="Add Family" onNavigate={close} />
          <SidebarNavLink to="/families/view" end icon={ic.viewFamilies} label="View Families" onNavigate={close} />
        </div>

        <p className={section}>Member management</p>
        <div className={subNav}>
          <SidebarNavLink to="/persons" icon={ic.persons} label="Persons" onNavigate={close} />
        </div>

        <p className={section}>User &amp; system admin</p>
        <div className={subNav}>
          <SidebarNavLink to="/users/create" end icon={ic.createUser} label="Create User" onNavigate={close} />
          <SidebarNavLink to="/users" end icon={ic.users} label="Users" onNavigate={close} />
        </div>

        <p className={section}>Financials</p>
        <div className={subNav}>
          <SidebarNavLink to="/dashboard" end icon={ic.overview} label="Overview" onNavigate={close} />
          <SidebarNavLink to="/transactions" icon={ic.transactions} label="Transactions" onNavigate={close} />
        </div>

        <p className={section}>Reports &amp; audit</p>
        <div className={subNav}>
          <SidebarNavLink to="/reports" icon={ic.reports} label="Reports" onNavigate={close} />
          <SidebarNavLink to="/audit-logs" icon={ic.audit} label="Audit Logs" onNavigate={close} />
        </div>

        <p className={section}>Configuration</p>
        <div className={subNav}>
          <SidebarNavLink to="/settings" icon={ic.settings} label="Settings" onNavigate={close} />
        </div>
      </nav>
    </aside>
  );
}
