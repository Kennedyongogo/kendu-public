import React, { Suspense, lazy } from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/Home/HeroSection";
import { HOME } from "../components/Home/homeShared";

const ProgrammesSection = lazy(() => import("../components/Home/ProgrammesSection"));
const NewsSection = lazy(() => import("../components/Home/NewsSection"));
const Footer = lazy(() => import("../components/Footer/Footer"));

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: HOME.fontBody,
        bgcolor: HOME.warmWhite,
      }}
    >
      <HeroSection />
      <Suspense fallback={null}>
        <ProgrammesSection />
        <NewsSection />
        <Footer />
      </Suspense>
    </Box>
  );
}
