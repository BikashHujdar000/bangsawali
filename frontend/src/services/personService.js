import api from "../api";

export async function getPersonById(personId) {
  const response = await api.get(`/persons/${personId}`);
  return response.data;
}

export async function listPersonChildren(personId) {
  const response = await api.get(`/persons/${personId}/children`);
  return response.data;
}

/**
 * @param {string | Record<string, string> | null | undefined} arg
 *        Legacy: non-empty string becomes `q`. Object: optional `id`, `name`, `dateOfBirth` (yyyy-MM-dd), `q`.
 */
export async function listPersons(arg) {
  const params = {};
  if (arg == null || arg === "") {
    // list all
  } else if (typeof arg === "string") {
    const t = arg.trim();
    if (t) params.q = t;
  } else {
    const { id, name, dateOfBirth, q } = arg;
    if (q != null && String(q).trim()) params.q = String(q).trim();
    const idStr = id != null ? String(id).trim() : "";
    if (idStr && /^\d+$/.test(idStr)) params.id = idStr;
    if (name != null && String(name).trim()) params.name = String(name).trim();
    if (dateOfBirth != null && String(dateOfBirth).trim()) {
      params.dateOfBirth = String(dateOfBirth).trim();
    }
  }
  const response = await api.get("/persons", {
    params: Object.keys(params).length ? params : undefined,
  });
  return response.data;
}

export async function createPerson(payload) {
  const response = await api.post("/persons", payload);
  return response.data;
}

export async function deletePerson(personId) {
  await api.delete(`/persons/${personId}`);
}

/** Admin / Super Admin: removes the person row from the database (cannot be undone). */
export async function deletePersonPermanent(personId) {
  await api.delete(`/persons/${personId}/permanent`);
}

export async function updatePerson(personId, payload) {
  const response = await api.put(`/persons/${personId}`, payload);
  return response.data;
}
