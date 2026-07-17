import React, { useEffect, useState } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useNavigate } from "react-router-dom";
import { BRAND } from "../../brand";
import { HOME, homePrimaryButtonSx } from "./homeShared";

const SLIDE_INTERVAL_MS = 6500;
const SLIDE_CROSSFADE_MS = 1800;

const HERO_STATS = [
  { value: "98%", label: "Graduate Employment Rate" },
  { value: "500+", label: "Healthcare Professionals Trained" },
  { value: "15+", label: "Clinical Partnerships" },
];

const HERO_IMAGES = [
  { file: "kendu 1.jpg", alt: "Graduates celebrating at Kendu Adventist School of Medical Sciences" },
  { file: "kendu 2.jpg", alt: "Medical student practicing clinical skills on a training mannequin" },
  { file: "kendu 3.jpg", alt: "Students learning in a classroom at Kendu Adventist School of Medical Sciences" },
  { file: "kendu 4.jpg", alt: "School sports field and campus grounds at Kendu Adventist School of Medical Sciences" },
];

const heroGoldButtonSx = {
  ...homePrimaryButtonSx(),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontSize: { xs: "0.72rem", md: "0.68rem", xl: "0.72rem" },
  px: { xs: 1.75, md: 1.4, xl: 1.75 },
  py: { xs: 0.85, md: 0.8 },
  whiteSpace: "nowrap",
  maxWidth: "100%",
};

function heroImageSrc(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

const heroViewportSx = {
  height: "100vh",
  maxHeight: "100vh",
  "@supports (height: 100svh)": {
    height: "100svh",
    maxHeight: "100svh",
  },
};

export default function HeroSection() {
  const navigate = useNavigate();
  const [slideUrls, setSlideUrls] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const urls = HERO_IMAGES.map((img) => heroImageSrc(img.file));

    Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(src);
            image.onerror = () => resolve(null);
            image.src = src;
          })
      )
    ).then((resolved) => {
      if (cancelled) return;
      setSlideUrls(resolved.filter(Boolean));
      setActiveSlide(0);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slideUrls.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setActiveSlide((i) => (i + 1) % slideUrls.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slideUrls.length]);

  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0.2;
          const scrollY = window.scrollY;
          const isAtTop = scrollY <= 20;
          window.dispatchEvent(
            new CustomEvent("heroVisibilityChange", {
              detail: { isVisible: visible && isAtTop, intersectionRatio: entry.intersectionRatio, scrollY },
            })
          );
        });
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0], rootMargin: "0px" }
    );

    observer.observe(heroSection);

    const t = window.setTimeout(() => {
      const rect = heroSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      const isAtTop = window.scrollY <= 20;
      window.dispatchEvent(
        new CustomEvent("heroVisibilityChange", {
          detail: { isVisible: isInView && isAtTop, intersectionRatio: isInView ? 1 : 0, scrollY: window.scrollY },
        })
      );
    }, 200);

    return () => {
      observer.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <Box
      id="hero-section"
      sx={{
        position: "relative",
        width: "100%",
        marginTop: "-80px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...heroViewportSx,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left — white panel */}
        <Box
          sx={{
            position: "relative",
            flex: { xs: "1 1 auto", md: "0 0 46%" },
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            bgcolor: HOME.heroSplitWhite,
            pt: "80px",
            zIndex: 1,
            clipPath: {
              md: "polygon(0 0, 100% 0, 78% 100%, 0 100%)",
            },
            backgroundImage: `
              radial-gradient(circle at 18% 82%, rgba(0, 96, 80, 0.07) 0%, transparent 42%),
              radial-gradient(circle, rgba(30, 40, 88, 0.045) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 18px 18px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              pl: { xs: 2, sm: 2.5, md: "clamp(28px, 4vw, 56px)", lg: "clamp(36px, 4.5vw, 72px)" },
              pr: { xs: 2, sm: 2.5, md: "clamp(48px, 14%, 120px)", lg: "clamp(48px, 12%, 108px)" },
              py: { xs: 2, md: 4, lg: 5, xl: 6 },
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                overflow: "hidden",
                py: { md: 1.5, lg: 2.5, xl: 3 },
              }}
            >
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: { xs: "0.62rem", md: "0.72rem", lg: "0.78rem" },
                  fontWeight: 700,
                  color: BRAND.gold,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  mb: { xs: 1, md: 2, lg: 2.5 },
                  maxWidth: "100%",
                  overflowWrap: "break-word",
                }}
              >
                Excellence in Medical Education Since 1948
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: { xs: "1.55rem", sm: "1.85rem", md: "clamp(1.75rem, 2.4vw, 2.45rem)", lg: "clamp(2rem, 2.6vw, 2.75rem)" },
                  fontWeight: 800,
                  lineHeight: { xs: 1.1, lg: 1.15 },
                  letterSpacing: "-0.02em",
                  color: BRAND.navy,
                  mb: { xs: 1.25, md: 2, lg: 2.75 },
                  maxWidth: "100%",
                  overflowWrap: "break-word",
                }}
              >
                Shaping the Future of{" "}
                <Box component="span" sx={{ color: BRAND.gold }}>
                  Healthcare
                </Box>
              </Typography>

              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: { xs: "0.88rem", md: "1rem", lg: "1.08rem" },
                  fontWeight: 500,
                  color: HOME.inkMuted,
                  lineHeight: { xs: 1.55, lg: 1.7 },
                  mb: { xs: 1.5, md: 2.5, lg: 3.5 },
                  maxWidth: "100%",
                  overflowWrap: "break-word",
                }}
              >
                {BRAND.name}—where faith meets excellence in clinical training, research, and
                compassionate patient care.
              </Typography>

              <Stack
                direction="row"
                spacing={{ xs: 0.75, md: 0.6, xl: 0.75 }}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: "1rem !important" }} />}
                  onClick={() =>
                    navigate("/admission/apply", { state: { from: "/", fromLabel: "Home" } })
                  }
                  sx={heroGoldButtonSx}
                >
                  Apply Admission
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DescriptionOutlinedIcon sx={{ fontSize: "0.95rem !important" }} />}
                  onClick={() => navigate("/about-us")}
                  sx={{
                    ...heroGoldButtonSx,
                    textTransform: "none",
                    letterSpacing: "0.02em",
                    "& .MuiButton-startIcon": { mr: 0.5 },
                  }}
                >
                  About Us
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Right — green panel */}
        <Box
          sx={{
            position: "relative",
            flex: { xs: "1 1 42%", md: "1 1 auto" },
            minHeight: { xs: 180, md: 0 },
            bgcolor: HOME.heroSplitGreen,
            ml: { md: "-12%" },
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: { xs: "52%", md: "46%" },
              height: { xs: "38%", md: "42%" },
              bgcolor: HOME.heroSplitGreenDark,
              clipPath: "polygon(100% 0, 0 0, 100% 100%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: { xs: "72%", md: "68%" },
              height: { xs: "48%", md: "52%" },
              bgcolor: HOME.heroSplitGreenLight,
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: { xs: "10%", md: "12%" },
              right: { xs: "-2%", md: "2%" },
              bottom: { xs: "6%", md: "8%" },
              width: { xs: "86%", md: "76%" },
              boxShadow: "0 28px 60px rgba(8, 16, 40, 0.35)",
              clipPath: {
                xs: "polygon(10% 0, 100% 0, 100% 100%, 0 100%)",
                md: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
              },
              zIndex: 2,
              overflow: "hidden",
            }}
          >
            {slideUrls.map((src, index) => {
              const imageMeta = HERO_IMAGES.find((img) => heroImageSrc(img.file) === src);
              return (
                <Box
                  key={src}
                  component="img"
                  src={src}
                  alt={imageMeta?.alt ?? ""}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    opacity: index === activeSlide ? 1 : 0,
                    transition: `opacity ${SLIDE_CROSSFADE_MS}ms ease-in-out`,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Stats — full width, pinned inside hero */}
      <Box
        sx={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          bgcolor: BRAND.navyDeep,
          borderTop: `1px solid rgba(255,255,255,0.08)`,
          zIndex: 4,
        }}
      >
        {HERO_STATS.map((stat, index) => (
          <Box
            key={stat.label}
            sx={{
              px: { xs: 1.25, sm: 2, md: 2.5 },
              py: { xs: 1.25, md: 1.5 },
              textAlign: "center",
              borderLeft: index === 0 ? "none" : `1px solid rgba(255,255,255,0.12)`,
            }}
          >
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.65rem" },
                fontWeight: 800,
                color: BRAND.gold,
                lineHeight: 1,
                mb: 0.4,
              }}
            >
              {stat.value}
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: { xs: "0.52rem", sm: "0.58rem", md: "0.62rem" },
                fontWeight: 600,
                color: "rgba(255,255,255,0.82)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
