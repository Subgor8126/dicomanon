import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { Shield, FileText, Eye, Zap, Lock, Cloud } from 'lucide-react';
import SignInButton from './SignInButton';

const FEATURES = [
  {
    icon: Cloud,
    title: "S3 Integration",
    description: "Connect your AWS bucket with an IAM Role to securely select DICOM data."
  },
  {
    icon: Eye,
    title: "OCR Text Detection",
    description: "Detect and redact burned-in text with pixel-level OCR."
  },
  {
    icon: FileText,
    title: "DICOM Tag Scrubbing",
    description: "Automatically clean metadata tags containing sensitive patient info."
  },
  {
    icon: Zap,
    title: "AI Inference (Optional)",
    description: "Run optional AI models (e.g., YOLOv5) for clinical feature detection."
  },
  {
    icon: Shield,
    title: "HIPAA Ready",
    description: "Secure architecture built for healthcare-grade privacy compliance."
  }
];

export default function DicomAnonLanding() {
  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      {/* HEADER */}
      <Box component="header" sx={{
        borderBottom: 1,
        borderColor: 'rgba(102, 0, 51, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.default',
        backdropFilter: 'blur(6px)'
      }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield color="#660033" size={28} />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              DicomAnon
            </Typography>
          </Box>
          <SignInButton variant="header" />
        </Container>
      </Box>

      {/* HERO */}
      <Box sx={{
        position: 'relative',
        py: { xs: 12, md: 16 },
        textAlign: 'center',
      }}>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(102,0,51,0.1) 0%, transparent 50%)'
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="inline-flex" alignItems="center" gap={1} px={2} py={1} sx={{
            bgcolor: 'rgba(102,0,51,0.1)',
            border: '1px solid',
            borderColor: 'rgba(102,0,51,0.4)',
            borderRadius: 3,
            mb: 4
          }}>
            <Lock size={18} color="#660033" />
            <Typography variant="body2" color="text.secondary">
              HIPAA Ready • End-to-End Pipeline
            </Typography>
          </Box>

          <Typography variant="h2" fontWeight="bold" gutterBottom sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            De-identify and Analyze
            <Box component="span" color="primary.main" display="block">
              Medical Imaging, At Scale
            </Box>
          </Typography>

          <Typography variant="h6" color="text.secondary" mb={4}>
            Use your own AWS bucket to run automated de-identification with optional AI inference — all inside a secure browser-based dashboard.
          </Typography>

          <SignInButton variant="primary" />
        </Container>
      </Box>

      {/* FEATURES */}
      <Box sx={{ bgcolor: 'background.paper', py: 12 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
            What You Can Do
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={8}>
            Built for radiologists, researchers, developers, and innovators in healthtech
          </Typography>
          <Grid container spacing={4}>
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card elevation={0} sx={{
                  borderRadius: 4,
                  p: 3,
                  border: '1px solid',
                  borderColor: 'rgba(102, 0, 51, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(102, 0, 51, 0.2)'
                  }
                }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{
                      p: 1.5,
                      bgcolor: 'rgba(102,0,51,0.1)',
                      borderRadius: 2,
                      color: 'primary.main',
                      border: '1px solid',
                      borderColor: 'rgba(102, 0, 51, 0.3)'
                    }}>
                      <Icon size={24} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(102, 0, 51, 0.2)' }} />

      {/* FOOTER */}
      <Box component="footer" py={6}>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid xs={12} item>
              <Box display="flex" alignItems="center" gap={1}>
                <Shield size={20} color="#660033" />
                <Typography variant="subtitle1" fontWeight="bold">
                  DicomAnon
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" gap={3}>
                {["Privacy Policy", "Terms of Service", "Support"].map(label => (
                  <Typography
                    key={label}
                    component="a"
                    href="#"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: 'rgba(102, 0, 51, 0.2)' }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            © 2025 DicomAnon. All rights reserved. Built for real-world DICOM workflows.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}