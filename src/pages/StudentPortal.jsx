import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import StudentNavbar from "../components/StudentPortal/StudentNavbar";
import StudentHome from "../components/StudentPortal/StudentHome";
import StudentSettings from "../components/StudentPortal/StudentSettings";
import StudentFees from "../components/StudentPortal/StudentFees";
import StudentTimetable from "../components/StudentPortal/StudentTimetable";
import StudentTimetableDay from "../components/StudentPortal/StudentTimetableDay";
import { HOME, readStoredStudent } from "../components/StudentPortal/studentPortalShared";

export default function StudentPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(() => readStoredStudent());
  const isTimetableDay = location.pathname.includes("/timetable/day/");
  const activePage = location.pathname.endsWith("/settings")
    ? "settings"
    : location.pathname.endsWith("/fees")
      ? "fees"
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, fontFamily: HOME.fontBody }}>
      <StudentNavbar
        student={student}
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {activePage === "settings" ? (
        <StudentSettings
          student={student}
          onStudentUpdate={handleStudentUpdate}
          onLogout={handleLogout}
        />
      ) : activePage === "fees" ? (
        <StudentFees student={student} />
      ) : activePage === "timetable" ? (
        isTimetableDay ? <StudentTimetableDay /> : <StudentTimetable />
      ) : (
        <StudentHome student={student} />
      )}
    </Box>
  );
}
