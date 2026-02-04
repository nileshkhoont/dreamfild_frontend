import { Box, styled } from "@mui/material";
import { keyframes } from "@mui/system";

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const CustomLoader = styled(Box)(({ theme }) => ({
  width: "50px",
  height: "50px",
  border: "4px solid rgba(0, 70, 246, 0.1)",
  borderRadius: "50%",
  borderTop: "4px solid #0046f6",
  animation: `${spinAnimation} 1s linear infinite`,
}));

export const LoaderContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "85vh",
});
