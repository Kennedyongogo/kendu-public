import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Stack, keyframes, CircularProgress, IconButton, Chip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { HOME } from "./homeShared";
import { HomeSectionShell, HomePrimaryButton } from "./homeUi";
import useBrandImageSrc from "../../hooks/useBrandImageSrc";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GAP_PX = { xs: 12, sm: 16, md: 20 };

function programmeImageSrc(programme) {
  return programme?.image_url || null;
}

function formatDuration(programme) {
  if (programme?.duration) return programme.duration;
  if (programme?.duration_years) {
    const y = Number(programme.duration_years);
    return `${y} year${y === 1 ? "" : "s"}`;
  }
  return "Duration TBA";
}

function ProgrammeCard({ programme, index, onView }) {
  const { src: imgSrc, usingLogo, onError } = useBrandImageSrc(programmeImageSrc(programme));

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${HOME.border}`,
        bgcolor: "#fff",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "@media (prefers-reduced-motion: no-preference)": {
          animation: `${fadeUp} 0.55s ease both`,
          animationDelay: `${Math.min(index, 8) * 0.06}s`,
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: HOME.shadowSm,
          "& .programme-photo": { transform: "scale(1.04)" },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "5 / 4",
          overflow: "hidden",
          bgcolor: usingLogo ? "#fff" : HOME.green,
        }}
      >
        <Box
          className="programme-photo"
          component="img"
          src={imgSrc}
          alt={programme.name}
          onError={onError}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: usingLogo ? "contain" : "cover",
            objectPosition: "center",
            p: usingLogo ? { xs: 3, sm: 4 } : 0,
            display: "block",
            transition: "transform 0.45s ease",
            bgcolor: usingLogo ? "rgba(0,96,80,0.06)" : "transparent",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: usingLogo
              ? "linear-gradient(180deg, transparent 40%, rgba(8,22,43,0.55) 78%, rgba(8,22,43,0.88) 100%)"
              : "linear-gradient(180deg, transparent 42%, rgba(8,22,43,0.5) 72%, rgba(8,22,43,0.88) 100%)",
            pointerEvents: "none",
          }}
        />
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, px: 2, pb: 1.75, zIndex: 1 }}>
          <Typography
            component="h3"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.2rem", sm: "1.35rem" },
              color: "#fff",
              lineHeight: 1.2,
              textShadow: "0 1px 8px rgba(0,0,0,0.35)",
            }}
          >
            {programme.name}
          </Typography>
        </Box>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ px: 2, py: 1.75, gap: 1.5, mt: "auto" }}
      >
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 700,
            fontSize: "0.88rem",
            color: HOME.inkSoft,
            minWidth: 0,
          }}
        >
          {formatDuration(programme)}
        </Typography>
        <HomePrimaryButton
          onClick={() => onView(programme.id)}
          sx={{ py: 1, px: 2, fontSize: "0.82rem", flexShrink: 0 }}
        >
          View details
        </HomePrimaryButton>
      </Stack>
    </Box>
  );
}

function NavArrow({ direction, onClick, disabled }) {
  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous programmes" : "Next programmes"}
      sx={{
        width: { xs: 42, md: 48 },
        height: { xs: 42, md: 48 },
        bgcolor: HOME.green,
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 10px 28px -10px rgba(0,96,80,0.55)",
        "&:hover": { bgcolor: "#004840" },
        "&.Mui-disabled": {
          bgcolor: "rgba(0,96,80,0.25)",
          color: "rgba(255,255,255,0.7)",
        },
      }}
    >
      {direction === "prev" ? (
        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
      ) : (
        <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
      )}
    </IconButton>
  );
}

export default function ProgrammesSection() {
  const navigate = useNavigate();
  const scrollerRef = useRef(null);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  /** Arrows enabled only when there are 4 or more programmes. */
  const carouselEnabled = programmes.length >= 4;

  const updateArrowState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || programmes.length < 4) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 4) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, [programmes.length]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/programmes?is_active=true&limit=100");
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Could not load programmes");
        }
        setProgrammes(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load programmes");
          setProgrammes([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrowState();
    el.addEventListener("scroll", updateArrowState, { passive: true });
    window.addEventListener("resize", updateArrowState);
    return () => {
      el.removeEventListener("scroll", updateArrowState);
      window.removeEventListener("resize", updateArrowState);
    };
  }, [programmes, loading, updateArrowState]);

  const scrollByPage = (dir) => {
    if (!carouselEnabled) return;
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.92;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <HomeSectionShell
      id="programmes"
      bg={{ bgcolor: HOME.cream }}
      sx={{
        width: "100%",
        pt: { xs: 2.5, md: 3.5 },
        pb: { xs: 5, md: 7 },
        px: 0,
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, md: 2.5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Chip
          label="Academics"
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            height: 28,
            mb: { xs: 1.25, md: 1.5 },
            bgcolor: "rgba(201, 162, 39, 0.12)",
            color: HOME.navyDeep,
            border: `1px solid ${HOME.borderGold}`,
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: { xs: 1.25, md: 1.5 },
            width: "100%",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "2.85rem" },
              lineHeight: 1.1,
              color: HOME.navyDeep,
            }}
          >
            Our{" "}
            <Box component="span" sx={{ color: HOME.gold }}>
              programmes
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.5,
              color: HOME.inkMuted,
              textAlign: "center",
              px: { xs: 1, md: 0 },
              maxWidth: { xs: "100%", md: "none" },
              whiteSpace: { md: "nowrap" },
            }}
          >
            Explore the academic programmes offered at Kendu Adventist School of Medical Sciences.
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: HOME.green }} />
        </Box>
      ) : error ? (
        <Typography sx={{ color: HOME.inkMuted, py: 4, textAlign: "center", px: 2 }}>{error}</Typography>
      ) : programmes.length === 0 ? (
        <Typography sx={{ color: HOME.inkMuted, py: 4, textAlign: "center", px: 2 }}>
          Programmes will appear here once they are published.
        </Typography>
      ) : (
        <Box sx={{ position: "relative", width: "100%" }}>
          {/* Always on far left / far right edges */}
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              left: { xs: 6, sm: 10, md: 12 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
          >
            <NavArrow
              direction="prev"
              disabled={!carouselEnabled || !canPrev}
              onClick={() => scrollByPage(-1)}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              right: { xs: 6, sm: 10, md: 12 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
          >
            <NavArrow
              direction="next"
              disabled={!carouselEnabled || !canNext}
              onClick={() => scrollByPage(1)}
            />
          </Box>

          <Box
            ref={scrollerRef}
            sx={{
              display: "flex",
              gap: { xs: `${GAP_PX.xs}px`, sm: `${GAP_PX.sm}px`, md: `${GAP_PX.md}px` },
              overflowX: carouselEnabled ? "auto" : "hidden",
              overflowY: "hidden",
              scrollSnapType: carouselEnabled ? "x mandatory" : "none",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              px: { xs: 7, sm: 8, md: 9 },
              pb: 1,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {programmes.map((p, i) => (
              <Box
                key={p.id}
                sx={{
                  flex: {
                    xs: "0 0 calc(100% - 0px)",
                    sm: `0 0 calc((100% - ${GAP_PX.sm}px) / 2)`,
                    md: `0 0 calc((100% - ${GAP_PX.md * 2}px) / 3)`,
                  },
                  minWidth: {
                    xs: "calc(100% - 0px)",
                    sm: `calc((100% - ${GAP_PX.sm}px) / 2)`,
                    md: `calc((100% - ${GAP_PX.md * 2}px) / 3)`,
                  },
                  maxWidth: {
                    xs: "calc(100% - 0px)",
                    sm: `calc((100% - ${GAP_PX.sm}px) / 2)`,
                    md: `calc((100% - ${GAP_PX.md * 2}px) / 3)`,
                  },
                  scrollSnapAlign: "start",
                }}
              >
                <ProgrammeCard
                  programme={p}
                  index={i}
                  onView={(id) =>
                    navigate(`/programmes/${id}`, { state: { from: "/", fromLabel: "Home" } })
                  }
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </HomeSectionShell>
  );
}
