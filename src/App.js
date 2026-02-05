import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Scraper from "./pages/Scraper";
import Database from "./pages/Database";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";

// Auth guard
function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    return savedTheme;
  });

  useEffect(() => {
    // Apply theme whenever it changes
    const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const themeToApply = theme === 'system' ? systemPreference : theme;
    document.documentElement.setAttribute('data-theme', themeToApply);
  }, [theme]);

  useEffect(() => {
    // Listen for storage changes (theme changes from other tabs/Settings page)
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setTheme('system'); // trigger re-render
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  return (
    <>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Scraper */}
        <Route
          path="/scraper"
          element={
            <ProtectedRoute>
              <Navbar />
              <Scraper />
            </ProtectedRoute>
          }
        />

        {/* Database */}
        <Route
          path="/database"
          element={
            <ProtectedRoute>
              <Navbar />
              <Database />
            </ProtectedRoute>
          }
        />

        {/* Users / Account */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Navbar />
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Navbar />
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
