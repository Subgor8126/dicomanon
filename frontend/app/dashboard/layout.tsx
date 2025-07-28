"use client";
import React from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Avatar, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import WorkIcon from '@mui/icons-material/Work';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { DashboardProvider } from '../../components/dashboard/DashboardContext';
import { useAuth } from 'react-oidc-context';

const drawerWidth = 220;

const navItems = [
  { text: 'Home', icon: <HomeIcon />, href: '/dashboard' },
  { text: 'Connections', icon: <LinkIcon />, href: '/dashboard/connections' },
  { text: 'Run a Job', icon: <WorkIcon />, href: '/dashboard/run-job' },
  { text: 'Jobs', icon: <ListAltIcon />, href: '/dashboard/jobs' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Placeholder user info
  const user = { name: 'Dr. Jane Doe', role: 'Radiologist' };
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signoutRedirect();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <DashboardProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
          <CssBaseline />
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#181818', boxShadow: 'none', borderBottom: '1px solid #222' }}>
            <Toolbar>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>{user.name[0]}</Avatar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>{user.name} <Typography variant="caption" sx={{ ml: 1, color: 'info.main' }}>{user.role}</Typography></Typography>
              <Button color="info" startIcon={<LogoutIcon />} onClick={handleLogout}>Logout</Button>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#181818', borderRight: '1px solid #222' },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto', mt: 2 }}>
              <List>
                {navItems.map((item) => (
                  <ListItem key={item.text} component="a" href={item.href} sx={{ mb: 1, borderRadius: 2, mx: 1, '&:hover': { background: 'rgba(102,0,51,0.15)' } }}>
                    <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 4, ml: `${drawerWidth}px`, mt: 8 }}>
            {children}
          </Box>
        </Box>
      </DashboardProvider>
    </ThemeProvider>
  );
}