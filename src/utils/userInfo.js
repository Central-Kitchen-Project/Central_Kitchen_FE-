/**
 * JWT claim keys that may hold the numeric user id (ASP.NET / Identity).
 */
const JWT_USER_ID_CLAIMS = [
  "nameid",
  "sub",
  "userId",
  "UserId",
  "Id",
  "id",
  "uid",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata",
];

const JWT_SKIP_KEYS = new Set([
  "exp",
  "iat",
  "nbf",
  "auth_time",
  "ver",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
]);

function parsePositiveInt(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Any small positive integer in payload (last resort — skips Guid-like strings). */
function scanPayloadForNumericUserId(payload) {
  if (!payload || typeof payload !== "object") return null;
  for (const [k, v] of Object.entries(payload)) {
    if (JWT_SKIP_KEYS.has(k)) continue;
    if (typeof v === "number" && parsePositiveInt(v)) return parsePositiveInt(v);
    if (typeof v === "string" && /^\d{1,12}$/.test(v)) {
      const n = parsePositiveInt(v);
      if (n != null) return n;
    }
  }
  return null;
}

function getNumericUserIdFromJwtPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  for (const key of JWT_USER_ID_CLAIMS) {
    if (payload[key] == null || payload[key] === "") continue;
    const n = parsePositiveInt(payload[key]);
    if (n != null) return n;
  }
  return scanPayloadForNumericUserId(payload);
}

/**
 * Deep scan Auth/login JSON for a numeric user id (nested user object, etc.).
 * Avoids picking roleId / small ints that are not user pk.
 */
export function resolveUserIdFromLoginToken(tokenObj) {
  const preferredKeys = [
    "userId",
    "id",
    "userID",
    "UserId",
    "Id",
    "user_id",
  ];
  const skipKeys = new Set([
    "roleId",
    "RoleId",
    "status",
    "exp",
    "iat",
    "ver",
  ]);

  const tryDirect = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    for (const pk of preferredKeys) {
      if (obj[pk] == null || obj[pk] === "") continue;
      const n = parsePositiveInt(obj[pk]);
      if (n != null) return n;
    }
    return null;
  };

  const walk = (obj, depth) => {
    if (depth > 5 || !obj || typeof obj !== "object") return null;
    const direct = tryDirect(obj);
    if (direct != null) return direct;
    for (const [k, v] of Object.entries(obj)) {
      if (skipKeys.has(k)) continue;
      if (typeof v === "string" && v.length > 120 && (k === "token" || k === "accessToken")) continue;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const inner = walk(v, depth + 1);
        if (inner != null) return inner;
      }
    }
    return null;
  };
  return walk(tokenObj, 0);
}

/**
 * Decode current access token (object with .token string or raw JWT string).
 */
/** Parse JWT string and extract numeric user id (uses full payload scan). */
export function getUserIdFromJwtString(jwtString) {
  try {
    if (!jwtString || typeof jwtString !== "string" || !jwtString.includes(".")) return null;
    const part = jwtString.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return getNumericUserIdFromJwtPayload(payload);
  } catch {
    return null;
  }
}

export function getJwtPayloadFromStorage() {
  try {
    const stored = localStorage.getItem("ACCESS_TOKEN");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const tokenStr = parsed?.token ?? parsed;
    if (typeof tokenStr !== "string" || !tokenStr.includes(".")) return null;
    const part = tokenStr.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * If USER_INFO exists but id is missing, copy numeric id from JWT (older logins).
 */
export function ensureUserInfoIdFromJwt() {
  const fromJwt = getNumericUserIdFromJwtPayload(getJwtPayloadFromStorage());
  if (fromJwt == null) return;
  try {
    const raw = localStorage.getItem("USER_INFO");
    if (!raw) return;
    const u = JSON.parse(raw);
    const current = parsePositiveInt(u?.id);
    if (current != null) return;
    u.id = fromJwt;
    localStorage.setItem("USER_INFO", JSON.stringify(u));
  } catch {
    /* ignore */
  }
}

/**
 * Returns a positive numeric user id for ?userId=… APIs.
 * Uses USER_INFO first, then JWT claims (fixes missing id when only Guid was in token).
 */
export function getStoredUserId() {
  ensureUserInfoIdFromJwt();

  try {
    const raw = localStorage.getItem("USER_INFO");
    if (raw) {
      const u = JSON.parse(raw);
      const fromInfo = parsePositiveInt(u?.id);
      if (fromInfo != null) return fromInfo;
    }
  } catch {
    /* ignore */
  }

  const payload = getJwtPayloadFromStorage();
  return getNumericUserIdFromJwtPayload(payload);
}
