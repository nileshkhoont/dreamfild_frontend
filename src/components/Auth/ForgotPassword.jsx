import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Paper,
  Fade,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Email, Lock, ArrowForward } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../../apiService";
import { useAuthImage } from "./AuthImageProvider";


const ForgotContainer = styled(Paper)(({ theme }) => ({
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

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [forgotPassword, { isLoading: isRequesting }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const bgImage = useAuthImage();

  // Get token from URL
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await forgotPassword({ email }).unwrap();
      setSuccessMessage(res?.message || "Password reset link sent to your email.");
    } catch (err) {
      setErrorMessage(
        err?.data?.message ||
        err?.error ||
        "Failed to send reset link. Please try again."
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await resetPassword({ token, newPassword }).unwrap();
      setSuccessMessage(res?.message || "Password has been reset successfully!");
      if (res?.success && res?.statusCode === 200) {
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(
        err?.data?.message ||
        err?.error ||
        "Failed to reset password. Please try again."
      );
    }
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
      <Box
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
          <ForgotContainer
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
              <Box sx={{ width: '100%' }}>
                <Box
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
                    {token ? "Reset your password" : "Forgot your password?"}
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
                    {token
                      ? "Enter your new password below."
                      : "Enter your email address to receive a password reset link."}
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
                <Collapse in={!!successMessage}>
                  <Alert
                    severity="success"
                    sx={{ mb: 2, borderRadius: "12px" }}
                    onClose={() => setSuccessMessage("")}
                  >
                    {successMessage}
                  </Alert>
                </Collapse>

                <Box
                  component="form"
                  onSubmit={token ? handleResetPassword : handleRequestReset}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {!token ? (
                    <>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: 'var(--textColor)', fontWeight: 500, mb: 0.5, textAlign: 'left' }}>Email</Typography>
                        <StyledTextField
                          fullWidth
                          label=""
                          placeholder="Enter your email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ color: "var(--borderColor)" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                          required
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: 'var(--textColor)', fontWeight: 500, mb: 0.5, textAlign: 'left' }}>New Password</Typography>
                        <StyledTextField
                          fullWidth
                          label=""
                          placeholder="Enter new password"
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock sx={{ color: "var(--borderColor)" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                          required
                        />
                      </Box>
                    </>
                  )}
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
                      href="/"
                    >
                      Back to Login
                    </Typography>
                  </Box>
                  <AnimatedButton
                    type="submit"
                    fullWidth
                    endIcon={<ArrowForward />}
                    disabled={isRequesting || isResetting}
                    sx={{
                      mt: 1,
                      color: '#ffffff !important',
                      '&:disabled': {
                        color: '#ffffff !important',
                        opacity: 0.8
                      }
                    }}
                  >
                    {token ? "Reset Password" : "Send Reset Link"}
                  </AnimatedButton>
                </Box>
              </Box>
            </Fade>
          </ForgotContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default ForgotPassword;