import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { HOME, fadeUp } from "./studentPortalShared";

const formatMoney = (amount, currency = "KES") =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function SummaryCard({ label, value, hint, icon, accent = HOME.green, delay = 0 }) {
  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        borderRadius: "18px",
        p: { xs: 1.75, sm: 2 },
        boxShadow: HOME.shadowSm,
        overflow: "hidden",
        animation: `${fadeUp} 0.45s ease both`,
        animationDelay: `${delay * 0.07}s`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: HOME.shadowMd,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}, ${HOME.gold})`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              color: HOME.inkSoft,
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              color: HOME.navyDeep,
              fontWeight: 700,
              fontSize: { xs: "1.35rem", md: "1.65rem" },
              letterSpacing: "-0.02em",
              mt: 0.3,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.7rem", mt: 0.2 }}>
            {hint}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "13px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: `linear-gradient(145deg, ${accent} 0%, ${HOME.navyDeep} 160%)`,
            boxShadow: `0 8px 20px -6px ${accent}66`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

function SectionCard({ title, subtitle, children, delay = 0 }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: HOME.shadowSm,
        animation: `${fadeUp} 0.5s ease both`,
        animationDelay: `${delay * 0.08}s`,
      }}
    >
      <Box sx={{ px: 2, py: 1.5, bgcolor: "rgba(0,96,80,0.04)", borderBottom: `1px solid ${HOME.border}` }}>
        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, fontSize: "1.1rem" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem" }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}

function StatusChip({ status }) {
  const config = {
    confirmed: { label: "Confirmed", color: "success" },
    pending: { label: "Pending", color: "warning" },
    failed: { label: "Failed", color: "error" },
    reversed: { label: "Reversed", color: "default" },
  }[status] || { label: status, color: "default" };
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />;
}

export default function StudentFees({ student }) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState(student.phone || "");

  const loadLedger = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/accounting/me", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load your fee account");
      setLedger(data.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const paymentProgress = useMemo(() => {
    if (!ledger?.summary?.total_charged) return 0;
    return Math.min(100, (ledger.summary.total_paid / ledger.summary.total_charged) * 100);
  }, [ledger]);

  const openPayment = () => {
    setAmount(String(ledger?.summary?.balance || ""));
    setPhone(student.phone || "");
    setPayOpen(true);
  };

  const initiatePayment = async () => {
    const value = Number(amount);
    if (!value || value <= 0 || value > ledger.summary.balance) {
      Swal.fire({
        icon: "warning",
        title: "Check the amount",
        text: `Enter an amount between KES 1 and ${formatMoney(ledger.summary.balance)}.`,
        confirmButtonColor: HOME.green,
      });
      return;
    }

    setPaying(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/accounting/me/pay", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: value, phone }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not start payment");
      setPayOpen(false);
      await Swal.fire({
        icon: "info",
        title: "Check your phone",
        text: "Enter your M-Pesa PIN to complete the payment. Your balance will update after confirmation.",
        confirmButtonText: "I have paid",
        confirmButtonColor: HOME.green,
      });
      await loadLedger();
      window.setTimeout(() => loadLedger({ silent: true }), 6000);
    } catch (requestError) {
      Swal.fire({
        icon: "error",
        title: "Payment not started",
        text: requestError.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", bgcolor: HOME.cream }}>
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress sx={{ color: HOME.green }} />
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted }}>Loading your fee account…</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 68px)", bgcolor: HOME.cream, p: { xs: 2, sm: 4 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" startIcon={<RefreshRoundedIcon />} onClick={() => loadLedger()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const { summary, charges, payments, online_payment_available: onlinePaymentAvailable } = ledger;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 68px)",
        bgcolor: HOME.cream,
        px: { xs: 1.5, sm: 3, lg: 4 },
        py: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          background: HOME.navyGradient,
          px: { xs: 2, sm: 2.75 },
          py: { xs: 2, sm: 2.25 },
          boxShadow: HOME.shadowMd,
          animation: `${fadeUp} 0.45s ease both`,
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: HOME.heroBackgroundAccent,
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1.5}
          alignItems={{ sm: "center" }}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "15px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: `linear-gradient(145deg, ${HOME.gold} 0%, ${HOME.green} 120%)`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                flexShrink: 0,
              }}
            >
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                component="h1"
                sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: { xs: "1.7rem", sm: "1.9rem" }, color: "#fff", lineHeight: 1.15 }}
              >
                Fee account
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, color: "rgba(255,255,255,0.75)", fontSize: "0.85rem" }}>
                Your charges, payments and outstanding balances in one place.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<PhoneIphoneRoundedIcon />}
            disabled={summary.balance <= 0 || !onlinePaymentAvailable}
            onClick={openPayment}
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              px: 2.5,
              py: 1,
              background: HOME.goldGradient,
              color: HOME.navyDeep,
              fontWeight: 800,
              fontFamily: HOME.fontBody,
              boxShadow: "0 10px 26px -6px rgba(201,162,39,0.55)",
              flexShrink: 0,
              "&:hover": { background: `linear-gradient(135deg, ${HOME.goldMuted} 0%, ${HOME.gold} 100%)`, boxShadow: "0 12px 30px -6px rgba(201,162,39,0.6)" },
              "&.Mui-disabled": { background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.45)" },
            }}
          >
            Pay with M-Pesa
          </Button>
        </Stack>
      </Box>

      {summary.fee_structure_missing ? (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: "12px" }}>
          Your current semester fee structure has not been published. Contact the accounts office.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
          gap: 1.5,
          mt: 2,
        }}
      >
        <SummaryCard
          delay={1}
          label="Total billed"
          value={formatMoney(summary.total_charged, summary.currency)}
          hint="All semesters to date"
          icon={<ReceiptLongRoundedIcon />}
        />
        <SummaryCard
          delay={2}
          label="Paid"
          value={formatMoney(summary.total_paid, summary.currency)}
          hint={`${paymentProgress.toFixed(0)}% of billed fees`}
          icon={<CheckCircleRoundedIcon />}
          accent="#2e7d32"
        />
        <SummaryCard
          delay={3}
          label="Fee balance"
          value={formatMoney(summary.balance, summary.currency)}
          hint={summary.balance ? "Amount still payable" : "Your account is clear"}
          icon={<AccountBalanceWalletRoundedIcon />}
          accent={summary.balance ? "#b26a00" : "#2e7d32"}
        />
        <SummaryCard
          delay={4}
          label="Previous arrears"
          value={formatMoney(summary.arrears, summary.currency)}
          hint="Before the current semester"
          icon={<PaymentsRoundedIcon />}
          accent={summary.arrears ? "#b91c1c" : HOME.green}
        />
      </Box>

      <Box
        sx={{
          mt: 1.5,
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
          borderRadius: "16px",
          px: 2,
          py: 1.5,
          boxShadow: HOME.shadowSm,
          animation: `${fadeUp} 0.5s ease both`,
          animationDelay: "0.32s",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.85 }}>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <TrendingUpRoundedIcon sx={{ fontSize: 18, color: HOME.green }} />
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.78rem", fontWeight: 700, color: HOME.navyDeep }}>
              Overall payment progress
            </Typography>
          </Stack>
          <Typography sx={{ fontFamily: HOME.fontDisplay, fontSize: "1.05rem", fontWeight: 800, color: HOME.green }}>
            {paymentProgress.toFixed(0)}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={paymentProgress}
          sx={{
            height: 9,
            borderRadius: 8,
            bgcolor: "rgba(0,96,80,0.09)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 8,
              background: `linear-gradient(90deg, ${HOME.green} 0%, #3d9e78 100%)`,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 0.9fr) minmax(0, 1.25fr)" },
          gap: 2,
          mt: 2,
          alignItems: "start",
        }}
      >
        <SectionCard
          delay={5}
          title="Semester breakdown"
          subtitle="How each study period is billed and paid"
        >
          {charges.length ? (
            <Stack divider={<Divider />}>
              {charges.map((charge) => {
                const chargeProgress = charge.amount
                  ? Math.min(100, (Number(charge.paid) / Number(charge.amount)) * 100)
                  : 0;
                const cleared = !Number(charge.balance);
                return (
                  <Box key={charge.id} sx={{ px: 2, py: 1.5, transition: "background 0.15s ease", "&:hover": { bgcolor: "rgba(0,96,80,0.025)" } }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, color: HOME.navyDeep, fontSize: "0.87rem" }}>
                            Year {charge.year_of_study} · Semester {charge.semester}
                          </Typography>
                          {charge.is_current ? (
                            <Chip size="small" label="Current" sx={{ height: 21, fontSize: "0.65rem", fontWeight: 700, bgcolor: "rgba(0,96,80,0.1)", color: HOME.green }} />
                          ) : null}
                          {cleared ? (
                            <Chip
                              size="small"
                              icon={<CheckCircleRoundedIcon sx={{ fontSize: "0.85rem !important" }} />}
                              label="Cleared"
                              sx={{ height: 21, fontSize: "0.65rem", fontWeight: 700, bgcolor: "rgba(46,125,50,0.12)", color: "#2e7d32", "& .MuiChip-icon": { color: "#2e7d32" } }}
                            />
                          ) : null}
                        </Stack>
                        <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem", mt: 0.25 }}>
                          Paid {formatMoney(charge.paid, charge.currency)} of {formatMoney(charge.amount, charge.currency)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 800, color: cleared ? "#2e7d32" : HOME.navyDeep, fontSize: "1rem" }}>
                          {formatMoney(charge.balance, charge.currency)}
                        </Typography>
                        <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.67rem" }}>balance</Typography>
                      </Box>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={chargeProgress}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 6,
                        bgcolor: "rgba(0,96,80,0.08)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 6,
                          background: cleared
                            ? "linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)"
                            : `linear-gradient(90deg, ${HOME.green} 0%, #3d9e78 100%)`,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
              <SchoolRoundedIcon sx={{ fontSize: 40, color: "rgba(0,96,80,0.25)" }} />
              <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.85rem" }}>
                No fee charges are available yet.
              </Typography>
            </Stack>
          )}
        </SectionCard>

        <SectionCard
          delay={6}
          title="Payment records"
          subtitle={`${payments.length} transaction${payments.length === 1 ? "" : "s"} on your account`}
        >
          {payments.length ? (
            <>
            <Box sx={{ overflowX: "auto", display: { xs: "none", md: "block" } }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: "rgba(0,96,80,0.04)" }}>
                    {["Date", "Reference", "Method", "Amount", "Status"].map((heading) => (
                      <Box
                        component="th"
                        key={heading}
                        sx={{
                          textAlign: "left",
                          px: 2,
                          py: 1.1,
                          fontFamily: HOME.fontBody,
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          color: HOME.inkSoft,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {payments.map((payment) => (
                    <Box
                      component="tr"
                      key={payment.id}
                      sx={{
                        borderTop: `1px solid ${HOME.border}`,
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(0,96,80,0.03)" },
                      }}
                    >
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.inkMuted }}>
                        {formatDate(payment.paid_at || payment.createdAt)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.navyDeep, fontWeight: 700 }}>
                        {payment.provider_receipt || payment.reference}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.inkMuted, textTransform: "capitalize" }}>
                        {payment.method}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.8rem", color: HOME.navyDeep, fontWeight: 800 }}>
                        {formatMoney(payment.amount, payment.currency)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2 }}>
                        <StatusChip status={payment.status} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Stack spacing={1.25} sx={{ display: { xs: "flex", md: "none" }, p: 1.5 }}>
              {payments.map((payment) => (
                <Box
                  key={payment.id}
                  sx={{
                    border: `1px solid ${HOME.border}`,
                    borderRadius: "14px",
                    p: 1.5,
                    bgcolor: "rgba(0,96,80,0.02)",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 800, color: HOME.navyDeep, fontSize: "1rem" }}>
                      {formatMoney(payment.amount, payment.currency)}
                    </Typography>
                    <StatusChip status={payment.status} />
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: HOME.fontBody,
                      fontWeight: 700,
                      color: HOME.navyDeep,
                      fontSize: "0.78rem",
                      mt: 0.75,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {payment.provider_receipt || payment.reference}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 0.75, pt: 0.75, borderTop: `1px dashed ${HOME.border}` }}
                  >
                    <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.74rem", textTransform: "capitalize", fontWeight: 700 }}>
                      {payment.method === "mpesa" ? "M-Pesa" : payment.method}
                    </Typography>
                    <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem" }}>
                      {formatDate(payment.paid_at || payment.createdAt)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
            </>
          ) : (
            <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
              <ReceiptLongRoundedIcon sx={{ fontSize: 40, color: "rgba(0,96,80,0.25)" }} />
              <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, color: HOME.navyDeep, fontSize: "0.9rem" }}>
                No payments yet
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.8rem" }}>
                Payments you make will appear here after verification.
              </Typography>
            </Stack>
          )}
        </SectionCard>
      </Box>

      <Dialog open={payOpen} onClose={paying ? undefined : () => setPayOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep }}>Pay fees with M-Pesa</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">An M-Pesa prompt will be sent to the phone number below.</Alert>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{ min: 1, max: summary.balance }}
              InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }}
            />
            <TextField
              label="M-Pesa phone number"
              fullWidth
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="07XXXXXXXX"
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneRoundedIcon fontSize="small" /></InputAdornment> }}
            />
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.76rem", color: HOME.inkSoft }}>
              Outstanding balance: {formatMoney(summary.balance, summary.currency)}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPayOpen(false)} disabled={paying} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={initiatePayment}
            disabled={paying}
            startIcon={paying ? <CircularProgress size={16} color="inherit" /> : <PhoneIphoneRoundedIcon />}
            sx={{ textTransform: "none", bgcolor: HOME.green, fontWeight: 800, boxShadow: "none", "&:hover": { bgcolor: "#004840", boxShadow: "none" } }}
          >
            {paying ? "Sending prompt…" : "Send M-Pesa prompt"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
