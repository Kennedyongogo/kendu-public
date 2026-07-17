import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Stack, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomeGhostButton,
  HomePrimaryButton,
} from "../components/Home/homeUi";
import Footer from "../components/Footer/Footer";

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

export default function AdmissionApplication() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, display: "flex", flexDirection: "column" }}>
      <HomeSectionShell bg={{ py: { xs: 5, md: 7 }, bgcolor: HOME.warmWhite }}>
        <Box sx={{ ...sectionPad, width: "100%", maxWidth: 720, mx: "auto" }}>
          <HomeSectionHeader
            eyebrow="Admissions"
            title="Apply for"
            titleAccent="admission"
            subtitle="Begin your journey at Kendu Adventist School of Medical Sciences. Reach out to our admissions team to start your application."
          />

          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 3,
              bgcolor: "#fff",
              border: `1px solid ${HOME.border}`,
              boxShadow: HOME.shadowSm,
            }}
          >
            <Chip
              label="Admissions office"
              sx={{
                mb: 2,
                fontWeight: 700,
                bgcolor: "rgba(0,96,80,0.1)",
                color: HOME.green,
              }}
            />
            <Typography sx={{ color: HOME.inkMuted, lineHeight: 1.75, mb: 2.5 }}>
              Contact us to request an application pack, ask about programmes, or schedule a campus
              visit. Our team is ready to guide you through the next steps.
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <PhoneRoundedIcon sx={{ color: HOME.green }} />
                <Typography
                  component="a"
                  href="tel:+2540711954609"
                  sx={{ color: HOME.navyDeep, fontWeight: 700, textDecoration: "none" }}
                >
                  +254 0711 954609
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <EmailOutlinedIcon sx={{ color: HOME.green }} />
                <Typography
                  component="a"
                  href="mailto:kendunursing@yahoo.com"
                  sx={{ color: HOME.navyDeep, fontWeight: 700, textDecoration: "none" }}
                >
                  kendunursing@yahoo.com
                </Typography>
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <HomePrimaryButton onClick={() => (window.location.href = "tel:+2540711954609")}>
                Call admissions
              </HomePrimaryButton>
              <HomeGhostButton startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
                Back to home
              </HomeGhostButton>
            </Stack>
          </Box>
        </Box>
      </HomeSectionShell>
      <Footer />
    </Box>
  );
}
