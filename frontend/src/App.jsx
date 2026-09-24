import {
  Navigate,
  Outlet,
  createBrowserRouter,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "react-toastify";
import PageLoader from "./components/PageLoader";
import AppSplash from "./components/AppSplash";
import HomePage from "./pages/HomePage";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// ─────────────────────────────────────────────
// Lazy-loaded page chunks — each page gets its
// own JS chunk, loaded only when first visited.
// HomePage is imported directly above for instant load on refresh!
// ─────────────────────────────────────────────
const LoginPage        = lazy(() => import("./pages/LoginPage"));
const RegisterPage     = lazy(() => import("./pages/RegisterPage"));
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
// Suspense wrapper — shows light skeleton while chunks load
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
// Behaviour matrix:
//
//  authLoading │ hasSession │ user  │ Action
//  ────────────┼────────────┼───────┼──────────────────────────────────
//     true     │   false    │  null │ Show AppSplash (fresh start)
//     true     │   true     │  null │ Render children optimistically
//     false    │   any      │  obj  │ Render children (auth confirmed)
//     false    │   any      │  null │ Redirect to /login (session ended)
// ─────────────────────────────────────────────
function ProtectedLayout() {
  const { user, authLoading } = useAuth();
  const hasSession = !!sessionStorage.getItem("crowdly_session");

  // Still checking AND no prior session → show branded splash
  if (authLoading && !hasSession) return <AppSplash />;

  // Auth check finished and no user (session expired / invalid) → login
  if (!authLoading && !user) return <Navigate to="/login" replace />;

  // Either optimistic render (session flag, auth still loading)
  // or confirmed auth (authLoading=false, user exists) → show page
  return <Outlet />;
}

// ─────────────────────────────────────────────
// Root redirect — "/" → /home or /login
// ─────────────────────────────────────────────
function RootRedirect() {
  const { user, authLoading } = useAuth();
  const hasSession = !!sessionStorage.getItem("crowdly_session");

  // Still on fresh start and checking → show splash
  if (authLoading && !hasSession) return <AppSplash />;

  // Has session flag → optimistically go to home
  if (hasSession) return <Navigate to="/home" replace />;

  // Auth done → route based on result
  return <Navigate to={user ? "/home" : "/login"} replace />;
}


// ─────────────────────────────────────────────
// Router — flat structure, lazy pages wrapped in Suspense
// No async loaders — all auth handled inside React
// so the page is never blank while a fetch is pending.
// ─────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      // Root: smart redirect based on auth state
      {
        index: true,
        element: (
          <SuspensePage>
            <RootRedirect />
          </SuspensePage>
        ),
      },
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
      // ── Protected routes (auth guarded inside React) ──
      {
        element: <ProtectedLayout />,
        children: [
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
