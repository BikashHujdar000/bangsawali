import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import {
  adminBtnAmber,
  adminBtnSecondary,
  DataTableShell,
  DetailField,
  DetailFieldGrid,
  DetailSection,
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
import {
  deleteFamily,
  deleteFamilyPermanent,
  getFamilyById,
  getFamilyByIdIncludingDeleted,
  listFamilyPersons,
  listFamilyPersonsExtended,
  restoreFamily,
} from "../services/familyService";
import { getErrorMessage } from "../lib/http";
import { canEditFamilyData, isSuperAdmin } from "../lib/authStorage";
import Button from "../components/common/Button";

function formatDob(v) {
  if (v == null || v === "") return "—";
  const s = typeof v === "string" ? v : String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function locality(p) {
  if (!p) return "—";
  if (p.municipality) return p.municipality;
  if (p.vdc) return p.vdc;
  return "—";
}

function refPerson(p) {
  if (!p) return "—";
  return `${p.nameEn || "—"} / ${p.nameNp || "—"} (ID ${p.id})`;
}

function PersonDetailsTable({ title, subtitle, members, showHouseholdCol, pageFamilyId, primaryPersonId }) {
  if (!members.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p> : null}
        <p className="mt-3 text-sm text-[#64748B]">No people in this list.</p>
      </div>
    );
  }
  const showRoleCol = primaryPersonId != null && !showHouseholdCol;
  const hasHeading = Boolean((title && String(title).trim()) || (subtitle && String(subtitle).trim()));
  return (
    <div>
      {hasHeading ? (
        <div className="mb-4">
          {title ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
          ) : null}
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
      ) : null}
      <DataTableShell>
        <table className={`${dataTableClass} min-w-[960px]`}>
          <thead>
            <tr className={dataTableHeadRowClass}>
              <th className={dataTableThClass}>ID</th>
              {showRoleCol ? <th className={dataTableThClass}>Role</th> : null}
              <th className={dataTableThClass}>Name (English)</th>
              <th className={dataTableThClass}>Name (Nepali)</th>
              <th className={dataTableThClass}>DOB</th>
              <th className={dataTableThClass}>Gender</th>
              <th className={dataTableThClass}>Phone</th>
              <th className={dataTableThClass}>Province</th>
              <th className={dataTableThClass}>District</th>
              <th className={dataTableThClass}>Ward</th>
              <th className={dataTableThClass}>Municipality / VDC</th>
              <th className={dataTableThClass}>Tole</th>
              <th className={`${dataTableThClass} min-w-[140px]`}>Father</th>
              <th className={`${dataTableThClass} min-w-[140px]`}>Mother</th>
              <th className={`${dataTableThClass} min-w-[120px]`}>Spouse</th>
              {showHouseholdCol ? <th className={dataTableThClass}>Household row</th> : null}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const other =
                showHouseholdCol &&
                m.family?.id != null &&
                pageFamilyId != null &&
                Number(m.family.id) !== Number(pageFamilyId);
              return (
                <tr key={m.id} className={dataTableRowClass}>
                  <td className={`${dataTableTdClass} font-mono`}>
                    <Link className="font-medium text-[#2563EB] hover:underline" to={`/persons/${m.id}`}>
                      {m.id}
                    </Link>
                  </td>
                  {showRoleCol ? (
                    <td className={`${dataTableTdClass} whitespace-nowrap`}>
                      {Number(m.id) === Number(primaryPersonId) ? (
                        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                          Primary
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  ) : null}
                  <td className={dataTableTdClass}>{m.nameEn || "—"}</td>
                  <td className={dataTableTdClass}>{m.nameNp || "—"}</td>
                  <td className={`${dataTableTdClass} whitespace-nowrap`}>{formatDob(m.dateOfBirth)}</td>
                  <td className={dataTableTdClass}>{m.gender || "—"}</td>
                  <td className={`${dataTableTdClass} whitespace-nowrap`}>{m.phone || "—"}</td>
                  <td className={dataTableTdClass}>{m.district?.provinceNameEn || "—"}</td>
                  <td className={dataTableTdClass}>{m.district?.nameEn || "—"}</td>
                  <td className={dataTableTdClass}>{m.wardNo != null ? String(m.wardNo) : "—"}</td>
                  <td className={dataTableTdClass}>{locality(m)}</td>
                  <td className={dataTableTdClass}>{m.toleEn || "—"}</td>
                  <td className={`${dataTableTdClass} text-xs leading-snug text-slate-700`}>{refPerson(m.father)}</td>
                  <td className={`${dataTableTdClass} text-xs leading-snug text-slate-700`}>{refPerson(m.mother)}</td>
                  <td className={`${dataTableTdClass} text-xs leading-snug text-slate-700`}>{refPerson(m.spouse)}</td>
                  {showHouseholdCol ? (
                    <td className={dataTableTdClass}>
                      {other ? (
                        <Link className="font-medium text-[#2563EB] hover:underline" to={`/families/${m.family.id}`}>
                          #{m.family.id}
                        </Link>
                      ) : (
                        <span className="text-slate-600">This family</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}

function RelationPersonLine({ person, pageFamilyId, emptyText = "—" }) {
  if (!person) return <p className="text-sm text-slate-500">{emptyText}</p>;
  const otherHousehold =
    person.family?.id != null &&
    pageFamilyId != null &&
    !Number.isNaN(Number(pageFamilyId)) &&
    Number(person.family.id) !== Number(pageFamilyId);
  return (
    <p className="text-sm text-slate-900">
      <span className="font-semibold">{person.nameEn || "—"}</span>{" "}
      <span className="text-slate-600">({person.nameNp || "—"})</span>{" "}
      <span className="text-xs font-normal text-slate-500">ID {person.id}</span>
      {otherHousehold ? (
        <span className="ml-1 text-xs font-medium text-amber-800">· household #{person.family.id}</span>
      ) : null}
    </p>
  );
}

export default function FamiliesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = id ? Number(id) : NaN;
  const superAdmin = isSuperAdmin();
  const [family, setFamily] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [extendedMembers, setExtendedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [eraseFamilyDbOpen, setEraseFamilyDbOpen] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [familyData, household, extended] = await Promise.all([
        getFamilyById(id),
        listFamilyPersons(id),
        listFamilyPersonsExtended(id),
      ]);
      setFamily(familyData);
      setHouseholdMembers(household);
      setExtendedMembers(extended);
    } catch (err) {
      // SUPER_ADMIN can still open deleted families (so they can retrieve/restore).
      if (superAdmin) {
        try {
          const deletedFamily = await getFamilyByIdIncludingDeleted(id);
          setFamily(deletedFamily);
          setHouseholdMembers([]);
          setExtendedMembers([]);
          setError("");
        } catch {
          setError(getErrorMessage(err, "Failed to load family details."));
          setFamily(null);
          setHouseholdMembers([]);
          setExtendedMembers([]);
        }
      } else {
        setError(getErrorMessage(err, "Failed to load family details."));
        setFamily(null);
        setHouseholdMembers([]);
        setExtendedMembers([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function confirmDeleteFamily() {
    if (!id) return;
    setDeleting(true);
    setError("");
    try {
      await deleteFamily(id);
      setDeleteOpen(false);
      if (superAdmin) {
        // Keep the page and reload deleted state so retrieve option can appear.
        await load();
      } else {
        navigate("/families/view", { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete this family."));
    } finally {
      setDeleting(false);
    }
  }

  async function handleRetrieveFamily() {
    if (!id) return;
    setDeleting(true);
    setError("");
    try {
      await restoreFamily(id);
      setDeleteOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not retrieve this family."));
    } finally {
      setDeleting(false);
    }
  }

  async function confirmEraseFamilyFromDb() {
    if (!id) return;
    setDeleting(true);
    setError("");
    try {
      await deleteFamilyPermanent(id);
      setEraseFamilyDbOpen(false);
      navigate("/families/view", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete this family permanently."));
    } finally {
      setDeleting(false);
    }
  }

  const primary = useMemo(() => {
    if (!family) return null;
    const pid = family.primaryPersonId;
    if (pid == null || pid === "") return null;
    const n = Number(pid);
    const fromHousehold = householdMembers.find((m) => Number(m.id) === n);
    if (fromHousehold) return fromHousehold;
    /** Head may be primary for this family row while their person.family still points at another household (e.g. after branch). */
    return extendedMembers.find((m) => Number(m.id) === n) || null;
  }, [family, householdMembers, extendedMembers]);

  /** Table rows: API members plus primary when they are not on this family_id (still show head on this record). */
  const householdMembersForTable = useMemo(() => {
    if (!primary) return householdMembers;
    if (householdMembers.some((m) => Number(m.id) === Number(primary.id))) return householdMembers;
    return [primary, ...householdMembers];
  }, [householdMembers, primary]);

  const linkedOnlyMembers = useMemo(() => {
    const shownIds = new Set(householdMembersForTable.map((m) => Number(m.id)));
    return extendedMembers.filter((m) => !shownIds.has(Number(m.id)));
  }, [householdMembersForTable, extendedMembers]);

  const relationSummary = useMemo(() => {
    if (!primary) {
      return { father: null, mother: null, spouses: [], children: [] };
    }
    const father = primary.father || null;
    const mother = primary.mother || null;
    const spouses = extendedMembers.filter(
      (m) => primary.spouse?.id === m.id || m.spouse?.id === primary.id
    );
    const children = extendedMembers.filter(
      (m) => m.father?.id === primary.id || m.mother?.id === primary.id
    );
    return { father, mother, spouses, children };
  }, [primary, extendedMembers]);

  return (
    <AppLayout>
      <PageHeader
        title="Family details"
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={load}>
              Refresh
            </button>
            {canEditFamilyData() && (
              <>
                <Link to={`/families/${id}/edit`} className={adminBtnAmber}>
                  Edit
                </Link>
                <button type="button" className={adminBtnSecondary} onClick={() => setDeleteOpen(true)}>
                  Delete family
                </button>
              </>
            )}
          </div>
        }
      />

      <MainPanel>
        <PanelToolbar title={`Family #${id}`} hint={loading ? "Loading…" : undefined} />
        <PanelBody>
          {loading && <p className="text-sm text-slate-500">Loading…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && family && (
            <>
              {family.deleted ? (
                superAdmin ? (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    This family is currently soft-deleted.
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="primary" size="sm" onClick={handleRetrieveFamily} disabled={deleting}>
                        {deleting ? "Retrieving…" : "Retrieve family"}
                      </Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => setEraseFamilyDbOpen(true)} disabled={deleting}>
                        Delete permanently
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/families/view")} disabled={deleting}>
                        Back to families
                      </Button>
                    </div>
                  </div>
                ) : null
              ) : null}
              <DetailSection title="Household identity">
                <DetailFieldGrid>
                  <DetailField label="Family name (English)">{family.familyNameEn || "—"}</DetailField>
                  <DetailField label="Family name (Nepali)">{family.familyNameNp || "—"}</DetailField>
                  <DetailField label="Primary (English)">{family.primaryPersonNameEn || "—"}</DetailField>
                  <DetailField label="Primary (Nepali)">{family.primaryPersonNameNp || "—"}</DetailField>
                </DetailFieldGrid>
              </DetailSection>

              {family.deleted ? null : primary && (
                <DetailSection title="Linked to primary member">
                  <div className="grid gap-3 md:grid-cols-2">
                    <DetailField label="Father">
                      <RelationPersonLine person={relationSummary.father} pageFamilyId={numericId} />
                    </DetailField>
                    <DetailField label="Mother">
                      <RelationPersonLine person={relationSummary.mother} pageFamilyId={numericId} />
                    </DetailField>
                    <DetailField label="Spouse(s)">
                      {relationSummary.spouses.length === 0 ? (
                        <p className="text-sm text-slate-500">—</p>
                      ) : (
                        <div className="space-y-2">
                          {relationSummary.spouses.map((sp) => (
                            <RelationPersonLine key={sp.id} person={sp} pageFamilyId={numericId} />
                          ))}
                        </div>
                      )}
                    </DetailField>
                    <DetailField label="Children">
                      {relationSummary.children.length === 0 ? (
                        <p className="text-sm text-slate-500">—</p>
                      ) : (
                        <div className="space-y-2">
                          {relationSummary.children.map((ch) => (
                            <RelationPersonLine key={ch.id} person={ch} pageFamilyId={numericId} />
                          ))}
                        </div>
                      )}
                    </DetailField>
                  </div>
                </DetailSection>
              )}

              {family.deleted ? null : (
                <DetailSection title={`Household on this record (${householdMembersForTable.length})`}>
                <PersonDetailsTable
                  title=""
                  subtitle=""
                  members={householdMembersForTable}
                  showHouseholdCol={false}
                  pageFamilyId={numericId}
                  primaryPersonId={family.primaryPersonId}
                />
              </DetailSection>
              )}

              {family.deleted ? null : linkedOnlyMembers.length > 0 && (
                <DetailSection title={`Linked in the tree (${linkedOnlyMembers.length})`}>
                  <PersonDetailsTable
                    title=""
                    subtitle=""
                    members={linkedOnlyMembers}
                    showHouseholdCol
                    pageFamilyId={numericId}
                  />
                </DetailSection>
              )}
            </>
          )}
        </PanelBody>
      </MainPanel>

      {eraseFamilyDbOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
            <h2 className="text-lg font-semibold text-slate-900">Are you sure you want to delete this family permanently?</h2>
            <p className="mt-2 text-sm leading-snug text-slate-600">
              You are about to permanently remove{" "}
              <span className="font-medium text-slate-800">
                Family #{id} — {family?.familyNameEn || "—"}
              </span>
              . This deletes the household, every associated member, and their financial and role records. This action cannot be
              undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" className={adminBtnSecondary} onClick={() => setEraseFamilyDbOpen(false)} disabled={deleting}>
                Cancel
              </button>
              <Button type="button" variant="danger" size="sm" disabled={deleting} onClick={confirmEraseFamilyFromDb}>
                {deleting ? "Deleting…" : "Delete permanently"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
            <h2 className="text-lg font-semibold text-slate-900">Are you sure you want to delete this family?</h2>
            <p className="mt-2 text-sm leading-snug text-slate-600">
              This will soft-delete this household and all associated members from the active directory. Records can be restored
              later by an administrator.
            </p>
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
              Family #{id} — {family?.familyNameEn || "—"}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" className={adminBtnSecondary} onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </button>
              <Button type="button" variant="danger" disabled={deleting} onClick={confirmDeleteFamily}>
                {deleting ? "Deleting…" : "Delete family"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
