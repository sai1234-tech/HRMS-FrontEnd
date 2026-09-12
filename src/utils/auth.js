export function getAuthToken() {
  return sessionStorage.getItem("hrms_token");
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}
