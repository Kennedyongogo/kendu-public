import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import BrandLogoMark from "../components/common/BrandLogoMark";
import { HOME, homeGlassSx } from "../components/Home/homeShared";
import { HomeGhostButton, HomePrimaryButton } from "../components/Home/homeUi";

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background: `linear-gradient(145deg, ${HOME.navyDeep} 0%, ${HOME.green} 55%, #004840 100%)`,
      }}
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          ...homeGlassSx({ radius: 4 }),
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={2.5} alignItems="center">
          <BrandLogoMark
            size={64}
            sx={{ height: 64, width: 64 }}
            imgSx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: "1.65rem",
                color: "#fff",
              }}
            >
              Student portal
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.78)", mt: 0.75, fontSize: "0.92rem" }}>
              Sign in with your email or admission number
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Email or admission number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: HOME.goldMuted }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 },
              "& .MuiInputLabel-root": { color: HOME.inkMuted },
            }}
          />
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: HOME.goldMuted }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 },
            }}
          />

          <HomePrimaryButton
            type="submit"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? "Signing in…" : "Login"}
          </HomePrimaryButton>

          <HomeGhostButton light startIcon={<ArrowBack />} onClick={() => navigate("/")}>
            Back to home
          </HomeGhostButton>
        </Stack>
      </Box>
    </Box>
  );
}
