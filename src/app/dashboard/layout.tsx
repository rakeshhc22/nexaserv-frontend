'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NewSidebar from '@/components/dashboard/NewSidebar';
import PageTransition from '@/components/PageTransition';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '@/theme';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) setDarkMode(savedTheme === 'dark');

        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        if (savedSidebarState) setIsCollapsed(savedSidebarState === 'true');
    }, []);

    const handleDrawerToggle = () => setMobileOpen(o => !o);
    const handleCollapseToggle = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('sidebarCollapsed', String(next));
    };
    const handleThemeToggle = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    const theme = getTheme(darkMode ? 'dark' : 'light');
    const bgColor = darkMode ? '#030810' : '#F2F1EB';

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: bgColor }}>

                {/* Mobile Menu Button */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{
                        position: 'fixed', top: 16, left: 16, zIndex: 1300,
                        display: { sm: 'none' },
                        bgcolor: darkMode ? 'rgba(0,200,255,0.08)' : 'rgba(0,0,0,0.05)',
                        border: darkMode ? '1px solid rgba(0,200,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 1.5,
                        color: darkMode ? '#00C8FF' : 'inherit',
                        '&:hover': {
                            bgcolor: darkMode ? 'rgba(0,200,255,0.14)' : 'rgba(0,0,0,0.1)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    <MenuIcon />
                </IconButton>

                <NewSidebar
                    mobileOpen={mobileOpen}
                    onDrawerToggle={handleDrawerToggle}
                    darkMode={darkMode}
                    onThemeToggle={handleThemeToggle}
                    isCollapsed={isCollapsed}
                    onCollapseToggle={handleCollapseToggle}
                />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        transition: 'margin 0.3s ease',
                        backgroundColor: bgColor,
                        minHeight: '100vh',
                    }}
                >
                    <PageTransition>
                        {children}
                    </PageTransition>
                </Box>
            </Box>
        </ThemeProvider>
    );
}