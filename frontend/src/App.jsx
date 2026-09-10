import {
  Navigate,
  Outlet,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "react-toastify";
import { apiRequest } from "./lib/api";
import PageLoader from "./components/PageLoader";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// ─────────────────────────────────────────────
// Lazy-loaded page chunks — each page gets its
// own JS chunk, loaded only when first visited.
// ─────────────────────────────────────────────
const LoginPage        = lazy(() => import("./pages/LoginPage"));
const RegisterPage     = lazy(() => import("./pages/RegisterPage"));
const HomePage         = lazy(() => import("./pages/HomePage"));
const FriendsPage      = lazy(() => import("./pages/FriendsPage"));
const GroupsPage       = lazy(() => import("./pages/GroupsPage"));
const GroupDetailPage  = lazy(() => import("./pages/GroupDetailPage"));
const ProfilePage      = lazy(() => import("./pages/ProfilePage"));
const MessagesPage     = lazy(() => import("./pages/MessagesPage"));
const WatchPage        = lazy(() => import("./pages/WatchPage"));
const SettingsPage     = lazy(() => import("./pages/SettingsPage"));
const SavedPage        = lazy(() => import("./pages/SavedPage"));

// ─────────────────────────────────────────────
// MUI Theme — light, branded palette
// ─────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6feb" },
    secondary: { main: "#f97316" },
    background: { default: "#f4f7fb", paper: "#ffffff" },
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

// ─────────────────────────────────────────────
// Auth loader — redirects to /login if no session
// ─────────────────────────────────────────────
const requireAuth = async () => {
  try {
    await apiRequest("/auth/me");
    return null;
  } catch {
    throw redirect("/login");
  }
};

// ─────────────────────────────────────────────
// Suspense wrapper — shows skeleton while chunks load
// ─────────────────────────────────────────────
function SuspensePage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ─────────────────────────────────────────────
// Root shell — provides global context + theme
// ─────────────────────────────────────────────
function AppShell() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Outlet />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="light"
              limit={3}
            />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────
// Protected layout — guards all auth-required routes
// ─────────────────────────────────────────────
function ProtectedLayout() {
  const { user, authLoading } = useAuth();
  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ─────────────────────────────────────────────
// Router — flat structure, lazy pages wrapped in Suspense
// ─────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        path: "register",
        element: (
          <SuspensePage>
            <RegisterPage />
          </SuspensePage>
        ),
      },
      {
        path: "login",
        element: (
          <SuspensePage>
            <LoginPage />
          </SuspensePage>
        ),
      },
      {
        element: <ProtectedLayout />,
        loader: requireAuth,
        children: [
          {
            index: true,
            element: (
              <SuspensePage>
                <HomePage />
              </SuspensePage>
            ),
          },
          {
            path: "home",
            element: (
              <SuspensePage>
                <HomePage />
              </SuspensePage>
            ),
          },
          {
            path: "friends",
            element: (
              <SuspensePage>
                <FriendsPage />
              </SuspensePage>
            ),
          },
          {
            path: "groups",
            element: (
              <SuspensePage>
                <GroupsPage />
              </SuspensePage>
            ),
          },
          {
            path: "groups/:id",
            element: (
              <SuspensePage>
                <GroupDetailPage />
              </SuspensePage>
            ),
          },
          {
            path: "profile",
            element: (
              <SuspensePage>
                <ProfilePage />
              </SuspensePage>
            ),
          },
          {
            path: "profile/:id",
            element: (
              <SuspensePage>
                <ProfilePage />
              </SuspensePage>
            ),
          },
          {
            path: "messages",
            element: (
              <SuspensePage>
                <MessagesPage />
              </SuspensePage>
            ),
          },
          {
            path: "watch",
            element: (
              <SuspensePage>
                <WatchPage />
              </SuspensePage>
            ),
          },
          {
            path: "settings",
            element: (
              <SuspensePage>
                <SettingsPage />
              </SuspensePage>
            ),
          },
          {
            path: "saved",
            element: (
              <SuspensePage>
                <SavedPage />
              </SuspensePage>
            ),
          },
        ],
      },
    ],
  },
]);
