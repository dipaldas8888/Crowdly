import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box className="home-page">
      <Container maxWidth="lg" className="home-shell">
        <Paper className="home-hero" elevation={0}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack spacing={2}>
              <Chip label="Protected Route" color="secondary" />
              <Typography variant="h3">Home page unlocked</Typography>
              <Typography className="muted-text home-copy">
                You are signed in and viewing a route protected by the data
                router and auth context. This is the right place to grow your
                feed next.
              </Typography>
            </Stack>

            <Paper className="profile-card" elevation={0}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar className="profile-avatar">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {user?.username || "Crowdly User"}
                  </Typography>
                  <Typography className="muted-text">{user?.email}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Paper>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          className="home-grid"
        >
          <Paper className="info-card" elevation={0}>
            <Typography variant="h5">Routing setup</Typography>
            <Typography className="muted-text">
              `createBrowserRouter` and `RouterProvider` are driving navigation,
              with `/home` guarded so unauthenticated users are redirected.
            </Typography>
          </Paper>

          <Paper className="info-card" elevation={0}>
            <Typography variant="h5">Auth state</Typography>
            <Typography className="muted-text">
              Context API stores the signed-in user and persists it in
              `localStorage` for a smoother refresh experience.
            </Typography>
          </Paper>

          <Paper className="info-card accent-card" elevation={0}>
            <Typography variant="h5">Next step</Typography>
            <Typography className="muted-text">
              Connect this page to your posts API to create, list, like, and
              comment from the UI.
            </Typography>
          </Paper>
        </Stack>

        <Button variant="contained" size="large" onClick={handleLogout}>
          Logout
        </Button>
      </Container>
    </Box>
  );
}
