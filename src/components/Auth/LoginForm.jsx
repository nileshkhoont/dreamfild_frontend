import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress,
  Fade,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginMutation } from "../../apiService";
import { useAuth } from "../../utils/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import { useAuthImage } from "./AuthImageProvider"; // adjust path as needed

const LoginContainer = styled(Paper)(({ theme }) => ({
  position: "relative",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  padding: theme.spacing(4),
  maxWidth: "450px",
  width: "100%",
  margin: "auto",
  boxShadow: "var(--cardBoxShadow)",
  border: "1px solid rgba(0, 70, 246, 0.1)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "var(--textColor)",
    transition: "all 0.3s ease-in-out",
    minHeight: "40px",
    height: "40px",
    "& input": {
      height: "40px",
      minHeight: "40px",
      boxSizing: "border-box",
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
    },
    "& fieldset": {
      borderWidth: "2px",
      borderColor: "#ced4da",
    },
    "&:hover fieldset": {
      borderColor: "#ced4da",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ced4da",
      borderWidth: 2,
    },
  },
  "& label": {
    color: "var(--textColor)",
  },
  "& label.Mui-focused": {
    color: "var(--borderColor)",
  },
  "& .MuiInputLabel-root": {
    color: "var(--textColor)",
    transition: "none",
  },
  boxShadow: "none",
  outline: "none",
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: "12px 24px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  background: "var(--borderColor)",
  color: "#fff",
  boxShadow: "var(--cardBoxShadow)",
  "&:hover": {
    background: "var(--textColor)",
    color: "#fff",
    boxShadow: "var(--cardBoxShadow)",
  },
}));

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [loginMutation, { isLoading, error }] = useLoginMutation();
  const { login: authLogin } = useAuth();
  const bgImage = useAuthImage();

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        deviceId: "F871D669-3D86-4D93-B883-9BFA87065A64",
      };
      const result = await loginMutation(payload).unwrap();
      // API returns: { statusCode, data: { userData }, message }
      const token = result?.data?.userData?.token;
      if (
        result?.statusCode === 200 &&
        token &&
        result?.message?.toLowerCase().includes("log in successfully")
      ) {
        localStorage.setItem("jwt", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(result.data.userData));
        authLogin(result); // Pass full result to AuthContext for navigation
      } else {
        toast.error(result?.message || "Invalid email or password");
      }
    } catch (err) {
      // If error is an object with data, show message, else fallback
      setErrorMessage(
        err?.data?.message || err?.message || "An unexpected error occurred"
      );
    }
  }

  useEffect(() => {
    if (error) {
      // If error is an object with data, show message, else fallback
      const errorMessage =
        error?.data?.message || error?.message || "An unexpected error occurred";
      setErrorMessage(errorMessage);
    }
  }, [error]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: '100vw',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: '#ffffff',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <ToastContainer />      <Box
        sx={{
          width: '1200px',
          height: '650px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: { xs: 'none', md: 'var(--cardBoxShadow)' },
          borderRadius: { xs: '0px', md: '24px' },
          overflow: 'hidden',
          background: '#ffffff',
          margin: 'auto',
        }}
      >
        {/* Left Side - Image */}
        <Box
          sx={{
            flex: { xs: 0, md: 1.1 },
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            background: `url('${bgImage}') center center/cover no-repeat`,
            height: '100%',
          }}
        >
          {/* Optionally add logo or leave empty */}
        </Box>
        {/* Right Side - Form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            p: { xs: 2, sm: 3, md: 4 },
            height: '100%',
            overflow: 'auto',
          }}
        >
          <LoginContainer
            elevation={0}
            sx={{
              boxShadow: 'none',
              border: 'none',
              background: 'none',
              p: 0,
              width: '100%',
              maxWidth: '400px',
              margin: 0
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ width: '100%' }}>                <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "center", md: "flex-start" },
                  mb: 3,
                  width: '100%',
                  position: 'relative',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "var(--textColor)",
                    mb: 0.5,
                    letterSpacing: 0.2,
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  Welcome,
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textAlign: { xs: "center", md: "left" },
                    mb: 2,
                    opacity: 0.8,
                  }}
                >
                  Please sign in to continue to your dashboard.
                </Typography>
              </Box>

                <Collapse in={!!errorMessage}>
                  <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: "12px" }}
                    onClose={() => setErrorMessage("")}
                  >
                    {errorMessage}
                  </Alert>
                </Collapse>

                <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--textColor)', fontWeight: 500, mb: 0.5, textAlign: 'left' }}>Email</Typography>
                    <StyledTextField
                      fullWidth
                      label=""
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: "var(--borderColor)" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--textColor)', fontWeight: 500, mb: 0.5, textAlign: 'left' }}>Password</Typography>
                    <StyledTextField
                      fullWidth
                      label=""
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: "var(--borderColor)" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              sx={{
                                color: showPassword ? "var(--textColor)" : "var(--borderColor)",
                                transition: "color 0.2s",
                              }}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "var(--borderColor)",
                        fontWeight: 500,
                        cursor: "pointer",
                        textDecoration: "underline",
                        "&:hover": { color: "var(--purpleShadeBg)" }
                      }}
                      component="a"
                      href="/forgot-password"
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                  <AnimatedButton
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    endIcon={
                      isLoading ? (
                        <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                      ) : (
                        <ArrowForward />
                      )
                    }
                    sx={{
                      mt: 1,
                      color: '#ffffff !important',
                      '&:disabled': {
                        color: '#ffffff !important',
                        opacity: 0.8
                      }
                    }}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </AnimatedButton>
                </Box>
              </Box>
            </Fade>
          </LoginContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginForm;
