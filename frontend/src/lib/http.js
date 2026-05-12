export function getErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.error && typeof data.error === "string") {
    return data.error;
  }

  if (data?.message && typeof data.message === "string") {
    return data.message;
  }

  return fallbackMessage;
}
