import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const initialFormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const { login, authLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(formData);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box className="auth-page auth-page-login">
      <Paper className="auth-card" elevation={1}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" className="eyebrow">
              Welcome back
            </Typography>
            <Typography variant="h4">Sign in to Crowdly</Typography>
            <Typography className="muted-text">
              Access your feed, connect with your community, and keep the
              conversation moving.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit} className="auth-form">
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={authLoading}
              >
                {authLoading ? "Signing in..." : "Login"}
              </Button>
            </Stack>
          </Box>

          <Typography className="switch-text">
            New here?{" "}
            <Link component={RouterLink} to="/register" underline="hover">
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
