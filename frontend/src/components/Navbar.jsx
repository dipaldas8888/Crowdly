import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6">Crowdly</Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h7">{user?.username}</Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
