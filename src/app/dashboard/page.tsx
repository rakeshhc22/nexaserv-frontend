'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Grid, CircularProgress, Typography, useTheme } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TodayIcon from '@mui/icons-material/Today';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '@/lib/api';
import RBACGuard from '@/components/dashboard/RBACGuard';
import { dashboardService } from '@/lib/services/dashboard.service';
import { useDashboardStore } from '@/store/dashboardStore';
import { useLeadsStore } from '@/store/leadsStore';
import { useBookingsStore } from '@/store/bookingsStore';

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TotalLikesCard from '@/components/dashboard/widgets/TotalLikesCard';
import PendingMessagesCard from '@/components/dashboard/widgets/PendingMessagesCard';
import RecentActivityList from '@/components/dashboard/widgets/RecentActivityList';
import WaveStatCard from '@/components/dashboard/widgets/WaveStatCard';
import LowStockList from '@/components/dashboard/widgets/LowStockList';
import CompactCalendar from '@/components/dashboard/widgets/CompactCalendar';
import QuickStatsRow from '@/components/dashboard/widgets/QuickStatsRow';
import WeeklyActivityChart from '@/components/dashboard/widgets/WeeklyActivityChart';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    cyan: '#00C8FF',
    purple: '#6450FF',
    card: (isDark: boolean) => isDark ? 'rgba(8, 20, 48, 0.72)' : '#ffffff',
    border: (isDark: boolean) => isDark ? 'rgba(0, 200, 255, 0.12)' : 'rgba(0,0,0,0.07)',
    bg: (isDark: boolean) => isDark ? '#030810' : '#F2F1EB',
    text: (isDark: boolean) => isDark ? 'rgba(200,225,255,0.85)' : '#1a1a2e',
    muted: (isDark: boolean) => isDark ? 'rgba(130,170,220,0.5)' : 'rgba(0,0,0,0.45)',
};

// ── Today Quick Stat mini-card ─────────────────────────────────────────────────
function TodayCard({
    label, value, sub, icon, accent, isDark,
}: {
    label: string; value: number | string; sub?: string;
    icon: React.ReactNode; accent: string; isDark: boolean;
}) {
    return (
        <Box sx={{
            p: 2.5, borderRadius: 2.5,
            background: isDark
                ? `linear-gradient(135deg, rgba(8,20,48,0.85), rgba(8,20,48,0.6))`
                : '#fff',
            border: `1px solid ${isDark ? `${accent}28` : 'rgba(0,0,0,0.07)'}`,
            backdropFilter: 'blur(16px)',
            boxShadow: isDark
                ? `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${accent}10 inset`
                : '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
                borderColor: `${accent}50`,
                transform: 'translateY(-3px)',
                boxShadow: isDark
                    ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${accent}18`
                    : `0 8px 24px rgba(0,0,0,0.1)`,
            },
        }}>
            <Box sx={{
                width: 46, height: 46, borderRadius: 2, flexShrink: 0,
                background: `${accent}18`,
                border: `1px solid ${accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 16px ${accent}20`,
            }}>
                <Box sx={{ color: accent, display: 'flex' }}>{icon}</Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{
                    fontSize: '1.5rem', fontWeight: 800, lineHeight: 1,
                    color: isDark ? 'rgba(220,240,255,0.95)' : '#1a1a2e',
                    mb: 0.3,
                }}>
                    {value}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.muted(isDark), letterSpacing: '0.05em' }}>
                    {label}
                </Typography>
                {sub && (
                    <Typography sx={{ fontSize: '0.68rem', color: accent, fontWeight: 600, mt: 0.2 }}>
                        {sub}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const { stats, alerts, loading, setStats, setAlerts, setLoading } = useDashboardStore();
    const { leads, fetchLeads } = useLeadsStore();
    const { bookings, fetchBookings } = useBookingsStore();

    useEffect(() => {
        const initDashboard = async () => {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/login'); return; }
            try {
                const authRes = await api.get('/auth/me');
                if (authRes.data.data) {
                    localStorage.setItem('user', JSON.stringify(authRes.data.data.user));
                    if (!authRes.data.data.user.isOnboarded) { router.push('/onboarding'); return; }
                }
                const [statsRes, alertsRes] = await Promise.all([
                    dashboardService.getOverview(),
                    dashboardService.getAlerts(),
                ]);
                if (statsRes.success) setStats(statsRes.data);
                if (alertsRes.success) setAlerts(alertsRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Dashboard initialization failed', error);
                setLoading(false);
            }
        };
        initDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    useEffect(() => { fetchLeads(); }, []);  // eslint-disable-line
    useEffect(() => { fetchBookings(); }, []);  // eslint-disable-line

    const activityItems = useMemo(() =>
        (alerts || []).map((alert: any) => ({
            id: alert._id || alert.id || String(Math.random()),
            type: alert.type || 'default',
            title: alert.title || alert.message || 'Alert',
            description: alert.description || alert.message || '',
            severity: alert.severity,
            link: alert.link,
            date: alert.date || alert.createdAt,
        })), [alerts]);

    const lowStockItems = useMemo(() => {
        console.log('📦 Low Stock Data from API:', stats?.inventory?.lowStock);
        return (stats?.inventory?.lowStock || []).map((item: any) => ({
            _id: item._id,
            name: item.name,
            quantity: item.quantity || 0,
            threshold: item.threshold || 0,
            unit: item.unit || 'units',
        }));
    }, [stats?.inventory?.lowStock]);

    const leadsStats = useMemo(() => {
        const total = leads.length;
        const newLeads = leads.filter(l => l.status === 'new').length;
        const contacted = leads.filter(l => l.status === 'contacted').length;
        const qualified = leads.filter(l => l.status === 'qualified').length;
        const closed = leads.filter(l => l.status === 'closed').length;
        return { total, new: newLeads, contacted, qualified, closed };
    }, [leads]);

    const bookingsStats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const total = bookings.length;
        const todayBookings = bookings.filter(b => {
            const d = new Date(b.date);
            return d >= today && d < tomorrow;
        }).length;
        const upcomingBookings = bookings.filter(b => {
            const d = new Date(b.date);
            return d >= tomorrow && (b.status === 'confirmed' || b.status === 'pending');
        }).length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;

        return { total, today: todayBookings, upcoming: upcomingBookings, completed: completedBookings };
    }, [bookings]);

    // Today's leads (created today)
    const todayLeads = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return leads.filter(l => {
            const d = new Date(l.createdAt || l.date || 0);
            return d >= today;
        }).length;
    }, [leads]);

    const quickStats = useMemo(() => [
        {
            icon: <HotelIcon sx={{ fontSize: 24 }} />,
            label: 'Total Bookings',
            value: bookingsStats.total,
            trend: 12,
            color: '#667eea',
            link: '/dashboard/bookings',
        },
        {
            icon: <PeopleIcon sx={{ fontSize: 24 }} />,
            label: 'Total Leads',
            value: leadsStats.total,
            trend: stats?.leads?.new24h || 0,
            color: '#22c55e',
            link: '/dashboard/leads',
        },
        {
            icon: <InventoryIcon sx={{ fontSize: 24 }} />,
            label: 'Low Stock Items',
            value: lowStockItems.length,
            color: '#f59e0b',
            link: '/dashboard/inventory',
        },
        {
            icon: <LocalHospitalIcon sx={{ fontSize: 24 }} />,
            label: 'Services',
            value: stats?.services?.count?.toString() || '0',
            color: '#ef4444',
            link: '/dashboard/settings',
        },
    ], [stats, leadsStats, bookingsStats, lowStockItems]);

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                height: '100vh', gap: 2,
                bgcolor: C.bg(isDark),
            }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: `conic-gradient(${C.cyan}, ${C.purple}, ${C.cyan})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: C.bg(isDark) }} />
                </Box>
                <Typography sx={{ color: C.muted(isDark), fontSize: '0.85rem', letterSpacing: '0.06em' }}>
                    Loading Dashboard…
                </Typography>
            </Box>
        );
    }

    return (
        <RBACGuard>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: C.bg(isDark),
                p: { xs: 2, sm: 3 },
                transition: 'background-color 0.3s ease',
            }}>

                <DashboardHeader />

                {/* ── TODAY'S SNAPSHOT ─────────────────────────────────────── */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 0.5,
                }}>
                    <Box sx={{ width: 3, height: 16, borderRadius: 99, background: `linear-gradient(180deg, ${C.cyan}, ${C.purple})` }} />
                    <Typography sx={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                        color: isDark ? C.cyan : C.purple,
                    }}>
                        TODAY'S SNAPSHOT
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TodayCard
                            label="Today's Bookings"
                            value={bookingsStats.today}
                            sub={bookingsStats.upcoming > 0 ? `+${bookingsStats.upcoming} upcoming` : undefined}
                            icon={<TodayIcon sx={{ fontSize: 22 }} />}
                            accent={C.cyan}
                            isDark={isDark}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TodayCard
                            label="Today's Leads"
                            value={todayLeads}
                            sub={todayLeads > 0 ? 'new today' : 'none yet today'}
                            icon={<PersonAddIcon sx={{ fontSize: 22 }} />}
                            accent="#4AFF9F"
                            isDark={isDark}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TodayCard
                            label="Completed"
                            value={bookingsStats.completed}
                            sub="bookings done"
                            icon={<HotelIcon sx={{ fontSize: 22 }} />}
                            accent={C.purple}
                            isDark={isDark}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <TodayCard
                            label="New Leads"
                            value={leadsStats.new}
                            sub="awaiting contact"
                            icon={<PeopleIcon sx={{ fontSize: 22 }} />}
                            accent="#FFB800"
                            isDark={isDark}
                        />
                    </Grid>
                </Grid>

                {/* ── SECTION LABEL ─────────────────────────────────────────── */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ width: 3, height: 16, borderRadius: 99, background: `linear-gradient(180deg, ${C.cyan}, ${C.purple})` }} />
                    <Typography sx={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                        color: isDark ? C.cyan : C.purple,
                    }}>
                        OVERVIEW
                    </Typography>
                </Box>

                {/* Quick Stats Row */}
                <Box mb={3}>
                    <QuickStatsRow stats={quickStats} />
                </Box>

                {/* ROW 1: Bookings Breakdown + Leads Donut */}
                <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <TotalLikesCard
                            title="Total Bookings"
                            total={bookingsStats.total}
                            color="#ff6b6b"
                            breakdown={[
                                { label: 'Today', value: bookingsStats.today, color: '#FCD34D' },
                                { label: 'Upcoming', value: bookingsStats.upcoming, color: '#FFB84D' },
                                { label: 'Completed', value: bookingsStats.completed, color: '#FF8A4D' },
                            ]}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <PendingMessagesCard
                            title="Leads Overview"
                            total={leadsStats.total}
                            data={[
                                { name: 'New', value: leadsStats.new, color: isDark ? 'rgba(255,255,255,0.9)' : '#3b82f6' },
                                { name: 'Contacted', value: leadsStats.contacted, color: '#f59e0b' },
                                { name: 'Qualified', value: leadsStats.qualified, color: '#10b981' },
                                { name: 'Closed', value: leadsStats.closed, color: '#6b7280' },
                            ]}
                        />
                    </Grid>
                </Grid>

                {/* ROW 2: Calendar */}
                <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12 }}>
                        <CompactCalendar />
                    </Grid>
                </Grid>

                {/* ROW 3: Weekly Activity Chart */}
                <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12 }}>
                        <WeeklyActivityChart />
                    </Grid>
                </Grid>

                {/* ROW 4: Activity & Low Stock */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <RecentActivityList items={activityItems} title="Recent Alerts" />
                    </Grid>
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <LowStockList items={lowStockItems} />
                    </Grid>
                </Grid>

            </Box>
        </RBACGuard>
    );
}