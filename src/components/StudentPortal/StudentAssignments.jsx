import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { HOME, fadeUp, studentAuthHeaders } from "./studentPortalShared";

function formatWhen(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(n) {
  const v = Number(n) || 0;
  if (!v) return "";
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function AssignmentCard({ row, onDownload, downloading }) {
  const dueLabel = formatWhen(row.due_at);
  const unitLabel = row.unit
    ? `${row.unit.code ? `${row.unit.code} · ` : ""}${row.unit.name || ""}`.trim()
    : null;

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#fff",
        borderBottom: `1px solid ${HOME.border}`,
        px: { xs: 1.5, sm: 2, md: 2.5 },
        py: { xs: 1.75, sm: 2 },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(27,94,168,0.1)",
              color: HOME.green,
            }}
          >
            <AssignmentRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                color: HOME.navyDeep,
                fontSize: { xs: "1.05rem", sm: "1.15rem" },
                lineHeight: 1.25,
                overflowWrap: "anywhere",
              }}
            >
              {row.title}
            </Typography>
            {row.description ? (
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  color: HOME.inkSoft,
                  fontSize: "0.86rem",
                  mt: 0.5,
                  lineHeight: 1.45,
                }}
              >
                {row.description}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {row.academic_year ? (
            <Chip
              size="small"
              label={row.academic_year}
              sx={{ fontWeight: 700, bgcolor: "rgba(27,94,168,0.08)", color: HOME.green }}
            />
          ) : null}
          {row.year_of_study != null ? (
            <Chip size="small" label={`Year ${row.year_of_study}`} sx={{ fontWeight: 700 }} />
          ) : null}
          {row.semester != null ? (
            <Chip size="small" label={`Semester ${row.semester}`} sx={{ fontWeight: 700 }} />
          ) : null}
          {row.programme?.name ? (
            <Chip
              size="small"
              icon={<MenuBookRoundedIcon sx={{ fontSize: "15px !important" }} />}
              label={row.programme.name}
              sx={{ fontWeight: 700, maxWidth: "100%" }}
            />
          ) : null}
        </Stack>

        {unitLabel ? (
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.82rem", color: HOME.inkMuted }}>
            Unit: {unitLabel}
          </Typography>
        ) : null}

        {row.instructions ? (
          <Box
            sx={{
              p: 1.25,
              borderRadius: "12px",
              bgcolor: "rgba(27,94,168,0.04)",
              border: "1px solid rgba(27,94,168,0.1)",
            }}
          >
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.72rem",
                fontWeight: 800,
                color: HOME.green,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                mb: 0.5,
              }}
            >
              Instructions
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.86rem",
                color: HOME.inkSoft,
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
              }}
            >
              {row.instructions}
            </Typography>
          </Box>
        ) : null}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={0.35}>
            {dueLabel ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <EventRoundedIcon sx={{ fontSize: 16, color: HOME.green }} />
                <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.8rem", fontWeight: 700 }}>
                  Due {dueLabel}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <ScheduleRoundedIcon sx={{ fontSize: 16, color: HOME.inkMuted }} />
                <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.8rem", color: HOME.inkMuted }}>
                  No due date set
                </Typography>
              </Stack>
            )}
            {row.has_document ? (
              <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.75rem", color: HOME.inkMuted }}>
                {row.document_original_name || "Attached document"}
                {row.document_size ? ` · ${formatBytes(row.document_size)}` : ""}
              </Typography>
            ) : null}
          </Stack>

          {row.has_document ? (
            <Button
              variant="contained"
              startIcon={
                downloading === row.id ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DownloadRoundedIcon />
                )
              }
              disabled={downloading === row.id}
              onClick={() => onDownload(row)}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                fontFamily: HOME.fontBody,
                borderRadius: "12px",
                bgcolor: HOME.green,
                alignSelf: { xs: "stretch", sm: "center" },
                "&:hover": { bgcolor: HOME.navy },
              }}
            >
              {downloading === row.id ? "Downloading…" : "Download"}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function StudentAssignments({ student }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  const cohortLabel = useMemo(() => {
    const parts = [];
    if (student?.year_of_study) parts.push(`Year ${student.year_of_study}`);
    if (student?.semester) parts.push(`Semester ${student.semester}`);
    return parts.length ? parts.join(" · ") : "Your cohort";
  }, [student]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assignments/me", {
        headers: studentAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load assignments");
      }
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || "Could not load assignments");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const downloadDocument = async (row) => {
    if (!row?.id || !row.has_document) return;
    setDownloading(row.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/assignments/${row.id}/document`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Could not download document");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = row.document_original_name || "assignment-document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: err.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        bgcolor: HOME.cream,
        animation: `${fadeUp} 0.4s ease both`,
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: { xs: 1.25, sm: 1.75, md: 2.5 },
          py: { xs: 1.5, sm: 1.75 },
          background: `linear-gradient(135deg, ${HOME.navyDeep} 0%, ${HOME.navy} 55%, ${HOME.green} 100%)`,
          color: "#fff",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Back to home">
            <IconButton
              onClick={() => navigate("/student")}
              aria-label="Back to home"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
                lineHeight: 1.15,
              }}
            >
              Assignments
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: { xs: "0.75rem", sm: "0.82rem" },
                color: "rgba(255,255,255,0.82)",
                mt: 0.25,
              }}
            >
              {cohortLabel} · published coursework for your programme
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error ? (
        <Alert
          severity="error"
          sx={{ mx: { xs: 1.25, sm: 1.75, md: 2.5 }, mt: 1.5, borderRadius: "12px" }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
          <CircularProgress sx={{ color: HOME.green }} />
        </Box>
      ) : items.length === 0 ? (
        <Box
          sx={{
            mx: { xs: 1.25, sm: 1.75, md: 2.5 },
            mt: 2,
            mb: 3,
            p: { xs: 3, sm: 4 },
            textAlign: "center",
            bgcolor: "#fff",
            borderRadius: "16px",
            border: `1px solid ${HOME.border}`,
          }}
        >
          <AssignmentRoundedIcon sx={{ fontSize: 44, color: "rgba(27,94,168,0.28)", mb: 1 }} />
          <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep }}>
            No assignments yet
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, mt: 0.5, fontSize: "0.88rem" }}>
            Published assignments for your cohort will appear here.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            bgcolor: "#fff",
            borderTop: `1px solid ${HOME.border}`,
            borderBottom: `1px solid ${HOME.border}`,
            mt: { xs: 0, sm: 1.5 },
            mb: 3,
          }}
        >
          {items.map((row) => (
            <AssignmentCard
              key={row.id}
              row={row}
              onDownload={downloadDocument}
              downloading={downloading}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
