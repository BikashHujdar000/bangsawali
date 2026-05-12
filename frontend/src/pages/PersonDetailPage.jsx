import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { getPersonById, listPersonChildren } from "../services/personService";
import { listFamilyPersonsExtended } from "../services/familyService";
import { getErrorMessage } from "../lib/http";
import { canEditFamilyData } from "../lib/authStorage";
import {
  adminBtnAmber,
  adminBtnPrimary,
  adminBtnSecondary,
  DetailField,
  DetailFieldGrid,
  DetailSection,
  MainPanel,
  PageHeader,
  PanelBody,
  PanelToolbar,
} from "../components/admin/DetailLayout";

function PersonLine({ person, emptyText = "—" }) {
  if (!person) return <p className="text-sm text-slate-500">{emptyText}</p>;
  return (
    <p className="text-sm text-slate-900">
      <span className="font-semibold">{person.nameEn}</span>{" "}
      <span className="text-slate-600">({person.nameNp || "—"})</span>{" "}
      <span className="text-xs font-normal text-slate-500">ID {person.id}</span>
    </p>
  );
}

export default function PersonDetailPage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [members, setMembers] = useState([]);
  const [childrenByParent, setChildrenByParent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const p = await getPersonById(id);
      setPerson(p);
      const [kids, famMembers] = await Promise.all([
        listPersonChildren(id),
        p?.family?.id ? listFamilyPersonsExtended(p.family.id) : Promise.resolve([]),
      ]);
      setChildrenByParent(kids);
      setMembers(famMembers);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this person."));
      setPerson(null);
      setMembers([]);
      setChildrenByParent([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const relationSummary = useMemo(() => {
    if (!person) {
      return { father: null, mother: null, spouses: [], children: [] };
    }
    const sid = person.id;
    const father = person.father || null;
    const mother = person.mother || null;
    const spouses = members.filter(
      (m) => person.spouse?.id === m.id || (m.spouse && m.spouse.id === sid)
    );
    const children = childrenByParent.length
      ? childrenByParent
      : members.filter((m) => m?.father?.id === sid || m?.mother?.id === sid);
    return { father, mother, spouses, children };
  }, [person, members, childrenByParent]);

  const familyId = person?.family?.id;
  const isFemale = String(person?.gender || "").toUpperCase() === "FEMALE";
  const editHref =
    familyId && canEditFamilyData() && !isFemale
      ? `/families/${familyId}/edit?focusPerson=${person.id}`
      : null;

  return (
    <AppLayout>
      <PageHeader
        title="Person details"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/persons" className={adminBtnSecondary}>
              Back to persons
            </Link>
            {editHref ? (
              <Link to={editHref} className={adminBtnAmber}>
                Edit (family sections)
              </Link>
            ) : null}
            {familyId ? (
              <Link to={`/families/${familyId}`} className={adminBtnPrimary}>
                Household record
              </Link>
            ) : null}
          </div>
        }
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && person && (
        <MainPanel>
          <PanelToolbar title={`Person #${person.id}`} />
          <PanelBody>
            <DetailSection title="Identity & contact">
              <DetailFieldGrid>
                <DetailField label="Name (English)">{person.nameEn || "—"}</DetailField>
                <DetailField label="Name (Nepali)">{person.nameNp || "—"}</DetailField>
                <DetailField label="Gender">{person.gender || "—"}</DetailField>
                <DetailField label="Date of birth">{person.dateOfBirth || "—"}</DetailField>
                <DetailField label="Phone">{person.phone || "—"}</DetailField>
                <DetailField label="Household">
                  {person.family?.familyNameEn ? (
                    <>
                      {person.family.familyNameEn} ({person.family.familyNameNp || "—"})
                      {familyId ? (
                        <>
                          {" "}
                          <span className="text-slate-400">·</span>{" "}
                          <Link className="font-medium text-[#2563EB] hover:underline" to={`/families/${familyId}`}>
                            Family #{familyId}
                          </Link>
                        </>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </DetailField>
                <DetailField label="Location">
                  {[person.district?.provinceNameEn, person.district?.nameEn, person.municipality || person.vdc, person.toleEn]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </DetailField>
              </DetailFieldGrid>
            </DetailSection>

            <DetailSection title="Family links">
              <div className="grid gap-3 md:grid-cols-2">
                <DetailField label="Father">
                  <PersonLine person={relationSummary.father} />
                </DetailField>
                <DetailField label="Mother">
                  <PersonLine person={relationSummary.mother} />
                </DetailField>
                <DetailField label="Spouse(s)">
                  {relationSummary.spouses.length === 0 ? (
                    <p className="text-sm text-slate-500">—</p>
                  ) : (
                    <div className="space-y-2">
                      {relationSummary.spouses.map((sp) => (
                        <PersonLine key={sp.id} person={sp} />
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
                        <PersonLine key={ch.id} person={ch} />
                      ))}
                    </div>
                  )}
                </DetailField>
              </div>
            </DetailSection>
          </PanelBody>
        </MainPanel>
      )}
    </AppLayout>
  );
}
