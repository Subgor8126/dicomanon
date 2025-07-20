// /app/dashboard/layout.tsx
'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import { DashboardProvider } from '@/components/dashboard/DashboardContext';
import Box from '@mui/material/Box';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/router';
import { CircularProgress } from '@mui/material';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const auth = useAuth();
  const { isLoading, isAuthenticated } = auth;

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Box component="span" sx={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', backgroundColor: 'primary.main', animation: 'spin 1s linear infinite' }} />
        <CircularProgress color="primary" />
        <Box sx={{ mt: 2 }}>Loading...</Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    const router = useRouter();
    router.replace('/'); // Redirect to home if not authenticated
    return null;
  }


  return (
    <DashboardProvider>
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'black' }}>
        <Sidebar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </DashboardProvider>
  );
}


// 'use client';

// import { useAuth } from 'react-oidc-context';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import CircularProgress from '@mui/material/CircularProgress';
// import Button from '@mui/material/Button';

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {

//   const auth = useAuth();
//   const { isLoading, isAuthenticated, signinRedirect, user } = auth;

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       signinRedirect();
//     }
//   }, [isLoading, isAuthenticated, signinRedirect]);

//   if (isLoading) {
//     return (
//       <Box sx={{ textAlign: 'center', mt: 10 }}>
//         <CircularProgress color="primary" />
//         <Typography sx={{ mt: 2 }}>Loading...</Typography>
//       </Box>
//     );
//   }

//   if (!isAuthenticated) return null;

//   if (user && user.profile && user.profile.email_verified === false) {
//     return (
//       <Box sx={{ textAlign: 'center', mt: 10 }}>
//         <Typography variant="h5" color="warning.main">
//           Please verify your email to access the dashboard.
//           Open your email inbox and look for a verification email from us, and click the link inside.
//         </Typography>
//         <Typography sx={{ mt: 2 }}>
//           Then come back and click on the button below
//         </Typography>
//         <Button
//           onClick={() => signinRedirect()}
//           sx={{
//             mt: 2,
//             borderRadius: 3,
//             background: 'linear-gradient(90deg, #660033 50%, #a64d79 100%)',
//             color: '#fff',
//             '&:hover': {
//               background: 'linear-gradient(90deg, #55002a 50%, #d98cb3 100%)',
//             },
//             textTransform: 'none',
//             fontWeight: 600,
//             px: 3,
//             py: 1.5,
//           }}
//         >
//           Confirm Email Verification
//         </Button>
//       </Box>
//     );
//   }

//   return <>{children}</>;
// }