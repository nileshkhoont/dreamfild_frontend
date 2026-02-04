import React from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// Props: previewOpen (bool), setPreviewOpen (func), previewSrc (string)
const PreviewImg = ({ previewOpen, setPreviewOpen, previewSrc }) => {
  return (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
          overflow: "visible",
          p: 0,
          m: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(20, 20, 30, 0.85)",
          backdropFilter: "blur(2px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100vw",
          height: "100vh",
          outline: "none",
        }}
      >
        <IconButton
          onClick={() => setPreviewOpen(false)}
          sx={{
            position: "absolute",
            top: 32,
            right: 48,
            color: "#fff",
            background: "rgba(0,0,0,0.25)",
            zIndex: 100,
            "&:hover": { background: "rgba(0,0,0,0.45)" },
          }}
          size="large"
        >
          <CloseIcon sx={{ fontSize: 32 }} />
        </IconButton>
        {previewSrc.endsWith(".pdf") ? (
          <iframe
            src={previewSrc}
            title="PDF Preview"
            style={{
              width: "90vw",
              height: "80vh",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              background: "#fff",
              border: "none",
            }}
          />
        ) : (
          <img
            src={previewSrc}
            alt=""
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              background: "#fff",
              objectFit: "contain",
            }}
          />
        )}
      </Box>
    </Dialog>
  );
};

export default PreviewImg;