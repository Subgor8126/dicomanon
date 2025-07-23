// Sidebar.tsx
import { List, ListItemButton, ListItemText, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Jobs', href: '/dashboard/jobs' },
  { label: 'Connections', href: '/dashboard/connections' },
  { label: 'Upload', href: '/dashboard/upload' },
  { label: 'Profile', href: '/dashboard/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box sx={{ width: 220, bgcolor: '#121212', color: 'white', height: '100vh', p: 2 }}>
      <List>
        {navItems.map(({ label, href }) => (
          <Link key={href} href={href} passHref legacyBehavior>
            <ListItemButton selected={pathname === href}>
              <ListItemText primary={label} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Box>
  );
}