import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  Button,
  Link,
  Divider,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Clear,
  SchoolOutlined,
  DescriptionOutlined,
  MarkEmailReadOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { HOME, BRAND_LOGO_SRC } from "../components/Home/homeShared";

const LOGIN_PANEL_IMG = "/images/login-panel.png";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "#fff",
    fontFamily: HOME.fontBody,
    fontSize: "0.9rem",
    "& fieldset": { borderColor: "rgba(12, 35, 64, 0.14)" },
    "&:hover fieldset": { borderColor: HOME.green },
    "&.Mui-focused fieldset": { borderColor: HOME.green, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root": { display: "none" },
};

const labelSx = {
  fontFamily: HOME.fontBody,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "rgba(8, 22, 43, 0.62)",
  mb: 0.5,
  display: "block",
};

const STEPS = [
  { label: "Ready to Apply", icon: <SchoolOutlined sx={{ fontSize: 16 }} /> },
  { label: "Submitted", icon: <DescriptionOutlined sx={{ fontSize: 16 }} /> },
  { label: "Offer Letter", icon: <MarkEmailReadOutlined sx={{ fontSize: 16 }} /> },
  { label: "Enrollment", icon: <CheckCircleOutline sx={{ fontSize: 16 }} /> },
];

const outlineBtnSx = {
  textTransform: "none",
  fontWeight: 600,
  fontFamily: HOME.fontBody,
  borderRadius: "999px",
  py: { xs: 1, md: 0.85 },
  fontSize: "0.88rem",
  borderColor: "rgba(12,35,64,0.18)",
  color: HOME.navyDeep,
  bgcolor: "#fff",
};

export default function MarketplaceLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing details",
        text: "Enter your email or admission number and password.",
        confirmButtonColor: HOME.green,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: identifier.trim(),
          password,
          portal: "public",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      Swal.fire({
        icon: "success",
        title: "Welcome",
        text: `Signed in as ${data.data.user.full_name || "student"}`,
        confirmButtonColor: HOME.green,
        timer: 1600,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err.message || "Please check your credentials.",
        confirmButtonColor: HOME.green,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    const { value: email } = await Swal.fire({
      title: "Forgot password?",
      input: "email",
      inputLabel: "Enter the email on your account",
      inputPlaceholder: "you@example.com",
      showCancelButton: true,
      confirmButtonText: "Send reset",
      confirmButtonColor: HOME.green,
      cancelButtonColor: HOME.inkSoft,
    });
    if (!email) return;
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      Swal.fire({
        icon: "success",
        title: "Check your email",
        text: data.message || "If that account exists, reset instructions were sent.",
        confirmButtonColor: HOME.green,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Request failed",
        text: "Please try again later.",
        confirmButtonColor: HOME.green,
      });
    }
  };

  return (
    <Box
      sx={{
        height: { xs: "auto", md: "100vh" },
        minHeight: "100vh",
        maxHeight: { md: "100vh" },
        overflow: { xs: "auto", md: "hidden" },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(320px, 40%) 1fr" },
        bgcolor: "#fff",
        fontFamily: HOME.fontBody,
      }}
    >
      {/* ── Left: form ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4, md: 4, lg: 5.5 },
          py: { xs: 3, md: 2 },
          bgcolor: "#fff",
          order: { xs: 1, md: 1 },
          minHeight: 0,
          overflow: { md: "hidden" },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, mx: { xs: "auto", md: 0 } }}>
          <Box
            component="img"
            src={BRAND_LOGO_SRC}
            alt="KASMS"
            sx={{
              height: { xs: 44, md: 40, lg: 48 },
              width: "auto",
              objectFit: "contain",
              objectPosition: "left center",
              mb: { xs: 2, md: 1.5 },
              display: "block",
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.6rem", sm: "1.75rem", md: "1.7rem", lg: "1.95rem" },
              color: HOME.navyDeep,
              lineHeight: 1.15,
              mb: 0.5,
            }}
          >
            Get started with KASMS
          </Typography>
          <Typography
            sx={{
              color: HOME.inkMuted,
              fontSize: { xs: "0.88rem", md: "0.84rem" },
              mb: { xs: 2.5, md: 1.75 },
            }}
          >
            New student?{" "}
            <Link
              component={RouterLink}
              to="/admission/apply"
              state={{ from: "/login", fromLabel: "Login" }}
              underline="hover"
              sx={{ color: HOME.green, fontWeight: 700 }}
            >
              Apply for admission
            </Link>
          </Typography>

          <Box component="form" onSubmit={handleLogin} noValidate>
            <Box sx={{ mb: { xs: 1.75, md: 1.35 } }}>
              <Typography component="label" htmlFor="login-identifier" sx={labelSx}>
                Enter your email or admission number
              </Typography>
              <TextField
                id="login-identifier"
                fullWidth
                size="small"
                placeholder="email or admission number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: HOME.green, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: identifier ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Clear"
                        onClick={() => setIdentifier("")}
                        edge="end"
                      >
                        <Clear sx={{ fontSize: 16, color: HOME.inkSoft }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={fieldSx}
              />
            </Box>

            <Box sx={{ mb: 0.5 }}>
              <Typography component="label" htmlFor="login-password" sx={labelSx}>
                Enter password
              </Typography>
              <TextField
                id="login-password"
                fullWidth
                size="small"
                type={showPassword ? "text" : "password"}
                placeholder="enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: HOME.green, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 18, color: HOME.inkSoft }} />
                        ) : (
                          <Visibility sx={{ fontSize: 18, color: HOME.inkSoft }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: { xs: 2, md: 1.5 } }}>
              <Link
                component="button"
                type="button"
                onClick={handleForgot}
                underline="hover"
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: HOME.inkMuted,
                  border: "none",
                  bgcolor: "transparent",
                  cursor: "pointer",
                  fontFamily: HOME.fontBody,
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontFamily: HOME.fontBody,
                fontSize: "0.95rem",
                borderRadius: "999px",
                py: { xs: 1.2, md: 1 },
                color: "#fff",
                bgcolor: HOME.green,
                boxShadow: "0 6px 18px rgba(0, 96, 80, 0.25)",
                "&:hover": { bgcolor: "#004840" },
                "&.Mui-disabled": { bgcolor: "rgba(0,96,80,0.45)", color: "#fff" },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Login"}
            </Button>
          </Box>

          <Divider
            sx={{
              my: { xs: 2.25, md: 1.5 },
              "&::before, &::after": { borderColor: "rgba(12,35,64,0.12)" },
              "& .MuiDivider-wrapper": {
                px: 1.25,
                color: HOME.inkSoft,
                fontSize: "0.8rem",
                fontWeight: 600,
              },
            }}
          >
            or
          </Divider>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={() =>
                navigate("/admission/apply", { state: { from: "/login", fromLabel: "Login" } })
              }
              sx={{
                ...outlineBtnSx,
                "&:hover": {
                  borderColor: HOME.green,
                  bgcolor: "rgba(0,96,80,0.04)",
                },
              }}
            >
              Apply for admission
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{
                ...outlineBtnSx,
                "&:hover": {
                  borderColor: HOME.gold,
                  bgcolor: "rgba(200,168,64,0.08)",
                },
              }}
            >
              Back to home
            </Button>
          </Stack>

          <Typography
            sx={{
              mt: { xs: 2.5, md: 1.5 },
              fontSize: "0.7rem",
              color: HOME.inkSoft,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            By signing in you agree to the school{" "}
            <Box component="span" sx={{ color: HOME.green, fontWeight: 700 }}>
              terms & conditions
            </Box>
            .
          </Typography>
        </Box>
      </Box>

      {/* ── Right: panel image (desktop) ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden",
          bgcolor: "#f3f5f8",
          height: "100%",
          minHeight: 0,
          flexDirection: "column",
          order: 2,
        }}
      >
        <Box
          component="img"
          src={LOGIN_PANEL_IMG}
          alt=""
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "175%",
            maxWidth: "none",
            objectFit: "cover",
            objectPosition: "right center",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(30,40,88,0.08) 0%, transparent 35%, rgba(0,96,80,0.18) 100%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: "auto",
            mx: 2.5,
            mb: 2,
            px: 1.75,
            py: 1.25,
            borderRadius: 2.5,
            bgcolor: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 10px 28px rgba(8,22,43,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="nowrap"
          >
            {STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,96,80,0.1)",
                      color: HOME.green,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { md: "0.65rem", lg: "0.72rem" },
                      fontWeight: 700,
                      color: HOME.navyDeep,
                      lineHeight: 1.15,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </Typography>
                </Stack>
                {i < STEPS.length - 1 ? (
                  <Box
                    sx={{
                      width: 10,
                      height: 2,
                      borderRadius: 1,
                      bgcolor: "rgba(12,35,64,0.15)",
                      flexShrink: 0,
                    }}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ── Mobile: compact visual strip ── */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          order: 0,
          position: "relative",
          height: { xs: 140, sm: 170 },
          overflow: "hidden",
          bgcolor: HOME.green,
        }}
      >
        <Box
          component="img"
          src={LOGIN_PANEL_IMG}
          alt=""
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "175%",
            maxWidth: "none",
            objectFit: "cover",
            objectPosition: "right center",
            opacity: 0.95,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,96,80,0.25) 0%, rgba(20,26,58,0.55) 100%)",
          }}
        />
        <Typography
          sx={{
            position: "absolute",
            left: 20,
            bottom: 16,
            right: 20,
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          Student portal
        </Typography>
      </Box>
    </Box>
  );
}
