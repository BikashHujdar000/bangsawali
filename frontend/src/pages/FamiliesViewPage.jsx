import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import { deleteFamily, deleteFamilyPermanent, listFamilies, restoreFamily } from "../services/familyService";
import { listPersons } from "../services/personService";
import { listDistricts } from "../services/districtService";
import { getErrorMessage } from "../lib/http";
import { canEditFamilyData, isSuperAdmin } from "../lib/authStorage";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminBtnSmAmber,
  adminBtnSmPrimary,
  DataTableShell,
  MainPanel,
  PageHeader,
  PanelBody,
  PanelToolbar,
  dataTableClass,
  dataTableHeadRowClass,
  dataTableRowClass,
  dataTableTdClass,
  dataTableThClass,
} from "../components/admin/DetailLayout";

export default function FamiliesViewPage() {
  const [families, setFamilies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "active",
    query: "",
    familyId: "",
    primaryPersonId: "",
    province: "",
    districtId: "",
    municipality: "",
    vdc: "",
    wardNo: "",
    tole: "",
    hasParentLinks: "any",
    hasSpouse: "any",
    hasChildren: "any",
  });
  const [draftFilters, setDraftFilters] = useState({
    status: "active",
    query: "",
    familyId: "",
    primaryPersonId: "",
    province: "",
    districtId: "",
    municipality: "",
    vdc: "",
    wardNo: "",
    tole: "",
    hasParentLinks: "any",
    hasSpouse: "any",
    hasChildren: "any",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [retrievingId, setRetrievingId] = useState(null);
  const [permanentEraseTarget, setPermanentEraseTarget] = useState(null);
  const [erasingPermanent, setErasingPermanent] = useState(false);
  const superAdmin = isSuperAdmin();
  /** Backend allows status=deleted|all for ADMIN and SUPER_ADMIN (retrieve remains super-admin only). */
  const canScopeFamilyList = canEditFamilyData();

  async function fetchFamilies() {
    setLoading(true);
    setError("");
    try {
      const listOpts = canScopeFamilyList && filters.status ? { status: filters.status } : {};
      const [familyData, personData, districtData] = await Promise.all([
        listFamilies(listOpts),
        listPersons(),
        listDistricts(),
      ]);
      setFamilies(familyData);
      setPersons(personData);
      setDistricts(districtData);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load families."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFamilies();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when super-admin list scope changes
  }, [filters.status]);

  const personsByFamily = persons.reduce((acc, person) => {
    const familyId = person?.family?.id;
    if (!familyId) return acc;
    if (!acc[familyId]) acc[familyId] = [];
    acc[familyId].push(person);
    return acc;
  }, {});

  function pickPrimaryOrFirstMember(family) {
    const members = personsByFamily[family.id] || [];
    if (family.primaryPersonId) {
      const found = members.find((member) => member.id === family.primaryPersonId);
      if (found) return found;
    }
    return members[0] || null;
  }

  function firstNonEmpty(members, key) {
    const found = members.find((m) => m?.[key]);
    return found?.[key] || "";
  }

  function familyFacts(family) {
    const members = personsByFamily[family.id] || [];
    const primary = pickPrimaryOrFirstMember(family);
    const district = primary?.district || null;
    const province = district?.provinceNameEn || "";
    const districtId = district?.id ? String(district.id) : "";
    const districtName = district?.nameEn || "";
    const municipality = primary?.municipality || firstNonEmpty(members, "municipality");
    const vdc = primary?.vdc || firstNonEmpty(members, "vdc");
    const tole = primary?.toleEn || firstNonEmpty(members, "toleEn");
    const wardNo = primary?.wardNo ?? members.find((m) => m?.wardNo != null)?.wardNo ?? "";
    const hasParentLinks = Boolean(primary?.father || primary?.mother);
    const hasSpouse = members.some((m) => m?.spouse);
    const hasChildren = family.primaryPersonId
      ? members.some((m) => m?.father?.id === family.primaryPersonId || m?.mother?.id === family.primaryPersonId)
      : members.some((m) => m?.father || m?.mother);
    /** Parents linked on the household primary (same notion as Family Details → Relations). */
    const parentLinkedCount = (primary?.father ? 1 : 0) + (primary?.mother ? 1 : 0);
    const spouseLinkedCount = members.filter((m) => m?.spouse).length;
    const searchable = [
      family.id,
      family.familyNameEn,
      family.familyNameNp,
      family.primaryPersonNameEn,
      family.primaryPersonNameNp,
      family.primaryPersonId,
      districtName,
      province,
      municipality,
      vdc,
      tole,
      ...members.map((m) => `${m.nameEn || ""} ${m.nameNp || ""} ${m.phone || ""}`),
    ]
      .join(" ")
      .toLowerCase();

    return {
      primary,
      province,
      districtId,
      districtName,
      municipality,
      vdc,
      tole,
      wardNo: wardNo === "" ? "" : String(wardNo),
      hasParentLinks,
      hasSpouse,
      hasChildren,
      parentLinkedCount,
      spouseLinkedCount,
      searchable,
      membersCount: members.length,
    };
  }

  function triStatePass(filterValue, boolValue) {
    if (filterValue === "any") return true;
    if (filterValue === "yes") return boolValue;
    return !boolValue;
  }

  const filteredFamilies = families.filter((family) => {
    const facts = familyFacts(family);
    const q = filters.query.trim().toLowerCase();
    if (q && !facts.searchable.includes(q)) return false;
    if (filters.familyId && String(family.id) !== filters.familyId.trim()) return false;
    if (filters.primaryPersonId && String(family.primaryPersonId || "") !== filters.primaryPersonId.trim()) return false;
    if (filters.province && facts.province !== filters.province) return false;
    if (filters.districtId && facts.districtId !== filters.districtId) return false;
    if (filters.municipality && !facts.municipality.toLowerCase().includes(filters.municipality.toLowerCase())) return false;
    if (filters.vdc && !facts.vdc.toLowerCase().includes(filters.vdc.toLowerCase())) return false;
    if (filters.wardNo && facts.wardNo !== filters.wardNo.trim()) return false;
    if (filters.tole && !facts.tole.toLowerCase().includes(filters.tole.toLowerCase())) return false;
    if (!triStatePass(filters.hasParentLinks, facts.hasParentLinks)) return false;
    if (!triStatePass(filters.hasSpouse, facts.hasSpouse)) return false;
    if (!triStatePass(filters.hasChildren, facts.hasChildren)) return false;
    return true;
  });

  const provinceOptions = [...new Set(districts.map((d) => d.provinceNameEn).filter(Boolean))];

  function onFilterChange(event) {
    const { name, value } = event.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  }

  function clearFilters() {
    const cleared = {
      status: "active",
      query: "",
      familyId: "",
      primaryPersonId: "",
      province: "",
      districtId: "",
      municipality: "",
      vdc: "",
      wardNo: "",
      tole: "",
      hasParentLinks: "any",
      hasSpouse: "any",
      hasChildren: "any",
    };
    setFilters(cleared);
    setDraftFilters(cleared);
  }

  function openFilterModal() {
    setDraftFilters(filters);
    setFilterOpen(true);
  }

  function activeFilterCount() {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "status") return canScopeFamilyList && value !== "active";
      if (["hasParentLinks", "hasSpouse", "hasChildren"].includes(key)) return value !== "any";
      return String(value || "").trim() !== "";
    }).length;
  }

  function applyFilters() {
    setFilters(draftFilters);
    setFilterOpen(false);
  }

  async function confirmDeleteFamily() {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setError("");
    try {
      await deleteFamily(deleteTarget.id);
      setDeleteTarget(null);
      await fetchFamilies();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete this family."));
    } finally {
      setDeleting(false);
    }
  }

  async function handleRetrieveFamily(familyId) {
    if (!familyId) return;
    setRetrievingId(familyId);
    setError("");
    try {
      await restoreFamily(familyId);
      await fetchFamilies();
    } catch (err) {
      setError(getErrorMessage(err, "Could not retrieve this family."));
    } finally {
      setRetrievingId(null);
    }
  }

  async function confirmPermanentEraseFamily() {
    if (!permanentEraseTarget?.id) return;
    setErasingPermanent(true);
    setError("");
    try {
      await deleteFamilyPermanent(permanentEraseTarget.id);
      setPermanentEraseTarget(null);
      await fetchFamilies();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete this family permanently."));
    } finally {
      setErasingPermanent(false);
    }
  }

  return (
    <AppLayout>
      <PageHeader title="Family management" />

      <MainPanel>
        <PanelToolbar
          title="Family list"
          hint={!loading ? `Showing ${filteredFamilies.length} of ${families.length} families` : undefined}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {canScopeFamilyList ? (
                <Select
                  aria-label="Family status"
                  name="status"
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="min-w-[180px]"
                >
                  <option value="active">Status: Active</option>
                  <option value="deleted">Status: Deleted</option>
                  <option value="all">Status: All</option>
                </Select>
              ) : null}
              <button type="button" className={`${adminBtnSecondary} gap-2`} onClick={openFilterModal}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
                </svg>
                Filters {activeFilterCount() > 0 ? `(${activeFilterCount()})` : ""}
              </button>
              <button type="button" className={adminBtnPrimary} onClick={fetchFamilies}>
                Refresh
              </button>
            </div>
          }
        />
        <PanelBody>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && families.length === 0 && <p className="text-sm text-slate-500">No families found.</p>}
          {!loading && families.length > 0 && filteredFamilies.length > 0 && (
            <DataTableShell>
              <table className={dataTableClass}>
                <thead>
                  <tr className={dataTableHeadRowClass}>
                    <th className={dataTableThClass}>ID</th>
                    {canScopeFamilyList ? <th className={dataTableThClass}>Status</th> : null}
                    <th className={dataTableThClass}>Family name (English)</th>
                    <th className={dataTableThClass}>Family name (Nepali)</th>
                    <th className={dataTableThClass}>Primary person</th>
                    <th className={dataTableThClass}>Location</th>
                    <th className={dataTableThClass}>Relations</th>
                    <th className={dataTableThClass}>Members</th>
                    <th className={dataTableThClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilies.map((family) => {
                    const facts = familyFacts(family);
                    const location = [facts.province, facts.districtName, facts.municipality || facts.vdc, facts.tole]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <tr
                        key={family.id}
                        className={`${dataTableRowClass}${family.deleted ? " bg-amber-50/50" : ""}`}
                      >
                        <td className={`${dataTableTdClass} font-mono font-medium text-slate-700`}>{family.id}</td>
                        {canScopeFamilyList ? (
                          <td className={dataTableTdClass}>
                            {family.deleted ? (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                                Deleted
                              </span>
                            ) : (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                                Active
                              </span>
                            )}
                          </td>
                        ) : null}
                        <td className={dataTableTdClass}>{family.familyNameEn}</td>
                        <td className={dataTableTdClass}>{family.familyNameNp}</td>
                        <td className={dataTableTdClass}>{family.primaryPersonNameEn || "—"}</td>
                        <td className={dataTableTdClass}>{location || "—"}</td>
                        <td className={`${dataTableTdClass} text-xs text-slate-700`}>
                          Parents: {facts.parentLinkedCount} · Spouse: {facts.spouseLinkedCount} · Children:{" "}
                          {facts.hasChildren ? "Yes" : "No"}
                        </td>
                        <td className={dataTableTdClass}>{facts.membersCount}</td>
                        <td className={dataTableTdClass}>
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/families/${family.id}`} className={adminBtnSmPrimary}>
                              View
                            </Link>
                            {superAdmin && family.deleted ? (
                              <>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  className="!px-2.5 !py-1 !text-xs"
                                  disabled={retrievingId === family.id}
                                  onClick={() => handleRetrieveFamily(family.id)}
                                >
                                  {retrievingId === family.id ? "Retrieving…" : "Retrieve"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="danger"
                                  size="sm"
                                  className="!px-2.5 !py-1 !text-xs"
                                  disabled={erasingPermanent}
                                  onClick={() => setPermanentEraseTarget(family)}
                                >
                                  Delete permanently
                                </Button>
                              </>
                            ) : null}
                            {canEditFamilyData() && !family.deleted ? (
                              <>
                                <Link to={`/families/${family.id}/edit`} className={adminBtnSmAmber}>
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                  onClick={() => setDeleteTarget(family)}
                                >
                                  Delete
                                </button>
                              </>
                            ) : !canEditFamilyData() ? (
                              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-[#64748B]">
                                Edit: Admin only
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DataTableShell>
          )}
          {!loading && families.length > 0 && filteredFamilies.length === 0 && (
            <p className="text-sm text-slate-500">No families match current filters.</p>
          )}
        </PanelBody>
      </MainPanel>

      {permanentEraseTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
            <h2 className="text-lg font-semibold text-slate-900">Are you sure you want to delete this family permanently?</h2>
            <p className="mt-2 text-sm leading-snug text-slate-600">
              You are about to permanently remove{" "}
              <span className="font-medium text-slate-800">
                Family #{permanentEraseTarget.id} — {permanentEraseTarget.familyNameEn}
              </span>
              . This deletes the household, every associated member, and their financial and role records. This action cannot be
              undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" className={adminBtnSecondary} onClick={() => setPermanentEraseTarget(null)} disabled={erasingPermanent}>
                Cancel
              </button>
              <Button type="button" variant="danger" size="sm" disabled={erasingPermanent} onClick={confirmPermanentEraseFamily}>
                {erasingPermanent ? "Deleting…" : "Delete permanently"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
            <h2 className="text-lg font-semibold text-slate-900">Are you sure you want to delete this family?</h2>
            <p className="mt-2 text-sm leading-snug text-slate-600">
              This will soft-delete{" "}
              <span className="font-medium text-slate-800">
                Family #{deleteTarget.id} — {deleteTarget.familyNameEn}
              </span>{" "}
              and all associated household members. They will disappear from the active list but can be restored later by an
              administrator.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" className={adminBtnSecondary} onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <Button type="button" variant="danger" size="sm" disabled={deleting} onClick={confirmDeleteFamily}>
                {deleting ? "Deleting…" : "Delete family"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto shadow-2xl" padding="p-6 md:p-8" title="Filter families">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {canScopeFamilyList ? (
                <Select name="status" value={draftFilters.status} onChange={onFilterChange}>
                  <option value="active">Status: Active (default)</option>
                  <option value="deleted">Status: Deleted only</option>
                  <option value="all">Status: All</option>
                </Select>
              ) : null}
              <Input name="query" value={draftFilters.query} onChange={onFilterChange} placeholder="Search: family, person, phone, location..." />
              <Input name="familyId" value={draftFilters.familyId} onChange={onFilterChange} placeholder="Family ID" />
              <Input name="primaryPersonId" value={draftFilters.primaryPersonId} onChange={onFilterChange} placeholder="Primary Person ID" />
              <Select name="province" value={draftFilters.province} onChange={onFilterChange}>
                <option value="">Province (All)</option>
                {provinceOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
              <Select name="districtId" value={draftFilters.districtId} onChange={onFilterChange}>
                <option value="">District (All)</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameEn} ({d.nameNp})</option>
                ))}
              </Select>
              <Input name="wardNo" value={draftFilters.wardNo} onChange={onFilterChange} placeholder="Ward no" />
              <Input name="municipality" value={draftFilters.municipality} onChange={onFilterChange} placeholder="Municipality" />
              <Input name="vdc" value={draftFilters.vdc} onChange={onFilterChange} placeholder="VDC" />
              <Input name="tole" value={draftFilters.tole} onChange={onFilterChange} placeholder="Tole" />
              <Select name="hasParentLinks" value={draftFilters.hasParentLinks} onChange={onFilterChange}>
                <option value="any">Parent links: Any</option>
                <option value="yes">Parent links: Yes</option>
                <option value="no">Parent links: No</option>
              </Select>
              <Select name="hasSpouse" value={draftFilters.hasSpouse} onChange={onFilterChange}>
                <option value="any">Has spouse: Any</option>
                <option value="yes">Has spouse: Yes</option>
                <option value="no">Has spouse: No</option>
              </Select>
              <Select name="hasChildren" value={draftFilters.hasChildren} onChange={onFilterChange}>
                <option value="any">Has children: Any</option>
                <option value="yes">Has children: Yes</option>
                <option value="no">Has children: No</option>
              </Select>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => setFilterOpen(false)}>
                Close
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={clearFilters}>
                Reset
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
