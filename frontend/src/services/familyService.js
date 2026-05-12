import api from "../api";

/**
 * @param {{ status?: 'active' | 'deleted' | 'all' }} [opts]
 *        {@code status} is honored for ADMIN and SUPER_ADMIN on the server; other roles always receive active families.
 */
export async function listFamilies(opts = {}) {
  const { status } = opts;
  const params = {};
  if (status === "active" || status === "deleted" || status === "all") {
    params.status = status;
  }
  const response = await api.get("/families", {
    params: Object.keys(params).length ? params : undefined,
  });
  return response.data;
}

export async function createFamily(payload) {
  const response = await api.post("/families", payload);
  return response.data;
}

/** Admin: new household record; moves this person, same-household spouse, and their children. */
export async function createHouseholdFromPerson(personId) {
  const response = await api.post(`/families/branch-from-person/${personId}`);
  return response.data;
}

export async function setFamilyPrimaryPerson(familyId, payload) {
  const response = await api.put(`/families/${familyId}/primary-person`, payload);
  return response.data;
}

export async function updateFamily(familyId, payload) {
  const response = await api.put(`/families/${familyId}`, payload);
  return response.data;
}

export async function getFamilyById(familyId) {
  const response = await api.get(`/families/${familyId}`);
  return response.data;
}

export async function listFamilyPersons(familyId) {
  const response = await api.get(`/families/${familyId}/persons`);
  return response.data;
}

/**
 * Server-side duplicate identity check for the same household (same rules as POST /persons create).
 * @param {number|string} familyId
 * @param {{ skipPersonIds?: number[], nameEn: string, nameNp: string, gender: string, dateOfBirth?: string|null, phone?: string|null }} body
 * @returns {Promise<number|null>} existing person id or null
 */
export async function findDuplicateHouseholdMember(familyId, body) {
  const response = await api.post(`/families/${familyId}/duplicate-household-member`, body);
  const id = response.data?.existingPersonId;
  if (id == null || id === "") return null;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Detail view: household + linked children/spouses on other household rows */
export async function listFamilyPersonsExtended(familyId) {
  const response = await api.get(`/families/${familyId}/persons-extended`);
  return response.data;
}

/** SUPER_ADMIN only: fetch family even if it is soft-deleted. */
export async function getFamilyByIdIncludingDeleted(familyId) {
  const response = await api.get(`/families/${familyId}/include-deleted`);
  return response.data;
}

/** SUPER_ADMIN only: restore a soft-deleted family and its members. */
export async function restoreFamily(familyId) {
  await api.post(`/families/${familyId}/restore`);
}

/** Admin / Super Admin: soft-deletes all household members then marks the family deleted. */
export async function deleteFamily(familyId) {
  await api.delete(`/families/${familyId}`);
}

/** SUPER_ADMIN only: hard-deletes the family and all members from the database. */
export async function deleteFamilyPermanent(familyId) {
  await api.delete(`/families/${familyId}/permanent`);
}
