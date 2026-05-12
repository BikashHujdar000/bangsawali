import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import {
  createFamily,
  createHouseholdFromPerson,
  findDuplicateHouseholdMember,
  getFamilyById,
  listFamilyPersons,
  listFamilyPersonsExtended,
  setFamilyPrimaryPerson,
  updateFamily,
} from "../services/familyService";
import { listDistricts } from "../services/districtService";
import { createPerson, deletePerson, getPersonById, listPersons, updatePerson } from "../services/personService";
import { getErrorMessage } from "../lib/http";
import FormField from "../components/common/FormField";
import Switch from "../components/common/Switch";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import LocalityFieldRow from "../components/ui/LocalityFieldRow";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "../components/ui/DataTable";
import { canEditFamilyData } from "../lib/authStorage";

const STEPS = [
  {
    code: "S1",
    title: "Personal details",
  },
  {
    code: "S2",
    title: "Relations",
  },
  {
    code: "S3",
    title: "Preview",
  },
];

const relationTemplate = {
  personId: null,
  nameEn: "",
  nameNp: "",
  gender: "FEMALE",
  addDetails: false,
  dateOfBirth: "",
  phone: "",
  state: "",
  districtId: "",
  wardNo: "",
  useMunicipality: true,
  municipality: "",
  vdc: "",
  toleEn: "",
};

const emptyForm = {
  nameEn: "",
  nameNp: "",
  gender: "MALE",
  dateOfBirth: "",
  phone: "",
  state: "",
  districtId: "",
  wardNo: "",
  municipality: "",
  vdc: "",
  useMunicipality: true,
  toleEn: "",
  fatherPersonId: null,
  fatherAddDetails: false,
  fatherNameEn: "",
  fatherNameNp: "",
  fatherGender: "MALE",
  fatherDateOfBirth: "",
  fatherPhone: "",
  fatherState: "",
  fatherDistrictId: "",
  fatherWardNo: "",
  fatherUseMunicipality: true,
  fatherMunicipality: "",
  fatherVdc: "",
  fatherToleEn: "",
  motherPersonId: null,
  motherAddDetails: false,
  motherNameEn: "",
  motherNameNp: "",
  motherGender: "FEMALE",
  motherDateOfBirth: "",
  motherPhone: "",
  motherState: "",
  motherDistrictId: "",
  motherWardNo: "",
  motherUseMunicipality: true,
  motherMunicipality: "",
  motherVdc: "",
  motherToleEn: "",
  spouses: [{ ...relationTemplate }],
  children: [{ ...relationTemplate, gender: "MALE" }],
};

/** Province label from embedded district or district catalog (ids may be string or number). */
function provinceLabel(district, catalog) {
  if (!catalog?.length) return "";
  if (district?.provinceNameEn) return district.provinceNameEn;
  const raw = district?.id;
  if (raw == null || raw === "") return "";
  const idn = Number(raw);
  const row = catalog.find((d) => Number(d.id) === idn);
  return row?.provinceNameEn ?? "";
}

function hasFatherFormData(f) {
  const fatherEnTrim = String(f.fatherNameEn || "").trim();
  const fatherNpTrim = String(f.fatherNameNp || "").trim();
  return Boolean(fatherEnTrim || fatherNpTrim || f.fatherPersonId);
}

function hasMotherFormData(f) {
  const motherEnTrim = String(f.motherNameEn || "").trim();
  const motherNpTrim = String(f.motherNameNp || "").trim();
  return Boolean(motherEnTrim || motherNpTrim || f.motherPersonId);
}

/** Minimum father fields required to persist (matches step-2 save rules). */
function hasFatherSaveableForPersist(f) {
  const fatherEnTrim = String(f.fatherNameEn || "").trim();
  const fatherNpTrim = String(f.fatherNameNp || "").trim();
  const pid = f.fatherPersonId != null && f.fatherPersonId !== "" ? Number(f.fatherPersonId) : NaN;
  const hasPid = !Number.isNaN(pid) && pid > 0;
  return hasPid || Boolean(fatherEnTrim || fatherNpTrim);
}

function hasMotherSaveableForPersist(f) {
  const motherEnTrim = String(f.motherNameEn || "").trim();
  const motherNpTrim = String(f.motherNameNp || "").trim();
  const pid = f.motherPersonId != null && f.motherPersonId !== "" ? Number(f.motherPersonId) : NaN;
  const hasPid = !Number.isNaN(pid) && pid > 0;
  return hasPid || Boolean(motherEnTrim || motherNpTrim);
}

/** Spouse row counts as present if saved to DB or has a display name. */
function hasNamedOrPersistedSpouse(f) {
  return f.spouses.some((s) => {
    if (s.personId != null && s.personId !== "") {
      const n = Number(s.personId);
      if (!Number.isNaN(n) && n > 0) return true;
    }
    const en = String(s.nameEn || "").trim();
    const np = String(s.nameNp || "").trim();
    return Boolean(en || np);
  });
}

function genderNeedsSpouseForChildren(gender) {
  const g = String(gender || "").toUpperCase();
  return g === "MALE" || g === "FEMALE";
}

/** Trash icon for relation remove (Feather/Lucide-style outline, reads clearly at 20px). */
function RelationRemoveIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CollapsibleRelationCard({
  title,
  expanded,
  onToggle,
  summaryCollapsed,
  showRemove,
  onRemove,
  removeDisabled,
  removeTitle,
  onDone,
  doneLabel,
  doneDisabled,
  children: panelChildren,
}) {
  const removeLabel = removeTitle || "Remove relation";
  const doneText = doneLabel || "Done";
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-[3rem] items-stretch divide-x divide-slate-100">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
          onClick={onToggle}
        >
          <span className="shrink-0 text-slate-500" aria-hidden>
            {expanded ? "▼" : "▶"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-800">{title}</div>
            {!expanded && summaryCollapsed ? (
              <div className="truncate text-xs text-slate-600">{summaryCollapsed}</div>
            ) : null}
          </div>
        </button>
        {onDone ? (
          <button
            type="button"
            className="flex shrink-0 items-center justify-center px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!doneDisabled) onDone();
            }}
            disabled={doneDisabled}
            aria-label={doneText}
          >
            {doneText}
          </button>
        ) : null}
        {showRemove ? (
          <button
            type="button"
            className="flex min-w-[2.75rem] shrink-0 items-center justify-center px-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!removeDisabled) onRemove?.();
            }}
            disabled={removeDisabled}
            title={removeLabel}
            aria-label={removeLabel}
          >
            <RelationRemoveIcon />
          </button>
        ) : null}
      </div>
      {expanded ? <div className="space-y-4 border-t border-slate-100 p-4">{panelChildren}</div> : null}
    </div>
  );
}

export default function FamiliesAddPage() {
  const { id: familyIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const focusPersonIdFromUrl = searchParams.get("focusPerson") || "";
  const navigate = useNavigate();
  const isEditMode = Boolean(familyIdParam);
  const [districts, setDistricts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [draft, setDraft] = useState({ familyId: null, primaryPersonId: null, memberEditMode: false });
  const [loadingExisting, setLoadingExisting] = useState(false);
  /** Person IDs removed from spouse/child rows in edit mode; soft-deleted after relations save. */
  const [relationRemovals, setRelationRemovals] = useState([]);
  const [fatherPanelOpen, setFatherPanelOpen] = useState(false);
  const [motherPanelOpen, setMotherPanelOpen] = useState(false);
  const [spouseRowOpen, setSpouseRowOpen] = useState([true]);
  const [childRowOpen, setChildRowOpen] = useState([true]);
  /** Step 2: saving father or mother block only ("Done" → persist + collapse). */
  const [parentSectionSaving, setParentSectionSaving] = useState(null);
  const [directoryPersons, setDirectoryPersons] = useState([]);

  useEffect(() => {
    listDistricts().then(setDistricts);
  }, []);

  useEffect(() => {
    if (step !== 2 && !isEditMode) return;
    listPersons()
      .then(setDirectoryPersons)
      .catch(() => setDirectoryPersons([]));
  }, [step, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !familyIdParam) return;
    if (!canEditFamilyData()) {
      setError("Only Admin/Super Admin can edit family details.");
      navigate("/families/view");
      return;
    }
    async function loadExisting() {
      setLoadingExisting(true);
      setError("");
      setRelationRemovals([]);
      try {
        const [family, members, extended, districtCatalog] = await Promise.all([
          getFamilyById(familyIdParam),
          listFamilyPersons(familyIdParam),
          listFamilyPersonsExtended(familyIdParam),
          listDistricts(),
        ]);
        if (districtCatalog?.length) {
          setDistricts(districtCatalog);
        }
        const primary =
          members.find((m) => Number(m.id) === Number(family.primaryPersonId)) || members[0];
        if (!primary) {
          throw new Error("Primary member not found in this family.");
        }
        const focusNum = focusPersonIdFromUrl ? Number(focusPersonIdFromUrl) : NaN;
        const subject =
          !Number.isNaN(focusNum) && focusNum > 0
            ? members.find((m) => Number(m.id) === focusNum)
            : primary;
        if (!Number.isNaN(focusNum) && focusNum > 0 && !subject) {
          throw new Error("That person is not listed under this household. Open edit from Person Management or pick the correct family.");
        }
        const father = subject.father || null;
        const mother = subject.mother || null;
        const spouse = subject.spouse || null;
        const children = extended.filter(
          (m) =>
            (subject.id && Number(m?.father?.id) === Number(subject.id)) ||
            (subject.id && Number(m?.mother?.id) === Number(subject.id))
        );

        setForm((prev) => ({
          ...prev,
          nameEn: subject.nameEn || "",
          nameNp: subject.nameNp || "",
          gender: subject.gender || "MALE",
          dateOfBirth: subject.dateOfBirth || "",
          phone: subject.phone || "",
          districtId: subject.district?.id ? String(subject.district.id) : "",
          state: provinceLabel(subject.district, districtCatalog),
          wardNo: subject.wardNo != null ? String(subject.wardNo) : "",
          municipality: subject.municipality || "",
          vdc: subject.vdc || "",
          useMunicipality: Boolean(subject.municipality) || !subject.vdc,
          toleEn: subject.toleEn || "",
          fatherPersonId: father?.id || null,
          fatherNameEn: father?.nameEn || "",
          fatherNameNp: father?.nameNp || "",
          fatherAddDetails: Boolean(father),
          fatherGender: father?.gender || "MALE",
          fatherDateOfBirth: father?.dateOfBirth || "",
          fatherPhone: father?.phone || "",
          fatherDistrictId: father?.district?.id ? String(father.district.id) : "",
          fatherState: provinceLabel(father?.district, districtCatalog),
          fatherWardNo: father?.wardNo != null ? String(father.wardNo) : "",
          fatherMunicipality: father?.municipality || "",
          fatherVdc: father?.vdc || "",
          fatherUseMunicipality: Boolean(father?.municipality) || !father?.vdc,
          fatherToleEn: father?.toleEn || "",
          motherPersonId: mother?.id || null,
          motherNameEn: mother?.nameEn || "",
          motherNameNp: mother?.nameNp || "",
          motherAddDetails: Boolean(mother),
          motherGender: mother?.gender || "FEMALE",
          motherDateOfBirth: mother?.dateOfBirth || "",
          motherPhone: mother?.phone || "",
          motherDistrictId: mother?.district?.id ? String(mother.district.id) : "",
          motherState: provinceLabel(mother?.district, districtCatalog),
          motherWardNo: mother?.wardNo != null ? String(mother.wardNo) : "",
          motherMunicipality: mother?.municipality || "",
          motherVdc: mother?.vdc || "",
          motherUseMunicipality: Boolean(mother?.municipality) || !mother?.vdc,
          motherToleEn: mother?.toleEn || "",
          spouses: spouse
            ? [
                {
                  ...relationTemplate,
                  personId: spouse.id,
                  nameEn: spouse.nameEn || "",
                  nameNp: spouse.nameNp || "",
                  gender: spouse.gender || "FEMALE",
                  addDetails: true,
                  districtId: spouse.district?.id ? String(spouse.district.id) : "",
                  state: provinceLabel(spouse.district, districtCatalog),
                  wardNo: spouse.wardNo != null ? String(spouse.wardNo) : "",
                  municipality: spouse.municipality || "",
                  vdc: spouse.vdc || "",
                  useMunicipality: Boolean(spouse.municipality) || !spouse.vdc,
                  toleEn: spouse.toleEn || "",
                },
              ]
            : [{ ...relationTemplate }],
          children: children.length
            ? children.map((child) => ({
                ...relationTemplate,
                personId: child.id,
                nameEn: child.nameEn || "",
                nameNp: child.nameNp || "",
                gender: child.gender || "MALE",
                addDetails: true,
                dateOfBirth: child.dateOfBirth || "",
                phone: child.phone || "",
                districtId: child.district?.id ? String(child.district.id) : "",
                state: provinceLabel(child.district, districtCatalog),
                wardNo: child.wardNo != null ? String(child.wardNo) : "",
                municipality: child.municipality || "",
                vdc: child.vdc || "",
                useMunicipality: Boolean(child.municipality) || !child.vdc,
                toleEn: child.toleEn || "",
              }))
            : [{ ...relationTemplate, gender: "MALE" }],
        }));
        setDraft({
          familyId: family.id,
          primaryPersonId: subject.id,
          memberEditMode: Number(subject.id) !== Number(family.primaryPersonId),
        });
        setFatherPanelOpen(false);
        setMotherPanelOpen(false);
        setSpouseRowOpen(spouse ? [false] : [true]);
        setChildRowOpen(children.length ? children.map(() => false) : [true]);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load family for editing."));
      } finally {
        setLoadingExisting(false);
      }
    }
    loadExisting();
  }, [isEditMode, familyIdParam, navigate, focusPersonIdFromUrl]);

  useEffect(() => {
    if (!districts.length) return;
    function provinceFromId(id) {
      if (id === "" || id == null) return "";
      const idn = Number(id);
      const row = districts.find((d) => Number(d.id) === idn);
      return row?.provinceNameEn ?? "";
    }
    setForm((prev) => ({
      ...prev,
      state: provinceFromId(prev.districtId),
      fatherState: provinceFromId(prev.fatherDistrictId),
      motherState: provinceFromId(prev.motherDistrictId),
      spouses: prev.spouses.map((s) => ({ ...s, state: provinceFromId(s.districtId) })),
      children: prev.children.map((c) => ({ ...c, state: provinceFromId(c.districtId) })),
    }));
  }, [districts, loadingExisting]);

  useEffect(() => {
    if (step !== 3 || !draft.familyId) return;
    loadPreviewFromDb(draft.familyId).catch(() => {
      // keep existing preview and surface fetch issues via explicit refresh action
    });
  }, [step, draft.familyId]);

  function provinceNameForDistrictId(districtId) {
    if (districtId === "" || districtId == null) return "";
    const id = Number(districtId);
    const row = districts.find((d) => Number(d.id) === id);
    return row?.provinceNameEn ?? "";
  }

  function formatErrorForUi(err) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (typeof data === "string" && data.trim()) {
      return status ? `(${status}) ${data}` : data;
    }
    if (data?.message && typeof data.message === "string") {
      return status ? `(${status}) ${data.message}` : data.message;
    }
    if (data?.error && typeof data.error === "string") {
      return status ? `(${status}) ${data.error}` : data.error;
    }
    if (data) {
      try {
        return status ? `(${status}) ${JSON.stringify(data, null, 2)}` : JSON.stringify(data, null, 2);
      } catch {
        return status ? `(${status}) Request failed` : "Request failed";
      }
    }
    return status ? `(${status}) ${err?.message || "Request failed"}` : (err?.message || "Request failed");
  }

  function deriveFieldErrorsFromMessage(message) {
    const msg = (message || "").toLowerCase();
    const next = {};
    if (msg.includes("nameen")) next.nameEn = "Name (English) is required/invalid.";
    if (msg.includes("namenp")) next.nameNp = "Name (Nepali) is required/invalid.";
    if (msg.includes("gender")) next.gender = "Gender is required.";
    if (msg.includes("district not found")) next.districtId = "Selected district is invalid (not found).";
    if (msg.includes("district not found")) {
      next.fatherDistrictId = "Selected district is invalid (not found).";
      next.motherDistrictId = "Selected district is invalid (not found).";
    }
    if (msg.includes("municipality") && msg.includes("not found")) next.municipality = "Municipality is invalid.";
    if (msg.includes("father") && msg.includes("not found")) next.fatherNameEn = "Father reference is invalid.";
    if (msg.includes("mother") && msg.includes("not found")) next.motherNameEn = "Mother reference is invalid.";
    return next;
  }

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === "useMunicipality") {
      setForm((prev) => ({
        ...prev,
        useMunicipality: checked,
        municipality: checked ? prev.municipality : "",
        vdc: checked ? "" : prev.vdc,
      }));
      return;
    }
    if (name === "fatherUseMunicipality") {
      setForm((prev) => ({
        ...prev,
        fatherUseMunicipality: checked,
        fatherMunicipality: checked ? prev.fatherMunicipality : "",
        fatherVdc: checked ? "" : prev.fatherVdc,
      }));
      return;
    }
    if (name === "motherUseMunicipality") {
      setForm((prev) => ({
        ...prev,
        motherUseMunicipality: checked,
        motherMunicipality: checked ? prev.motherMunicipality : "",
        motherVdc: checked ? "" : prev.motherVdc,
      }));
      return;
    }
    if (name === "districtId") {
      setForm((prev) => ({
        ...prev,
        districtId: value,
        state: provinceNameForDistrictId(value),
      }));
      return;
    }
    if (name === "fatherDistrictId") {
      setForm((prev) => ({
        ...prev,
        fatherDistrictId: value,
        fatherState: provinceNameForDistrictId(value),
      }));
      return;
    }
    if (name === "motherDistrictId") {
      setForm((prev) => ({
        ...prev,
        motherDistrictId: value,
        motherState: provinceNameForDistrictId(value),
      }));
      return;
    }
    if (name === "fatherAddDetails" && checked) {
      setForm((prev) => {
        const d = String(prev.fatherDistrictId || "").trim();
        const w = String(prev.fatherWardNo || "").trim();
        const t = String(prev.fatherToleEn || "").trim();
        const mu = String(prev.fatherMunicipality || "").trim();
        const vd = String(prev.fatherVdc || "").trim();
        return {
          ...prev,
          fatherAddDetails: true,
          fatherDistrictId: d || prev.districtId,
          fatherWardNo: w || prev.wardNo,
          fatherState: d ? prev.fatherState : provinceNameForDistrictId(prev.districtId) || prev.state,
          fatherToleEn: t || prev.toleEn,
          fatherUseMunicipality: prev.fatherDistrictId || prev.fatherMunicipality || prev.fatherVdc ? prev.fatherUseMunicipality : prev.useMunicipality,
          fatherMunicipality: mu || (prev.useMunicipality ? prev.municipality : ""),
          fatherVdc: vd || (prev.useMunicipality ? "" : prev.vdc),
        };
      });
      return;
    }
    if (name === "motherAddDetails" && checked) {
      setForm((prev) => {
        const d = String(prev.motherDistrictId || "").trim();
        const w = String(prev.motherWardNo || "").trim();
        const t = String(prev.motherToleEn || "").trim();
        const mu = String(prev.motherMunicipality || "").trim();
        const vd = String(prev.motherVdc || "").trim();
        return {
          ...prev,
          motherAddDetails: true,
          motherDistrictId: d || prev.districtId,
          motherWardNo: w || prev.wardNo,
          motherState: d ? prev.motherState : provinceNameForDistrictId(prev.districtId) || prev.state,
          motherToleEn: t || prev.toleEn,
          motherUseMunicipality: prev.motherDistrictId || prev.motherMunicipality || prev.motherVdc ? prev.motherUseMunicipality : prev.useMunicipality,
          motherMunicipality: mu || (prev.useMunicipality ? prev.municipality : ""),
          motherVdc: vd || (prev.useMunicipality ? "" : prev.vdc),
        };
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function updateArrayItem(key, index, field, value) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((item, idx) => {
        if (idx !== index) return item;
        if (field === "addDetails" && value === true) {
          const hasDistrict = String(item.districtId || "").trim() !== "";
          const hasWard = String(item.wardNo || "").trim() !== "";
          const hasTole = String(item.toleEn || "").trim() !== "";
          const hasMuni = String(item.municipality || "").trim() !== "";
          const hasVdc = String(item.vdc || "").trim() !== "";
          const useMuni =
            hasMuni || hasVdc
              ? item.useMunicipality
              : prev.useMunicipality;
          return {
            ...item,
            addDetails: true,
            districtId: hasDistrict ? item.districtId : prev.districtId,
            state: hasDistrict ? item.state : provinceNameForDistrictId(prev.districtId) || prev.state,
            wardNo: hasWard ? item.wardNo : prev.wardNo,
            useMunicipality: useMuni,
            municipality: hasMuni ? item.municipality : useMuni ? prev.municipality : "",
            vdc: hasVdc ? item.vdc : useMuni ? "" : prev.vdc,
            toleEn: hasTole ? item.toleEn : prev.toleEn,
          };
        }
        if (field === "useMunicipality") {
          return {
            ...item,
            useMunicipality: value,
            municipality: value ? item.municipality : "",
            vdc: value ? "" : item.vdc,
          };
        }
        if (field === "districtId") {
          return { ...item, districtId: value, state: provinceNameForDistrictId(value) };
        }
        return { ...item, [field]: value };
      }),
    }));
  }

  function addRelationRow(key, gender = "FEMALE") {
    setForm((prev) => ({
      ...prev,
      [key]: [...prev[key], { ...relationTemplate, gender }],
    }));
    if (key === "spouses") {
      setSpouseRowOpen((prev) => [...prev, true]);
    }
    if (key === "children") {
      setChildRowOpen((prev) => [...prev, true]);
    }
  }

  function relationRowHasPersistedPerson(row) {
    if (row.personId == null || row.personId === "") return false;
    const n = Number(row.personId);
    return !Number.isNaN(n) && n > 0;
  }

  function removeRelationRow(key, index) {
    let pidToQueue = null;
    setForm((prev) => {
      const row = prev[key][index];
      const pid = row?.personId != null && row.personId !== "" ? Number(row.personId) : Number.NaN;
      if (isEditMode && !Number.isNaN(pid) && pid > 0) {
        pidToQueue = pid;
      }
      const filtered = prev[key].filter((_, idx) => idx !== index);
      if (filtered.length === 0) {
        const emptyRow =
          key === "spouses"
            ? [{ ...relationTemplate, gender: "FEMALE" }]
            : [{ ...relationTemplate, gender: "MALE" }];
        return { ...prev, [key]: emptyRow };
      }
      return { ...prev, [key]: filtered };
    });
    if (pidToQueue != null) {
      setRelationRemovals((r) => (r.includes(pidToQueue) ? r : [...r, pidToQueue]));
    }
    if (key === "spouses") {
      setSpouseRowOpen((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next.length === 0 ? [true] : next;
      });
    }
    if (key === "children") {
      setChildRowOpen((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next.length === 0 ? [true] : next;
      });
    }
  }

  function removeFather() {
    if (draft.memberEditMode && form.fatherPersonId) return;
    const pidRaw = form.fatherPersonId;
    const pid = pidRaw != null && pidRaw !== "" ? Number(pidRaw) : Number.NaN;
    if (isEditMode && !Number.isNaN(pid) && pid > 0) {
      setRelationRemovals((r) => (r.includes(pid) ? r : [...r, pid]));
    }
    setFatherPanelOpen(false);
    setForm((prev) => ({
      ...prev,
      fatherPersonId: null,
      fatherAddDetails: false,
      fatherNameEn: "",
      fatherNameNp: "",
      fatherGender: "MALE",
      fatherDateOfBirth: "",
      fatherPhone: "",
      fatherState: "",
      fatherDistrictId: "",
      fatherWardNo: "",
      fatherUseMunicipality: true,
      fatherMunicipality: "",
      fatherVdc: "",
      fatherToleEn: "",
    }));
  }

  function removeMother() {
    if (draft.memberEditMode && form.motherPersonId) return;
    const pidRaw = form.motherPersonId;
    const pid = pidRaw != null && pidRaw !== "" ? Number(pidRaw) : Number.NaN;
    if (isEditMode && !Number.isNaN(pid) && pid > 0) {
      setRelationRemovals((r) => (r.includes(pid) ? r : [...r, pid]));
    }
    setMotherPanelOpen(false);
    setForm((prev) => ({
      ...prev,
      motherPersonId: null,
      motherAddDetails: false,
      motherNameEn: "",
      motherNameNp: "",
      motherGender: "FEMALE",
      motherDateOfBirth: "",
      motherPhone: "",
      motherState: "",
      motherDistrictId: "",
      motherWardNo: "",
      motherUseMunicipality: true,
      motherMunicipality: "",
      motherVdc: "",
      motherToleEn: "",
    }));
  }

  function relationPayload(basePayload, row) {
    const en = String(row.nameEn ?? "").trim();
    const np = String(row.nameNp ?? "").trim();
    const nameEnResolved = en || np;
    const nameNpResolved = np || en || nameEnResolved;
    return {
      ...basePayload,
      nameEn: nameEnResolved,
      nameNp: nameNpResolved,
      gender: String(row.gender || "FEMALE").toUpperCase(),
      dateOfBirth: row.addDetails ? row.dateOfBirth || null : null,
      phone: row.addDetails ? row.phone || null : null,
      districtId: row.addDetails ? (row.districtId ? Number(row.districtId) : basePayload.districtId) : basePayload.districtId,
      wardNo: row.addDetails ? (row.wardNo !== "" && row.wardNo != null ? Number(row.wardNo) : basePayload.wardNo) : basePayload.wardNo,
      municipality: row.addDetails
        ? row.useMunicipality
          ? row.municipality || null
          : null
        : basePayload.municipality,
      vdc: row.addDetails
        ? row.useMunicipality
          ? null
          : row.vdc || null
        : basePayload.vdc,
      toleEn: row.addDetails ? row.toleEn || basePayload.toleEn || null : basePayload.toleEn,
      toleNp: null,
      fatherId: null,
      motherId: null,
      spouseId: null,
      spouseIds: [],
    };
  }

  function buildBasePayload(familyId) {
    return {
      familyId,
      districtId: form.districtId ? Number(form.districtId) : null,
      wardNo: form.wardNo ? Number(form.wardNo) : null,
      municipality: form.useMunicipality ? form.municipality || null : null,
      vdc: form.useMunicipality ? null : form.vdc || null,
      toleEn: form.toleEn || null,
      toleNp: null,
    };
  }

  /**
   * Relation-step saves often send fatherId/motherId/spouse as null placeholders. The API
   * applies them literally, so updating an existing linked person (e.g. the head as "father"
   * while editing a son) would wipe that person's own parents/spouse. Merge from the server
   * when the payload still has nulls for those fields.
   */
  async function preserveRelationFieldsForExistingUpdate(personId, payload) {
    const id = Number(personId);
    if (!id || Number.isNaN(id) || id <= 0) return payload;
    try {
      const prev = await getPersonById(id);
      const next = { ...payload };
      if (next.fatherId == null && prev?.father?.id != null) next.fatherId = prev.father.id;
      if (next.motherId == null && prev?.mother?.id != null) next.motherId = prev.mother.id;
      if (next.spouseId == null && prev?.spouse?.id != null) next.spouseId = prev.spouse.id;
      const emptySpouseIds = !next.spouseIds || next.spouseIds.length === 0;
      if (emptySpouseIds && prev?.spouse?.id != null) next.spouseIds = [prev.spouse.id];
      return next;
    } catch {
      return payload;
    }
  }

  async function upsertPerson(personId, payload, options = {}) {
    let pid =
      personId != null && personId !== ""
        ? Number(personId)
        : null;
    if (pid != null && Number.isNaN(pid)) pid = null;

    if (pid) {
      return updatePerson(pid, payload);
    }

    const familyId = payload.familyId;
    const skip = (options.skipDuplicatePersonIds || []).filter(
      (x) => x != null && x !== "" && !Number.isNaN(Number(x)) && Number(x) > 0
    );

    if (familyId) {
      const existingId = await findDuplicateHouseholdMember(familyId, {
        skipPersonIds: skip,
        nameEn: payload.nameEn,
        nameNp: payload.nameNp,
        gender: String(payload.gender || "FEMALE").toUpperCase(),
        dateOfBirth: payload.dateOfBirth === "" ? null : payload.dateOfBirth ?? null,
        phone: payload.phone === "" ? null : payload.phone ?? null,
      });
      if (existingId != null) {
        return updatePerson(existingId, await preserveRelationFieldsForExistingUpdate(existingId, payload));
      }
    }

    return createPerson(payload);
  }

  async function saveStep1ToDb() {
    if (!form.nameEn || !form.nameNp) {
      throw new Error("Primary name is required.");
    }
    let familyId = draft.familyId;
    if (!familyId) {
      const family = await createFamily({
        primaryPersonNameEn: form.nameEn,
        primaryPersonNameNp: form.nameNp,
        description: null,
      });
      familyId = family.id;
    } else if (!draft.memberEditMode) {
      await updateFamily(familyId, {
        familyNameEn: form.nameEn,
        familyNameNp: form.nameNp,
        description: null,
      });
    }
    const basePayload = buildBasePayload(familyId);
    let fatherIdForSave =
      form.fatherPersonId != null && form.fatherPersonId !== "" ? Number(form.fatherPersonId) : null;
    if (fatherIdForSave != null && Number.isNaN(fatherIdForSave)) fatherIdForSave = null;
    let motherIdForSave =
      form.motherPersonId != null && form.motherPersonId !== "" ? Number(form.motherPersonId) : null;
    if (motherIdForSave != null && Number.isNaN(motherIdForSave)) motherIdForSave = null;
    let spouseIdsForSave = [];
    if (draft.primaryPersonId) {
      try {
        const prev = await getPersonById(Number(draft.primaryPersonId));
        if (draft.memberEditMode) {
          if (fatherIdForSave == null && prev?.father?.id) fatherIdForSave = prev.father.id;
          if (motherIdForSave == null && prev?.mother?.id) motherIdForSave = prev.mother.id;
        }
        if (prev?.spouse?.id) spouseIdsForSave = [prev.spouse.id];
      } catch {
        /* first-time create or stale id */
      }
    }
    const mainPerson = await upsertPerson(draft.primaryPersonId, {
      ...basePayload,
      nameEn: form.nameEn,
      nameNp: form.nameNp,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || null,
      phone: form.phone || null,
      fatherId: fatherIdForSave,
      motherId: motherIdForSave,
      spouseId: spouseIdsForSave[0] || null,
      spouseIds: spouseIdsForSave,
    });
    if (!draft.memberEditMode) {
      await setFamilyPrimaryPerson(familyId, {
        personId: mainPerson.id,
        personNameEn: mainPerson.nameEn,
        personNameNp: mainPerson.nameNp,
      });
    }
    setDraft((prev) => ({
      ...prev,
      familyId,
      primaryPersonId: mainPerson.id,
    }));
    return { familyId, primaryPersonId: mainPerson.id };
  }

  async function persistParentsSpousesAndMainPerson(saved) {
    const basePayload = buildBasePayload(saved.familyId);
    let fatherId = null;
    let motherId = null;
    const excludePrimary = new Set(
      [saved.primaryPersonId]
        .filter((id) => id != null && id !== "" && !Number.isNaN(Number(id)) && Number(id) > 0)
        .map((id) => Number(id))
    );

    for (let idx = 0; idx < form.spouses.length; idx++) {
      const s = form.spouses[idx];
      if (relationRowHasPersistedPerson(s)) continue;
      const en = String(s.nameEn || "").trim();
      const np = String(s.nameNp || "").trim();
      const rowTouched =
        en ||
        np ||
        s.addDetails ||
        (s.dateOfBirth && String(s.dateOfBirth).trim()) ||
        (s.phone && String(s.phone).trim()) ||
        (s.districtId && String(s.districtId).trim());
      if (!rowTouched) continue;
      if (!en && !np) {
        throw new Error(
          `Spouse (row ${idx + 1}): enter a name in English or Nepali (at least one is required), or link an existing person before saving.`
        );
      }
    }

    const fatherEnTrim = String(form.fatherNameEn || "").trim();
    const fatherNpTrim = String(form.fatherNameNp || "").trim();
    const hasFatherText = Boolean(fatherEnTrim || fatherNpTrim);
    let fatherPersonIdToUse =
      form.fatherPersonId != null && form.fatherPersonId !== "" ? Number(form.fatherPersonId) : null;
    if (fatherPersonIdToUse != null && Number.isNaN(fatherPersonIdToUse)) fatherPersonIdToUse = null;

    if (fatherPersonIdToUse && !hasFatherText) {
      fatherId = fatherPersonIdToUse;
    } else if (hasFatherText) {
      let fatherEn = fatherEnTrim || fatherNpTrim;
      let fatherNp = fatherNpTrim || fatherEnTrim || fatherEn;
      if (!String(fatherEn || "").trim()) fatherEn = fatherNpTrim || fatherEnTrim || "Unknown";
      if (!String(fatherNp || "").trim()) fatherNp = fatherEn;
      const fatherPayload = {
        ...basePayload,
        nameEn: fatherEn,
        nameNp: fatherNp || fatherEn,
        gender: form.fatherAddDetails ? form.fatherGender : "MALE",
        dateOfBirth: form.fatherAddDetails ? form.fatherDateOfBirth || null : null,
        phone: form.fatherAddDetails ? form.fatherPhone || null : null,
        districtId: form.fatherAddDetails ? (form.fatherDistrictId ? Number(form.fatherDistrictId) : basePayload.districtId) : basePayload.districtId,
        wardNo: form.fatherAddDetails && form.fatherWardNo !== "" && form.fatherWardNo != null ? Number(form.fatherWardNo) : basePayload.wardNo,
        municipality: form.fatherAddDetails ? (form.fatherUseMunicipality ? form.fatherMunicipality || null : null) : basePayload.municipality,
        vdc: form.fatherAddDetails ? (form.fatherUseMunicipality ? null : form.fatherVdc || null) : basePayload.vdc,
        toleEn: form.fatherAddDetails ? form.fatherToleEn || basePayload.toleEn : basePayload.toleEn,
        toleNp: null,
        fatherId: null,
        motherId: null,
        spouseId: null,
        spouseIds: [],
      };
      const fatherPayloadToSend = fatherPersonIdToUse
        ? await preserveRelationFieldsForExistingUpdate(fatherPersonIdToUse, fatherPayload)
        : fatherPayload;
      const father = await upsertPerson(fatherPersonIdToUse, fatherPayloadToSend, {
        skipDuplicatePersonIds: Array.from(excludePrimary),
      });
      fatherId = father.id;
    }

    const motherEnTrim = String(form.motherNameEn || "").trim();
    const motherNpTrim = String(form.motherNameNp || "").trim();
    const hasMotherText = Boolean(motherEnTrim || motherNpTrim);
    let motherPersonIdToUse =
      form.motherPersonId != null && form.motherPersonId !== "" ? Number(form.motherPersonId) : null;
    if (motherPersonIdToUse != null && Number.isNaN(motherPersonIdToUse)) motherPersonIdToUse = null;

    if (motherPersonIdToUse && !hasMotherText) {
      motherId = motherPersonIdToUse;
    } else if (hasMotherText) {
      let motherEn = motherEnTrim || motherNpTrim;
      let motherNp = motherNpTrim || motherEnTrim || motherEn;
      if (!String(motherEn || "").trim()) motherEn = motherNpTrim || motherEnTrim || "Unknown";
      if (!String(motherNp || "").trim()) motherNp = motherEn;
      const excludeMother = new Set(excludePrimary);
      if (fatherId) excludeMother.add(fatherId);
      const motherPayload = {
        ...basePayload,
        nameEn: motherEn,
        nameNp: motherNp || motherEn,
        gender: form.motherAddDetails ? form.motherGender : "FEMALE",
        dateOfBirth: form.motherAddDetails ? form.motherDateOfBirth || null : null,
        phone: form.motherAddDetails ? form.motherPhone || null : null,
        districtId: form.motherAddDetails ? (form.motherDistrictId ? Number(form.motherDistrictId) : basePayload.districtId) : basePayload.districtId,
        wardNo: form.motherAddDetails && form.motherWardNo !== "" && form.motherWardNo != null ? Number(form.motherWardNo) : basePayload.wardNo,
        municipality: form.motherAddDetails ? (form.motherUseMunicipality ? form.motherMunicipality || null : null) : basePayload.municipality,
        vdc: form.motherAddDetails ? (form.motherUseMunicipality ? null : form.motherVdc || null) : basePayload.vdc,
        toleEn: form.motherAddDetails ? form.motherToleEn || basePayload.toleEn : basePayload.toleEn,
        toleNp: null,
        fatherId: null,
        motherId: null,
        spouseId: null,
        spouseIds: [],
      };
      const motherPayloadToSend = motherPersonIdToUse
        ? await preserveRelationFieldsForExistingUpdate(motherPersonIdToUse, motherPayload)
        : motherPayload;
      const mother = await upsertPerson(motherPersonIdToUse, motherPayloadToSend, {
        skipDuplicatePersonIds: Array.from(excludeMother),
      });
      motherId = mother.id;
    }

    const spouseExcludeBase = new Set(excludePrimary);
    if (fatherId) spouseExcludeBase.add(fatherId);
    if (motherId) spouseExcludeBase.add(motherId);

    const spouseRows = [];
    const spouseIds = [];
    for (const spouse of form.spouses) {
      const nameTrim = String(spouse.nameEn || "").trim() || String(spouse.nameNp || "").trim();
      let existingId = null;
      if (spouse.personId != null && spouse.personId !== "") {
        const n = Number(spouse.personId);
        if (!Number.isNaN(n) && n > 0) existingId = n;
      }

      if (!nameTrim && !existingId) {
        spouseRows.push(spouse);
        continue;
      }

      if (existingId && !nameTrim) {
        spouseIds.push(existingId);
        spouseRows.push({ ...spouse, personId: existingId });
        continue;
      }

      const pay = relationPayload(basePayload, spouse);
      let spouseIdToUse = existingId;
      const spouseExclude = new Set(spouseExcludeBase);
      for (const id of spouseIds) spouseExclude.add(id);
      const payToSend = spouseIdToUse ? await preserveRelationFieldsForExistingUpdate(spouseIdToUse, pay) : pay;
      const savedSpouse = await upsertPerson(spouseIdToUse, payToSend, {
        skipDuplicatePersonIds: Array.from(spouseExclude),
      });
      spouseRows.push({ ...spouse, personId: savedSpouse.id });
      spouseIds.push(savedSpouse.id);
    }

    const uniqueSpouseIds = [...new Set(spouseIds)];

    let finalFatherId = fatherId;
    let finalMotherId = motherId;
    if (finalFatherId == null && form.fatherPersonId != null && form.fatherPersonId !== "") {
      const n = Number(form.fatherPersonId);
      if (!Number.isNaN(n) && n > 0) finalFatherId = n;
    }
    if (finalMotherId == null && form.motherPersonId != null && form.motherPersonId !== "") {
      const n = Number(form.motherPersonId);
      if (!Number.isNaN(n) && n > 0) finalMotherId = n;
    }
    let finalSpouseIds = [...uniqueSpouseIds];
    if (draft.memberEditMode && (finalFatherId == null || finalMotherId == null || finalSpouseIds.length === 0)) {
      try {
        const prev = await getPersonById(saved.primaryPersonId);
        if (finalFatherId == null && prev?.father?.id) finalFatherId = prev.father.id;
        if (finalMotherId == null && prev?.mother?.id) finalMotherId = prev.mother.id;
        if (finalSpouseIds.length === 0 && prev?.spouse?.id) finalSpouseIds = [prev.spouse.id];
      } catch {
        /* ignore */
      }
    }

    const mainPerson = await updatePerson(saved.primaryPersonId, {
      ...basePayload,
      nameEn: form.nameEn,
      nameNp: form.nameNp,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || null,
      phone: form.phone || null,
      fatherId: finalFatherId,
      motherId: finalMotherId,
      spouseId: finalSpouseIds[0] || null,
      spouseIds: finalSpouseIds,
    });

    return { fatherId, motherId, spouseRows, spouseIds: uniqueSpouseIds, mainPerson };
  }

  async function saveFatherSectionToDb() {
    if (draft.memberEditMode && form.fatherPersonId) {
      setError(
        "This father record is locked while editing another household member. Use Next at the bottom to save all relations together."
      );
      setErrorModalOpen(true);
      return;
    }
    if (!hasFatherSaveableForPersist(form)) {
      setError("Enter the father's English and/or Nepali name, or link an existing person, before saving.");
      setErrorModalOpen(true);
      return;
    }
    setError("");
    setErrorModalOpen(false);
    setFieldErrors({});
    setSuccess("");
    setParentSectionSaving("father");
    try {
      const saved = await saveStep1ToDb();
      const { fatherId, motherId, spouseRows } = await persistParentsSpousesAndMainPerson(saved);
      // If user removed spouse/child rows, ensure those queued soft-deletes are applied now.
      const idsToSoftDelete = [...relationRemovals];
      for (const pid of idsToSoftDelete) {
        await deletePerson(pid);
      }
      if (idsToSoftDelete.length) {
        setRelationRemovals((prev) => prev.filter((id) => !idsToSoftDelete.includes(id)));
      }
      setForm((prev) => ({
        ...prev,
        fatherPersonId: fatherId,
        motherPersonId: motherId,
        spouses: spouseRows,
      }));
      setFatherPanelOpen(false);
      setSuccess("Father details saved. You can open this section again if needed; use Next when all relations are ready.");
    } catch (err) {
      const msg = formatErrorForUi(err);
      setError(msg);
      setFieldErrors(deriveFieldErrorsFromMessage(msg));
      setErrorModalOpen(true);
    } finally {
      setParentSectionSaving(null);
    }
  }

  async function saveMotherSectionToDb() {
    if (draft.memberEditMode && form.motherPersonId) {
      setError(
        "This mother record is locked while editing another household member. Use Next at the bottom to save all relations together."
      );
      setErrorModalOpen(true);
      return;
    }
    if (!hasMotherSaveableForPersist(form)) {
      setError("Enter the mother's English and/or Nepali name, or link an existing person, before saving.");
      setErrorModalOpen(true);
      return;
    }
    setError("");
    setErrorModalOpen(false);
    setFieldErrors({});
    setSuccess("");
    setParentSectionSaving("mother");
    try {
      const saved = await saveStep1ToDb();
      const { fatherId, motherId, spouseRows } = await persistParentsSpousesAndMainPerson(saved);
      // If user removed spouse/child rows, ensure those queued soft-deletes are applied now.
      const idsToSoftDelete = [...relationRemovals];
      for (const pid of idsToSoftDelete) {
        await deletePerson(pid);
      }
      if (idsToSoftDelete.length) {
        setRelationRemovals((prev) => prev.filter((id) => !idsToSoftDelete.includes(id)));
      }
      setForm((prev) => ({
        ...prev,
        fatherPersonId: fatherId,
        motherPersonId: motherId,
        spouses: spouseRows,
      }));
      setMotherPanelOpen(false);
      setSuccess("Mother details saved. You can open this section again if needed; use Next when all relations are ready.");
    } catch (err) {
      const msg = formatErrorForUi(err);
      setError(msg);
      setFieldErrors(deriveFieldErrorsFromMessage(msg));
      setErrorModalOpen(true);
    } finally {
      setParentSectionSaving(null);
    }
  }

  async function saveStep2ToDb() {
    const saved = await saveStep1ToDb();

    for (let idx = 0; idx < form.children.length; idx++) {
      const c = form.children[idx];
      const en = String(c.nameEn || "").trim();
      const np = String(c.nameNp || "").trim();
      const rowTouched =
        en ||
        np ||
        c.addDetails ||
        (c.dateOfBirth && String(c.dateOfBirth).trim()) ||
        (c.phone && String(c.phone).trim()) ||
        (c.districtId && String(c.districtId).trim());
      if (!rowTouched) continue;
      if (!en && !np) {
        throw new Error(
          `Child (row ${idx + 1}): enter a name in English or Nepali (at least one is required) before saving.`
        );
      }
    }

    const genderUpperEarly = String(form.gender || "").toUpperCase();
    const hasNamedChildEarly = form.children.some(
      (c) => String(c.nameEn || "").trim() || String(c.nameNp || "").trim()
    );
    if (
      hasNamedChildEarly &&
      (genderUpperEarly === "MALE" || genderUpperEarly === "FEMALE") &&
      !hasNamedOrPersistedSpouse(form)
    ) {
      throw new Error(
        "Add a spouse with a name (English or Nepali) before adding children. Each child needs the other parent from the spouse row."
      );
    }

    const { fatherId, motherId, spouseRows, spouseIds, mainPerson } = await persistParentsSpousesAndMainPerson(saved);

    let otherParentFromSpouse = spouseIds[0] || null;
    if (!otherParentFromSpouse && mainPerson?.spouse?.id != null) {
      otherParentFromSpouse = mainPerson.spouse.id;
    }
    const g = String(form.gender || "").toUpperCase();

    const childRows = [];
    const hasNamedChild = form.children.some(
      (c) => String(c.nameEn || "").trim() || String(c.nameNp || "").trim()
    );
    if (hasNamedChild) {
      if (g === "MALE" && !otherParentFromSpouse) {
        throw new Error(
          "Add the primary member's spouse (wife) in the Spouse section before saving children, so each child gets the correct mother link."
        );
      }
      if (g === "FEMALE" && !otherParentFromSpouse) {
        throw new Error(
          "Add the primary member's spouse in the Spouse section before saving children, so each child gets the correct father link."
        );
      }
    }

    const basePayload = buildBasePayload(saved.familyId);

    for (const child of form.children) {
      const childEn = String(child.nameEn || "").trim();
      const childNp = String(child.nameNp || "").trim();
      if (!childEn && !childNp) {
        childRows.push(child);
        continue;
      }
      let childFatherId;
      let childMotherId;
      if (g === "MALE") {
        childFatherId = mainPerson.id;
        childMotherId = otherParentFromSpouse;
      } else if (g === "FEMALE") {
        childMotherId = mainPerson.id;
        childFatherId = otherParentFromSpouse;
      } else {
        childFatherId = fatherId;
        childMotherId = motherId;
      }
      const pay = relationPayload(basePayload, child);
      let childPersonId =
        child.personId != null && child.personId !== "" ? Number(child.personId) : null;
      if (childPersonId != null && Number.isNaN(childPersonId)) childPersonId = null;

      const skipChildDup = [
        saved.primaryPersonId,
        otherParentFromSpouse,
        childFatherId,
        childMotherId,
      ].filter((id) => id != null && id !== "" && !Number.isNaN(Number(id)) && Number(id) > 0);

      const childPayload = {
        ...pay,
        fatherId: childFatherId,
        motherId: childMotherId,
      };
      const childPayloadToSend = childPersonId
        ? await preserveRelationFieldsForExistingUpdate(childPersonId, childPayload)
        : childPayload;
      const savedChild = await upsertPerson(childPersonId, childPayloadToSend, {
        skipDuplicatePersonIds: skipChildDup,
      });
      childRows.push({ ...child, personId: savedChild.id });
    }

    setForm((prev) => ({
      ...prev,
      fatherPersonId: fatherId,
      motherPersonId: motherId,
      spouses: spouseRows,
      children: childRows,
    }));

    const originFamilyId = saved.familyId;
    let resultFamilyId = saved.familyId;
    const addedNewSpouseOrChild =
      draft.memberEditMode &&
      (form.spouses.some(
        (s) => (String(s.nameEn || "").trim() || String(s.nameNp || "").trim()) && !s.personId
      ) ||
        form.children.some(
          (c) => (String(c.nameEn || "").trim() || String(c.nameNp || "").trim()) && !c.personId
        ));

    let didBranch = false;
    if (addedNewSpouseOrChild) {
      const newFam = await createHouseholdFromPerson(saved.primaryPersonId);
      if (newFam.id !== originFamilyId) {
        didBranch = true;
        resultFamilyId = newFam.id;
        navigate(`/families/${newFam.id}/edit`, { replace: true });
        setDraft((prev) => ({
          ...prev,
          familyId: newFam.id,
          memberEditMode: false,
        }));
      }
    }

    const idsToSoftDelete = [...relationRemovals];
    for (const pid of idsToSoftDelete) {
      await deletePerson(pid);
    }
    if (idsToSoftDelete.length) {
      setRelationRemovals((prev) => prev.filter((id) => !idsToSoftDelete.includes(id)));
    }

    return { ...saved, familyId: resultFamilyId, fatherId, motherId, didBranch };
  }

  async function loadPreviewFromDb(familyId) {
    const [family, members, extended] = await Promise.all([
      getFamilyById(familyId),
      listFamilyPersons(familyId),
      listFamilyPersonsExtended(familyId),
    ]);
    setPreview({ family, members, extended });
  }

  async function handleNext() {
    setError("");
    setErrorModalOpen(false);
    setFieldErrors({});
    setSuccess("");
    setSaving(true);
    try {
      if (step === 1) {
        await saveStep1ToDb();
        setSuccess("Personal details saved to database.");
        setStep(2);
        return;
      }
      if (step === 2) {
        const saved = await saveStep2ToDb();
        await loadPreviewFromDb(saved.familyId);
        setSuccess(
          saved.didBranch
            ? "Relations saved. A new household was created for this member; preview shows the new family."
            : "Relations saved to database."
        );
        setStep(3);
      }
    } catch (err) {
      const msg = formatErrorForUi(err);
      setError(msg);
      setFieldErrors(deriveFieldErrorsFromMessage(msg));
      setErrorModalOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleStepJump(targetStep) {
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }
    if (step === 1 && targetStep >= 2) {
      await handleNext();
      return;
    }
    if (step === 2 && targetStep >= 3) {
      await handleNext();
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!draft.familyId) return;
    setError("");
    setErrorModalOpen(false);
    setFieldErrors({});
    setSuccess("");
    setSaving(true);
    try {
      await loadPreviewFromDb(draft.familyId);
      setSuccess("Latest details loaded from database.");
    } catch (err) {
      const msg = formatErrorForUi(err);
      setError(msg);
      setFieldErrors(deriveFieldErrorsFromMessage(msg));
      setErrorModalOpen(true);
    } finally {
      setSaving(false);
    }
  }

  function handleFinish() {
    setSuccess("Family flow completed.");
    navigate("/families/view");
  }

  function personDisplay(person) {
    if (!person) return "—";
    const np = person.nameNp ? ` (${person.nameNp})` : "";
    return `${person.nameEn || "—"}${np}`;
  }

  const fatherParentLocked = Boolean(draft.memberEditMode && form.fatherPersonId);
  const motherParentLocked = Boolean(draft.memberEditMode && form.motherPersonId);
  const spouseRequiredForChildrenUi = genderNeedsSpouseForChildren(form.gender);
  const hasSpouseForChildrenUi = hasNamedOrPersistedSpouse(form);
  const childFieldsLockedBySpouse = spouseRequiredForChildrenUi && !hasSpouseForChildrenUi;
  const fatherSummaryCollapsed = hasFatherFormData(form)
    ? [String(form.fatherNameEn || "").trim(), String(form.fatherNameNp || "").trim()].filter(Boolean).join(" · ") ||
      "Father on file"
    : "Not added — tap to add father";
  const motherSummaryCollapsed = hasMotherFormData(form)
    ? [String(form.motherNameEn || "").trim(), String(form.motherNameNp || "").trim()].filter(Boolean).join(" · ") ||
      "Mother on file"
    : "Not added — tap to add mother";

  return (
    <>
      <AppLayout>
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md md:p-8 md:px-10 md:py-10">
        <div className="mb-8">
          <Link
            to="/families/view"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] transition hover:text-blue-800 hover:underline"
          >
            <span aria-hidden className="text-base leading-none">
              ←
            </span>
            Back to families
          </Link>
          {isEditMode && draft.memberEditMode ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              You are editing a household member who is not the listed household head. The family name and primary head
              on this page stay as on file until you branch. When you add a new spouse or child row and press Next, we
              create a new household with this member as primary (branching), then open that family for editing. If a
              spouse or child already exists in this household with the same identity, we link that record instead of
              creating a duplicate.
            </p>
          ) : null}
        </div>

        <div className="mb-8 flex w-full flex-wrap items-center gap-y-3">
          {STEPS.map((s, idx) => {
            const n = idx + 1;
            const active = step === n;
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={s.code} className={`flex min-w-0 items-center ${isLast ? "shrink-0" : "flex-1"}`}>
                <button
                  type="button"
                  onClick={() => handleStepJump(n)}
                  className="flex min-w-0 shrink-0 items-center gap-3 rounded-lg text-left outline-none ring-blue-400/30 transition hover:opacity-95 focus-visible:ring-2"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                      active ? "bg-[#2563EB] text-white shadow-md ring-2 ring-blue-100" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {n}
                  </span>
                  <span
                    className={`min-w-0 text-sm leading-tight sm:text-[0.9375rem] ${active ? "font-semibold text-[#0F172A]" : "font-medium text-gray-400"}`}
                  >
                    <span className={active ? "text-[#2563EB]" : ""}>{n}.</span> {s.title}
                  </span>
                </button>
                {!isLast ? (
                  <div
                    className={`mx-3 h-0.5 min-w-[1.5rem] flex-1 rounded-full sm:mx-5 ${step >= n ? "bg-[#2563EB]" : "bg-gray-200"}`}
                    aria-hidden
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {loadingExisting && <p className="mb-3 text-sm text-slate-600">Loading family data for edit...</p>}
        <form className="space-y-6" onSubmit={onSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Name (English)" htmlFor="nameEn" error={fieldErrors.nameEn}>
                  <Input id="nameEn" name="nameEn" value={form.nameEn} onChange={onChange} placeholder="e.g. Ram Bahadur Thapa" required />
                </FormField>
                <FormField label="Name (Nepali)" htmlFor="nameNp" error={fieldErrors.nameNp}>
                  <Input id="nameNp" name="nameNp" value={form.nameNp} onChange={onChange} placeholder="राम बहादुर थापा" required />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField label="Gender" htmlFor="gender">
                  <Select id="gender" name="gender" value={form.gender} onChange={onChange}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Others</option>
                  </Select>
                </FormField>
                <FormField label="Date of birth" htmlFor="dateOfBirth">
                  <Input id="dateOfBirth" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} type="date" />
                </FormField>
                <FormField label="Phone" htmlFor="phone">
                  <Input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="Mobile / landline" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField label="Province" htmlFor="state">
                  <Input
                    id="state"
                    name="state"
                    value={form.state}
                    readOnly
                    className="bg-slate-50 text-slate-700"
                    placeholder={form.districtId ? "From district below" : "Select a district to see province"}
                  />
                </FormField>
                <FormField label="District" htmlFor="districtId" error={fieldErrors.districtId}>
                  <Select id="districtId" name="districtId" value={form.districtId} onChange={onChange}>
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>{district.nameEn} ({district.nameNp})</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Ward number" htmlFor="wardNo" error={fieldErrors.wardNo}>
                  <Input id="wardNo" name="wardNo" value={form.wardNo} onChange={onChange} placeholder="Ward no." type="number" />
                </FormField>
              </div>
              <LocalityFieldRow
                toggleId="useMunicipality-sw"
                toggleName="useMunicipality"
                useMunicipality={form.useMunicipality}
                onToggleChange={onChange}
                inputId="locality-primary"
                municipalityName="municipality"
                vdcName="vdc"
                municipalityValue={form.municipality}
                vdcValue={form.vdc}
                onChange={onChange}
                error={fieldErrors.municipality}
              />
              <FormField label="Tole / neighbourhood" htmlFor="toleEn">
                <Input id="toleEn" name="toleEn" value={form.toleEn} onChange={onChange} placeholder="Enter tole name" />
              </FormField>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs leading-snug text-slate-700">
                <span className="font-semibold text-slate-800">Address defaults:</span> when you turn on full details for a
                parent, spouse, or child, only <span className="font-medium">empty</span> address fields are prefilled from
                the primary member (district, ward, municipality/VDC, tole). Change any value for a different residence.
                Each person is stored with their own address in the database. After Finish, the family list page loads
                families the same way as before (no new backend endpoint required).
              </p>
              {draft.memberEditMode && (
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                  Parent rows that already show someone from the database are locked so lineage stays consistent. Add or
                  update spouse and children below. Use <span className="font-semibold">Done</span> on a spouse or child
                  header to collapse that row (no save until you press Next). When you save this step with a new spouse
                  or child row (no saved person id on that row yet), the app creates a new household for this member,
                  moves them and that new spouse/child onto it, then opens that new family for editing.
                </div>
              )}
              <div className="rounded border border-slate-200 p-4">
                <p className="mb-1 text-sm font-semibold text-slate-800">Parents</p>
                <p className="mb-4 text-xs text-slate-600">
                  Enter English and Nepali names for each parent (one row each), or link an existing person. Turn on Full
                  details for address, DOB, and phone. Tap the header to expand or collapse; Remove clears the
                  parent (soft-deleted after save in edit mode). Press <span className="font-semibold">Done</span> at the
                  bottom of a parent section to save that block and collapse it. While editing another household member,
                  existing parents from the database stay locked.
                </p>
                <div className="space-y-4">
                  <CollapsibleRelationCard
                    title="Father"
                    expanded={fatherPanelOpen}
                    onToggle={() => setFatherPanelOpen((o) => !o)}
                    summaryCollapsed={fatherSummaryCollapsed}
                    showRemove={hasFatherFormData(form) && !fatherParentLocked}
                    onRemove={removeFather}
                    removeDisabled={fatherParentLocked}
                    removeTitle={fatherParentLocked ? "Locked for this member edit" : "Remove father from record"}
                  >
                    {!fatherParentLocked ? (
                      <FormField label="Link existing father (optional)" htmlFor="fatherPersonId-select">
                        <Select
                          id="fatherPersonId-select"
                          value={form.fatherPersonId != null && form.fatherPersonId !== "" ? String(form.fatherPersonId) : ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) {
                              setForm((prev) => ({ ...prev, fatherPersonId: null }));
                              return;
                            }
                            const p = directoryPersons.find((x) => String(x.id) === v);
                            setForm((prev) => ({
                              ...prev,
                              fatherPersonId: Number(v),
                              fatherNameEn: p?.nameEn || prev.fatherNameEn,
                              fatherNameNp: p?.nameNp || prev.fatherNameNp,
                            }));
                          }}
                        >
                          <option value="">— New record (enter names below) —</option>
                          {directoryPersons
                            .filter((p) => draft.primaryPersonId == null || Number(p.id) !== Number(draft.primaryPersonId))
                            .map((p) => (
                              <option key={`father-opt-${p.id}`} value={p.id}>
                                {p.nameEn} ({p.nameNp}) — ID {p.id}
                              </option>
                            ))}
                        </Select>
                      </FormField>
                    ) : null}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField label="Name (English)" htmlFor="fatherNameEn" error={fieldErrors.fatherNameEn}>
                        <Input
                          id="fatherNameEn"
                          name="fatherNameEn"
                          value={form.fatherNameEn}
                          onChange={onChange}
                          placeholder="Father name (English)"
                          disabled={fatherParentLocked}
                          className={fatherParentLocked ? "bg-slate-100 text-slate-700" : ""}
                        />
                      </FormField>
                      <FormField label="Name (Nepali)" htmlFor="fatherNameNp" error={fieldErrors.fatherNameNp}>
                        <Input
                          id="fatherNameNp"
                          name="fatherNameNp"
                          value={form.fatherNameNp}
                          onChange={onChange}
                          placeholder="Father name (Nepali)"
                          disabled={fatherParentLocked}
                          className={fatherParentLocked ? "bg-slate-100 text-slate-700" : ""}
                        />
                      </FormField>
                    </div>
                    <FormField label="Full details (address, DOB, phone)" htmlFor="fatherAddDetails-sw">
                      <div className="flex justify-end rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <Switch
                          id="fatherAddDetails-sw"
                          name="fatherAddDetails"
                          checked={form.fatherAddDetails}
                          onChange={onChange}
                          disabled={fatherParentLocked}
                        />
                      </div>
                    </FormField>
                    {form.fatherAddDetails && (
                      <fieldset disabled={fatherParentLocked} className="min-w-0 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormField label="Gender" htmlFor="fatherGender">
                            <select id="fatherGender" name="fatherGender" value={form.fatherGender} onChange={onChange} className="w-full rounded border p-2">
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Others</option>
                            </select>
                          </FormField>
                          <FormField label="Date of birth" htmlFor="fatherDateOfBirth">
                            <Input id="fatherDateOfBirth" name="fatherDateOfBirth" value={form.fatherDateOfBirth} onChange={onChange} type="date" />
                          </FormField>
                          <FormField label="Phone" htmlFor="fatherPhone">
                            <Input id="fatherPhone" name="fatherPhone" value={form.fatherPhone} onChange={onChange} placeholder="Mobile / landline" />
                          </FormField>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormField
                            label="Province"
                            htmlFor="fatherState"
                            hint={fieldErrors.fatherDistrictId ? "Check selected district/province mapping." : undefined}
                          >
                            <Input
                              id="fatherState"
                              name="fatherState"
                              value={form.fatherState}
                              readOnly
                              className="bg-slate-50 text-slate-700"
                              placeholder={form.fatherDistrictId ? "From district below" : "Select district for province"}
                            />
                          </FormField>
                          <FormField label="District" htmlFor="fatherDistrictId" error={fieldErrors.fatherDistrictId}>
                            <select id="fatherDistrictId" name="fatherDistrictId" value={form.fatherDistrictId} onChange={onChange} className="w-full rounded border p-2">
                              <option value="">Select district</option>
                              {districts.map((district) => (
                                <option key={`fd-${district.id}`} value={district.id}>{district.nameEn} ({district.nameNp})</option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label="Ward number" htmlFor="fatherWardNo">
                            <Input id="fatherWardNo" name="fatherWardNo" value={form.fatherWardNo} onChange={onChange} placeholder="Ward no." type="number" />
                          </FormField>
                        </div>
                        <LocalityFieldRow
                          toggleId="fatherUseMunicipality-sw"
                          toggleName="fatherUseMunicipality"
                          useMunicipality={form.fatherUseMunicipality}
                          onToggleChange={onChange}
                          inputId="father-locality"
                          municipalityName="fatherMunicipality"
                          vdcName="fatherVdc"
                          municipalityValue={form.fatherMunicipality}
                          vdcValue={form.fatherVdc}
                          onChange={onChange}
                          disabled={fatherParentLocked}
                        />
                        <FormField label="Tole / neighbourhood" htmlFor="fatherToleEn">
                          <Input id="fatherToleEn" name="fatherToleEn" value={form.fatherToleEn} onChange={onChange} placeholder="Enter tole name" />
                        </FormField>
                      </fieldset>
                    )}
                    {!fatherParentLocked ? (
                      <div className="flex justify-end border-t border-slate-100 pt-4">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={!hasFatherSaveableForPersist(form) || parentSectionSaving !== null}
                          onClick={saveFatherSectionToDb}
                        >
                          {parentSectionSaving === "father" ? "Saving…" : "Done"}
                        </Button>
                      </div>
                    ) : null}
                  </CollapsibleRelationCard>

                  <CollapsibleRelationCard
                    title="Mother"
                    expanded={motherPanelOpen}
                    onToggle={() => setMotherPanelOpen((o) => !o)}
                    summaryCollapsed={motherSummaryCollapsed}
                    showRemove={hasMotherFormData(form) && !motherParentLocked}
                    onRemove={removeMother}
                    removeDisabled={motherParentLocked}
                    removeTitle={motherParentLocked ? "Locked for this member edit" : "Remove mother from record"}
                  >
                    {!motherParentLocked ? (
                      <FormField label="Link existing mother (optional)" htmlFor="motherPersonId-select">
                        <Select
                          id="motherPersonId-select"
                          value={form.motherPersonId != null && form.motherPersonId !== "" ? String(form.motherPersonId) : ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) {
                              setForm((prev) => ({ ...prev, motherPersonId: null }));
                              return;
                            }
                            const p = directoryPersons.find((x) => String(x.id) === v);
                            setForm((prev) => ({
                              ...prev,
                              motherPersonId: Number(v),
                              motherNameEn: p?.nameEn || prev.motherNameEn,
                              motherNameNp: p?.nameNp || prev.motherNameNp,
                            }));
                          }}
                        >
                          <option value="">— New record (enter names below) —</option>
                          {directoryPersons
                            .filter((p) => draft.primaryPersonId == null || Number(p.id) !== Number(draft.primaryPersonId))
                            .map((p) => (
                              <option key={`mother-opt-${p.id}`} value={p.id}>
                                {p.nameEn} ({p.nameNp}) — ID {p.id}
                              </option>
                            ))}
                        </Select>
                      </FormField>
                    ) : null}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField label="Name (English)" htmlFor="motherNameEn" error={fieldErrors.motherNameEn}>
                        <Input
                          id="motherNameEn"
                          name="motherNameEn"
                          value={form.motherNameEn}
                          onChange={onChange}
                          placeholder="Mother name (English)"
                          disabled={motherParentLocked}
                          className={motherParentLocked ? "bg-slate-100 text-slate-700" : ""}
                        />
                      </FormField>
                      <FormField label="Name (Nepali)" htmlFor="motherNameNp" error={fieldErrors.motherNameNp}>
                        <Input
                          id="motherNameNp"
                          name="motherNameNp"
                          value={form.motherNameNp}
                          onChange={onChange}
                          placeholder="Mother name (Nepali)"
                          disabled={motherParentLocked}
                          className={motherParentLocked ? "bg-slate-100 text-slate-700" : ""}
                        />
                      </FormField>
                    </div>
                    <FormField label="Full details (address, DOB, phone)" htmlFor="motherAddDetails-sw">
                      <div className="flex justify-end rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <Switch
                          id="motherAddDetails-sw"
                          name="motherAddDetails"
                          checked={form.motherAddDetails}
                          onChange={onChange}
                          disabled={motherParentLocked}
                        />
                      </div>
                    </FormField>
                    {form.motherAddDetails && (
                      <fieldset disabled={motherParentLocked} className="min-w-0 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormField label="Gender" htmlFor="motherGender">
                            <select id="motherGender" name="motherGender" value={form.motherGender} onChange={onChange} className="w-full rounded border p-2">
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Others</option>
                            </select>
                          </FormField>
                          <FormField label="Date of birth" htmlFor="motherDateOfBirth">
                            <Input id="motherDateOfBirth" name="motherDateOfBirth" value={form.motherDateOfBirth} onChange={onChange} type="date" />
                          </FormField>
                          <FormField label="Phone" htmlFor="motherPhone">
                            <Input id="motherPhone" name="motherPhone" value={form.motherPhone} onChange={onChange} placeholder="Mobile / landline" />
                          </FormField>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormField label="Province" htmlFor="motherState" hint={fieldErrors.motherDistrictId ? "Check selected district/province mapping." : undefined}>
                            <Input
                              id="motherState"
                              name="motherState"
                              value={form.motherState}
                              readOnly
                              className="bg-slate-50 text-slate-700"
                              placeholder={form.motherDistrictId ? "From district below" : "Select district for province"}
                            />
                          </FormField>
                          <FormField label="District" htmlFor="motherDistrictId" error={fieldErrors.motherDistrictId}>
                            <select id="motherDistrictId" name="motherDistrictId" value={form.motherDistrictId} onChange={onChange} className="w-full rounded border p-2">
                              <option value="">Select district</option>
                              {districts.map((district) => (
                                <option key={`md-${district.id}`} value={district.id}>{district.nameEn} ({district.nameNp})</option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label="Ward number" htmlFor="motherWardNo">
                            <Input id="motherWardNo" name="motherWardNo" value={form.motherWardNo} onChange={onChange} placeholder="Ward no." type="number" />
                          </FormField>
                        </div>
                        <LocalityFieldRow
                          toggleId="motherUseMunicipality-sw"
                          toggleName="motherUseMunicipality"
                          useMunicipality={form.motherUseMunicipality}
                          onToggleChange={onChange}
                          inputId="mother-locality"
                          municipalityName="motherMunicipality"
                          vdcName="motherVdc"
                          municipalityValue={form.motherMunicipality}
                          vdcValue={form.motherVdc}
                          onChange={onChange}
                          disabled={motherParentLocked}
                        />
                        <FormField label="Tole / neighbourhood" htmlFor="motherToleEn">
                          <Input id="motherToleEn" name="motherToleEn" value={form.motherToleEn} onChange={onChange} placeholder="Enter tole name" />
                        </FormField>
                      </fieldset>
                    )}
                    {!motherParentLocked ? (
                      <div className="flex justify-end border-t border-slate-100 pt-4">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={!hasMotherSaveableForPersist(form) || parentSectionSaving !== null}
                          onClick={saveMotherSectionToDb}
                        >
                          {parentSectionSaving === "mother" ? "Saving…" : "Done"}
                        </Button>
                      </div>
                    ) : null}
                  </CollapsibleRelationCard>
                </div>
              </div>

              <div className="rounded border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Wives / spouses</p>
                  <Button type="button" variant="primary" size="sm" onClick={() => addRelationRow("spouses", "FEMALE")}>
                    + Add spouse
                  </Button>
                </div>
                {form.spouses.map((spouse, idx) => {
                  const spouseLine =
                    [String(spouse.nameEn || "").trim(), String(spouse.nameNp || "").trim()].filter(Boolean).join(" · ") ||
                    (relationRowHasPersistedPerson(spouse) ? "Saved in database" : "Empty row — add a name");
                  const spouseOpen = spouseRowOpen[idx] ?? true;
                  const spouseHasNames = Boolean(
                    String(spouse.nameEn || "").trim() || String(spouse.nameNp || "").trim()
                  );
                  const canRemoveSpouseRow =
                    form.spouses.length > 1 || relationRowHasPersistedPerson(spouse) || spouseHasNames;
                  return (
                    <div key={`sp-${idx}`} className="mb-3">
                      <CollapsibleRelationCard
                        title={`Spouse ${idx + 1}`}
                        expanded={spouseOpen}
                        onToggle={() =>
                          setSpouseRowOpen((prev) => {
                            const next = [...prev];
                            while (next.length <= idx) next.push(true);
                            next[idx] = !(next[idx] ?? true);
                            return next;
                          })
                        }
                        summaryCollapsed={spouseLine}
                        showRemove={canRemoveSpouseRow}
                        onRemove={() => removeRelationRow("spouses", idx)}
                        removeTitle="Remove spouse"
                        onDone={() =>
                          setSpouseRowOpen((prev) => {
                            const next = [...prev];
                            while (next.length <= idx) next.push(true);
                            next[idx] = false;
                            return next;
                          })
                        }
                      >
                    <FormField label="Name (English)" htmlFor={`spouses-${idx}-nameEn`}>
                      <Input id={`spouses-${idx}-nameEn`} value={spouse.nameEn} onChange={(e) => updateArrayItem("spouses", idx, "nameEn", e.target.value)} placeholder="Spouse name (English)" />
                    </FormField>
                    <FormField label="Name (Nepali)" htmlFor={`spouses-${idx}-nameNp`}>
                      <Input id={`spouses-${idx}-nameNp`} value={spouse.nameNp} onChange={(e) => updateArrayItem("spouses", idx, "nameNp", e.target.value)} placeholder="Spouse name (Nepali)" />
                    </FormField>
                    <FormField label="Gender" htmlFor={`spouses-${idx}-gender`}>
                      <select id={`spouses-${idx}-gender`} value={spouse.gender} onChange={(e) => updateArrayItem("spouses", idx, "gender", e.target.value)} className="w-full rounded border p-2">
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </FormField>
                    <FormField label="Full details" htmlFor={`spouses-${idx}-add-sw`}>
                      <div className="flex justify-end rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                        <Switch
                          id={`spouses-${idx}-add-sw`}
                          name="spouse-addDetails"
                          checked={spouse.addDetails}
                          onChange={(e) => updateArrayItem("spouses", idx, "addDetails", e.target.checked)}
                        />
                      </div>
                    </FormField>
                    {spouse.addDetails && (
                      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField label="Date of birth" htmlFor={`spouses-${idx}-dob`}>
                            <Input id={`spouses-${idx}-dob`} value={spouse.dateOfBirth || ""} type="date" onChange={(e) => updateArrayItem("spouses", idx, "dateOfBirth", e.target.value)} />
                          </FormField>
                          <FormField label="Phone" htmlFor={`spouses-${idx}-phone`}>
                            <Input id={`spouses-${idx}-phone`} value={spouse.phone || ""} placeholder="Mobile / landline" onChange={(e) => updateArrayItem("spouses", idx, "phone", e.target.value)} />
                          </FormField>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormField label="Province" htmlFor={`spouses-${idx}-state`}>
                            <Input
                              id={`spouses-${idx}-state`}
                              value={spouse.state || ""}
                              readOnly
                              className="bg-slate-50 text-slate-700"
                              placeholder={spouse.districtId ? "From district below" : "Select district for province"}
                            />
                          </FormField>
                          <FormField label="District" htmlFor={`spouses-${idx}-district`}>
                            <select id={`spouses-${idx}-district`} value={spouse.districtId || ""} onChange={(e) => updateArrayItem("spouses", idx, "districtId", e.target.value)} className="w-full rounded border p-2">
                              <option value="">Select district</option>
                              {districts.map((district) => (
                                <option key={`sd-${idx}-${district.id}`} value={district.id}>{district.nameEn} ({district.nameNp})</option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label="Ward number" htmlFor={`spouses-${idx}-ward`}>
                            <Input id={`spouses-${idx}-ward`} value={spouse.wardNo || ""} type="number" placeholder="Ward no." onChange={(e) => updateArrayItem("spouses", idx, "wardNo", e.target.value)} />
                          </FormField>
                        </div>
                        <LocalityFieldRow
                          toggleId={`spouses-${idx}-mun-sw`}
                          toggleName="spouse-useMunicipality"
                          useMunicipality={spouse.useMunicipality}
                          onToggleChange={(e) => updateArrayItem("spouses", idx, "useMunicipality", e.target.checked)}
                          inputId={`spouses-${idx}-locality`}
                          municipalityName="municipality"
                          vdcName="vdc"
                          municipalityValue={spouse.municipality || ""}
                          vdcValue={spouse.vdc || ""}
                          onChange={(e) => updateArrayItem("spouses", idx, e.target.name, e.target.value)}
                        />
                        <FormField label="Tole / neighbourhood" htmlFor={`spouses-${idx}-toleEn`}>
                          <Input id={`spouses-${idx}-toleEn`} value={spouse.toleEn || ""} placeholder="Enter tole name" onChange={(e) => updateArrayItem("spouses", idx, "toleEn", e.target.value)} />
                        </FormField>
                      </div>
                    )}
                      </CollapsibleRelationCard>
                    </div>
                  );
                })}
              </div>

              <div className="rounded border border-slate-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">Children</p>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={childFieldsLockedBySpouse}
                    onClick={() => addRelationRow("children", "MALE")}
                  >
                    + Add child
                  </Button>
                </div>
                {spouseRequiredForChildrenUi && !hasSpouseForChildrenUi ? (
                  <p className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                    Add a spouse with a name (English or Nepali) before adding children. For male or female heads, each
                    child needs the other parent from the spouse row.
                  </p>
                ) : null}
                {form.children.map((child, idx) => {
                  const childLine =
                    [String(child.nameEn || "").trim(), String(child.nameNp || "").trim()].filter(Boolean).join(" · ") ||
                    (relationRowHasPersistedPerson(child) ? "Saved in database" : "Empty row");
                  const childOpen = childRowOpen[idx] ?? true;
                  const childHasNames = Boolean(
                    String(child.nameEn || "").trim() || String(child.nameNp || "").trim()
                  );
                  const canRemoveChildRow =
                    form.children.length > 1 || relationRowHasPersistedPerson(child) || childHasNames;
                  return (
                    <div key={`ch-${idx}`} className="mb-3">
                      <CollapsibleRelationCard
                        title={`Child ${idx + 1}`}
                        expanded={childOpen}
                        onToggle={() =>
                          setChildRowOpen((prev) => {
                            const next = [...prev];
                            while (next.length <= idx) next.push(true);
                            next[idx] = !(next[idx] ?? true);
                            return next;
                          })
                        }
                        summaryCollapsed={childLine}
                        showRemove={canRemoveChildRow}
                        onRemove={() => removeRelationRow("children", idx)}
                        removeTitle="Remove child"
                        doneDisabled={childFieldsLockedBySpouse}
                        onDone={() =>
                          setChildRowOpen((prev) => {
                            const next = [...prev];
                            while (next.length <= idx) next.push(true);
                            next[idx] = false;
                            return next;
                          })
                        }
                      >
                    <FormField label="Name (English)" htmlFor={`children-${idx}-nameEn`}>
                      <Input
                        id={`children-${idx}-nameEn`}
                        value={child.nameEn}
                        onChange={(e) => updateArrayItem("children", idx, "nameEn", e.target.value)}
                        placeholder="Child name (English)"
                        disabled={childFieldsLockedBySpouse}
                        className={childFieldsLockedBySpouse ? "bg-slate-100 text-slate-600" : ""}
                      />
                    </FormField>
                    <FormField label="Name (Nepali)" htmlFor={`children-${idx}-nameNp`}>
                      <Input
                        id={`children-${idx}-nameNp`}
                        value={child.nameNp}
                        onChange={(e) => updateArrayItem("children", idx, "nameNp", e.target.value)}
                        placeholder="Child name (Nepali)"
                        disabled={childFieldsLockedBySpouse}
                        className={childFieldsLockedBySpouse ? "bg-slate-100 text-slate-600" : ""}
                      />
                    </FormField>
                    <FormField label="Gender" htmlFor={`children-${idx}-gender`}>
                      <select
                        id={`children-${idx}-gender`}
                        value={child.gender}
                        onChange={(e) => updateArrayItem("children", idx, "gender", e.target.value)}
                        disabled={childFieldsLockedBySpouse}
                        className={`w-full rounded border p-2 ${childFieldsLockedBySpouse ? "cursor-not-allowed bg-slate-100 text-slate-600" : ""}`}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </FormField>
                    <FormField label="Full details" htmlFor={`children-${idx}-add-sw`}>
                      <div className="flex justify-end rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                        <Switch
                          id={`children-${idx}-add-sw`}
                          name="child-addDetails"
                          checked={child.addDetails}
                          onChange={(e) => updateArrayItem("children", idx, "addDetails", e.target.checked)}
                          disabled={childFieldsLockedBySpouse}
                        />
                      </div>
                    </FormField>
                    {child.addDetails && (
                      <fieldset disabled={childFieldsLockedBySpouse} className="min-w-0 space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField label="Date of birth" htmlFor={`children-${idx}-dob`}>
                            <Input id={`children-${idx}-dob`} value={child.dateOfBirth || ""} type="date" onChange={(e) => updateArrayItem("children", idx, "dateOfBirth", e.target.value)} />
                          </FormField>
                          <FormField label="Phone" htmlFor={`children-${idx}-phone`}>
                            <Input id={`children-${idx}-phone`} value={child.phone || ""} placeholder="Mobile / landline" onChange={(e) => updateArrayItem("children", idx, "phone", e.target.value)} />
                          </FormField>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormField label="Province" htmlFor={`children-${idx}-state`}>
                            <Input
                              id={`children-${idx}-state`}
                              value={child.state || ""}
                              readOnly
                              className="bg-slate-50 text-slate-700"
                              placeholder={child.districtId ? "From district below" : "Select district for province"}
                            />
                          </FormField>
                          <FormField label="District" htmlFor={`children-${idx}-district`}>
                            <select id={`children-${idx}-district`} value={child.districtId || ""} onChange={(e) => updateArrayItem("children", idx, "districtId", e.target.value)} className="w-full rounded border p-2">
                              <option value="">Select district</option>
                              {districts.map((district) => (
                                <option key={`cd-${idx}-${district.id}`} value={district.id}>{district.nameEn} ({district.nameNp})</option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label="Ward number" htmlFor={`children-${idx}-ward`}>
                            <Input id={`children-${idx}-ward`} value={child.wardNo || ""} type="number" placeholder="Ward no." onChange={(e) => updateArrayItem("children", idx, "wardNo", e.target.value)} />
                          </FormField>
                        </div>
                        <LocalityFieldRow
                          toggleId={`children-${idx}-mun-sw`}
                          toggleName="child-useMunicipality"
                          useMunicipality={child.useMunicipality}
                          onToggleChange={(e) => updateArrayItem("children", idx, "useMunicipality", e.target.checked)}
                          inputId={`children-${idx}-locality`}
                          municipalityName="municipality"
                          vdcName="vdc"
                          municipalityValue={child.municipality || ""}
                          vdcValue={child.vdc || ""}
                          onChange={(e) => updateArrayItem("children", idx, e.target.name, e.target.value)}
                        />
                        <FormField label="Tole / neighbourhood" htmlFor={`children-${idx}-toleEn`}>
                          <Input id={`children-${idx}-toleEn`} value={child.toleEn || ""} placeholder="Enter tole name" onChange={(e) => updateArrayItem("children", idx, "toleEn", e.target.value)} />
                        </FormField>
                      </fieldset>
                    )}
                      </CollapsibleRelationCard>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
              {!preview ? (
                <p className="rounded bg-white p-3 text-slate-600">No saved preview loaded yet.</p>
              ) : (
                <>
                  {(() => {
                    const pid = preview.family?.primaryPersonId;
                    const primary =
                      draft.memberEditMode && draft.primaryPersonId
                        ? preview.members.find((m) => Number(m.id) === Number(draft.primaryPersonId)) ||
                          preview.members[0] ||
                          null
                        : preview.members.find((m) => Number(m.id) === Number(pid)) || preview.members[0] || null;
                    const father = primary?.father || null;
                    const mother = primary?.mother || null;
                    const relationPool = preview.extended ?? preview.members;
                    const spouses = relationPool.filter(
                      (m) =>
                        (primary?.spouse?.id && Number(m.id) === Number(primary.spouse.id)) ||
                        Number(m?.spouse?.id) === Number(primary?.id)
                    );
                    const children = relationPool.filter(
                      (m) =>
                        Number(m?.father?.id) === Number(primary?.id) || Number(m?.mother?.id) === Number(primary?.id)
                    );
                    const provinceOf = (person) => {
                      if (!person?.district) return "—";
                      if (person.district.provinceNameEn) return person.district.provinceNameEn;
                      const matched = districts.find((d) => Number(d.id) === Number(person.district.id));
                      return matched?.provinceNameEn || "—";
                    };
                    const detailRows = (person) => (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <p>
                          <span className="text-slate-500">Name:</span>{" "}
                          <span className="font-medium">{personDisplay(person)}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">Gender:</span>{" "}
                          <span className="font-medium">{person?.gender || "—"}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">Date of birth:</span>{" "}
                          <span className="font-medium">{person?.dateOfBirth || "—"}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">Phone:</span>{" "}
                          <span className="font-medium">{person?.phone || "—"}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">Province:</span>{" "}
                          <span className="font-medium">{provinceOf(person)}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">District:</span>{" "}
                          <span className="font-medium">{person?.district?.nameEn || "—"}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">Ward number:</span>{" "}
                          <span className="font-medium">{person?.wardNo ?? "—"}</span>
                        </p>
                        <p>
                          <span className="text-slate-500">Locality:</span>{" "}
                          <span className="font-medium">{person?.municipality || person?.vdc || "—"}</span>
                        </p>
                        <p className="sm:col-span-2">
                          <span className="text-slate-500">Tole:</span>{" "}
                          <span className="font-medium">{person?.toleEn || "—"}</span>
                        </p>
                      </div>
                    );
                    const refShort = (p) => (p ? `${p.nameEn || "—"} (${p.nameNp || "—"})` : "—");
                    return (
                      <div className="space-y-3">
                        <div className="rounded bg-white p-3 shadow-sm">
                          <p className="text-xs text-slate-500">Family</p>
                          <p className="font-medium text-slate-900">{preview.family.familyNameEn || "—"}</p>
                          <p className="mt-1 text-xs text-slate-600">{preview.family.familyNameNp || ""}</p>
                        </div>

                        <div className="rounded bg-white p-3 shadow-sm">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {draft.memberEditMode ? "Household member (this editor)" : "Primary member"}
                          </p>
                          {primary ? detailRows(primary) : <p className="font-medium text-slate-900">—</p>}
                        </div>

                        <div className="rounded bg-white p-3 shadow-sm">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Father</p>
                          {father ? detailRows(father) : <p className="font-medium text-slate-900">—</p>}
                        </div>

                        <div className="rounded bg-white p-3 shadow-sm">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Mother</p>
                          {mother ? detailRows(mother) : <p className="font-medium text-slate-900">—</p>}
                        </div>

                        <div className="rounded bg-white p-3 shadow-sm">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Spouse(s)</p>
                          {spouses.length ? (
                            <div className="space-y-3">
                              {spouses.map((s) => (
                                <div key={s.id} className="rounded border border-slate-100 p-2">
                                  {detailRows(s)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="font-medium text-slate-900">—</p>
                          )}
                        </div>

                        <div className="rounded bg-white p-3 shadow-sm">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Children</p>
                          {children.length ? (
                            <div className="space-y-3">
                              {children.map((c) => (
                                <div key={c.id} className="rounded border border-slate-100 p-2">
                                  {detailRows(c)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="font-medium text-slate-900">—</p>
                          )}
                        </div>

                        <div className="rounded bg-white p-3 shadow-sm">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            All saved household members ({preview.members.length})
                          </p>
                          <div className="overflow-x-auto">
                            <DataTable flush className="min-w-[720px] text-xs">
                              <DataTableHead>
                                <DataTableHeaderCell>Role</DataTableHeaderCell>
                                <DataTableHeaderCell>ID</DataTableHeaderCell>
                                <DataTableHeaderCell>Name (EN)</DataTableHeaderCell>
                                <DataTableHeaderCell>Name (NP)</DataTableHeaderCell>
                                <DataTableHeaderCell>DOB</DataTableHeaderCell>
                                <DataTableHeaderCell>Gender</DataTableHeaderCell>
                                <DataTableHeaderCell>Phone</DataTableHeaderCell>
                                <DataTableHeaderCell>Father</DataTableHeaderCell>
                                <DataTableHeaderCell>Mother</DataTableHeaderCell>
                                <DataTableHeaderCell>Spouse</DataTableHeaderCell>
                              </DataTableHead>
                              <tbody>
                                {preview.members.map((m) => {
                                  const isPrimary = Number(m.id) === Number(preview.family?.primaryPersonId);
                                  return (
                                    <DataTableRow key={m.id}>
                                      <DataTableCell className="whitespace-nowrap font-medium">
                                        {isPrimary ? "Primary" : "Member"}
                                      </DataTableCell>
                                      <DataTableCell className="font-mono">{m.id}</DataTableCell>
                                      <DataTableCell>{m.nameEn || "—"}</DataTableCell>
                                      <DataTableCell>{m.nameNp || "—"}</DataTableCell>
                                      <DataTableCell className="whitespace-nowrap">
                                        {m.dateOfBirth ? String(m.dateOfBirth).slice(0, 10) : "—"}
                                      </DataTableCell>
                                      <DataTableCell>{m.gender || "—"}</DataTableCell>
                                      <DataTableCell>{m.phone || "—"}</DataTableCell>
                                      <DataTableCell className="max-w-[140px] truncate" title={refShort(m.father)}>
                                        {refShort(m.father)}
                                      </DataTableCell>
                                      <DataTableCell className="max-w-[140px] truncate" title={refShort(m.mother)}>
                                        {refShort(m.mother)}
                                      </DataTableCell>
                                      <DataTableCell className="max-w-[140px] truncate" title={refShort(m.spouse)}>
                                        {refShort(m.spouse)}
                                      </DataTableCell>
                                    </DataTableRow>
                                  );
                                })}
                              </tbody>
                            </DataTable>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Button type="button" variant="secondary" className="order-1 w-full sm:order-none sm:w-auto" onClick={() => navigate("/families/view")}>
              Cancel
            </Button>
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                className="order-2 w-full sm:order-none sm:w-auto"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                Prev
              </Button>
            ) : null}
            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                className="order-3 w-full sm:order-none sm:min-w-[8.5rem] sm:w-auto"
                onClick={handleNext}
                disabled={saving || parentSectionSaving !== null}
              >
                {saving || parentSectionSaving !== null ? (
                  "Saving…"
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    Next
                    <span aria-hidden className="text-lg font-normal leading-none">
                      →
                    </span>
                  </span>
                )}
              </Button>
            ) : (
              <>
                <Button type="submit" variant="primary" className="order-3 w-full sm:order-none sm:w-auto" disabled={saving}>
                  {saving ? "Refreshing…" : "Refresh from DB"}
                </Button>
                <Button type="button" variant="secondary" className="order-4 w-full sm:order-none sm:w-auto" onClick={handleFinish}>
                  Finish
                </Button>
              </>
            )}
          </div>
        </form>
        {success && <p className="mt-3 text-sm text-green-700">{success}</p>}
      </section>
      </AppLayout>

      {errorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <Card className="max-h-[80vh] w-full max-w-lg overflow-hidden shadow-2xl" padding="p-6" title="Error">
            <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-[#0F172A]">
              {error}
            </pre>
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setErrorModalOpen(false);
                  setError("");
                }}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
