"use client";

import React, { useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

interface MediaRecorderSectionProps {
  audioUrl: string;
  setAudioUrl: (url: string) => void;
  audioStatus: string;
  setAudioStatus: (status: string) => void;
  setAudioBlob: (blob: Blob | null) => void;
  loading: boolean;
}

export default function MediaRecorderSection({
  audioUrl,
  setAudioUrl,
  audioStatus,
  setAudioStatus,
  setAudioBlob,
  loading,
}: MediaRecorderSectionProps) {
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    askPermissionOnMount: false,
    onStop: async (blobUrl) => {
      if (blobUrl) {
        setAudioUrl(blobUrl);
        
        // Convert Blob URL to actual Blob for API submission
        try {
          const response = await fetch(blobUrl);
          const blob = await response.blob();
          setAudioBlob(blob);
        } catch (error) {
          console.error("Failed to convert audio blob:", error);
        }
      }
    },
  });

  useEffect(() => {
    setAudioStatus(status);
  }, [status, setAudioStatus]);

  const hasAudio = Boolean(audioUrl || mediaBlobUrl);
  const playbackUrl = audioUrl || mediaBlobUrl || "";

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Record 5-Second Cough Sample</Typography>
            <Typography variant="body2" color="text.secondary">
              Capture audio directly from the browser.
            </Typography>
          </Box>
          <Chip label={hasAudio ? "Recorded" : "Ready"} color={hasAudio ? "success" : "default"} />
        </Stack>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Recording status: <strong>{audioStatus}</strong>
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={startRecording}
              disabled={status === "recording" || loading}
            >
              Start
            </Button>
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              onClick={stopRecording}
              disabled={status !== "recording" || loading}
            >
              Stop
            </Button>
          </Stack>
          {hasAudio && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2">Playback</Typography>
              <audio src={playbackUrl} controls style={{ width: "100%" }} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
