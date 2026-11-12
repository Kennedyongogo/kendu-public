import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TouchAppRoundedIcon from "@mui/icons-material/TouchAppRounded";
import { HOME, fadeUp, studentAuthHeaders } from "./studentPortalShared";

const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  borderRadius: "22px",
  boxShadow: HOME.shadowMd,
  overflow: "hidden",
};

function formatMoney(amount, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function showFeeGateDialog({ unit, access, onGoToFees }) {
  const escape = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const unitCode = escape(unit.code);
  const unitName = escape(unit.name);
  const required = access?.min_fee_percent ?? 0;
  const paidPct = access?.percent_paid ?? 0;
  const shortfall = access?.shortfall_percent ?? Math.max(0, required - paidPct);
  const currency = access?.currency || "KES";
  const totalCharged = formatMoney(access?.total_charged, currency);
  const totalPaid = formatMoney(access?.total_paid, currency);

  return Swal.fire({
    icon: false,
    title: "Fee requirement not met",
    html: `
      <div style="text-align:left;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1a2638;">
        <p style="margin:0 0 10px;font-size:0.86rem;line-height:1.45;color:rgba(8,22,43,0.72);">
          You need to clear more of your school fees before enrolling in
          <strong style="color:#1B5EA8;">${unitCode}</strong>
          — ${unitName}.
        </p>
        <div style="display:grid;gap:6px;padding:10px 12px;border-radius:12px;background:rgba(27,94,168,0.05);border:1px solid rgba(27,94,168,0.12);">
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Required</span>
            <span style="font-size:0.84rem;font-weight:800;color:#1B5EA8;">${required}% of fees paid</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">You have paid</span>
            <span style="font-size:0.84rem;font-weight:800;">${paidPct}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Still needed</span>
            <span style="font-size:0.84rem;font-weight:800;color:#9a6700;">${shortfall}%</span>
          </div>
          <hr style="border:none;border-top:1px solid rgba(27,94,168,0.12);margin:2px 0;" />
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Total charged</span>
            <span style="font-size:0.8rem;font-weight:700;">${totalCharged}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Confirmed paid</span>
            <span style="font-size:0.8rem;font-weight:700;">${totalPaid}</span>
          </div>
        </div>
        <p style="margin:10px 0 0;font-size:0.74rem;line-height:1.4;color:rgba(8,22,43,0.55);">
          Make a payment under Fees, then come back and enroll when you reach the required share.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Go to Fees",
    cancelButtonText: "Not now",
    confirmButtonColor: HOME.green,
    cancelButtonColor: "#94a3b8",
    reverseButtons: true,
    focusConfirm: true,
    width: 420,
    padding: "1.1em 1.15em 1em",
  }).then((result) => {
    if (result.isConfirmed && typeof onGoToFees === "function") onGoToFees();
  });
}

function UnitSkeleton() {
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: "16px",
        border: "1px solid rgba(27,94,168,0.08)",
        bgcolor: "rgba(27,94,168,0.02)",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: "14px" }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="42%" height={18} />
          <Skeleton width="78%" height={14} sx={{ mt: 0.75 }} />
          <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
            <Skeleton width={56} height={22} sx={{ borderRadius: 999 }} />
            <Skeleton width={48} height={22} sx={{ borderRadius: 999 }} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function UnitRow({ unit, index, registeringId, onRegister }) {
  const enrolled = Boolean(unit.is_registered);
  const busy = registeringId === unit.id;

  return (
    <Box
      sx={{
        position: "relative",
        p: { xs: 1.5, sm: 1.75 },
        borderRadius: "18px",
        border: enrolled ? "1.5px solid rgba(27,94,168,0.35)" : "1px solid rgba(27,94,168,0.1)",
        bgcolor: enrolled ? "rgba(27,94,168,0.04)" : "#fff",
        boxShadow: enrolled ? "0 10px 28px -16px rgba(27,94,168,0.45)" : HOME.shadowSm,
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        animation: `${fadeUp} 0.5s ease both`,
        animationDelay: `${0.06 + index * 0.05}s`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: enrolled ? "0 14px 32px -14px rgba(27,94,168,0.5)" : HOME.shadowMd,
          borderColor: enrolled ? "rgba(27,94,168,0.5)" : "rgba(200,168,64,0.45)",
        },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: enrolled ? HOME.green : "rgba(27,94,168,0.08)",
            color: enrolled ? "#fff" : HOME.green,
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: "0.62rem",
            letterSpacing: "0.04em",
            textAlign: "center",
            lineHeight: 1.1,
            px: 0.5,
          }}
        >
          {unit.code?.split("-").pop() || unit.code?.slice(-4) || "—"}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: HOME.green,
              }}
            >
              {unit.code}
            </Typography>
            {enrolled ? (
              <Chip
                size="small"
                icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important" }} />}
                label="Enrolled"
                sx={{
                  height: 22,
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  bgcolor: "rgba(27,94,168,0.12)",
                  color: HOME.green,
                  "& .MuiChip-icon": { color: HOME.green },
                }}
              />
            ) : null}
          </Stack>

          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.02rem", sm: "1.08rem" },
              color: HOME.navyDeep,
              lineHeight: 1.25,
              mt: 0.35,
            }}
          >
            {unit.name}
          </Typography>

          {unit.description ? (
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.78rem",
                color: HOME.inkSoft,
                mt: 0.45,
                lineHeight: 1.45,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {unit.description}
            </Typography>
          ) : null}

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {unit.credits != null ? (
              <Chip
                size="small"
                label={`${unit.credits} cr`}
                sx={{
                  height: 24,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  bgcolor: "rgba(200,168,64,0.14)",
                  color: HOME.navyDeep,
                  border: "1px solid rgba(200,168,64,0.35)",
                }}
              />
            ) : null}
            {unit.hours ? (
              <Chip
                size="small"
                icon={<ScheduleRoundedIcon sx={{ fontSize: "14px !important" }} />}
                label={`${unit.hours} hrs`}
                sx={{
                  height: 24,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  bgcolor: "rgba(30,40,88,0.06)",
                  color: HOME.inkMuted,
                }}
              />
            ) : null}
            {unit.department?.name ? (
              <Chip
                size="small"
                label={unit.department.name}
                sx={{
                  height: 24,
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  bgcolor: "rgba(27,94,168,0.06)",
                  color: HOME.green,
                }}
              />
            ) : null}
          </Stack>
        </Box>

        {!enrolled ? (
          <Button
            variant="contained"
            size="small"
            disabled={busy}
            startIcon={busy ? null : <TouchAppRoundedIcon />}
            onClick={() => onRegister?.(unit)}
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              flexShrink: 0,
              textTransform: "none",
              fontFamily: HOME.fontBody,
              fontWeight: 800,
              fontSize: "0.82rem",
              borderRadius: "12px",
              px: 1.75,
              py: 0.9,
              bgcolor: HOME.green,
              boxShadow: "0 8px 18px -10px rgba(27,94,168,0.65)",
              "&:hover": { bgcolor: HOME.greenDark || "#164a86" },
              "&.Mui-disabled": { bgcolor: "rgba(27,94,168,0.35)", color: "#fff" },
            }}
          >
            {busy ? "Registering…" : "Register"}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function StudentUnitsCard({ student }) {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registeringId, setRegisteringId] = useState(null);

  const cohortLabel = useMemo(() => {
    const parts = [];
    if (student?.year_of_study) parts.push(`Year ${student.year_of_study}`);
    if (student?.semester) parts.push(`Semester ${student.semester}`);
    return parts.join(" · ");
  }, [student]);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/units/student/available", {
        headers: studentAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load your units");
      }
      setUnits(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const stats = useMemo(() => {
    const total = units.length;
    const enrolled = units.filter((u) => u.is_registered).length;
    const credits = units.reduce((sum, u) => sum + (Number(u.credits) || 0), 0);
    const enrolledCredits = units
      .filter((u) => u.is_registered)
      .reduce((sum, u) => sum + (Number(u.credits) || 0), 0);
    const progress = total ? Math.round((enrolled / total) * 100) : 0;
    return { total, enrolled, credits, enrolledCredits, progress };
  }, [units]);

  const handleRegister = async (unit) => {
    setRegisteringId(unit.id);
    try {
      const res = await fetch(`/api/units/${unit.id}/register`, {
        method: "POST",
        headers: studentAuthHeaders(true),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const access = data.data?.enrollment_access;
        if (res.status === 403 && access && access.eligible === false) {
          await showFeeGateDialog({
            unit,
            access,
            onGoToFees: () => navigate("/student/fees"),
          });
          return;
        }
        throw new Error(data.message || "Registration failed");
      }
      setUnits((prev) =>
        prev.map((row) => (row.id === unit.id ? { ...row, is_registered: true } : row))
      );
      Swal.fire({
        icon: "success",
        title: "Enrolled!",
        text: `You are now registered for ${unit.code}.`,
        timer: 1800,
        showConfirmButton: false,
        confirmButtonColor: HOME.green,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not enroll",
        text: err.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1.25, sm: 1.5, md: 2 },
        py: { xs: 2, sm: 2.5, md: 3 },
        animation: `${fadeUp} 0.55s ease 0.12s both`,
      }}
    >
      <Box sx={cardSx}>
        <Box
          sx={{
            px: { xs: 1.75, sm: 2.25 },
            py: { xs: 1.75, sm: 2 },
            background: `linear-gradient(135deg, ${HOME.navyDeep} 0%, ${HOME.navy} 55%, ${HOME.green} 100%)`,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "rgba(200,168,64,0.18)",
              pointerEvents: "none",
            }}
          />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  bgcolor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <MenuBookRoundedIcon sx={{ fontSize: 24, color: HOME.gold }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: HOME.fontDisplay,
                    fontWeight: 700,
                    fontSize: { xs: "1.25rem", sm: "1.4rem" },
                    lineHeight: 1.15,
                  }}
                >
                  Your semester units
                </Typography>
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.82)",
                    mt: 0.25,
                  }}
                >
                  {cohortLabel || "Current enrolment"} · approved offerings for your cohort
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ width: { xs: "100%", sm: "auto" }, flexShrink: 0 }}
            >
              {!loading && stats.total > 0 ? (
                <Chip
                  size="small"
                  icon={<SchoolRoundedIcon sx={{ fontSize: "15px !important", color: "#fff !important" }} />}
                  label={`${stats.enrolled}/${stats.total} enrolled`}
                  sx={{
                    fontWeight: 700,
                    fontFamily: HOME.fontBody,
                    bgcolor: "rgba(255,255,255,0.14)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.25)",
                    alignSelf: { xs: "flex-start", sm: "center" },
                  }}
                />
              ) : null}
              <Button
                variant="contained"
                startIcon={<AssignmentRoundedIcon sx={{ fontSize: "1.05rem !important" }} />}
                onClick={() => navigate("/student/assignments")}
                sx={{
                  textTransform: "none",
                  fontFamily: HOME.fontBody,
                  fontWeight: 800,
                  fontSize: { xs: "0.82rem", sm: "0.86rem" },
                  borderRadius: "12px",
                  px: { xs: 1.5, sm: 2 },
                  py: 0.9,
                  width: { xs: "100%", sm: "auto" },
                  whiteSpace: "nowrap",
                  color: HOME.navyDeep,
                  bgcolor: HOME.gold,
                  boxShadow: "0 8px 20px -10px rgba(160,128,40,0.55)",
                  "&:hover": { bgcolor: "#d4b04a" },
                }}
              >
                View assignment
              </Button>
            </Stack>
          </Stack>

          {!loading && stats.total > 0 ? (
            <Box sx={{ mt: 1.75, position: "relative", zIndex: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", fontWeight: 700, opacity: 0.9 }}>
                  Registration progress
                </Typography>
                <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", fontWeight: 800 }}>
                  {stats.progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={stats.progress}
                sx={{
                  height: 7,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.18)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    bgcolor: HOME.gold,
                  },
                }}
              />
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.68rem",
                  color: "rgba(255,255,255,0.75)",
                  mt: 0.65,
                }}
              >
                {stats.enrolledCredits} of {stats.credits} credits enrolled
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          {error ? (
            <Alert
              severity="error"
              sx={{ mb: 1.5, borderRadius: "12px" }}
              action={
                <Button color="inherit" size="small" onClick={() => loadUnits()}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Stack spacing={1.25}>
              <UnitSkeleton />
              <UnitSkeleton />
              <UnitSkeleton />
            </Stack>
          ) : units.length ? (
            <Stack spacing={1.25}>
              {units.map((unit, index) => (
                <UnitRow
                  key={unit.id}
                  unit={unit}
                  index={index}
                  registeringId={registeringId}
                  onRegister={handleRegister}
                />
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 3.5, sm: 4.5 },
                px: 2,
                borderRadius: "18px",
                bgcolor: "rgba(27,94,168,0.03)",
                border: "1px dashed rgba(27,94,168,0.16)",
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  mx: "auto",
                  mb: 1.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(27,94,168,0.08)",
                  color: HOME.green,
                }}
              >
                <AutoStoriesRoundedIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: HOME.navyDeep,
                }}
              >
                No units published yet
              </Typography>
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.84rem",
                  color: HOME.inkSoft,
                  maxWidth: 380,
                  mx: "auto",
                  mt: 0.75,
                  lineHeight: 1.55,
                }}
              >
                When your department approves units for {cohortLabel || "your semester"}, they will
                appear here for enrollment.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
