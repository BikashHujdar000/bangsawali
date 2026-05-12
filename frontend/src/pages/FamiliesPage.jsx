import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { createFamily, listFamilies } from "../services/familyService";
import { createPerson, listPersons, updatePerson } from "../services/personService";
import { listDistricts } from "../services/districtService";
import { getErrorMessage } from "../lib/http";
import FormField from "../components/common/FormField";
import Switch from "../components/common/Switch";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from "../components/ui/DataTable";

const relationTemplate = {
  mode: "select",
  personId: "",
  nameEn: "",
  nameNp: "",
  gender: "FEMALE",
};

const STEPS = [
  { code: "S1", title: "Personal details" },
  { code: "S2", title: "Relations" },
  { code: "S3", title: "Review" },
];

const emptyForm = {
  nameEn: "",
  nameNp: "",
  gender: "MALE",
  dateOfBirth: "",
  districtId: "",
  wardNo: "",
  toleEn: "",
  phone: "",
  municipality: "",
  vdc: "",
  useMunicipality: true,
  fatherId: "",
  motherId: "",
  fatherNameEn: "",
  fatherNameNp: "",
  motherNameEn: "",
  motherNameNp: "",
  spouses: [{ ...relationTemplate }],
  children: [{ ...relationTemplate, gender: "MALE", mode: "details" }],
};

export default function FamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const location = useLocation();
  const activePanel = location.pathname.endsWith("/view") ? "view" : "add";

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [familyData, personData, districtData] = await Promise.all([
        listFamilies(),
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
    fetchData();
  }, []);

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    if (name === "useMunicipality") {
      setForm((prev) => ({
        ...prev,
        useMunicipality: checked,
        municipality: checked ? prev.municipality : "",
        vdc: checked ? "" : prev.vdc,
      }));
      return;
    }
    if (name === "createFather" && checked) {
      setForm((prev) => ({ ...prev, fatherId: "" }));
      return;
    }
    if (name === "createMother" && checked) {
      setForm((prev) => ({ ...prev, motherId: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function updateArrayItem(key, index, field, value) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addRelationRow(key, gender = "FEMALE") {
    setForm((prev) => ({
      ...prev,
      [key]: [
        ...prev[key],
        {
          ...relationTemplate,
          gender,
          ...(key === "children" ? { mode: "details" } : {}),
        },
      ],
    }));
  }

  function removeRelationRow(key, index) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, idx) => idx !== index),
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const family = await createFamily({
        primaryPersonNameEn: form.nameEn,
        primaryPersonNameNp: form.nameNp,
        description: null,
      });

      const basePayload = {
        familyId: family.id,
        districtId: form.districtId ? Number(form.districtId) : null,
        wardNo: form.wardNo ? Number(form.wardNo) : null,
        toleEn: form.toleEn || null,
        toleNp: null,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth || null,
        municipality: form.useMunicipality ? form.municipality || null : null,
        vdc: form.useMunicipality ? null : form.vdc || null,
      };

      let fatherId = form.fatherId ? Number(form.fatherId) : null;
      let motherId = form.motherId ? Number(form.motherId) : null;
      let spouseId = null;

      if (!form.fatherId && form.fatherId !== "") {
        fatherId = null;
      }
      if (!form.motherId && form.motherId !== "") {
        motherId = null;
      }

      if (!fatherId && form.fatherNameEn && form.fatherNameNp) {
        const father = await createPerson({
          ...basePayload,
          dateOfBirth: null,
          nameEn: form.fatherNameEn || "Father",
          nameNp: form.fatherNameNp || "Father",
          gender: "MALE",
          fatherId: null,
          motherId: null,
          spouseId: null,
        });
        fatherId = father.id;
      }
      if (!motherId && form.motherNameEn && form.motherNameNp) {
        const mother = await createPerson({
          ...basePayload,
          dateOfBirth: null,
          nameEn: form.motherNameEn || "Mother",
          nameNp: form.motherNameNp || "Mother",
          gender: "FEMALE",
          fatherId: null,
          motherId: null,
          spouseId: null,
        });
        motherId = mother.id;
      }

      const createdPerson = await createPerson({
        familyId: family.id,
        nameEn: form.nameEn,
        nameNp: form.nameNp,
        gender: form.gender,
        ...basePayload,
        fatherId,
        motherId,
        spouseId,
      });

      for (const spouse of form.spouses) {
        if (spouse.mode === "select" && spouse.personId) {
          if (!spouseId) spouseId = Number(spouse.personId);
          continue;
        }
        if (spouse.mode === "details" && spouse.nameEn && spouse.nameNp) {
          const createdSpouse = await createPerson({
            ...basePayload,
            dateOfBirth: null,
            nameEn: spouse.nameEn,
            nameNp: spouse.nameNp,
            gender: spouse.gender || "FEMALE",
            fatherId: null,
            motherId: null,
            spouseId: createdPerson.id,
          });
          if (!spouseId) spouseId = createdSpouse.id;
        }
      }

      if (spouseId) {
        await updatePerson(createdPerson.id, {
          ...basePayload,
          nameEn: form.nameEn,
          nameNp: form.nameNp,
          gender: form.gender,
          fatherId,
          motherId,
          spouseId,
        });
      }

      for (const child of form.children) {
        if (child.mode === "details" && child.nameEn && child.nameNp) {
          let childFatherId;
          let childMotherId;
          if (form.gender === "MALE") {
            childFatherId = createdPerson.id;
            childMotherId = spouseId;
          } else if (form.gender === "FEMALE") {
            childMotherId = createdPerson.id;
            childFatherId = spouseId;
          } else {
            childFatherId = fatherId;
            childMotherId = motherId;
          }
          await createPerson({
            ...basePayload,
            dateOfBirth: null,
            nameEn: child.nameEn,
            nameNp: child.nameNp,
            gender: child.gender || "MALE",
            fatherId: childFatherId,
            motherId: childMotherId,
            spouseId: null,
          });
        }
      }
      setSuccess("Family and first person profile created successfully.");
      setForm(emptyForm);
      setStep(1);
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create family. Please check required fields."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap gap-2">
        <NavLink
          to="/families/add"
          className={({ isActive }) =>
            `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-br from-[#3b82f6] to-[#2563EB] text-white shadow-md"
                : "border border-gray-300 bg-gray-50 text-[#0F172A] hover:bg-white"
            }`
          }
        >
          Add family
        </NavLink>
        <NavLink
          to="/families/view"
          className={({ isActive }) =>
            `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-br from-[#3b82f6] to-[#2563EB] text-white shadow-md"
                : "border border-gray-300 bg-gray-50 text-[#0F172A] hover:bg-white"
            }`
          }
        >
          View families
        </NavLink>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activePanel === "add" && (
        <Card title="Add family">
          <div className="my-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {STEPS.map((s, idx) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setStep(idx + 1)}
                  className={`rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all duration-200 ${
                    step === idx + 1
                      ? "bg-gradient-to-br from-[#3b82f6] to-[#2563EB] text-white shadow-md"
                      : "border border-gray-200 bg-white text-[#64748B] hover:border-gray-300"
                  }`}
                >
                  <span className="block">{s.code}</span>
                  <span className={`block font-normal ${step === idx + 1 ? "text-blue-100" : "text-[#64748B]"}`}>{s.title}</span>
                </button>
              ))}
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#2563EB] transition-all duration-200"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField label="Primary person name (English)" htmlFor="nameEn">
                    <Input id="nameEn" name="nameEn" value={form.nameEn} onChange={onChange} placeholder="Person name (English)" required />
                  </FormField>
                  <FormField label="Primary person name (Nepali)" htmlFor="nameNp">
                    <Input id="nameNp" name="nameNp" value={form.nameNp} onChange={onChange} placeholder="Person name (Nepali)" required />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField label="Date of birth" htmlFor="dateOfBirth">
                    <Input id="dateOfBirth" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} type="date" />
                  </FormField>
                  <FormField label="Gender" htmlFor="gender">
                    <Select id="gender" name="gender" value={form.gender} onChange={onChange}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </FormField>
                  <FormField label="Phone" htmlFor="phone">
                    <Input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="Phone number" />
                  </FormField>
                </div>
                <FormField label="District" htmlFor="districtId">
                  <Select id="districtId" name="districtId" value={form.districtId} onChange={onChange}>
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.nameEn} ({district.nameNp})
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Ward number" htmlFor="wardNo">
                  <Input id="wardNo" name="wardNo" value={form.wardNo} onChange={onChange} placeholder="Ward number" type="number" />
                </FormField>
                <FormField label="Tole" htmlFor="toleEn">
                  <Input id="toleEn" name="toleEn" value={form.toleEn} onChange={onChange} placeholder="Tole / neighbourhood" />
                </FormField>
                <FormField label="Address type" htmlFor="useMunicipality-sw">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <span className="text-sm text-slate-600">Use municipality (not VDC)</span>
                    <Switch id="useMunicipality-sw" name="useMunicipality" checked={form.useMunicipality} onChange={onChange} />
                  </div>
                </FormField>
                {form.useMunicipality ? (
                  <FormField label="Municipality" htmlFor="municipality">
                    <Input id="municipality" name="municipality" value={form.municipality} onChange={onChange} placeholder="Municipality" />
                  </FormField>
                ) : (
                  <FormField label="VDC" htmlFor="vdc">
                    <Input id="vdc" name="vdc" value={form.vdc} onChange={onChange} placeholder="VDC" />
                  </FormField>
                )}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">Parents (create new)</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Father name (English)" htmlFor="fatherNameEn">
                      <Input id="fatherNameEn" name="fatherNameEn" value={form.fatherNameEn} onChange={onChange} placeholder="Optional — creates father person if both EN/NP set" />
                    </FormField>
                    <FormField label="Father name (Nepali)" htmlFor="fatherNameNp">
                      <Input id="fatherNameNp" name="fatherNameNp" value={form.fatherNameNp} onChange={onChange} placeholder="Optional" />
                    </FormField>
                    <FormField label="Mother name (English)" htmlFor="motherNameEn">
                      <Input id="motherNameEn" name="motherNameEn" value={form.motherNameEn} onChange={onChange} placeholder="Optional" />
                    </FormField>
                    <FormField label="Mother name (Nepali)" htmlFor="motherNameNp">
                      <Input id="motherNameNp" name="motherNameNp" value={form.motherNameNp} onChange={onChange} placeholder="Optional" />
                    </FormField>
                  </div>
                </div>
                <FormField label="Link existing father" htmlFor="fatherId">
                  <Select id="fatherId" name="fatherId" value={form.fatherId} onChange={onChange}>
                    <option value="">Father — optional existing person</option>
                    {persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.nameEn} ({person.id})
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Link existing mother" htmlFor="motherId">
                  <Select id="motherId" name="motherId" value={form.motherId} onChange={onChange}>
                    <option value="">Mother — optional existing person</option>
                    {persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.nameEn} ({person.id})
                      </option>
                    ))}
                  </Select>
                </FormField>

                <div className="rounded border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Spouse(s)</p>
                    <Button type="button" variant="primary" size="sm" onClick={() => addRelationRow("spouses", "FEMALE")}>
                      + Add spouse
                    </Button>
                  </div>
                  {form.spouses.map((spouse, idx) => (
                    <div key={`spouse-${idx}`} className="mb-4 space-y-3 rounded border border-slate-100 bg-slate-50/50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Spouse row {idx + 1}</p>
                      <FormField label="Spouse mode" htmlFor={`spouses-${idx}-mode-select`}>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <button
                            id={`spouses-${idx}-mode-select`}
                            type="button"
                            onClick={() => updateArrayItem("spouses", idx, "mode", "select")}
                            className={`rounded-lg px-2 py-1 transition ${spouse.mode === "select" ? "bg-[#2563EB] text-white shadow-sm" : "border border-gray-200 bg-gray-100 text-[#64748B]"}`}
                          >
                            Select existing (personId)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateArrayItem("spouses", idx, "mode", "details")}
                            className={`rounded-lg px-2 py-1 transition ${spouse.mode === "details" ? "bg-[#2563EB] text-white shadow-sm" : "border border-gray-200 bg-gray-100 text-[#64748B]"}`}
                          >
                            Enter details (nameEn / nameNp)
                          </button>
                          {form.spouses.length > 1 && (
                            <button type="button" onClick={() => removeRelationRow("spouses", idx)} className="ml-auto rounded bg-red-600 px-2 py-1 text-white">
                              Remove row
                            </button>
                          )}
                        </div>
                      </FormField>
                      {spouse.mode === "select" ? (
                        <FormField label="Existing spouse person" htmlFor={`spouses-${idx}-personId`}>
                          <Select
                            id={`spouses-${idx}-personId`}
                            value={spouse.personId}
                            onChange={(event) => updateArrayItem("spouses", idx, "personId", event.target.value)}
                          >
                            <option value="">Select person</option>
                            {persons.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.nameEn} ({person.id})
                              </option>
                            ))}
                          </Select>
                        </FormField>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField label="Spouse name (English)" htmlFor={`spouses-${idx}-nameEn`}>
                            <Input id={`spouses-${idx}-nameEn`} value={spouse.nameEn} onChange={(event) => updateArrayItem("spouses", idx, "nameEn", event.target.value)} placeholder="Spouse name (English)" />
                          </FormField>
                          <FormField label="Spouse name (Nepali)" htmlFor={`spouses-${idx}-nameNp`}>
                            <Input id={`spouses-${idx}-nameNp`} value={spouse.nameNp} onChange={(event) => updateArrayItem("spouses", idx, "nameNp", event.target.value)} placeholder="Spouse name (Nepali)" />
                          </FormField>
                          <FormField label="Gender" htmlFor={`spouses-${idx}-gender`}>
                            <Select id={`spouses-${idx}-gender`} value={spouse.gender} onChange={(event) => updateArrayItem("spouses", idx, "gender", event.target.value)}>
                              <option value="FEMALE">Female</option>
                              <option value="MALE">Male</option>
                              <option value="OTHER">Other</option>
                            </Select>
                          </FormField>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Children</p>
                    <Button type="button" variant="primary" size="sm" onClick={() => addRelationRow("children", "MALE")}>
                      + Add child
                    </Button>
                  </div>
                  {form.children.map((child, idx) => (
                    <div key={`child-${idx}`} className="mb-4 space-y-3 rounded border border-slate-100 bg-slate-50/50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Child row {idx + 1}</p>
                      <FormField label="Child mode" hint="New rows default to details so names are saved">
                        <span className="text-sm text-slate-600">{child.mode}</span>
                      </FormField>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Child name (English)" htmlFor={`children-${idx}-nameEn`}>
                          <Input id={`children-${idx}-nameEn`} value={child.nameEn} onChange={(event) => updateArrayItem("children", idx, "nameEn", event.target.value)} placeholder="Child name (English)" />
                        </FormField>
                        <FormField label="Child name (Nepali)" htmlFor={`children-${idx}-nameNp`}>
                          <Input id={`children-${idx}-nameNp`} value={child.nameNp} onChange={(event) => updateArrayItem("children", idx, "nameNp", event.target.value)} placeholder="Child name (Nepali)" />
                        </FormField>
                      </div>
                      <FormField label="Gender" htmlFor={`children-${idx}-gender`}>
                        <Select id={`children-${idx}-gender`} value={child.gender} onChange={(event) => updateArrayItem("children", idx, "gender", event.target.value)}>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </Select>
                      </FormField>
                      {form.children.length > 1 && (
                        <Button type="button" variant="dangerSoft" size="sm" onClick={() => removeRelationRow("children", idx)}>
                          Remove row
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review</p>
                <p className="text-xs text-slate-600">
                  Submit creates the family record and person rows (primary + optional parents/spouses/children) in one flow.
                </p>
                <dl className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded bg-white p-3 shadow-sm">
                    <dt className="text-xs text-slate-500">Name (English)</dt>
                    <dd className="font-medium text-slate-900">{form.nameEn || "—"}</dd>
                  </div>
                  <div className="rounded bg-white p-3 shadow-sm">
                    <dt className="text-xs text-slate-500">Name (Nepali)</dt>
                    <dd className="font-medium text-slate-900">{form.nameNp || "—"}</dd>
                  </div>
                  <div className="rounded bg-white p-3 shadow-sm">
                    <dt className="text-xs text-slate-500">District</dt>
                    <dd className="font-medium text-slate-900">{form.districtId || "—"}</dd>
                  </div>
                  <div className="rounded bg-white p-3 shadow-sm">
                    <dt className="text-xs text-slate-500">Gender</dt>
                    <dd className="font-medium text-slate-900">{form.gender}</dd>
                  </div>
                  <div className="rounded bg-white p-3 shadow-sm">
                    <dt className="text-xs text-slate-500">Linked father / mother</dt>
                    <dd className="font-medium text-slate-900">
                      {form.fatherId || "—"} / {form.motherId || "—"}
                    </dd>
                  </div>
                  <div className="rounded bg-white p-3 shadow-sm">
                    <dt className="text-xs text-slate-500">Spouses / Children</dt>
                    <dd className="font-medium text-slate-900">{form.spouses.length} spouse row(s), {form.children.length} child row(s)</dd>
                  </div>
                </dl>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="w-full" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                Back
              </Button>
              {step < 3 ? (
                <Button type="button" variant="primary" className="w-full" onClick={() => setStep((s) => Math.min(3, s + 1))}>
                  Next
                </Button>
              ) : (
                <Button type="submit" variant="primary" className="w-full" disabled={saving}>
                  {saving ? "Creating…" : "Create family"}
                </Button>
              )}
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm text-green-700">{success}</p>}
        </Card>
        )}

        {activePanel === "view" && (
        <Card
          title="Family list"
          headerRight={
            <Button type="button" variant="secondary" size="sm" onClick={fetchData}>
              Refresh
            </Button>
          }
        >
          {!loading && families.length === 0 ? <p className="mt-4 text-sm text-[#64748B]">No families found.</p> : null}
          {!loading && families.length > 0 ? (
            <DataTable flush className="mt-4">
                <DataTableHead>
                <DataTableHeaderCell>ID</DataTableHeaderCell>
                <DataTableHeaderCell>Family name (English)</DataTableHeaderCell>
                <DataTableHeaderCell>Family name (Nepali)</DataTableHeaderCell>
              </DataTableHead>
              <tbody>
                {families.map((family) => (
                  <DataTableRow key={family.id}>
                    <DataTableCell className="font-mono font-medium">{family.id}</DataTableCell>
                    <DataTableCell>{family.familyNameEn}</DataTableCell>
                    <DataTableCell>{family.familyNameNp}</DataTableCell>
                  </DataTableRow>
                ))}
              </tbody>
            </DataTable>
          ) : null}
        </Card>
        )}
      </div>
    </AppLayout>
  );
}
