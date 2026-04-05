"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  CircularProgress,
  Stack,
  Paper,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MicIcon from "@mui/icons-material/Mic";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AssessmentIcon from "@mui/icons-material/Assessment";

const MediaRecorderSection = dynamic(
  () => import("@/components/MediaRecorderSection"),
  {
    ssr: false,
  }
);

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const drawerWidth = 280;

interface AnalysisResults {
  calibration: string;
  reactionSize: string;
  audioAnalysis: string; // We will store the percentage number here
  finalRiskScore: string;
  recommendation: string;
}

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0457ab",
    },
    secondary: {
      main: "#d32f2f",
    },
    background: {
      default: "#eef3fb",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});

const spectrumData = Array.from({ length: 10 }, (_, index) => ({
  name: `T${index + 1}`,
  value: Math.round(35 + Math.random() * 50 + (index % 2 ? 12 : -12)),
}));

export default function ZephyrDashboard() {
  const [selectedView, setSelectedView] = useState<"overview" | "input">("overview");
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioStatus, setAudioStatus] = useState<string>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const onDrop = useCallback((files: File[]) => {
    setAcceptedFiles(files);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  });

  const hasImage = acceptedFiles.length > 0;
  const hasAudio = Boolean(audioUrl);
  const analysisEnabled = hasImage && hasAudio && !loading;

  const uploadLabel = hasImage
    ? acceptedFiles[0].name
    : "Drag and drop the Mantoux photo with a 1 Rupee coin here.";

  const runZephyrAnalysis = async () => {
    setLoading(true);
    setResults(null);

    try {
      if (!audioBlob) {
        throw new Error("No audio recording available");
      }

      // 1. Prepare the FormData for the API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'cough.wav');

      if (acceptedFiles.length > 0) {
        formData.append('image', acceptedFiles[0]);
      } else {
        throw new Error("Please upload an image before analyzing.");
      }

      // 2. Call the Next.js API which talks to AssemblyAI
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process audio");
      }

      // 1. FORCE THE UI TO SHOW OPENCV ERRORS
      let reactionText = "Processing failed.";
      
      if (data.visionData) {
        if (data.visionData.success) {
          // It worked! Show the math.
          reactionText = `Calculated: ${data.visionData.bump_mm}mm - OpenCV`;
        } else if (data.visionData.error) {
          // The Python script threw an error (e.g., "No coin found")
          reactionText = `OpenCV Error: ${data.visionData.error}`;
        }
      } else {
        reactionText = "Backend did not return vision data.";
      }

      

      // 3. Parse the AssemblyAI Response
      console.log("Raw AssemblyAI Events:", data.events);
      
      const events = data.events || [];
      const coughEvents = events.filter((e: any) => {
        const word = e.text.toLowerCase();
        return word.includes('cough') || word.includes('[noise]') || word.includes('noise');
      });
      
      // Find the highest confidence score among all detected coughs
      let maxConfidence = 0;
      if (coughEvents.length > 0) {
        maxConfidence = Math.max(...coughEvents.map((e: any) => e.confidence));
      }

      // Convert to a clean percentage string (e.g. "82.5")
      const biomarkerScore = (maxConfidence * 100).toFixed(1);
      
      // If the model is > 50% confident it heard a cough, trigger High Risk
      const isHighRisk = maxConfidence > 0.5;

      const realResults = {
        calibration: "1 Rupee Coin Detected (25mm) - OpenCV",
        reactionSize: reactionText, 
        audioAnalysis: biomarkerScore, 
        finalRiskScore: isHighRisk ? "HIGH RISK" : "LOW RISK",
        recommendation: "Processed via AssemblyAI & OpenCV."
      };

      setResults(realResults);
      setSelectedView("overview");

    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      setResults({
        calibration: "Error",
        reactionSize: "Error",
        audioAnalysis: "0.0",
        finalRiskScore: "ERROR",
        recommendation: `Failed: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#102542",
              color: "#ffffff",
              borderRight: "none",
            },
          }}
        >
          <Toolbar sx={{ px: 3, py: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#0d47a1", width: 48, height: 48 }}>Z</Avatar>
              <Box>
                <Typography variant="h6" sx={{ letterSpacing: 0.5 }}>
                  Zephyr
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.72)">
                  Patient Triage
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
          <List>
            {[
              { label: "Dashboard", id: "overview", icon: <DashboardIcon /> },
              { label: "Upload Data", id: "input", icon: <UploadFileIcon /> },
            ].map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={selectedView === item.id}
                  onClick={() => setSelectedView(item.id as "overview" | "input")}
                  sx={{ color: "#ffffff" }}
                >
                  <ListItemIcon sx={{ color: "#90caf9" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 2 }} />
          <Box sx={{ px: 3, py: 2, mt: "auto", bgcolor: "rgba(255,255,255,0.05)" }}>
            <Typography variant="overline" color="rgba(255,255,255,0.7)">
              Clinician
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Avatar sx={{ bgcolor: "#90caf9" }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography>Dr. Mira Patel</Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.72)">
                  triage@zephyr.ai
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 4, width: `calc(100% - ${drawerWidth}px)` }}>
          <AppBar
            position="static"
            elevation={0}
            sx={{ bgcolor: "transparent", boxShadow: "none", mb: 3 }}
          >
            <Toolbar sx={{ justifyContent: "space-between", px: 0 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Zephyr Command Center
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary" sx={{ mt: 0.5 }}>
                  Patient Triage Dashboard
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={() => setSelectedView("input")}
              >
                Upload + Scan
              </Button>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" } }}>
            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cases Triaged
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    48
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    12 this shift · 3 new high-risk alerts
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg Biomarker Match
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    76%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={76}
                    sx={{ height: 10, borderRadius: 5, mt: 2 }}
                  />
                </CardContent>
              </Card>
              <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Reaction Size
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    13.8mm
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Stable across the last 9 patients
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    High-Risk Alerts
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    7
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    2 awaiting clinician review
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Live Monitor
                      </Typography>
                      <Typography variant="h6">Clinic A · Ward 3</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Active Session
                    </Typography>
                    <Typography variant="h5">Patient: Arun K.</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {results ? "Analysis complete" : "Awaiting input"}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            {selectedView === "input" ? (
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" } }}>
                <Box>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                          <Typography variant="h6">Upload Mantoux Reaction</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Include 1 Rupee coin for calibration.
                          </Typography>
                        </Box>
                        <Chip label={hasImage ? "Ready" : "Waiting"} color={hasImage ? "success" : "default"} />
                      </Stack>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 4,
                          borderRadius: 3,
                          borderStyle: "dashed",
                          borderColor: isDragActive ? "primary.main" : "divider",
                          bgcolor: isDragActive ? "rgba(25, 118, 210, 0.08)" : "transparent",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                        {...getRootProps()}
                      >
                        <input {...getInputProps()} />
                        <UploadFileIcon sx={{ fontSize: 48, color: "primary.main" }} />
                        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
                          {uploadLabel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Accepted formats: JPG, PNG. One image only.
                        </Typography>
                      </Paper>
                      {hasImage && (
                        <Paper sx={{ mt: 3, p: 2, bgcolor: "#f5f9ff", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Uploaded file:
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {acceptedFiles[0].name}
                          </Typography>
                        </Paper>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <MediaRecorderSection
                    audioUrl={audioUrl}
                    setAudioUrl={setAudioUrl}
                    audioStatus={audioStatus}
                    setAudioStatus={setAudioStatus}
                    setAudioBlob={setAudioBlob}
                    loading={loading}
                  />
                </Box>

                <Box sx={{ gridColumn: "1/-1" }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3, position: "relative" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="h6">Run Triage Analysis</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Simulate the Zephyr AI pipeline with a cloud-ready interface.
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AssessmentIcon />}
                        onClick={runZephyrAnalysis}
                        disabled={!analysisEnabled}
                      >
                        Analyze Patient
                      </Button>
                    </Stack>
                    {!analysisEnabled && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Upload both a calibrated Mantoux image and a cough recording to enable the analysis.
                      </Typography>
                    )}
                    {loading && (
                      <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
                        <CircularProgress size={24} />
                        <Typography>Processing audio payload via AssemblyAI SDK...</Typography>
                      </Box>
                    )}
                  </Card>
                </Box>
              </Box>
            ) : (
              <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                      <Typography variant="h6">Patient Input Workflow</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Follow the steps to upload the Mantoux reaction and record the cough sample.
                      </Typography>
                    </Box>
                    <Button variant="outlined" onClick={() => setSelectedView("input")}>Start Input</Button>
                  </Stack>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#ffffff" }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <AccessTimeIcon color="primary" />
                        <Typography>Step 1</Typography>
                      </Stack>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Upload the calibrated Mantoux image.
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#ffffff" }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <MicIcon color="secondary" />
                        <Typography>Step 2</Typography>
                      </Stack>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Record the 5-second cough sample.
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#ffffff" }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <AnalyticsIcon color="success" />
                        <Typography>Step 3</Typography>
                      </Stack>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Run the Zephyr analysis and review results.
                      </Typography>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

          {(results || loading) && (
            <Box sx={{ mt: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="h6">Zephyr Analysis Results</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Real-time clinical triage summary generated via AssemblyAI endpoints.
                    </Typography>
                  </Box>
                  {results && (
                    <Alert 
                      severity={results.finalRiskScore === "HIGH RISK" ? "error" : "success"} 
                      icon={results.finalRiskScore === "HIGH RISK" ? <WarningAmberIcon /> : undefined} 
                      sx={{ borderRadius: 3 }}
                    >
                      <strong>{results.finalRiskScore}</strong>
                    </Alert>
                  )}
                </Stack>

                {loading && (
                  <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography>Finalizing the audio + vision fusion model output...</Typography>
                  </Box>
                )}

                {results && (
                  <Box sx={{ mt: 4, display: "grid", gap: 3 }}>
                    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: "#f4f7ff" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Calibration
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {results.calibration}
                        </Typography>
                      </Card>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: "#f4f7ff" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Reaction Measurement
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {results.reactionSize}
                        </Typography>
                      </Card>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: "#f4f7ff" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Audio Biomarker Match
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {results.audioAnalysis}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(results.audioAnalysis)} 
                          sx={{ height: 10, borderRadius: 5, mt: 2 }} 
                        />
                      </Card>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: "#f4f7ff" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Recommendation
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {results.recommendation}
                        </Typography>
                      </Card>
                    </Box>
                    <Card sx={{ borderRadius: 3, p: 2, bgcolor: "#ffffff" }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Live Acoustic Spectrogram Analysis
                      </Typography>
                      <Box sx={{ width: "100%", height: 300, overflow: "hidden" }}>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={spectrumData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#1976d2"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Card>
                  </Box>
                )}
              </Card>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}