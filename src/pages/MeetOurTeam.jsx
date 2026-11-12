import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, keyframes, IconButton, Tooltip } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { HOME } from "../components/Home/homeShared";
import Footer from "../components/Footer/Footer";
import BrandPageLoader from "../components/common/BrandPageLoader";
import useBrandImageSrc from "../hooks/useBrandImageSrc";
import { cachedFetchJson } from "../lib/cachedFetch";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
`;

const softIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const LEADERSHIP_ROLES = ["principal", "deputy_principal", "secretary"];
const HOD_ROLES = ["hod"];
const FACULTY_ROLES = ["lecturer"];

const ROLE_RANK = {
  principal: 1,
  deputy_principal: 2,
  secretary: 3,
  hod: 4,
  lecturer: 5,
};

const FACULTY_NAME_RANK = {
  "moses o. otieno": 1,
  "beatrice moraa": 2,
  "evans malo": 3,
  "joshua obure n.": 4,
  "jane amunga": 5,
};

const pagePad = { px: { xs: 1.25, sm: 1.75, md: 2.25, lg: 2.75 } };
const contentMax = { maxWidth: 1240, mx: "auto", width: "100%" };

function initialsFromName(name) {
  const parts = String(name || "")
    .replace(/\./g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function splitPosition(position) {
  const raw = String(position || "").trim();
  if (!raw) return { qualification: "", module: "" };
  if (raw.includes(" · ")) {
    const [qualification, ...rest] = raw.split(" · ");
    return { qualification: qualification.trim(), module: rest.join(" · ").trim() };
  }
  return { qualification: "", module: raw };
}

function hodRank(person) {
  const p = String(person.position || "").toLowerCase();
  if (p.includes("nursing")) return 1;
  if (p.includes("clinical")) return 2;
  return 9;
}

function sortStaff(list) {
  return [...list].sort((a, b) => {
    const ra = ROLE_RANK[a.role] ?? 50;
    const rb = ROLE_RANK[b.role] ?? 50;
    if (ra !== rb) return ra - rb;
    if (a.role === "hod" && b.role === "hod") {
      const ha = hodRank(a);
      const hb = hodRank(b);
      if (ha !== hb) return ha - hb;
    }
    if (a.role === "lecturer" && b.role === "lecturer") {
      const fa = FACULTY_NAME_RANK[String(a.full_name || "").toLowerCase()] ?? 99;
      const fb = FACULTY_NAME_RANK[String(b.full_name || "").toLowerCase()] ?? 99;
      if (fa !== fb) return fa - fb;
    }
    return String(a.full_name || "").localeCompare(String(b.full_name || ""));
  });
}

function PageHero({ onBack, total }) {
  return (
    <Box
      component="header"
      sx={{
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        background: HOME.heroBackground,
        pt: { xs: 2.25, md: 3.5 },
        pb: { xs: 4.5, md: 6 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: HOME.heroBackgroundAccent,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          right: { xs: -90, md: -40 },
          top: { xs: -110, md: -80 },
          background: "radial-gradient(circle, rgba(200,168,64,0.22) 0%, transparent 68%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          left: { xs: -80, md: 40 },
          bottom: -120,
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ ...pagePad, ...contentMax, position: "relative", zIndex: 1 }}>
        <Tooltip title="Back to About Us" arrow>
          <IconButton
            aria-label="Back to About Us"
            onClick={onBack}
            sx={{
              mb: { xs: 2, md: 2.5 },
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
              transition: "background 0.2s ease, transform 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(200,168,64,0.22)",
                borderColor: HOME.goldMuted,
                transform: "translateX(-2px)",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: HOME.goldMuted,
            mb: 1.25,
            "@media (prefers-reduced-motion: no-preference)": {
              animation: `${softIn} 0.6s ease both`,
            },
          }}
        >
          Administration & faculty
        </Typography>

        <Typography
          component="h1"
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "2.35rem", sm: "2.85rem", md: "3.35rem" },
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 720,
            mb: 1.5,
            "@media (prefers-reduced-motion: no-preference)": {
              animation: `${fadeUp} 0.65s ease both`,
            },
          }}
        >
          The people who{" "}
          <Box component="span" sx={{ color: HOME.goldMuted }}>
            lead the school
          </Box>
        </Typography>

        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.84)",
            maxWidth: 540,
            mb: total ? 2.25 : 0,
            "@media (prefers-reduced-motion: no-preference)": {
              animation: `${fadeUp} 0.7s ease both`,
              animationDelay: "0.08s",
            },
          }}
        >
          Leadership, heads of department, and academic staff — published for students, families,
          and partners of KASMS.
        </Typography>

        {total ? (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.85,
              borderRadius: "999px",
              bgcolor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              "@media (prefers-reduced-motion: no-preference)": {
                animation: `${fadeUp} 0.7s ease both`,
                animationDelay: "0.14s",
              },
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: HOME.goldMuted,
                boxShadow: "0 0 0 4px rgba(200,168,64,0.18)",
              }}
            />
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 700,
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {total} published profiles
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function SectionShell({ tone = "warm", children, id }) {
  const bg =
    tone === "cream"
      ? HOME.cream
      : tone === "sky"
        ? HOME.sky
        : tone === "navy"
          ? `linear-gradient(165deg, ${HOME.navyDeep} 0%, ${HOME.navy} 55%, ${HOME.green} 130%)`
          : HOME.warmWhite;

  return (
    <Box
      id={id}
      component="section"
      sx={{
        position: "relative",
        bgcolor: tone === "navy" ? undefined : bg,
        background: tone === "navy" ? bg : undefined,
        py: { xs: 4.5, md: 6 },
        ...pagePad,
        borderTop: tone === "warm" ? "none" : `1px solid ${HOME.border}`,
      }}
    >
      <Box sx={contentMax}>{children}</Box>
    </Box>
  );
}

function SectionIntro({ eyebrow, title, subtitle, light = false }) {
  return (
    <Box sx={{ mb: { xs: 3, md: 4 }, maxWidth: 640 }}>
      <Typography
        sx={{
          fontFamily: HOME.fontBody,
          fontWeight: 800,
          fontSize: "0.72rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: light ? HOME.goldMuted : HOME.gold,
          mb: 1,
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        component="h2"
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.85rem", md: "2.35rem" },
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          color: light ? "#fff" : HOME.navyDeep,
          mb: subtitle ? 1 : 0,
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontSize: { xs: "0.95rem", md: "1.02rem" },
            lineHeight: 1.65,
            color: light ? "rgba(255,255,255,0.78)" : HOME.inkMuted,
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}

function PortraitPerson({ person, index, featured = false }) {
  const { src: photoSrc, usingLogo, onError } = useBrandImageSrc(person.profile_image_url);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        "@media (prefers-reduced-motion: no-preference)": {
          animation: `${fadeUp} 0.6s ease both`,
          animationDelay: `${Math.min(index, 6) * 0.07}s`,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: featured ? 280 : 240,
          mb: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: { xs: -6, md: -8 },
            borderRadius: "50%",
            background: `linear-gradient(145deg, ${HOME.gold} 0%, transparent 42%, ${HOME.green} 100%)`,
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            overflow: "hidden",
            bgcolor: HOME.mist,
            border: "4px solid #fff",
            boxShadow: "0 18px 40px rgba(8,22,43,0.14)",
            transition: "transform 0.35s ease, box-shadow 0.35s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 24px 48px rgba(8,22,43,0.18)",
              "& .staff-photo": { transform: "scale(1.05)" },
            },
          }}
        >
          <Box
            className="staff-photo"
            component="img"
            src={photoSrc}
            alt={`Portrait of ${person.full_name}${person.position ? `, ${person.position}` : ""}`}
            onError={onError}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: usingLogo ? "contain" : "cover",
              objectPosition: "center top",
              p: usingLogo ? 4 : 0,
              display: "block",
              transition: "transform 0.5s ease",
              bgcolor: usingLogo ? "rgba(27,94,168,0.06)" : HOME.green,
            }}
          />
        </Box>
      </Box>

      <Typography
        component="h3"
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: featured
            ? { xs: "1.35rem", md: "1.55rem" }
            : { xs: "1.2rem", md: "1.35rem" },
          color: HOME.navyDeep,
          lineHeight: 1.15,
          mb: 0.55,
        }}
      >
        {person.full_name}
      </Typography>
      {person.position ? (
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 700,
            fontSize: { xs: "0.84rem", md: "0.9rem" },
            color: HOME.green,
            letterSpacing: "0.01em",
            lineHeight: 1.4,
            maxWidth: 260,
          }}
        >
          {person.position}
        </Typography>
      ) : null}
    </Box>
  );
}

function FacultyPerson({ person, index }) {
  const { qualification, module } = splitPosition(person.position);
  const initials = initialsFromName(person.full_name);
  const hasPhoto = Boolean(person.profile_image_url);
  const { src: photoSrc, usingLogo, onError } = useBrandImageSrc(person.profile_image_url);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "76px minmax(0, 1fr)", sm: "88px minmax(0, 1fr)" },
        gap: { xs: 1.5, sm: 2 },
        alignItems: "center",
        p: { xs: 1.5, sm: 1.75 },
        borderRadius: "18px",
        bgcolor: "#fff",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: "0 12px 30px rgba(8,22,43,0.16)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        "@media (prefers-reduced-motion: no-preference)": {
          animation: `${fadeUp} 0.55s ease both`,
          animationDelay: `${Math.min(index, 8) * 0.06}s`,
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 18px 40px rgba(8,22,43,0.2)",
          borderColor: HOME.gold,
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 76, sm: 88 },
          height: { xs: 76, sm: 88 },
          borderRadius: "16px",
          overflow: "hidden",
          flexShrink: 0,
          bgcolor: HOME.navyDeep,
          background: hasPhoto
            ? undefined
            : `linear-gradient(145deg, ${HOME.navyDeep} 0%, ${HOME.green} 100%)`,
          color: HOME.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.25rem", sm: "1.4rem" },
          letterSpacing: "0.04em",
          border: `2px solid ${HOME.gold}`,
        }}
      >
        {hasPhoto ? (
          <Box
            component="img"
            src={photoSrc}
            alt=""
            onError={onError}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: usingLogo ? "contain" : "cover",
              objectPosition: "center top",
              p: usingLogo ? 1.5 : 0,
            }}
          />
        ) : (
          initials
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h3"
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.15rem", sm: "1.3rem" },
            color: HOME.navyDeep,
            lineHeight: 1.15,
            mb: 0.4,
          }}
        >
          {person.full_name}
        </Typography>
        {qualification ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 600,
              fontSize: "0.84rem",
              color: HOME.inkMuted,
              mb: module ? 0.75 : 0,
            }}
          >
            {qualification}
          </Typography>
        ) : null}
        {module ? (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.2,
              py: 0.5,
              borderRadius: "999px",
              bgcolor: HOME.gold,
              border: `1px solid ${HOME.gold}`,
              boxShadow: "0 6px 14px rgba(160,128,40,0.28)",
            }}
          >
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                fontSize: "0.72rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: HOME.navyDeep,
              }}
            >
              {module}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function PortraitGrid({ people, featured = false }) {
  const count = people.length;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: count === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
          md:
            count <= 2
              ? `repeat(${count}, minmax(0, 280px))`
              : "repeat(3, minmax(0, 1fr))",
        },
        justifyContent: { md: count <= 2 ? "center" : "start" },
        gap: { xs: 3.5, sm: 4, md: 4.5 },
        width: "100%",
      }}
    >
      {people.map((person, index) => (
        <PortraitPerson key={person.id} person={person} index={index} featured={featured} />
      ))}
    </Box>
  );
}

export default function MeetOurTeam() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { ok, data } = await cachedFetchJson("/api/users/public/staff", {}, { ttlMs: 90_000 });
        if (!ok || !data.success) {
          throw new Error(data.message || "Could not load staff directory");
        }
        if (!cancelled) setStaff(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Could not load staff directory");
          setStaff([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const sorted = sortStaff(staff);
    return {
      leadership: sorted.filter((p) => LEADERSHIP_ROLES.includes(p.role)),
      departments: sorted.filter((p) => HOD_ROLES.includes(p.role)),
      faculty: sorted.filter((p) => FACULTY_ROLES.includes(p.role)),
      other: sorted.filter(
        (p) =>
          !LEADERSHIP_ROLES.includes(p.role) &&
          !HOD_ROLES.includes(p.role) &&
          !FACULTY_ROLES.includes(p.role)
      ),
    };
  }, [staff]);

  const count = staff.length;

  if (loading) {
    return <BrandPageLoader message="Loading team…" />;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, display: "flex", flexDirection: "column" }}>
      <PageHero onBack={() => navigate("/about-us")} total={count} />

      {error ? (
        <SectionShell tone="warm">
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: HOME.navyDeep, fontWeight: 700, mb: 1 }}>
              Unable to load staff
            </Typography>
            <Typography sx={{ color: HOME.inkMuted }}>{error}</Typography>
          </Box>
        </SectionShell>
      ) : count === 0 ? (
        <SectionShell tone="warm">
          <Box sx={{ py: { xs: 7, md: 9 }, textAlign: "center" }}>
            <GroupsOutlinedIcon sx={{ fontSize: 48, color: HOME.green, mb: 2, opacity: 0.9 }} />
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontSize: "1.7rem",
                fontWeight: 700,
                color: HOME.navyDeep,
                mb: 1,
              }}
            >
              Profiles coming soon
            </Typography>
            <Typography sx={{ color: HOME.inkMuted, lineHeight: 1.75, maxWidth: 420, mx: "auto" }}>
              Staff will appear here once they are published from the school admin.
            </Typography>
          </Box>
        </SectionShell>
      ) : (
        <>
          {grouped.leadership.length ? (
            <SectionShell tone="warm" id="leadership">
              <SectionIntro eyebrow="Administration" title="School leadership" />
              <PortraitGrid people={grouped.leadership} featured />
            </SectionShell>
          ) : null}

          {grouped.departments.length ? (
            <SectionShell tone="cream" id="departments">
              <SectionIntro
                eyebrow="Departments"
                title="Heads of department"
                subtitle="Nursing and Clinical Medicine — the academic departments that shape diploma training at KASMS."
              />
              <PortraitGrid people={grouped.departments} />
            </SectionShell>
          ) : null}

          {grouped.faculty.length ? (
            <SectionShell tone="navy" id="faculty">
              <SectionIntro
                light
                eyebrow="Faculty"
                title="Lecturers and the modules they lead"
                subtitle={`${grouped.faculty.length} academic staff with the qualification and module area published by the school.`}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: { xs: 1.25, sm: 1.5, md: 1.75 },
                }}
              >
                {grouped.faculty.map((person, index) => (
                  <FacultyPerson key={person.id} person={person} index={index} />
                ))}
              </Box>
            </SectionShell>
          ) : null}

          {grouped.other.length ? (
            <SectionShell tone="sky" id="team">
              <SectionIntro eyebrow="Team" title="Other staff" />
              <PortraitGrid people={grouped.other} />
            </SectionShell>
          ) : null}
        </>
      )}

      <Footer />
    </Box>
  );
}
