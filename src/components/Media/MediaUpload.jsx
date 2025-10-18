import React, { useState } from "react";
import { Button, Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useUploadMediaMutation } from "../../features/media/mediaApi";

const MediaUpload = ({ open, onClose, refetch }) => {
  const [file, setFile] = useState(null);
  const [uploadMedia, { isLoading }] = useUploadMediaMutation();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file); // key should match backend expectation
      formData.append("fileName", file.name);
      formData.append("url", "");

      await uploadMedia(formData).unwrap();
      setFile(null);
      if (refetch) refetch();
      if (onClose) onClose();
    } catch (error) {
      alert("Failed to upload media");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload Media</DialogTitle>
      <DialogContent>
        <Button
          variant="contained"
          component="label"
          sx={{ backgroundColor: "#000", color: "#fff", borderRadius: 2, mt: 2 }}
          disabled={isLoading}
        >
          Select File
          <input
            type="file"
            hidden
            onChange={handleFileChange}
            accept="*"
          />
        </Button>
        {file && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Selected: {file.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading ? "Uploading..." : "OK"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaUpload;