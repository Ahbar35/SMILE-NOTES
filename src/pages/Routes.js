import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuthContext } from "contexts/AuthContext";
import Header from "../components/Header/Header";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Footer from "components/Footer/Footer";
import Frontend from "./Frontend";
import AllItems from "./Dashboard/All Items/index"

export default function Index() {
  const { isAuthenticated, loading } = useAuthContext(); // Using loading state from auth context
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // Simulate auth check and ensure it's resolved before rendering dashboard
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // Determine if Header and Footer should be shown
  const showHeader = !location.pathname.startsWith("/auth");
  const showFooter = !location.pathname.startsWith("/auth") && !location.pathname.startsWith("/dashboard");

  // Handle rendering when authentication check is incomplete, specifically for the dashboard
  if (location.pathname.startsWith("/dashboard") && !authChecked) {
    return <div className="spinner">Loading Dashboard...</div>; // Spinner only for dashboard pages
  }

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/*" element={isAuthenticated ? <Frontend /> : <Navigate to="/auth/login" />} />
        <Route
          path="auth/*"
          element={!isAuthenticated ? <Auth /> : <Navigate to="/products" />}
        />
     <Route path="/allitems" element={<AllItems />} />
        <Route
          path="/dashboard/*"   
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/auth/login" />
          }
        />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}