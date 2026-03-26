import {
  Navigate,
  Outlet,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { apiRequest } from "./lib/api";
import "./App.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6feb" },
    secondary: { main: "#f97316" },
    background: {
      default: "#f4f7fb",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
});

const requireAuth = async () => {
  try {
    await apiRequest("/auth/me");
    return null;
  } catch {
    throw redirect("/login");
  }
};

function AppShell() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ThemeProvider>
  );
}

function ProtectedLayout() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        element: <ProtectedLayout />,
        loader: requireAuth,
        children: [
          {
            path: "home",
            element: <HomePage />,
          },
        ],
      },
    ],
  },
]);
