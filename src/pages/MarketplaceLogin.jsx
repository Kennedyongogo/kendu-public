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
  keyframes,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Clear,
  ArrowBack,
  SchoolOutlined,
  DescriptionOutlined,
  MarkEmailReadOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { HOME, BRAND_LOGO_SRC } from "../components/Home/homeShared";

const LOGIN_CIRCLE_LEFT = "/images/kendu%202.jpg";
const LOGIN_CIRCLE_RIGHT = "/images/kendu%201.jpg";
const LOGIN_PANEL_BG = "/images/kendu%203.jpg";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatA = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const floatB = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
`;

const breathe = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(200,168,64,0.35); }
  50% { transform: translate(-50%, -50%) scale(1.06); box-shadow: 0 0 0 10px rgba(200,168,64,0); }
`;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.92)",
    fontFamily: HOME.fontBody,
    fontSize: "0.95rem",
    minHeight: 52,
    transition: "box-shadow 0.25s ease, border-color 0.25s ease",
    "& fieldset": { borderColor: "rgba(12, 35, 64, 0.12)" },
    "&:hover": {
      boxShadow: "0 10px 28px rgba(8,22,43,0.07)",
      "& fieldset": { borderColor: HOME.green },
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 4px rgba(0,96,80,0.12)",
      "& fieldset": { borderColor: HOME.green, borderWidth: 1.5 },
    },
  },
};

const labelSx = {
  fontFamily: HOME.fontBody,
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: HOME.ink,
  mb: 0.85,
  display: "block",
};

const STEPS = [
  { label: "Apply", icon: <SchoolOutlined sx={{ fontSize: 15 }} /> },
  { label: "Submit", icon: <DescriptionOutlined sx={{ fontSize: 15 }} /> },
  { label: "Offer", icon: <MarkEmailReadOutlined sx={{ fontSize: 15 }} /> },
  { label: "Enroll", icon: <CheckCircleOutline sx={{ fontSize: 15 }} /> },
];

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
        gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 42%) 1fr" },
        bgcolor: HOME.cream,
        fontFamily: HOME.fontBody,
      }}
    >
      {/* ── Form column ── */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4, md: 4.5, lg: 6 },
          py: { xs: 3.5, md: 3 },
          order: { xs: 1, md: 1 },
          minHeight: 0,
          overflow: { md: "auto" },
          background: `
            linear-gradient(165deg, #ffffff 0%, ${HOME.cream} 55%, rgba(232,238,246,0.65) 100%)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 0% 0%, rgba(0,96,80,0.07) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(200,168,64,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            mx: { xs: "auto", md: 0 },
            animation: `${fadeUp} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ mb: { xs: 2.5, md: 2 }, display: { xs: "none", md: "flex" } }}
          >
            <IconButton
              onClick={() => navigate("/")}
              aria-label="Back to home"
              sx={{
                width: 40,
                height: 40,
                color: HOME.navy,
                border: `1px solid ${HOME.border}`,
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "rgba(0,96,80,0.08)", borderColor: HOME.green },
              }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Box
              component="img"
              src={BRAND_LOGO_SRC}
              alt="KASMS"
              sx={{
                height: { xs: 42, md: 46 },
                width: "auto",
                objectFit: "contain",
                objectPosition: "left center",
                display: "block",
              }}
            />
          </Stack>

          <Box
            component="img"
            src={BRAND_LOGO_SRC}
            alt="KASMS"
            sx={{
              display: { xs: "block", md: "none" },
              height: 42,
              width: "auto",
              objectFit: "contain",
              objectPosition: "left center",
              mb: 2.5,
            }}
          />

          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: HOME.green,
              mb: 1,
            }}
          >
            Student portal
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "2.35rem", sm: "2.6rem", md: "2.75rem" },
              color: HOME.navyDeep,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              mb: 1.1,
            }}
          >
            KASMS
          </Typography>

          <Typography
            sx={{
              color: HOME.inkMuted,
              fontSize: { xs: "0.95rem", md: "1rem" },
              lineHeight: 1.55,
              maxWidth: 360,
              mb: { xs: 3, md: 2.75 },
            }}
          >
            Sign in with your email or admission number to continue your studies.
          </Typography>

          <Box component="form" onSubmit={handleLogin} noValidate>
            <Box sx={{ mb: 2 }}>
              <Typography component="label" htmlFor="login-identifier" sx={labelSx}>
                Email or admission number
              </Typography>
              <TextField
                id="login-identifier"
                fullWidth
                placeholder="you@example.com or ADM-2026-001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: HOME.green, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: identifier ? (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label="Clear" onClick={() => setIdentifier("")} edge="end">
                        <Clear sx={{ fontSize: 16, color: HOME.inkSoft }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={fieldSx}
              />
            </Box>

            <Box sx={{ mb: 0.75 }}>
              <Typography component="label" htmlFor="login-password" sx={labelSx}>
                Password
              </Typography>
              <TextField
                id="login-password"
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: HOME.green, fontSize: 20 }} />
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

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2.25 }}>
              <Link
                component="button"
                type="button"
                onClick={handleForgot}
                underline="hover"
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: HOME.green,
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
                fontWeight: 800,
                fontFamily: HOME.fontBody,
                fontSize: "0.98rem",
                borderRadius: "12px",
                py: 1.45,
                color: "#fff",
                background: `linear-gradient(135deg, ${HOME.green} 0%, #004840 100%)`,
                boxShadow: "0 14px 32px rgba(0,96,80,0.28)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  background: `linear-gradient(135deg, #004840 0%, ${HOME.green} 100%)`,
                  transform: "translateY(-1px)",
                  boxShadow: "0 18px 36px rgba(0,96,80,0.34)",
                },
                "&.Mui-disabled": { bgcolor: "rgba(0,96,80,0.45)", color: "#fff" },
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 2.75,
              pt: 2.5,
              borderTop: `1px solid ${HOME.border}`,
            }}
          >
            <Typography sx={{ fontSize: "0.88rem", color: HOME.inkMuted, mb: 1.5, lineHeight: 1.5 }}>
              New here?{" "}
              <Link
                component={RouterLink}
                to="/admission/apply"
                state={{ from: "/login", fromLabel: "Login" }}
                underline="hover"
                sx={{ color: HOME.green, fontWeight: 800 }}
              >
                Apply for admission
              </Link>
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/admission/apply", { state: { from: "/login", fromLabel: "Login" } })}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontFamily: HOME.fontBody,
                borderRadius: "12px",
                py: 1.15,
                borderColor: "rgba(12,35,64,0.16)",
                color: HOME.navyDeep,
                bgcolor: "rgba(255,255,255,0.65)",
                "&:hover": {
                  borderColor: HOME.gold,
                  bgcolor: "rgba(200,168,64,0.08)",
                },
              }}
            >
              Start your application
            </Button>
          </Box>

          <Typography
            sx={{
              mt: 2.5,
              fontSize: "0.72rem",
              color: HOME.inkSoft,
              textAlign: { xs: "center", md: "left" },
              lineHeight: 1.45,
            }}
          >
            Kendu Adventist School of Medical Sciences
          </Typography>
        </Box>
      </Box>

      {/* ── Visual column ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden",
          height: "100%",
          minHeight: 0,
          flexDirection: "column",
          order: 2,
        }}
      >
        <Box
          component="img"
          src={LOGIN_PANEL_BG}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transform: "scale(1.06)",
            filter: "saturate(0.9) contrast(1.02)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(155deg, rgba(20,26,58,0.55) 0%, rgba(0,96,80,0.42) 48%, rgba(20,26,58,0.62) 100%),
              radial-gradient(ellipse 70% 55% at 80% 15%, rgba(200,168,64,0.28) 0%, transparent 55%)
            `,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            px: { md: 4, lg: 6 },
            pt: { md: 4, lg: 5 },
            animation: `${fadeUp} 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both`,
          }}
        >
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { md: "2.4rem", lg: "2.85rem" },
              color: "#fff",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              maxWidth: 420,
              textShadow: "0 12px 40px rgba(0,0,0,0.25)",
            }}
          >
            Train where care meets calling.
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              color: "rgba(255,255,255,0.86)",
              fontSize: "1rem",
              lineHeight: 1.55,
              maxWidth: 380,
            }}
          >
            Clinical excellence. Adventist values. Your pathway into medical sciences.
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { md: 3, lg: 5 },
            py: 2,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 540,
              height: { md: 300, lg: 360 },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: { md: "0%", lg: "2%" },
                top: { md: "4%", lg: "2%" },
                width: { md: "54%", lg: "52%" },
                aspectRatio: "1 / 1.12",
                borderRadius: "50%",
                overflow: "hidden",
                border: "5px solid rgba(255,255,255,0.92)",
                boxShadow: "0 28px 60px rgba(0,0,0,0.28)",
                animation: `${floatA} 7s ease-in-out infinite`,
              }}
            >
              <Box
                component="img"
                src={LOGIN_CIRCLE_LEFT}
                alt="KASMS learning"
                sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
              />
            </Box>

            <Box
              sx={{
                position: "absolute",
                right: { md: "-2%", lg: "0%" },
                bottom: { md: "0%", lg: "-2%" },
                width: { md: "54%", lg: "52%" },
                aspectRatio: "1 / 1.12",
                borderRadius: "50%",
                overflow: "hidden",
                border: "5px solid rgba(255,255,255,0.92)",
                boxShadow: "0 28px 60px rgba(0,0,0,0.28)",
                zIndex: 2,
                animation: `${floatB} 8s ease-in-out infinite`,
              }}
            >
              <Box
                component="img"
                src={LOGIN_CIRCLE_RIGHT}
                alt="KASMS graduates"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            </Box>

            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "48%",
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: HOME.gold,
                color: HOME.navyDeep,
                display: "grid",
                placeItems: "center",
                border: "3px solid #fff",
                zIndex: 3,
                fontWeight: 800,
                fontSize: "1rem",
                fontFamily: HOME.fontBody,
                animation: `${breathe} 3.2s ease-in-out infinite`,
              }}
            >
              +
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mx: { md: 3, lg: 4 },
            mb: { md: 2.5, lg: 3 },
            px: 2,
            py: 1.5,
            borderRadius: "16px",
            bgcolor: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            animation: `${fadeUp} 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <Stack direction="row" spacing={0.7} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "10px",
                      bgcolor: "rgba(255,255,255,0.18)",
                      color: "#fff",
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
                      fontSize: { md: "0.7rem", lg: "0.78rem" },
                      fontWeight: 700,
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </Typography>
                </Stack>
                {i < STEPS.length - 1 ? (
                  <Box
                    sx={{
                      flex: 1,
                      height: 2,
                      maxWidth: 28,
                      borderRadius: 1,
                      bgcolor: "rgba(255,255,255,0.28)",
                    }}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ── Mobile hero strip ── */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          order: 0,
          position: "relative",
          height: { xs: 168, sm: 200 },
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={LOGIN_CIRCLE_LEFT}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(20,26,58,0.35) 0%, rgba(0,96,80,0.55) 55%, rgba(20,26,58,0.72) 100%)",
          }}
        />
        <IconButton
          onClick={() => navigate("/")}
          aria-label="Back to home"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 2,
            width: 40,
            height: 40,
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.35)",
            bgcolor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            "&:hover": {
              bgcolor: "rgba(200,168,64,0.28)",
              borderColor: "rgba(200,168,64,0.55)",
            },
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
        <Box sx={{ position: "absolute", left: 20, right: 20, bottom: 18 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: HOME.goldMuted,
              mb: 0.5,
            }}
          >
            Student portal
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: "1.65rem",
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            KASMS
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
