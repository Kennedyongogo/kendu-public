import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { theme } from "./theme";
import "./App.css";
import React, { useEffect, Suspense, lazy } from "react";
import PublicHeader from "./components/Header/PublicHeader";
import Footer from "./components/Footer/Footer";
import BrandPageLoader from "./components/common/BrandPageLoader";

const Home = lazy(() => import("./pages/Home"));
const Team = lazy(() => import("./pages/Team"));
const MarketplaceLogin = lazy(() => import("./pages/MarketplaceLogin"));
const AdmissionApplication = lazy(() => import("./pages/AdmissionApplication"));
const MeetOurTeam = lazy(() => import("./pages/MeetOurTeam"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const hideHeader = location.pathname === "/login";

  return (
    <>
      <ScrollToTop />
      {!hideHeader && <PublicHeader />}
      <Box component="main" sx={{ flex: 1, width: "100%" }}>
        <Suspense fallback={<BrandPageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/about-us"
              element={
                <>
                  <Team />
                  <Footer />
                </>
              }
            />
            <Route path="/team" element={<Navigate to="/about-us" replace />} />
            <Route
              path="/meet-our-team"
              element={
                <>
                  <MeetOurTeam />
                </>
              }
            />
            <Route path="/login" element={<MarketplaceLogin />} />
            <Route path="/admission/apply" element={<AdmissionApplication />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <CssBaseline />
          <AppLayout />
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
