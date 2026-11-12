import React, { Suspense, lazy, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import StudentNavbar from "../components/StudentPortal/StudentNavbar";
import BrandPageLoader from "../components/common/BrandPageLoader";
import { HOME, readStoredStudent } from "../components/StudentPortal/studentPortalShared";
import { armStudentIdleTimer } from "../auth/sessionSecurity";

const StudentHome = lazy(() => import("../components/StudentPortal/StudentHome"));
const StudentSettings = lazy(() => import("../components/StudentPortal/StudentSettings"));
const StudentFees = lazy(() => import("../components/StudentPortal/StudentFees"));
const StudentTimetable = lazy(() => import("../components/StudentPortal/StudentTimetable"));
const StudentTimetableDay = lazy(() => import("../components/StudentPortal/StudentTimetableDay"));
const StudentTranscript = lazy(() => import("../components/StudentPortal/StudentTranscript"));
const StudentLibrary = lazy(() => import("../components/StudentPortal/StudentLibrary"));
const StudentProgramme = lazy(() => import("../components/StudentPortal/StudentProgramme"));
const StudentChurch = lazy(() => import("../components/StudentPortal/StudentChurch"));
const StudentAssignments = lazy(() => import("../components/StudentPortal/StudentAssignments"));

export default function StudentPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(() => readStoredStudent());

  useEffect(() => {
    if (student) armStudentIdleTimer();
  }, [student]);
  const isTimetableDay = location.pathname.includes("/timetable/day/");
  const activePage = location.pathname.endsWith("/settings")
    ? "settings"
    : location.pathname.endsWith("/church")
    ? "church"
    : location.pathname.endsWith("/programme")
      ? "programme"
      : location.pathname.endsWith("/library")
      ? "library"
      : location.pathname.endsWith("/fees")
      ? "fees"
      : location.pathname.endsWith("/transcript")
        ? "transcript"
        : location.pathname.endsWith("/assignments")
          ? "assignments"
          : location.pathname.endsWith("/timetable") || isTimetableDay
            ? "timetable"
            : "home";

  useEffect(() => {
    if (!student) navigate("/login", { replace: true });
  }, [student, navigate]);

  if (!student) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleStudentUpdate = (nextStudent) => {
    setStudent(nextStudent);
    localStorage.setItem("user", JSON.stringify(nextStudent));
  };

  const handleNavigate = (page) => {
    navigate(page === "home" ? "/student" : `/student/${page}`);
  };

  let page = <StudentHome student={student} />;
  if (activePage === "settings") {
    page = (
      <StudentSettings
        student={student}
        onStudentUpdate={handleStudentUpdate}
        onLogout={handleLogout}
      />
    );
  } else if (activePage === "church") {
    page = <StudentChurch student={student} />;
  } else if (activePage === "library") {
    page = <StudentLibrary />;
  } else if (activePage === "programme") {
    page = <StudentProgramme />;
  } else if (activePage === "fees") {
    page = <StudentFees student={student} />;
  } else if (activePage === "transcript") {
    page = <StudentTranscript />;
  } else if (activePage === "assignments") {
    page = <StudentAssignments student={student} />;
  } else if (activePage === "timetable") {
    page = isTimetableDay ? <StudentTimetableDay /> : <StudentTimetable />;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, fontFamily: HOME.fontBody }}>
      <StudentNavbar
        student={student}
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <Suspense fallback={<BrandPageLoader message="Loading…" />}>{page}</Suspense>
    </Box>
  );
}
