"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  Paper,
} from "@mui/material";

// Icons
import MicIcon from "@mui/icons-material/Mic";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import TimerIcon from "@mui/icons-material/Timer";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

// --- CUSTOM SCROLL ANIMATION COMPONENT ---
const FadeInUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Box>
  );
};

// --- THEME ---
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0457ab", light: "#eef5fc" },
    secondary: { main: "#d32f2f", light: "#fdeded" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#1e293b", secondary: "#475569" },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h1: { fontWeight: 800, fontSize: "3.5rem", letterSpacing: "-0.02em", lineHeight: 1.2, "@media (max-width:600px)": { fontSize: "2.5rem" } },
    h2: { fontWeight: 700, fontSize: "2.5rem", letterSpacing: "-0.01em", "@media (max-width:600px)": { fontSize: "2rem" } },
    h4: { fontWeight: 600 },
    body1: { fontSize: "1.1rem", lineHeight: 1.7 },
    button: { textTransform: "none", fontWeight: 600, fontSize: "1rem" },
  },
  shape: { borderRadius: 12 },
  components: { MuiButton: { styleOverrides: { root: { padding: "10px 24px", borderRadius: "8px" } } } },
});

export default function LandingPage() {
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default", overflowX: "hidden" }}>
        
        {/* Navigation Bar */}
        <Box sx={{ py: 2, bgcolor: "transparent", position: "relative", zIndex: 10 }}>
          <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44, fontWeight: "bold", fontSize: "1.2rem" }}>Z</Avatar>
              <Typography variant="h5" fontWeight="bold" color="text.primary">Zephyr</Typography>
            </Stack>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => router.push("/dashboard")} 
              endIcon={<ArrowForwardIcon />}
              sx={{ borderWidth: 2, "&:hover": { borderWidth: 2 }, bgcolor: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}
            >
              Open Dashboard
            </Button>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 6 }, px: 2, textAlign: "center" }}>
          <Container maxWidth="lg">
            <FadeInUp delay={0}>
              <Typography variant="h1" color="text.primary" gutterBottom>
                Zephyr: Next-Generation <br />
                <Box component="span" sx={{ color: "primary.main" }}>Respiratory Triage.</Box>
              </Typography>
            </FadeInUp>
            <FadeInUp delay={100}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: "800px", mx: "auto", fontSize: "1.25rem", lineHeight: 1.6 }}>
                Empowering frontline health workers with multimodal AI. Instant acoustic biomarker screening and clinical-grade computer vision, directly from a smartphone.
              </Typography>
            </FadeInUp>
            <FadeInUp delay={200}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <Button variant="contained" color="primary" size="large" startIcon={<PlayCircleOutlineIcon />} sx={{ boxShadow: "0 8px 20px rgba(4,87,171,0.25)" }}>
                  Watch the Demo
                </Button>
                <Button variant="outlined" color="inherit" size="large" startIcon={<GitHubIcon />} sx={{ borderColor: "rgba(0,0,0,0.15)", color: "text.primary" }}>
                  View GitHub
                </Button>
              </Stack>
            </FadeInUp>
          </Container>
        </Box>

        {/* CENTERED Hero Image Section */}
        <Box sx={{ pb: { xs: 6, md: 8 }, px: 2 }}>
          <Container maxWidth="lg">
            <FadeInUp delay={300}>
              <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Card sx={{ height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000" alt="Surgeons group in masks"
                      sx={{ width: "100%", height: 300, objectFit: "cover", display: "block", bgcolor: "rgba(0,0,0,0.04)" }} />
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Multimodal Sound and Vision AI
                        </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Card sx={{ height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <Box component="img" src="https://images.squarespace-cdn.com/content/v1/56a042fb25981d9326c9bbdb/8189870e-2560-42ee-9d65-75eef9604ad7/Benefits+and+Risks+of+Continuous+Medical+Monitoring.jpg?format=1500w" alt="Doctor consulting patient"
                      sx={{ width: "100%", height: 300, objectFit: "cover", display: "block", bgcolor: "rgba(0,0,0,0.04)" }} />
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Remote Clinical Reaction Measurement
                        </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Card sx={{ height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800" alt="Family on the beach"
                      sx={{ width: "100%", height: 300, objectFit: "cover", display: "block", bgcolor: "rgba(0,0,0,0.04)" }} />
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Bridging Community Wellness Gaps
                        </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </FadeInUp>
          </Container>
        </Box>

        {/* Feature Section */}
        <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.paper", px: 2 }}>
          <Container maxWidth="lg">
            <FadeInUp>
              <Box textAlign="center" mb={6}>
                <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 1.5 }}>WHY IT MATTERS</Typography>
                <Typography variant="h2" gutterBottom mt={1}>The Global Triage Bottleneck</Typography>
              </Box>
            </FadeInUp>
            
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              <Grid size={{ xs: 12, md: 4 }}>
                <FadeInUp delay={100}>
                  <Card sx={{ height: "100%", p: 1, borderTop: "4px solid #0457ab", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}>
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                      <Box sx={{ bgcolor: "primary.light", width: 48, height: 48, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                        <MicIcon color="primary" />
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight={700} color="text.primary">Zero-Barrier Acoustic Triage</Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>Analyze cough and breathing sounds for discrete clinical risk scoring and categorization.</Typography>
                    </CardContent>
                  </Card>
                </FadeInUp>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FadeInUp delay={200}>
                  <Card sx={{ height: "100%", p: 1, borderTop: "4px solid #d32f2f", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}>
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                      <Box sx={{ bgcolor: "secondary.light", width: 48, height: 48, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                        <VisibilityIcon color="secondary" />
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight={700} color="text.primary">Calibrated Computer Vision</Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>Dynamically measure PPD skin reactions using a standard 1-rupee coin as a calibrated visual reference.</Typography>
                    </CardContent>
                  </Card>
                </FadeInUp>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FadeInUp delay={300}>
                  <Card sx={{ height: "100%", p: 1, borderTop: "4px solid #43a047", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}>
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                      <Box sx={{ bgcolor: "#e8f5e9", width: 48, height: 48, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                        <MedicalServicesIcon sx={{ color: "#43a047" }} />
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight={700} color="text.primary">Streamlined Clinical Workflow</Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>Reduce critical clinical follow-up time by 72 hours, optimizing patient triage and care in underserved areas.</Typography>
                    </CardContent>
                  </Card>
                </FadeInUp>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Impact Gallery */}
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.default", px: 2 }}>
          <Container maxWidth="lg">
            <FadeInUp>
              <Box textAlign="center" mb={5}>
                <Typography variant="h3" fontWeight={800} color="text.primary">Deploying in the Real World</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>Bridging the gap between cutting-edge ML and frontline community healthcare.</Typography>
              </Box>
            </FadeInUp>
            
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              <Grid size={{ xs: 12, md: 4 }}>
                <FadeInUp delay={100}>
                  <Card sx={{ height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" alt="Hospital desk"
                      sx={{ width: "100%", height: 260, objectFit: "cover", display: "block", bgcolor: "rgba(0,0,0,0.04)" }} />
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Connecting Rural Clinics
                        </Typography>
                    </CardContent>
                  </Card>
                </FadeInUp>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FadeInUp delay={200}>
                  <Card sx={{ height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" alt="Doctor with phone"
                      sx={{ width: "100%", height: 260, objectFit: "cover", display: "block", bgcolor: "rgba(0,0,0,0.04)" }} />
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Frontline Triage at Scale
                        </Typography>
                    </CardContent>
                  </Card>
                </FadeInUp>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FadeInUp delay={300}>
                  <Card sx={{ height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800" alt="Surgeon hands"
                      sx={{ width: "100%", height: 260, objectFit: "cover", display: "block", bgcolor: "rgba(0,0,0,0.04)" }} />
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Collaborative Care Networks
                        </Typography>
                    </CardContent>
                  </Card>
                </FadeInUp>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* The Technology Section */}
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#111827", color: "#ffffff", px: 2 }}>
          <Container maxWidth="lg">
            <FadeInUp>
              <Box textAlign="center" mb={5}>
                <Typography variant="overline" color="primary.light" fontWeight={700} sx={{ letterSpacing: 1.5 }}>For the Judges</Typography>
                <Typography variant="h2" gutterBottom mt={1}>Powered by Multimodal Intelligence</Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", maxWidth: "600px", mx: "auto", fontSize: "1.15rem" }}>Zephyr is built for speed, accuracy, and scale.</Typography>
              </Box>
            </FadeInUp>
            
            <Grid container spacing={3}>
              {[
                { title: "Frontend Interface", desc: "React & Next.js for a responsive, accessible web architecture." },
                { title: "Audio Engine", desc: "AssemblyAI Universal-3 Pro with custom prompting for discrete sound classification." },
                { title: "Vision Engine", desc: "Headless Python OpenCV utilizing Hough Circles and HSV Color Masking for dynamic reference-based scaling." },
                { title: "State Management", desc: "Real-time Web Audio API integration for live acoustic spectrogram visualization." },
              ].map((tech, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={i}>
                  <FadeInUp delay={i * 100}>
                    <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 3, height: "100%", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <CheckCircleOutlineIcon sx={{ color: "primary.light", mt: 0.5 }} />
                        <Box>
                          <Typography variant="h6" gutterBottom fontWeight={600} color="#ffffff">{tech.title}</Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "1rem" }}>{tech.desc}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </FadeInUp>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Footer CTA */}
        <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "primary.main", color: "#ffffff", textAlign: "center", px: 2 }}>
          <Container maxWidth="md">
            <FadeInUp>
              <Typography variant="h2" gutterBottom fontWeight={800}>See Zephyr in Action</Typography>
              <Typography variant="h6" paragraph sx={{ mt: 3, mb: 5, fontWeight: 400, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, fontSize: "1.25rem" }}>
                Watch how we combine audio and visual intelligence to streamline patient triage.
              </Typography>
              <Button variant="contained" size="large" startIcon={<PlayCircleOutlineIcon />} sx={{ bgcolor: "#ffffff", color: "primary.main", px: 5, py: 2, fontSize: "1.2rem", borderRadius: 50, boxShadow: "0 8px 20px rgba(0,0,0,0.2)", "&:hover": { bgcolor: "#f8fafc" } }}>
                Play Video Pitch
              </Button>
            </FadeInUp>
          </Container>
        </Box>
        
      </Box>
    </ThemeProvider>
  );
}