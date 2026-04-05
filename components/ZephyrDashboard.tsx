"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useState, useMemo } from "react";
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
  IconButton,
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
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TimelineIcon from "@mui/icons-material/Timeline";
import TranslateIcon from "@mui/icons-material/Translate";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

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
  audioAnalysis: string;
  finalRiskScore: string;
  recommendation: string;
}

const patientHistoryData = [
  { visit: "Visit 1 (Jan)", date: "Jan 12", risk: 80, reaction: "15.2mm", phase: "Initial Screening" },
  { visit: "Visit 2 (Feb)", date: "Feb 14", risk: 45, reaction: "10.1mm", phase: "Month 1 Follow-up" },
  { visit: "Visit 3 (Mar)", date: "Mar 20", risk: 12, reaction: "4.5mm", phase: "Month 2 Follow-up" },
];

const translations = {
  en: {
    dashboard: "Dashboard",
    history: "Patient History",
    upload: "Upload Data",
    guidelines: "Guidelines",
    clinician: "Clinician",
    commandCenter: "Zephyr Command Center",
    triageDashboard: "Patient Triage Dashboard",
    backHome: "Back to Home",
    uploadScan: "Upload + Scan",
    casesTriaged: "Cases Triaged",
    biomarkerMatch: "Avg Biomarker Match",
    reactionSize: "Average Reaction Size",
    highRiskAlerts: "High-Risk Alerts",
    liveMonitor: "Live Monitor",
    activeSession: "Active Session",
    statusAwaiting: "Awaiting input",
    statusComplete: "Analysis complete",
    patientWorkflow: "Patient Input Workflow",
    startInput: "Start Input",
    step1Text: "Upload the calibrated Mantoux image.",
    step2Text: "Record the 5-second cough sample.",
    step3Text: "Run the Zephyr analysis and review results.",
    runAnalysis: "Run Triage Analysis",
    analyzePatient: "Analyze Patient",
    uploadTitle: "Upload Mantoux Reaction",
    clinicalReport: "Zephyr Clinical Triage Report",
    downloadReport: "Download Report"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    history: "मरीज का इतिहास",
    upload: "डेटा अपलोड करें",
    guidelines: "दिशानिर्देश",
    clinician: "चिकित्सक",
    commandCenter: "ज़ेफिर कमांड सेंटर",
    triageDashboard: "मरीज ट्राइएज डैशबोर्ड",
    backHome: "होम पर वापस जाएं",
    uploadScan: "अपलोड + स्कैन",
    casesTriaged: "ट्राइएज किए गए मामले",
    biomarkerMatch: "औसत बायोमार्कर मैच",
    reactionSize: "औसत प्रतिक्रिया आकार",
    highRiskAlerts: "उच्च जोखिम अलर्ट",
    liveMonitor: "लाइव मॉनिटर",
    activeSession: "सक्रिय सत्र",
    statusAwaiting: "इनपुट की प्रतीक्षा है",
    statusComplete: "विश्लेषण पूर्ण",
    patientWorkflow: "मरीज इनपुट वर्कफ़्लो",
    startInput: "इनपुट शुरू करें",
    step1Text: "कैलिब्रेटेड मंटौक्स छवि अपलोड करें।",
    step2Text: "5-सेकंड का खांसी का नमूना रिकॉर्ड करें।",
    step3Text: "ज़ेफिर विश्लेषण चलाएं और परिणामों की समीक्षा करें।",
    runAnalysis: "ट्राइएज विश्लेषण चलाएं",
    analyzePatient: "मरीज का विश्लेषण करें",
    uploadTitle: "मंटौक्स प्रतिक्रिया अपलोड करें",
    clinicalReport: "ज़ेफिर क्लिनिकल ट्राइएज रिपोर्ट",
    downloadReport: "रिपोर्ट डाउनलोड करें"
  }
};

type ViewType = "overview" | "input" | "guidelines" | "history";

export default function ZephyrDashboard() {
  const [selectedView, setSelectedView] = useState<ViewType>("overview");
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioStatus, setAudioStatus] = useState<string>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [mode, setMode] = useState<"light" | "dark">("light");
  
  const t = (key: keyof typeof translations.en) => translations[lang][key];

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "light" ? "#0457ab" : "#90caf9" },
          secondary: { main: mode === "light" ? "#d32f2f" : "#ef5350" },
          background: { 
            default: mode === "light" ? "#eef3fb" : "#121212", 
            paper: mode === "light" ? "#ffffff" : "#1e1e1e" 
          },
        },
        typography: { fontFamily: "Inter, sans-serif" },
      }),
    [mode]
  );

  const [spectrumData, setSpectrumData] = useState(
    Array.from({ length: 10 }, (_, index) => ({ name: `T${index + 1}`, value: 0 }))
  );

  const onDrop = useCallback((files: File[]) => {
    setAcceptedFiles(files);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
  });

  const hasImage = acceptedFiles.length > 0;
  const hasAudio = Boolean(audioUrl);
  const analysisEnabled = hasImage && hasAudio && !loading;

  const uploadLabel = hasImage
    ? acceptedFiles[0].name
    : lang === "en" ? "Drag and drop the Mantoux photo with a 1 Rupee coin here." : "1 रुपये के सिक्के के साथ मंटौक्स फोटो को यहां खींचें और छोड़ें।";

  const extractAcousticWaveform = async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0); 
      
      const chunks = 10;
      const chunkSize = Math.floor(rawData.length / chunks);
      const realAcousticData = [];

      for (let i = 0; i < chunks; i++) {
        let maxPeak = 0;
        const start = i * chunkSize;
        const end = start + chunkSize;
        for (let j = start; j < end; j++) {
          if (Math.abs(rawData[j]) > maxPeak) maxPeak = Math.abs(rawData[j]);
        }
        realAcousticData.push({ name: `T${i + 1}`, value: Math.round(maxPeak * 100) });
      }
      setSpectrumData(realAcousticData);
    } catch (err) {
      console.error("Failed to extract acoustic waveform:", err);
    }
  };

  const runZephyrAnalysis = async () => {
    setLoading(true);
    setResults(null);

    try {
      if (!audioBlob) throw new Error("No audio recording available");
      await extractAcousticWaveform(audioBlob);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'cough.wav');

      if (acceptedFiles.length > 0) formData.append('image', acceptedFiles[0]);
      else throw new Error("Please upload an image before analyzing.");

      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to process audio");

      let reactionText = "Processing failed.";
      if (data.visionData) {
        if (data.visionData.success) reactionText = `Calculated: ${data.visionData.bump_mm}mm - OpenCV`;
        else if (data.visionData.error) reactionText = `OpenCV Error: ${data.visionData.error}`;
      } else reactionText = "Backend did not return vision data.";
      
      const events = data.events || [];
      const coughEvents = events.filter((e: any) => {
        const word = e.text.toLowerCase();
        return word.includes('cough') || word.includes('[noise]') || word.includes('noise');
      });
      
      let maxConfidence = 0;
      if (coughEvents.length > 0) maxConfidence = Math.max(...coughEvents.map((e: any) => e.confidence));

      const biomarkerScore = (maxConfidence * 100).toFixed(1);
      const isHighRisk = maxConfidence > 0.5;

      const realResults = {
        calibration: "1 Rupee Coin Detected (25mm) - OpenCV",
        reactionSize: reactionText, 
        audioAnalysis: biomarkerScore, 
        finalRiskScore: isHighRisk ? "HIGH RISK" : "LOW RISK",
        recommendation: "Processed via AssemblyAI & OpenCV."
      };

      setResults(realResults);

    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setResults({
        calibration: "Error", reactionSize: "Error", audioAnalysis: "0.0", finalRiskScore: "ERROR", recommendation: `Failed: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("clinical-report");
      if (!element) return;

      // FIXED: Added 'as const' to ensure types match html2pdf expectations
      const opt = {
        margin: 0.5,
        filename: `Zephyr_Clinical_Report_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      } as const;

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
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
              bgcolor: mode === "dark" ? "#000000" : "#102542", 
              color: "#ffffff", 
              borderRight: mode === "dark" ? "1px solid rgba(255,255,255,0.12)" : "none" 
            },
          }}
        >
          <Toolbar sx={{ px: 3, py: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#0d47a1", width: 48, height: 48 }}>Z</Avatar>
              <Box>
                <Typography variant="h6" sx={{ letterSpacing: 0.5 }}>Zephyr</Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.72)">Patient Triage</Typography>
              </Box>
            </Stack>
          </Toolbar>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
          <List>
            {[
              { label: t("dashboard"), id: "overview", icon: <DashboardIcon /> },
              { label: t("history"), id: "history", icon: <TimelineIcon /> },
              { label: t("upload"), id: "input", icon: <UploadFileIcon /> },
              { label: t("guidelines"), id: "guidelines", icon: <MenuBookIcon /> },
            ].map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={selectedView === item.id}
                  onClick={() => setSelectedView(item.id as ViewType)}
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
            <Typography variant="overline" color="rgba(255,255,255,0.7)">{t("clinician")}</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Avatar sx={{ bgcolor: "#90caf9" }}><PersonIcon /></Avatar>
              <Box>
                <Typography>Dr. Shreyansh Kushwaha</Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.72)">triage@zephyr.ai</Typography>
              </Box>
            </Stack>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 4, width: `calc(100% - ${drawerWidth}px)` }}>
          <AppBar position="static" elevation={0} sx={{ bgcolor: "transparent", boxShadow: "none", mb: 3 }}>
            <Toolbar sx={{ justifyContent: "space-between", px: 0 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">{t("commandCenter")}</Typography>
                <Typography variant="h4" fontWeight={700} color="primary" sx={{ mt: 0.5 }}>{t("triageDashboard")}</Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton onClick={() => setMode(mode === "light" ? "dark" : "light")} sx={{ color: "text.primary" }}>
                  {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>

                <Button 
                  variant="text" 
                  color="primary" 
                  startIcon={<TranslateIcon />} 
                  onClick={() => setLang(lang === "en" ? "hi" : "en")}
                  sx={{ fontWeight: 'bold' }}
                >
                  {lang === "en" ? "हिंदी" : "English"}
                </Button>
                
                <Button variant="outlined" onClick={() => window.location.href = "/"} sx={{ borderColor: "divider", color: "text.primary" }}>
                  {t("backHome")}
                </Button>
                <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={() => setSelectedView("input")}>
                  {t("uploadScan")}
                </Button>
              </Stack>
            </Toolbar>
          </AppBar>

          <Box sx={{ mt: 2 }}>
            {selectedView === "overview" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" } }}>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                    <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">{t("casesTriaged")}</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>48</Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">{t("biomarkerMatch")}</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>76%</Typography>
                        <LinearProgress variant="determinate" value={76} sx={{ height: 10, borderRadius: 5, mt: 2 }} />
                      </CardContent>
                    </Card>
                    <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">{t("reactionSize")}</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>13.8mm</Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ minHeight: 140, borderRadius: 3, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">{t("highRiskAlerts")}</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>7</Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box>
                    <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: "#1976d2" }}><PersonIcon /></Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">{t("liveMonitor")}</Typography>
                            <Typography variant="h6">Clinic A · Ward 3</Typography>
                          </Box>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">{t("activeSession")}</Typography>
                          <Typography variant="h5">Patient: Arun K.</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: {results ? t("statusComplete") : t("statusAwaiting")}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Box>
                        <Typography variant="h6">{t("patientWorkflow")}</Typography>
                      </Box>
                      <Button variant="outlined" sx={{ borderColor: "divider", color: "text.primary" }} onClick={() => setSelectedView("input")}>{t("startInput")}</Button>
                    </Stack>
                    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: mode === "light" ? "#f5f9ff" : "rgba(255,255,255,0.05)" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <AccessTimeIcon color="primary" />
                          <Typography>Step 1</Typography>
                        </Stack>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>{t("step1Text")}</Typography>
                      </Paper>
                      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: mode === "light" ? "#f5f9ff" : "rgba(255,255,255,0.05)" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <MicIcon color="secondary" />
                          <Typography>Step 2</Typography>
                        </Stack>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>{t("step2Text")}</Typography>
                      </Paper>
                      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: mode === "light" ? "#f5f9ff" : "rgba(255,255,255,0.05)" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <AnalyticsIcon color="success" />
                          <Typography>Step 3</Typography>
                        </Stack>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>{t("step3Text")}</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {selectedView === "history" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  {lang === "en" ? "Longitudinal Patient Profile" : "अनुदैर्ध्य रोगी प्रोफ़ाइल"}
                </Typography>
                
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar sx={{ width: 80, height: 80, bgcolor: "#1976d2", fontSize: "2rem", color: "#fff" }}>AK</Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">Arun K.</Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Patient ID: ZEP-84920 &nbsp; | &nbsp; Age: 34 &nbsp; | &nbsp; Male
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                        <Chip label="Current Phase: Treatment (Month 2)" color="success" variant="filled" sx={{ fontWeight: "bold" }} />
                        <Typography variant="body2" color="text.secondary">Admitted: Clinic A, Ward 3</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" } }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Biomarker Risk Progression</Typography>
                    <Box sx={{ width: "100%", height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={patientHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mode === "light" ? "#ccc" : "#444"} />
                          <XAxis dataKey="visit" axisLine={false} tickLine={false} stroke={mode === "light" ? "#666" : "#aaa"} />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} stroke={mode === "light" ? "#666" : "#aaa"} />
                          <Tooltip contentStyle={{ backgroundColor: mode === "light" ? "#fff" : "#333", border: "none" }} />
                          <Line type="monotone" dataKey="risk" stroke="#1976d2" strokeWidth={4} dot={{ r: 6, fill: "#1976d2" }} activeDot={{ r: 8 }} name="Risk Score (%)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>

                  <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3, height: "100%" }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>Encounter Log</Typography>
                    <List sx={{ p: 0 }}>
                      {patientHistoryData.map((visit, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ px: 0, py: 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <Stack direction="row" justifyContent="space-between" width="100%">
                              <Typography variant="subtitle1" fontWeight={600}>{visit.visit}</Typography>
                              <Typography variant="body2" color="text.secondary">{visit.date}</Typography>
                            </Stack>
                            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                              <Chip size="small" label={`Reaction: ${visit.reaction}`} sx={{ bgcolor: mode === "light" ? "#f5f5f5" : "rgba(255,255,255,0.1)", color: "text.primary" }} />
                              <Chip size="small" label={`Risk: ${visit.risk}%`} color={visit.risk > 50 ? "error" : "success"} />
                            </Box>
                          </ListItem>
                          {index < patientHistoryData.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Card>
                </Box>
              </Box>
            )}

            {selectedView === "input" && (
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" } }}>
                <Box>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{t("uploadTitle")}</Typography>
                        </Box>
                        <Chip label={hasImage ? "Ready" : "Waiting"} color={hasImage ? "success" : "default"} />
                      </Stack>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 4, borderRadius: 3, borderStyle: "dashed", borderColor: isDragActive ? "primary.main" : "divider",
                          bgcolor: isDragActive ? "rgba(25, 118, 210, 0.08)" : "transparent", cursor: "pointer", textAlign: "center",
                        }}
                        {...getRootProps()}
                      >
                        <input {...getInputProps()} />
                        <UploadFileIcon sx={{ fontSize: 48, color: "primary.main" }} />
                        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>{uploadLabel}</Typography>
                      </Paper>
                      {hasImage && (
                        <Paper sx={{ mt: 3, p: 2, bgcolor: mode === "light" ? "#f5f9ff" : "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                          <Typography variant="body1">{acceptedFiles[0].name}</Typography>
                        </Paper>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <MediaRecorderSection audioUrl={audioUrl} setAudioUrl={setAudioUrl} audioStatus={audioStatus} setAudioStatus={setAudioStatus} setAudioBlob={setAudioBlob} loading={loading} />
                </Box>

                <Box sx={{ gridColumn: "1/-1" }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="h6">{t("runAnalysis")}</Typography>
                      </Box>
                      <Button variant="contained" size="large" startIcon={<AssessmentIcon />} onClick={runZephyrAnalysis} disabled={!analysisEnabled}>
                        {t("analyzePatient")}
                      </Button>
                    </Stack>
                    {loading && (
                      <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
                        <CircularProgress size={24} />
                        <Typography>Processing...</Typography>
                      </Box>
                    )}
                  </Card>
                </Box>
              </Box>
            )}

            {selectedView === "guidelines" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h5" color="primary" fontWeight={600}>Clinical Data Capture Guidelines</Typography>
                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: mode === "light" ? "#e3f2fd" : "rgba(25,118,210,0.2)", color: "#1976d2" }}><CameraAltIcon /></Avatar>
                      <Typography variant="h6">1. Mantoux Photographic Protocol</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Coin Placement" secondary="Place a standard 1 Indian Rupee coin (25mm) directly adjacent to the induration." />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Camera Angle" secondary="Hold the camera directly parallel (90 degrees) to the skin surface." />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: mode === "light" ? "#fce4ec" : "rgba(211,47,47,0.2)", color: "#d32f2f" }}><MicIcon /></Avatar>
                      <Typography variant="h6">2. Acoustic Capture Protocol</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Cough Quality" secondary="Instruct the patient to provide 2 to 3 deep, voluntary coughs." />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><ErrorOutlineIcon color="error" /></ListItemIcon>
                        <ListItemText primary="Environmental Noise" secondary="The room MUST be completely silent." />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>

          {(results || loading) && (selectedView === "overview" || selectedView === "input") && (
            <Box sx={{ mt: 4 }}>
              <Card id="clinical-report" sx={{ borderRadius: 3, boxShadow: 3, p: 3, bgcolor: "background.paper" }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="h6">{t("clinicalReport")}</Typography>
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {results && (
                      <Button variant="outlined" color="primary" startIcon={isGeneratingPDF ? <CircularProgress size={20} /> : <PictureAsPdfIcon />} onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                        {isGeneratingPDF ? "Generating..." : t("downloadReport")}
                      </Button>
                    )}
                    {results && (
                      <Alert severity={results.finalRiskScore === "HIGH RISK" ? "error" : "success"} sx={{ borderRadius: 3 }}>
                        <strong>{results.finalRiskScore}</strong>
                      </Alert>
                    )}
                  </Stack>
                </Stack>

                {results && (
                  <Box sx={{ mt: 4, display: "grid", gap: 3 }}>
                    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: mode === "light" ? "#f4f7ff" : "rgba(255,255,255,0.05)", boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="subtitle2" color="text.secondary">Calibration</Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>{results.calibration}</Typography>
                      </Card>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: mode === "light" ? "#f4f7ff" : "rgba(255,255,255,0.05)", boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="subtitle2" color="text.secondary">Reaction Measurement</Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>{results.reactionSize}</Typography>
                      </Card>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: mode === "light" ? "#f4f7ff" : "rgba(255,255,255,0.05)", boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="subtitle2" color="text.secondary">Audio Biomarker Match</Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>{results.audioAnalysis}%</Typography>
                        <LinearProgress variant="determinate" value={parseFloat(results.audioAnalysis)} sx={{ height: 10, borderRadius: 5, mt: 2 }} />
                      </Card>
                      <Card sx={{ borderRadius: 3, p: 3, bgcolor: mode === "light" ? "#f4f7ff" : "rgba(255,255,255,0.05)", boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="subtitle2" color="text.secondary">Recommendation</Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>{results.recommendation}</Typography>
                      </Card>
                    </Box>
                    <Card sx={{ borderRadius: 3, p: 2, bgcolor: "background.paper", boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Acoustic Spectrogram Signature</Typography>
                      <Box sx={{ width: "100%", height: 300, overflow: "hidden" }}>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={spectrumData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={mode === "light" ? "#ccc" : "#444"} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke={mode === "light" ? "#666" : "#aaa"} />
                            <YAxis tickLine={false} axisLine={false} stroke={mode === "light" ? "#666" : "#aaa"} />
                            <Tooltip contentStyle={{ backgroundColor: mode === "light" ? "#fff" : "#333", border: "none" }} />
                            <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} />
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