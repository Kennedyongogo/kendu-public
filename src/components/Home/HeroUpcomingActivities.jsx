import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Typography, keyframes } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import { HOME } from "./homeShared";
import { cachedFetchJson } from "../../lib/cachedFetch";

const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ACCENTS = {
  gold: {
    surface: "rgba(255,252,248,0.96)",
    ink: HOME.navyDeep,
    muted: "rgba(30,40,88,0.68)",
    badgeBg: HOME.gold,
    badgeFg: HOME.navyDeep,
    border: "rgba(200,168,64,0.45)",
    glow: "0 18px 40px -16px rgba(8,22,43,0.42)",
  },
  blue: {
    surface: "rgba(255,255,255,0.96)",
    ink: HOME.navyDeep,
    muted: "rgba(8,22,43,0.62)",
    badgeBg: HOME.green,
    badgeFg: "#fff",
    border: "rgba(27,94,168,0.28)",
    glow: "0 18px 40px -16px rgba(8,22,43,0.42)",
  },
  navy: {
    surface: "rgba(30,40,88,0.94)",
    ink: "#fff",
    muted: "rgba(255,255,255,0.72)",
    badgeBg: HOME.gold,
    badgeFg: HOME.navyDeep,
    border: "rgba(200,168,64,0.4)",
    glow: "0 18px 40px -14px rgba(8,22,43,0.5)",
  },
  cream: {
    surface: "rgba(255,252,248,0.97)",
    ink: HOME.navyDeep,
    muted: "rgba(8,22,43,0.62)",
    badgeBg: HOME.navyDeep,
    badgeFg: HOME.goldMuted,
    border: "rgba(12,35,64,0.12)",
    glow: "0 18px 40px -16px rgba(8,22,43,0.35)",
  },
};

const LEGACY_SHAPE_MAP = {
  circle: "event_card",
  pill: "ticket",
  rounded_square: "event_card",
  diamond: "event_card",
  hexagon: "event_card",
  oval: "event_card",
  speech_bubble: "event_card",
  ribbon: "ticket",
  banner: "ticket",
  star: "event_card",
};

function normalizeShape(shape) {
  const raw = String(shape || "").trim();
  if (raw === "event_card" || raw === "ticket") return raw;
  return LEGACY_SHAPE_MAP[raw] || "event_card";
}

function positionSx(hint) {
  // Clear fixed PublicHeader (hero content uses ~88–108px top pad)
  const belowNav = { xs: 96, sm: 100, md: 118 };
  const map = {
    top_right: { top: belowNav, right: { xs: 10, md: "5%" } },
    mid_right: { top: { xs: "38%", md: "42%" }, right: { xs: 8, md: "4.5%" } },
    bottom_right: { bottom: { xs: 88, md: 110 }, right: { xs: 10, md: "5%" } },
    top_left: { top: belowNav, left: { xs: 10, md: "3.5%" } },
    mid_left: { top: { xs: "42%", md: "46%" }, left: { xs: 8, md: "3%" } },
  };
  return map[hint] || map.mid_right;
}

function dateParts(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function FloatingEventCard({ item, onDismiss }) {
  const accent = ACCENTS[item.accent] || ACCENTS.gold;
  const shape = normalizeShape(item.shape);
  const pos = positionSx(item.position_hint);
  const parts = dateParts(item.display_start);
  const isTicket = shape === "ticket";

  return (
    <Box
      sx={{
        position: "absolute",
        ...pos,
        zIndex: 5,
        pointerEvents: "auto",
        animation: `${fadeIn} 0.55s ease both, ${floatY} 5s ease-in-out infinite`,
        animationDelay: "0.3s, 0.85s",
        maxWidth: { xs: 220, md: 248 },
      }}
    >
      <Box
        role="dialog"
        aria-label={item.title}
        sx={{
          position: "relative",
          width: { xs: 210, md: 236 },
          bgcolor: accent.surface,
          color: accent.ink,
          border: `1px solid ${accent.border}`,
          borderRadius: isTicket ? "18px 18px 18px 18px" : "18px",
          boxShadow: accent.glow,
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Ticket stub edge */}
        {isTicket ? (
          <>
            <Box
              sx={{
                position: "absolute",
                left: -9,
                top: "50%",
                width: 18,
                height: 18,
                borderRadius: "50%",
                bgcolor: "transparent",
                boxShadow: `inset 0 0 0 10px rgba(8,22,43,0.18)`,
                transform: "translateY(-50%)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: 22,
                top: 12,
                bottom: 12,
                borderLeft: `1.5px dashed ${accent.border}`,
                opacity: 0.85,
                pointerEvents: "none",
              }}
            />
          </>
        ) : null}

        <IconButton
          size="small"
          aria-label="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(item.id);
          }}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 3,
            color: accent.muted,
            opacity: 0.8,
            p: 0.4,
            bgcolor: "rgba(255,255,255,0.35)",
            "&:hover": { opacity: 1, bgcolor: "rgba(0,0,0,0.06)", color: accent.ink },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 14 }} />
        </IconButton>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "56px minmax(0, 1fr)",
            gap: 1.25,
            p: isTicket ? "14px 14px 14px 28px" : "14px",
            alignItems: "start",
          }}
        >
          <Box
            sx={{
              width: 56,
              minHeight: 56,
              borderRadius: "14px",
              bgcolor: accent.badgeBg,
              color: accent.badgeFg,
              textAlign: "center",
              py: parts ? 0.85 : 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px rgba(8,22,43,0.12)",
            }}
          >
            {parts ? (
              <>
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontWeight: 800,
                    fontSize: "0.62rem",
                    letterSpacing: "0.08em",
                    lineHeight: 1,
                    mb: 0.35,
                  }}
                >
                  {parts.month}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: HOME.fontDisplay,
                    fontWeight: 700,
                    fontSize: "1.35rem",
                    lineHeight: 1,
                  }}
                >
                  {parts.day}
                </Typography>
              </>
            ) : isTicket ? (
              <ConfirmationNumberRoundedIcon sx={{ fontSize: 22 }} />
            ) : (
              <EventAvailableRoundedIcon sx={{ fontSize: 22 }} />
            )}
          </Box>

          <Box sx={{ minWidth: 0, pr: 1.5 }}>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: accent.muted,
                mb: 0.45,
              }}
            >
              {isTicket ? "Upcoming" : "Coming up"}
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.02rem", md: "1.1rem" },
                lineHeight: 1.15,
                color: accent.ink,
                mb: item.body ? 0.55 : 0,
              }}
            >
              {item.title}
            </Typography>
            {item.body ? (
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.72rem",
                  lineHeight: 1.4,
                  color: accent.muted,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.body}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Non-blocking floating upcoming-activity cards for the home hero.
 * Styles: event_card | ticket (legacy novelty shapes map to these).
 */
export default function HeroUpcomingActivities() {
  const [items, setItems] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("kendu_dismissed_upcoming_activities");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { ok, data } = await cachedFetchJson("/api/upcoming-activities/public", {}, { ttlMs: 60_000 });
        if (!cancelled && ok && data.success) {
          setItems(data.data || []);
        }
      } catch {
        /* ignore — hero still works without ads */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    return items
      .filter((i) => !dismissedIds.has(i.id))
      .sort((a, b) => {
        const score = (p) => (String(p).includes("right") ? 0 : 1);
        return score(a.position_hint) - score(b.position_hint);
      })
      .slice(0, 2);
  }, [items, dismissedIds]);

  if (!ready || !visible.length) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {visible.map((item) => (
        <FloatingEventCard
          key={item.id}
          item={item}
          onDismiss={(id) => {
            setDismissedIds((prev) => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
          }}
        />
      ))}
    </Box>
  );
}
