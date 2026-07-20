import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { HOME, fadeUp, studentAuthHeaders } from "./studentPortalShared";

const CR80_RATIO = 85.6 / 53.98;

function formatMoney(amount, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function initials(name) {
  return String(name || "S")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Visual CR80 meal card (preview). */
function MealCardFace({ card }) {
  if (!card) return null;
  const yearLine = [
    card.year_of_study ? `Y${card.year_of_study}` : null,
    card.semester ? `Sem ${card.semester}` : null,
    card.academic_year || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 420,
        aspectRatio: `${CR80_RATIO}`,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        bgcolor: "#f7f4ef",
        border: "1px solid rgba(0,96,80,0.18)",
        boxShadow: "0 18px 40px -18px rgba(0,96,80,0.45)",
        fontFamily: HOME.fontBody,
        userSelect: "none",
      }}
    >
      <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, bgcolor: HOME.green }} />
      <Box
        sx={{
          position: "absolute",
          left: 10,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: HOME.gold,
        }}
      />

      <Box
        sx={{
          ml: "13px",
          height: "18%",
          bgcolor: HOME.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.25,
          color: "#fff",
        }}
      >
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: "0.68rem",
            letterSpacing: "0.12em",
          }}
        >
          MEAL CARD
        </Typography>
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, opacity: 0.9 }}>KASMS</Typography>
      </Box>

      <Stack direction="row" spacing={1.25} sx={{ ml: "13px", px: 1.25, pt: 1.1, pb: 0.5, height: "58%" }}>
        <Box
          sx={{
            width: "28%",
            maxWidth: 92,
            aspectRatio: "3 / 3.7",
            borderRadius: "8px",
            border: `1.5px solid ${HOME.green}`,
            overflow: "hidden",
            bgcolor: "rgba(0,96,80,0.08)",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          {card.profile_image_url ? (
            <Box
              component="img"
              src={card.profile_image_url}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: "1.35rem",
                color: HOME.green,
              }}
            >
              {initials(card.full_name)}
            </Typography>
          )}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
          <Typography
            sx={{
              fontSize: "0.55rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "rgba(8,22,43,0.45)",
              textTransform: "uppercase",
            }}
          >
            Full name
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "0.92rem", sm: "1.05rem" },
              color: HOME.navyDeep || "#1e2858",
              lineHeight: 1.15,
              mb: 0.85,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.full_name}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.55rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "rgba(8,22,43,0.45)",
              textTransform: "uppercase",
            }}
          >
            Admission no.
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 800,
              fontSize: "0.95rem",
              color: HOME.green,
              mb: 0.85,
            }}
          >
            {card.admission_number || "—"}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.55rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "rgba(8,22,43,0.45)",
              textTransform: "uppercase",
            }}
          >
            Programme
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              fontSize: "0.72rem",
              color: "rgba(8,22,43,0.78)",
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {card.programme_name || "—"}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          position: "absolute",
          left: "13px",
          right: 0,
          bottom: 0,
          height: "22%",
          bgcolor: "#004840",
          color: "#fff",
          px: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, opacity: 0.9 }} noWrap>
            {yearLine || "Student meal access"}
          </Typography>
          <Typography sx={{ fontSize: "0.55rem", color: HOME.gold, fontWeight: 700 }}>
            Issued {card.issued_on || "—"}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.08em" }}>
            VALID
          </Typography>
          <Typography sx={{ fontSize: "0.58rem", color: HOME.gold, fontWeight: 700 }}>
            {card.valid_label || "Current term"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function StudentMealCard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [access, setAccess] = useState(null);
  const [card, setCard] = useState(null);
  const [lockedCard, setLockedCard] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async ({ soft = false } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meals/card", { headers: studentAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load meal card");
      setAccess(data.data?.access || null);
      setCard(data.data?.card || null);
      setLockedCard(data.data?.locked_card || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const downloadPdf = async () => {
    if (!access?.eligible) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/meals/card/pdf", { headers: studentAuthHeaders() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && data.data?.access) {
          setAccess(data.data.access);
          setCard(null);
        }
        throw new Error(data.message || "Could not download meal card");
      }
      const blob = await res.blob();
      const adm = card?.admission_number || "student";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `KASMS-MealCard-${adm}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: err.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setDownloading(false);
    }
  };

  const eligible = access?.eligible === true;
  const preview = eligible ? card : lockedCard;
  const required = access?.min_fee_percent ?? 0;
  const paidPct = access?.percent_paid ?? 0;

  return (
    <Box
      sx={{
        mx: { xs: 1.5, sm: 2, md: 3 },
        mt: 2.5,
        mb: 1,
        animation: `${fadeUp} 0.55s ease both`,
        animationDelay: "0.08s",
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
          borderRadius: "22px",
          boxShadow: HOME.shadowMd,
          overflow: "hidden",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{
            px: { xs: 1.75, sm: 2.25 },
            py: 1.5,
            borderBottom: "1px solid rgba(0,96,80,0.08)",
            bgcolor: "rgba(0,96,80,0.03)",
          }}
        >
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(0,96,80,0.1)",
                color: HOME.green,
              }}
            >
              <RestaurantRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: HOME.ink,
                  lineHeight: 1.15,
                }}
              >
                Meal card
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.75rem", color: HOME.inkMuted }}>
                {eligible
                  ? "Ready to present at the cafeteria — download the ID-size PDF"
                  : access?.is_enabled
                    ? `Unlocks at ${required}% fees paid · you are at ${paidPct}%`
                    : "Your digital cafeteria pass"}
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            startIcon={refreshing ? <CircularProgress size={14} color="inherit" /> : <RefreshRoundedIcon />}
            onClick={() => load({ soft: true })}
            disabled={refreshing || loading}
            sx={{
              textTransform: "none",
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              color: HOME.green,
              borderRadius: "10px",
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          >
            Refresh
          </Button>
        </Stack>

        {refreshing ? (
          <LinearProgress
            sx={{
              height: 3,
              bgcolor: "rgba(0,96,80,0.08)",
              "& .MuiLinearProgress-bar": { bgcolor: HOME.green },
            }}
          />
        ) : null}

        <Box sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setError("")}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems="center">
              <Skeleton variant="rounded" sx={{ width: "100%", maxWidth: 420, aspectRatio: `${CR80_RATIO}` }} />
              <Skeleton variant="rounded" height={120} sx={{ flex: 1, width: "100%", borderRadius: "14px" }} />
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 420,
                  filter: eligible ? "none" : "grayscale(0.35)",
                  opacity: eligible ? 1 : 0.72,
                }}
              >
                <MealCardFace card={preview} />
                {!eligible ? (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "12px",
                      bgcolor: "rgba(8,22,43,0.38)",
                      display: "grid",
                      placeItems: "center",
                      px: 2,
                    }}
                  >
                    <Stack alignItems="center" spacing={0.75}>
                      <LockRoundedIcon sx={{ color: "#fff", fontSize: 28 }} />
                      <Typography
                        sx={{
                          color: "#fff",
                          fontFamily: HOME.fontBody,
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          textAlign: "center",
                        }}
                      >
                        Fee requirement not met
                      </Typography>
                    </Stack>
                  </Box>
                ) : null}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                {eligible ? (
                  <Stack spacing={1.5}>
                    <Typography
                      sx={{
                        fontFamily: HOME.fontBody,
                        fontSize: "0.88rem",
                        color: HOME.inkMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      Your meal card is unlocked. Download a credit-card sized PDF (CR80) to print or save on
                      your phone.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={
                        downloading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <DownloadRoundedIcon />
                        )
                      }
                      onClick={downloadPdf}
                      disabled={downloading}
                      sx={{
                        alignSelf: "flex-start",
                        textTransform: "none",
                        fontFamily: HOME.fontBody,
                        fontWeight: 800,
                        bgcolor: HOME.green,
                        borderRadius: "12px",
                        px: 2.25,
                        py: 1.1,
                        boxShadow: "0 10px 24px -12px rgba(0,96,80,0.65)",
                        "&:hover": { bgcolor: "#004840" },
                      }}
                    >
                      {downloading ? "Preparing PDF…" : "Download meal card PDF"}
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={1.25}>
                    <Typography
                      sx={{
                        fontFamily: HOME.fontBody,
                        fontSize: "0.88rem",
                        color: HOME.inkMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      {access?.message ||
                        `Pay at least ${required}% of your fees to unlock and download your meal card.`}
                    </Typography>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        bgcolor: "rgba(0,96,80,0.04)",
                        border: "1px solid rgba(0,96,80,0.12)",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: HOME.inkMuted,
                          }}
                        >
                          Fee progress
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: HOME.green }}>
                          {paidPct}% / {required}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, paidPct)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "rgba(0,96,80,0.1)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: paidPct >= required ? HOME.green : HOME.gold,
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography sx={{ fontSize: "0.75rem", color: HOME.inkMuted }}>
                          Paid {formatMoney(access?.total_paid, access?.currency)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: HOME.inkMuted }}>
                          of {formatMoney(access?.total_charged, access?.currency)}
                        </Typography>
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => navigate("/student/fees")}
                      sx={{
                        alignSelf: "flex-start",
                        textTransform: "none",
                        fontFamily: HOME.fontBody,
                        fontWeight: 800,
                        bgcolor: HOME.green,
                        borderRadius: "12px",
                        px: 2.25,
                        py: 1.1,
                        "&:hover": { bgcolor: "#004840" },
                      }}
                    >
                      Go to Fees
                    </Button>
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
