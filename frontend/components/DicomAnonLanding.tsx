import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { Shield, FileText, Eye, Zap, CheckCircle, Upload, Download, Lock } from 'lucide-react';
import SignInButton from './SignInButton';

const FEATURES = [
  {
    icon: Eye,
    title: "OCR Text Detection",
    description: "Advanced optical character recognition to remove text from DICOM images."
  },
  {
    icon: FileText,
    title: "Tag Removal",
    description: "Analyze and clean sensitive DICOM metadata."
  },
  {
    icon: Shield,
    title: "HIPAA Ready",
    description: "Enterprise-grade security aligned with healthcare data standards."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Batch process DICOM files with optimized performance."
  }
];

const PLANS = [
  {
    name: "Free Trial",
    credits: 30,
    price: "$0",
    popular: false,
    features: [
      "30 free credits",
      "OCR text removal",
      "DICOM tag cleaning",
      "Basic support"
    ]
  },
  {
    name: "Starter",
    credits: 80,
    price: "$9.99",
    popular: true,
    features: [
      "80 credits",
      "OCR text removal",
      "DICOM tag cleaning",
      "Priority support",
      "Batch processing"
    ]
  },
  {
    name: "Professional",
    credits: 200,
    price: "$19.99",
    popular: false,
    features: [
      "200 credits",
      "OCR text removal",
      "DICOM tag cleaning",
      "Priority support",
      "Batch processing",
      "Advanced analytics"
    ]
  },
  {
    name: "Enterprise",
    credits: 400,
    price: "$29.99",
    popular: false,
    features: [
      "400 credits",
      "OCR text removal",
      "DICOM tag cleaning",
      "24/7 support",
      "Batch processing",
      "Advanced analytics",
      "Custom integrations"
    ]
  }
];

export default async function DicomAnonLanding() {
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
            <Typography variant="h6" component="span" fontWeight="bold" color="text.primary">
              DicomAnon
            </Typography>
          </Box>
          <SignInButton variant="header" />
        </Container>
      </Box>

      {/* HERO */}
      <Box sx={{
        position: 'relative',
        bgcolor: 'background.default',
        color: 'text.primary',
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
              HIPAA Ready • Enterprise Security
            </Typography>
          </Box>

          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2
          }}>
            DICOM De-Identification
            <Box component="span" color="primary.main" display="block">
              Made Simple
            </Box>
          </Typography>

          <Typography variant="h5" color="text.secondary" mb={4} sx={{ maxWidth: '600px', mx: 'auto' }}>
            Securely remove patient information from medical images using advanced OCR and metadata cleaning. Start with 30 free credits.
          </Typography>

          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <SignInButton variant="primary" />
          </Box>
        </Container>
      </Box>

      {/* FEATURES */}
      <Box sx={{ bgcolor: 'background.paper', py: 12 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" align="center" gutterBottom color="text.primary">
            Powerful De-Identification Features
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={8}>
            Advanced technology to protect patient privacy
          </Typography>
          <Grid container spacing={4}>
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card elevation={0} sx={{ 
                  bgcolor: 'background.default', 
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
                    <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
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

      {/* PRICING */}
      <Box sx={{ bgcolor: 'background.default', py: 12 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" align="center" gutterBottom color="text.primary">
            Simple Credit-Based Pricing
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={8}>
            Pay only for what you use
          </Typography>
          <Grid container spacing={4}>
            {PLANS.map((plan, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: plan.popular ? 'rgba(102,0,51,0.05)' : 'background.paper',
                    borderColor: plan.popular ? 'primary.main' : 'rgba(102, 0, 51, 0.2)',
                    borderWidth: plan.popular ? 2 : 1,
                    borderStyle: 'solid',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: plan.popular ? '0 12px 32px rgba(102, 0, 51, 0.3)' : '0 8px 24px rgba(102, 0, 51, 0.2)'
                    },
                    color: 'text.primary',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  {plan.popular && (
                    <Box sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1
                    }}>
                      <Chip 
                        label="Most Popular" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                  )}
                  <CardHeader
                    title={
                      <Box textAlign="center" pt={plan.popular ? 2 : 0}>
                        <Typography variant="h6" color="text.primary" fontWeight="bold">
                          {plan.name}
                        </Typography>
                        <Typography variant="h4" color="primary.main" mt={1} fontWeight="bold">
                          {plan.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.credits} credits
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent>
                    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                      {plan.features.map((feature, idx) => (
                        <Box component="li" key={idx} display="flex" alignItems="center" gap={1} mb={1.5}>
                          <CheckCircle size={16} color="#660033" />
                          <Typography variant="body2" color="text.secondary">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box mt={3} textAlign="center">
                      <SignInButton variant="card" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(102, 0, 51, 0.2)' }} />

      {/* FOOTER */}
      <Box component="footer" bgcolor="background.paper" color="text.secondary" py={6}>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid xs={12} item>
              <Box display="flex" alignItems="center" gap={1}>
                <Shield size={20} color="#660033" />
                <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
                  DicomAnon
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" gap={3}>
                <Typography 
                  component="a" 
                  href="#" 
                  sx={{ 
                    color: 'text.secondary', 
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.3s ease'
                  }}
                >
                  Privacy Policy
                </Typography>
                <Typography 
                  component="a" 
                  href="#" 
                  sx={{ 
                    color: 'text.secondary', 
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.3s ease'
                  }}
                >
                  Terms of Service
                </Typography>
                <Typography 
                  component="a" 
                  href="#" 
                  sx={{ 
                    color: 'text.secondary', 
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.3s ease'
                  }}
                >
                  Support
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: 'rgba(102, 0, 51, 0.2)' }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            © 2025 DicomAnon. All rights reserved. HIPAA-ready medical image de-identification.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}