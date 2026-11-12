import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { HOME } from "../components/Home/homeShared";

const DEFAULT_CLOSED_MESSAGE =
  "Admissions are currently closed. Please check back during the next intake window.";

/** How often to re-fetch admin settings in case start/end/enabled changed. */
const SETTINGS_POLL_MS = 60_000;
/** Cap long waits so we still re-sync periodically near far-future boundaries. */
const MAX_BOUNDARY_WAIT_MS = 6 * 60 * 60 * 1000;

function parseTime(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function formatFriendlyDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d.toISOString();
  }
}

/** System-generated notice from window state (not free-typed). */
function buildClosedMessage({ reason, starts_at, ends_at }) {
  const opens = formatFriendlyDateTime(starts_at);
  const closes = formatFriendlyDateTime(ends_at);
  switch (reason) {
    case "not_started":
      return opens
        ? `Admissions are not open yet. Applications open on ${opens}.`
        : "Admissions are not open yet. Please check back when the intake window starts.";
    case "ended":
      return closes
        ? `The admissions window closed on ${closes}. Please wait for the next intake.`
        : "The admissions window has ended. Please wait for the next intake.";
    case "not_configured":
    case "invalid_range":
      return "Admissions are not open yet. Please check back later.";
    case "open":
      return closes
        ? `Applications are open until ${closes}.`
        : "Applications are currently open.";
    case "disabled":
    default:
      return DEFAULT_CLOSED_MESSAGE;
  }
}

/**
 * Client-side mirror of API admission window logic.
 * Uses corrected "now" (local clock adjusted by server skew).
 */
export function evaluateAdmissionWindow(settings, nowMs = Date.now()) {
  const is_enabled = Boolean(settings?.is_enabled);
  const startsMs = parseTime(settings?.starts_at);
  const endsMs = parseTime(settings?.ends_at);

  let reason = "disabled";
  let is_open = false;
  let nextChangeAt = null;

  if (!is_enabled) {
    reason = "disabled";
  } else if (startsMs == null || endsMs == null) {
    reason = "not_configured";
  } else if (startsMs > endsMs) {
    reason = "invalid_range";
  } else if (nowMs < startsMs) {
    reason = "not_started";
    nextChangeAt = startsMs;
  } else if (nowMs > endsMs) {
    reason = "ended";
  } else {
    reason = "open";
    is_open = true;
    nextChangeAt = endsMs;
  }

  const starts_at = settings?.starts_at || null;
  const ends_at = settings?.ends_at || null;

  return {
    is_enabled,
    starts_at,
    ends_at,
    closed_message: buildClosedMessage({ reason, starts_at, ends_at }),
    is_open,
    reason,
    nextChangeAt,
    server_time: settings?.server_time || null,
    id: settings?.id,
    updated_at: settings?.updated_at,
    updated_by: settings?.updated_by,
  };
}

/**
 * Public admissions open/closed window.
 * Polls settings and schedules a timer so Apply CTAs flip open/closed
 * automatically at start/end without a page refresh.
 */
export default function useAdmissionWindow() {
  const [settings, setSettings] = useState(null);
  const [clockSkewMs, setClockSkewMs] = useState(0);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const boundaryTimerRef = useRef(null);
  const pollTimerRef = useRef(null);

  const nowMs = () => Date.now() + clockSkewMs;

  const clearBoundaryTimer = () => {
    if (boundaryTimerRef.current != null) {
      window.clearTimeout(boundaryTimerRef.current);
      boundaryTimerRef.current = null;
    }
  };

  const applySettingsPayload = useCallback((data) => {
    const fetchedAt = Date.now();
    const serverMs = parseTime(data?.server_time);
    if (serverMs != null) {
      setClockSkewMs(serverMs - fetchedAt);
    }
    setSettings(data);
  }, []);

  const reload = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      try {
        const res = await fetch("/api/admissions/window", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.data) {
          applySettingsPayload(data.data);
        } else {
          applySettingsPayload({
            is_enabled: false,
            starts_at: null,
            ends_at: null,
            closed_message: DEFAULT_CLOSED_MESSAGE,
            server_time: new Date().toISOString(),
            reason: "unavailable",
          });
        }
      } catch {
        applySettingsPayload({
          is_enabled: false,
          starts_at: null,
          ends_at: null,
          closed_message: DEFAULT_CLOSED_MESSAGE,
          server_time: new Date().toISOString(),
          reason: "unavailable",
        });
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [applySettingsPayload]
  );

  // Initial fetch + periodic settings poll (admin may change dates).
  useEffect(() => {
    void reload();
    pollTimerRef.current = window.setInterval(() => {
      void reload({ quiet: true });
    }, SETTINGS_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void reload({ quiet: true });
        setTick((n) => n + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (pollTimerRef.current != null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      document.removeEventListener("visibilitychange", onVisible);
      clearBoundaryTimer();
    };
  }, [reload]);

  const evaluated = evaluateAdmissionWindow(settings, nowMs());

  // Schedule exact flip at next open/close boundary (cron-like).
  useEffect(() => {
    clearBoundaryTimer();
    const nextAt = evaluated.nextChangeAt;
    if (nextAt == null) return undefined;

    const delay = Math.min(Math.max(nextAt - nowMs() + 50, 250), MAX_BOUNDARY_WAIT_MS);
    boundaryTimerRef.current = window.setTimeout(() => {
      setTick((n) => n + 1);
      void reload({ quiet: true });
    }, delay);

    return () => clearBoundaryTimer();
    // tick forces re-schedule after a boundary fires
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, clockSkewMs, evaluated.nextChangeAt, evaluated.is_open, tick, reload]);

  const isOpen = Boolean(evaluated.is_open);
  const closedMessage = evaluated.closed_message || DEFAULT_CLOSED_MESSAGE;

  const showClosedNotice = useCallback(async () => {
    await Swal.fire({
      icon: "info",
      title: "Applications closed",
      text: closedMessage,
      confirmButtonColor: HOME.green,
    });
  }, [closedMessage]);

  const goApply = useCallback(
    async (navigate, state) => {
      // Fresh check at click time in case the timer is mid-transition.
      const live = evaluateAdmissionWindow(settings, nowMs());
      if (!live.is_open) {
        await Swal.fire({
          icon: "info",
          title: "Applications closed",
          text: live.closed_message || DEFAULT_CLOSED_MESSAGE,
          confirmButtonColor: HOME.green,
        });
        setTick((n) => n + 1);
        return false;
      }
      navigate("/admission/apply", { state });
      return true;
    },
    // nowMs reads latest skew via closure of clockSkewMs through settings updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, clockSkewMs]
  );

  return {
    window: evaluated,
    loading,
    isOpen,
    closedMessage,
    reload,
    goApply,
    showClosedNotice,
  };
}
