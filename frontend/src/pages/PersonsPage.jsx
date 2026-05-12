import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { canEditFamilyData } from "../lib/authStorage";
import AppLayout from "../layouts/AppLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from "../components/ui/DataTable";
import { listPersons } from "../services/personService";
import { getErrorMessage } from "../lib/http";

const emptyFilters = { id: "", name: "", dateOfBirth: "" };

function formatDob(value) {
  if (value == null || value === "") return "-";
  const s = typeof value === "string" ? value : String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function isHouseholdHead(person) {
  const fid = person?.family?.id;
  const pid = person?.family?.primaryPersonId;
  if (fid == null || pid == null || person?.id == null) return false;
  return Number(person.id) === Number(pid);
}

function isFemaleGender(gender) {
  return String(gender || "").toUpperCase() === "FEMALE";
}

function activeFilterCount(applied) {
  let n = 0;
  if (String(applied.id || "").trim()) n += 1;
  if (String(applied.name || "").trim()) n += 1;
  if (String(applied.dateOfBirth || "").trim()) n += 1;
  return n;
}

export default function PersonsPage() {
  const [loading, setLoading] = useState(true);
  const [persons, setPersons] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState("");

  async function loadData(nextFilters) {
    const active = nextFilters !== undefined ? nextFilters : filters;
    setLoading(true);
    setError("");
    try {
      const personsData = await listPersons(active);
      setPersons(personsData);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load person management data."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(emptyFilters);
  }, []);

  function openFilterModal() {
    setDraftFilters(filters);
    setFilterOpen(true);
  }

  function onDraftFilterChange(event) {
    const { name, value } = event.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  }

  function applyFilters() {
    const next = { ...draftFilters };
    setFilters(next);
    setFilterOpen(false);
    loadData(next);
  }

  function resetFiltersFromModal() {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setFilterOpen(false);
    loadData(emptyFilters);
  }

  async function handleDelete(id) {
    setError("");
    setSuccess("");
    try {
      await deletePerson(id);
      setSuccess("Person removed (soft delete).");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete person."));
    }
  }

  const count = activeFilterCount(filters);

  return (
    <AppLayout>
      <div className="mt-2 grid grid-cols-1 gap-6">
        <Card
          title="Person list"
          headerRight={
            <div className="flex flex-wrap gap-2">
              <Link to="/families/view">
                <Button type="button" variant="secondary" size="sm">
                  Family view
                </Button>
              </Link>
              <Button type="button" variant="secondary" size="sm" onClick={openFilterModal}>
                <span className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
                  </svg>
                  Filters {count > 0 ? `(${count})` : ""}
                </span>
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => loadData()}>
                Refresh
              </Button>
            </div>
          }
        >
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {!loading && persons.length === 0 ? (
            <p className="mt-3 text-sm text-[#64748B]">
              {count > 0 ? "No person records match these filters." : "No person records found."}
            </p>
          ) : null}
          {!loading && persons.length > 0 ? (
            <DataTable flush className="mt-4">
              <DataTableHead>
                <DataTableHeaderCell>ID</DataTableHeaderCell>
                <DataTableHeaderCell>Household role</DataTableHeaderCell>
                <DataTableHeaderCell>Name</DataTableHeaderCell>
                <DataTableHeaderCell>DOB</DataTableHeaderCell>
                <DataTableHeaderCell>Gender</DataTableHeaderCell>
                <DataTableHeaderCell>Family</DataTableHeaderCell>
                <DataTableHeaderCell>Phone</DataTableHeaderCell>
                <DataTableHeaderCell>Actions</DataTableHeaderCell>
              </DataTableHead>
              <tbody>
                {persons.map((person) => (
                  <DataTableRow key={person.id}>
                    <DataTableCell className="font-mono text-sm">{person.id}</DataTableCell>
                    <DataTableCell>
                      {person.family?.id == null ? (
                        <span className="text-[#64748B]">—</span>
                      ) : isHouseholdHead(person) ? (
                        <Badge variant="role" className="normal-case">
                          Head
                        </Badge>
                      ) : (
                        <Badge variant="neutral" className="normal-case">
                          Member
                        </Badge>
                      )}
                    </DataTableCell>
                    <DataTableCell className="font-medium">{person.nameEn}</DataTableCell>
                    <DataTableCell className="text-[#64748B]">{formatDob(person.dateOfBirth)}</DataTableCell>
                    <DataTableCell>{person.gender}</DataTableCell>
                    <DataTableCell className="text-[#64748B]">{person.family?.familyNameEn || "—"}</DataTableCell>
                    <DataTableCell className="text-[#64748B]">{person.phone || "—"}</DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/persons/${person.id}`}>
                          <Button type="button" variant="primary" size="sm">
                            View
                          </Button>
                        </Link>
                        {canEditFamilyData() && person.family?.id && !isFemaleGender(person.gender) ? (
                          <Link to={`/families/${person.family.id}/edit?focusPerson=${person.id}`}>
                            <Button type="button" variant="amber" size="sm">
                              Edit
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </tbody>
            </DataTable>
          ) : null}
        </Card>
      </div>

      {filterOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <Card className="relative w-full max-w-lg shadow-xl" padding="p-6 md:p-8" title="Filter persons">
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Person ID" htmlFor="modal-filter-id">
                <Input
                  id="modal-filter-id"
                  name="id"
                  value={draftFilters.id}
                  onChange={onDraftFilterChange}
                  placeholder="Exact person ID"
                  inputMode="numeric"
                />
              </FormField>
              <FormField label="Name" htmlFor="modal-filter-name">
                <Input
                  id="modal-filter-name"
                  name="name"
                  value={draftFilters.name}
                  onChange={onDraftFilterChange}
                  placeholder="English or Nepali (partial match)"
                />
              </FormField>
              <FormField label="Date of birth" htmlFor="modal-filter-dob">
                <Input
                  id="modal-filter-dob"
                  name="dateOfBirth"
                  type="date"
                  value={draftFilters.dateOfBirth}
                  onChange={onDraftFilterChange}
                />
              </FormField>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFilterOpen(false)}>
                Close
              </Button>
              <Button type="button" variant="secondary" onClick={resetFiltersFromModal}>
                Reset
              </Button>
              <Button type="button" variant="primary" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </AppLayout>
  );
}
