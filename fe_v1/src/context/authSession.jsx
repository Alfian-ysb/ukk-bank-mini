export function getStoredToken() {
  return sessionStorage.getItem("token") || "";
}

export function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getStoredRole() {
  return String(getStoredUser()?.role || "").toLowerCase();
}

export function getStoredBankName() {
  return sessionStorage.getItem("bank_name") || "";
}

export function setStoredBankName(bankName) {
  sessionStorage.setItem("bank_name", bankName);
  window.dispatchEvent(new Event("bank-name-updated"));
}

export function isLoggedIn() {
  return Boolean(getStoredToken() && getStoredUser());
}

export function saveSession(payload) {
  const token = payload.access_token || payload.token;
  const user = payload.user || payload.data;

  if (!token || !user?.role) {
    throw new Error("Response login tidak lengkap.");
  }

  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("bank_name");
}

export function getRouteByRole(role) {
  switch (String(role).toLowerCase()) {
    case "admin":
      return "/admin/dashboard";
    case "teller":
      return "/teller/dashboard";
    case "supervisor":
      return "/supervisor/dashboard";
    default:
      return "/login";
  }
}
