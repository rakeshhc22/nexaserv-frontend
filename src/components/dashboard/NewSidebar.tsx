'use client';

import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    useMediaQuery,
    Theme,
    IconButton,
    Tooltip,
    Typography,
    Avatar,
    Badge,
    Menu,
    MenuItem,
    useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MessageIcon from '@mui/icons-material/Message';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContactsIcon from '@mui/icons-material/Contacts';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { staffService } from '@/lib/services/staff.service';
import { notificationService } from '@/lib/services/notification.service';

interface SidebarProps {
    mobileOpen: boolean;
    onDrawerToggle: () => void;
    darkMode: boolean;
    onThemeToggle: () => void;
    isCollapsed: boolean;
    onCollapseToggle: () => void;
}

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Inbox', icon: <MessageIcon />, path: '/dashboard/inbox' },
    { text: 'Bookings', icon: <CalendarTodayIcon />, path: '/dashboard/bookings' },
    { text: 'Leads', icon: <ContactsIcon />, path: '/dashboard/leads' },
    { text: 'Forms', icon: <DescriptionIcon />, path: '/dashboard/forms' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/dashboard/inventory' },
    { text: 'Team', icon: <PeopleIcon />, path: '/dashboard/team' },
    { text: 'Automations', icon: <AutoModeIcon />, path: '/dashboard/automations' },
];

const secondaryItems = [
    { text: 'Integrations', icon: <IntegrationInstructionsIcon />, path: '/dashboard/integrations' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

export default function NewSidebar({ mobileOpen, onDrawerToggle, darkMode, onThemeToggle, isCollapsed, onCollapseToggle }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const [profile, setProfile] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

    // Sidebar Styling based on darkMode
    const sidebarBg = darkMode ? 'rgba(3, 8, 16, 0.95)' : 'rgba(255,255,255,0.95)';
    const sidebarBorderRight = darkMode ? '1px solid rgba(0,200,255,0.1)' : '1px solid rgba(0,0,0,0.08)';
    const sidebarBackdropFilter = 'blur(20px)';
    
    // Text colors
    const defaultNavColor = darkMode ? 'rgba(130,170,220,0.55)' : 'rgba(0,0,0,0.45)';
    const hoverNavBg = darkMode ? 'rgba(0,200,255,0.06)' : 'rgba(0,200,255,0.04)';
    const hoverNavColor = darkMode ? 'rgba(200,225,255,0.85)' : '#1a1a2e';
    const activeNavBg = darkMode ? 'rgba(0,200,255,0.1)' : 'rgba(0,200,255,0.08)';
    const activeNavColor = '#00C8FF';

    const textPrimary = darkMode ? 'rgba(200, 225, 255, 0.88)' : '#1a1a2e';
    const textMuted = darkMode ? 'rgba(130, 170, 220, 0.5)' : 'rgba(0,0,0,0.45)';

    const dividerColor = 'rgba(0,200,255,0.08)';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await staffService.getMe();
                if (res.success && res.data) {
                    setProfile(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };

        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }

        fetchProfile();
        loadUnreadCount();

        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (!profile) return item.text === 'Dashboard';
        if (profile.role === 'owner') return true;
        const permissions = profile.permissions;

        switch (item.text) {
            case 'Dashboard': return true;
            case 'Bookings': return permissions.canViewBookings;
            case 'Leads': return permissions.canViewLeads;
            case 'Inbox': return permissions.canViewInbox;
            case 'Forms': return permissions.canEditBookings || permissions.canEditLeads;
            case 'Inventory': return permissions.canManageInventory;
            case 'Team': return false;
            case 'Automations': return permissions.canManageAutomations;
            default: return true;
        }
    });

    const filteredSecondaryItems = secondaryItems.filter(item => {
        if (!profile) return false;
        if (profile.role === 'owner') return true;
        return false;
    });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setProfileAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedBusinessId');
        router.push('/login');
    };

    const renderMenuSection = (items: typeof menuItems, title?: string) => (
        <Box sx={{ width: '100%', mb: 2 }}>
            {!isCollapsed && title && (
                <Typography sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: darkMode ? 'rgba(0,200,255,0.3)' : 'rgba(0,0,0,0.3)',
                    mx: 2,
                    mt: 2,
                    mb: 0.5,
                    textTransform: 'uppercase'
                }}>
                    {title}
                </Typography>
            )}
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                            <Tooltip title={isCollapsed ? item.text : ''} placement="right" arrow>
                                <ListItemButton
                                    component={Link}
                                    href={item.path}
                                    selected={isActive}
                                    onClick={isMobile ? onDrawerToggle : undefined}
                                    sx={{
                                        mx: 1,
                                        px: 1.5,
                                        py: 1.2,
                                        borderRadius: 2,
                                        color: isActive ? activeNavColor : defaultNavColor,
                                        bgcolor: isActive ? activeNavBg : 'transparent',
                                        borderLeft: isActive ? '3px solid #00C8FF' : '3px solid transparent',
                                        boxShadow: isActive ? 'inset 0 0 12px rgba(0,200,255,0.05)' : 'none',
                                        transition: 'all 0.2s ease',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        '&:hover': {
                                            bgcolor: isActive ? activeNavBg : hoverNavBg,
                                            color: hoverNavColor,
                                            '& .MuiListItemIcon-root': {
                                                transform: 'scale(1.1)',
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: isCollapsed ? 0 : 36,
                                            justifyContent: 'center',
                                            color: isActive ? '#00C8FF' : 'inherit',
                                            transition: 'all 0.2s ease',
                                            filter: isActive ? 'drop-shadow(0 0 8px rgba(0,200,255,0.4))' : 'none'
                                        }}
                                    >
                                        {/* @ts-ignore */}
                                        {React.cloneElement(item.icon as React.ReactElement<any>, {
                                            sx: { fontSize: '1.2rem', transition: 'all 0.2s ease' }
                                        })}
                                    </ListItemIcon>
                                    {!isCollapsed && (
                                        <ListItemText
                                            primary={item.text}
                                            sx={{
                                                opacity: isCollapsed ? 0 : 1,
                                                m: 0,
                                                '& .MuiTypography-root': {
                                                    fontSize: '0.9rem',
                                                    fontWeight: isActive ? 600 : 500,
                                                    color: 'inherit',
                                                }
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: sidebarBg,
            backdropFilter: sidebarBackdropFilter,
            borderRight: sidebarBorderRight,
            transition: 'width 0.3s ease, background-color 0.3s ease',
            width: '100%',
            alignItems: 'center',
            py: 3,
            '& ::-webkit-scrollbar': { width: '4px' },
            '& ::-webkit-scrollbar-track': { background: 'transparent' },
            '& ::-webkit-scrollbar-thumb': { background: 'rgba(0,200,255,0.15)', borderRadius: '99px' },
            '& ::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,200,255,0.3)' }
        }}>
            {/* Logo */}
            <Box
                onClick={onCollapseToggle}
                sx={{
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    width: '100%',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.8 }
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : 1.5, height: 48 }}>
                    <SmartToyIcon sx={{ color: '#00C8FF', fontSize: '2rem', filter: 'drop-shadow(0 0 8px rgba(0,200,255,0.4))' }} />
                    {!isCollapsed && (
                        <Typography variant="h6" sx={{
                            background: 'linear-gradient(135deg, #00C8FF, #6450FF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 800,
                            fontSize: '1rem',
                            letterSpacing: '0.1em',
                            whiteSpace: 'nowrap',
                            opacity: isCollapsed ? 0 : 1,
                            transition: 'opacity 0.2s'
                        }}>
                            NEXASERV
                        </Typography>
                    )}
                </Box>
                {!isCollapsed && (
                    <Typography sx={{ color: textMuted, fontSize: '0.65rem', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>
                        AI Business Platform
                    </Typography>
                )}
            </Box>

            {/* Main Navigation */}
            <Box sx={{ flexGrow: 1, width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                {renderMenuSection(filteredMenuItems, 'MANAGEMENT')}
                <Divider sx={{ mx: 2, mb: 2, bgcolor: dividerColor }} />
                {renderMenuSection(filteredSecondaryItems, 'TOOLS')}
            </Box>

            {/* Bottom Section - Profile & Actions */}
            <Box sx={{ width: '100%', px: 2, pt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Divider sx={{ width: '100%', bgcolor: dividerColor, mb: 1 }} />
                
                {/* Profile */}
                <Tooltip title="Profile" placement="right">
                    <Box
                        onClick={handleProfileClick}
                        sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: isCollapsed ? 'column' : 'row',
                            alignItems: 'center',
                            gap: 1.5,
                            width: '100%',
                            p: 1,
                            borderRadius: 2,
                            '&:hover': { bgcolor: hoverNavBg }
                        }}
                    >
                        <Box sx={{
                            p: '2px',
                            background: 'linear-gradient(135deg, #00C8FF, #6450FF)',
                            borderRadius: '50%'
                        }}>
                            <Avatar
                                src={user?.avatar}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: darkMode ? '#030810' : '#ffffff',
                                    color: textPrimary,
                                    border: `2px solid ${darkMode ? '#030810' : '#ffffff'}`,
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}
                            >
                                {user ? getInitials(user.name) : <PersonIcon />}
                            </Avatar>
                        </Box>

                        {!isCollapsed && (
                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                <Typography noWrap sx={{
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: textPrimary,
                                }}>
                                    {user?.name || 'User Name'}
                                </Typography>
                                <Typography noWrap sx={{
                                    fontSize: '0.72rem',
                                    color: textMuted,
                                }}>
                                    {profile?.role || 'Role'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Tooltip>

                {/* Bottom Icons Row */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    width: '100%',
                    px: isCollapsed ? 0 : 1,
                    gap: isCollapsed ? 1 : 0,
                    flexDirection: isCollapsed ? 'column' : 'row'
                }}>
                    <Tooltip title="Toggle Theme" placement="right">
                        <IconButton
                            onClick={onThemeToggle}
                            sx={{
                                bgcolor: darkMode ? 'rgba(0,200,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: darkMode ? '1px solid rgba(0,200,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
                                borderRadius: 1.5,
                                color: darkMode ? '#00C8FF' : '#6450FF',
                                '&:hover': { bgcolor: darkMode ? 'rgba(0,200,255,0.15)' : 'rgba(0,0,0,0.1)' }
                            }}
                            size="small"
                        >
                            {darkMode ? <Brightness7Icon sx={{ fontSize: 18 }} /> : <Brightness4Icon sx={{ fontSize: 18 }} />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} placement="right">
                        <IconButton
                            onClick={onCollapseToggle}
                            sx={{
                                bgcolor: darkMode ? 'rgba(0,200,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: darkMode ? '1px solid rgba(0,200,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
                                borderRadius: 1.5,
                                color: darkMode ? '#00C8FF' : '#6450FF',
                                '&:hover': { bgcolor: darkMode ? 'rgba(0,200,255,0.15)' : 'rgba(0,0,0,0.1)' },
                                transition: 'transform 0.3s ease'
                            }}
                            size="small"
                        >
                            {isCollapsed ? <KeyboardArrowRightIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Profile Menu */}
            <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileClose}
                PaperProps={{
                    sx: {
                        width: 200,
                        ml: isCollapsed ? 7 : 2,
                        bgcolor: darkMode ? 'rgba(8, 20, 48, 0.95)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(16px)',
                        border: darkMode ? '1px solid rgba(0, 200, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    },
                }}
            >
                <MenuItem onClick={() => { handleProfileClose(); router.push('/dashboard/profile'); }} sx={{ color: textPrimary }}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" sx={{ color: textMuted }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Profile</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleProfileClose(); router.push('/dashboard/settings'); }} sx={{ color: textPrimary }}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" sx={{ color: textMuted }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Settings</Typography>
                </MenuItem>
                <Divider sx={{ my: 0.5, bgcolor: dividerColor }} />
                <MenuItem onClick={handleLogout} sx={{ '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.1)' } }}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" sx={{ color: '#FF6B6B' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: '#FF6B6B', fontWeight: 500 }}>Logout</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: isCollapsed ? 100 : 280 }, flexShrink: { sm: 0 }, transition: 'width 0.3s ease' }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: 'transparent', borderRight: 'none' },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: isCollapsed ? 100 : 280,
                        borderRight: 'none',
                        bgcolor: 'transparent',
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}
