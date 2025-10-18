import React from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Paper,
  Container,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSignupMutation } from "../../apiService";

const SignupForm = () => {
  const [errorState, setErrorState] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
    },
  });

  const navigate = useNavigate();
  const [signup, { isLoading, isSuccess, isError }] = useSignupMutation();
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const result = await signup(data).unwrap();
      if (result.status === "success") {
        navigate("/");
      }
    } catch (error) {

      let errorMessage = "An unexpected error occurred";
      if (error?.data?.message) {
        if (error.data.message.includes("email")) {
          errorMessage =
            "This email is already registered. Please use a different email.";
        } else if (error.data.message.includes("username")) {
          errorMessage =
            "This username is already taken. Please choose a different username.";
        } else {
          errorMessage = error.data.message;
        }
      }
      setErrorState(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={6}
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 2,
          background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          noValidate
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              backgroundClip: "text",
              textFillColor: "transparent",
              mb: 4,
            }}
          >
            Create Account
          </Typography>

          {/* Name Field */}
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="primary" />
                </InputAdornment>
              ),
            }}
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            error={!!errors.name}
            helperText={errors.name ? errors.name.message : ""}
          />

          {/* Email Field */}
          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="primary" />
                </InputAdornment>
              ),
            }}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address",
              },
            })}
            error={!!errors.email}
            helperText={errors.email ? errors.email.message : ""}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            autoComplete="new-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              pattern: {
                value:
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/,
                message:
                  "Password must contain letters, numbers, and special symbols",
              },
            })}
            error={!!errors.password}
            helperText={errors.password ? errors.password.message : ""}
          />

          {/* Confirm Password Field */}
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            margin="normal"
            autoComplete="new-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register("confirmPassword", {
              required: "Confirm Password is required",
              validate: (value) =>
                value === password ||
                "Password & Confirm Password do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={
              errors.confirmPassword ? errors.confirmPassword.message : ""
            }
          />

          {/* Gender Selection */}
          <FormControl
            component="fieldset"
            margin="normal"
            fullWidth
            error={!!errors.gender}
          >
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              row
              aria-label="gender"
              sx={{
                justifyContent: "center",
                "& .MuiFormControlLabel-root": {
                  margin: 2,
                },
              }}
            >
              <FormControlLabel
                value="Male"
                control={
                  <Radio
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: 28,
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountCircle />
                    <Typography>Male</Typography>
                  </Box>
                }
                {...register("gender", {
                  required: "Please select a gender",
                })}
              />
              <FormControlLabel
                value="Female"
                control={
                  <Radio
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: 28,
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountCircle />
                    <Typography>Female</Typography>
                  </Box>
                }
                {...register("gender", {
                  required: "Please select a gender",
                })}
              />
            </RadioGroup>
            {errors.gender && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {errors.gender.message}
              </Typography>
            )}
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              height: 48,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #1CA7D3 90%)",
              },
            }}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>

          {/* Error and Success Messages */}
          {isError && errorState && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {errorState}
            </Alert>
          )}
          {isSuccess && (
            <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
              Account created successfully!
            </Alert>
          )}

          <Divider sx={{ width: "100%", my: 3 }} />

          {/* Login Link */}
          <Typography variant="body2" color="text.secondary" align="center">
            Already have an account?{" "}
            <Button
              color="primary"
              onClick={() => navigate("/")}
              sx={{ textTransform: "none" }}
            >
              Sign in here
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupForm;
