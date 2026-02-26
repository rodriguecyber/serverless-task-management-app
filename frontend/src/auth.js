/**
 * Decode JWT payload without verification (for UI only; API validates token).
 * Returns null if token is missing or invalid.
 */
export function decodeToken(token) {
  if (!token?.trim()) return null;
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function isAdmin(token) {
  const payload = decodeToken(token);
  const groups = payload?.["cognito:groups"];
  return Array.isArray(groups) && groups.includes("task_admin_group");
}
