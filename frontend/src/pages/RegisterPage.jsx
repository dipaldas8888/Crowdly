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
  username: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const { register, authLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register(formData);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box className="auth-page auth-page-register">
      <Paper className="auth-card" elevation={1}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" className="eyebrow">
              Join the network
            </Typography>
            <Typography variant="h4">Create your Crowdly account</Typography>
            <Typography className="muted-text">
              Start posting, reacting, and building your space with a clean
              authenticated flow.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit} className="auth-form">
            <Stack spacing={2}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
              />
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
                helperText="Use at least 6 characters."
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={authLoading}
              >
                {authLoading ? "Creating account..." : "Register"}
              </Button>
            </Stack>
          </Box>

          <Typography className="switch-text">
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
