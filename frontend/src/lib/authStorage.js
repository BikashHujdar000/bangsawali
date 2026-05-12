const TOKEN_KEY = "token";
const AUTHORITIES_KEY = "authorities";
const PASSWORD_CHANGE_REQUIRED_KEY = "passwordChangeRequired";
const SESSION_USERNAME_KEY = "sessionUsername";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setPasswordChangeRequired(required) {
  if (required) {
    localStorage.setItem(PASSWORD_CHANGE_REQUIRED_KEY, "1");
  } else {
    localStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
  }
}

export function getPasswordChangeRequired() {
  return localStorage.getItem(PASSWORD_CHANGE_REQUIRED_KEY) === "1";
}

export function setSessionUsername(username) {
  if (username) {
    localStorage.setItem(SESSION_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(SESSION_USERNAME_KEY);
  }
}

export function getSessionUsername() {
  return localStorage.getItem(SESSION_USERNAME_KEY) || "";
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTHORITIES_KEY);
  localStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
  localStorage.removeItem(SESSION_USERNAME_KEY);
}

export function setAuthorities(authorities = []) {
  localStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
}

export function getAuthorities() {
  try {
    const raw = localStorage.getItem(AUTHORITIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function canEditFamilyData() {
  let authorities = getAuthorities();
  if (!authorities.length) {
    try {
      const token = getToken();
      if (token && token.includes(".")) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (Array.isArray(payload?.authorities)) {
          authorities = payload.authorities;
        }
      }
    } catch {
      // keep empty fallback
    }
  }
  const authoritySet = new Set(authorities);
  return authoritySet.has("ROLE_ADMIN") || authoritySet.has("ROLE_SUPER_ADMIN");
}

export function isSuperAdmin() {
  let authorities = getAuthorities();
  if (!authorities.length) {
    try {
      const token = getToken();
      if (token && token.includes(".")) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (Array.isArray(payload?.authorities)) {
          authorities = payload.authorities;
        }
      }
    } catch {
      // keep empty fallback
    }
  }
  const authoritySet = new Set(authorities);
  return authoritySet.has("ROLE_SUPER_ADMIN");
}
