/**
 * Student portal session security:
 * - Force logout on API 401 / expired token
 * - Idle timeout → clear localStorage and return to login
 */

const IDLE_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 35 * 60 * 1000; // 35 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

let idleTimer = null;
let installed = false;
let loggingOut = false;

function hasStudentSession() {
  return Boolean(localStorage.getItem("token") && localStorage.getItem("user"));
}

function redirectToLogin() {
  const path = window.location.pathname || "/";
  if (path === "/login" || !path.startsWith("/student")) return;
  window.location.assign("/login");
}

export function forceStudentLogout(reason = "session_ended") {
  if (loggingOut) return;
  loggingOut = true;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.setItem("kendu_student_logout_reason", reason);
  } catch {
    /* ignore */
  }
  redirectToLogin();
}

function resetIdleTimer() {
  if (!hasStudentSession()) return;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => forceStudentLogout("idle_timeout"), IDLE_MS);
}

function shouldInspectResponse(url, headers) {
  if (!url) return false;
  const href = String(url);
  if (!href.includes("/api/")) return false;
  try {
    const auth =
      (headers && typeof headers.get === "function" && headers.get("Authorization")) ||
      (headers && headers.Authorization) ||
      "";
    return String(auth).toLowerCase().startsWith("bearer ");
  } catch {
    return hasStudentSession();
  }
}

function installFetchGuard() {
  if (typeof window === "undefined" || window.__kenduStudentFetchPatched) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const response = await originalFetch(input, init);
    try {
      const url = typeof input === "string" ? input : input?.url;
      const headers = init.headers || (input && input.headers);
      if (shouldInspectResponse(url, headers) && response.status === 401) {
        let reason = "token_expired";
        try {
          const clone = response.clone();
          const body = await clone.json();
          if (body?.code === "STUDENT_SUSPENDED") reason = "student_suspended";
          else if (body?.code === "ACCOUNT_INACTIVE") reason = "account_inactive";
        } catch {
          /* ignore body parse */
        }
        forceStudentLogout(reason);
      }
    } catch {
      /* ignore */
    }
    return response;
  };
  window.__kenduStudentFetchPatched = true;
}

export function initStudentSessionSecurity() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  installFetchGuard();

  ACTIVITY_EVENTS.forEach((evt) => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resetIdleTimer();
  });

  if (hasStudentSession()) resetIdleTimer();
}

export function armStudentIdleTimer() {
  resetIdleTimer();
}
