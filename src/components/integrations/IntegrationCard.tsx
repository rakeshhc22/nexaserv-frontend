'use client';

import { Box, Typography, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    bgCard: 'rgba(255,255,255,0.03)',
    bgHover: 'rgba(255,255,255,0.05)',
    bgInput: 'rgba(0,10,30,0.6)',
    border: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,224,255,0.15)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.10)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    purple: '#6450ff',
    green: '#10b981',
    greenDim: 'rgba(16,185,129,0.12)',
    amber: '#f59e0b',
    amberDim: 'rgba(245,158,11,0.12)',
    red: '#ef4444',
    redDim: 'rgba(239,68,68,0.12)',
    textPrimary: 'rgba(220,240,255,0.95)',
    textMuted: 'rgba(130,170,220,0.55)',
    textFaint: 'rgba(100,140,180,0.40)',
    gradient: 'linear-gradient(135deg, #00e0ff 0%, #0070e0 100%)',
    gradientBtn: 'linear-gradient(135deg, #00e0ff 0%, #6450ff 100%)',
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    connected: { color: T.green, bg: T.greenDim, border: 'rgba(16,185,129,0.25)', icon: <CheckCircleIcon sx={{ fontSize: 13 }} />, label: 'Connected' },
    error: { color: T.red, bg: T.redDim, border: 'rgba(239,68,68,0.25)', icon: <ErrorIcon sx={{ fontSize: 13 }} />, label: 'Error' },
    pending: { color: T.amber, bg: T.amberDim, border: 'rgba(245,158,11,0.25)', icon: <WarningAmberIcon sx={{ fontSize: 13 }} />, label: 'Pending' },
    disconnected: { color: T.textFaint, bg: 'rgba(255,255,255,0.04)', border: T.border, icon: null, label: 'Not Connected' },
} as const;

const iconMap: Record<string, any> = {
    email: EmailIcon,
    gmail: EmailIcon,
    calendar: CalendarTodayIcon,
};

const labelSx = {
    fontSize: '0.7rem', fontWeight: 700,
    color: T.textFaint, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    mb: 0.5, display: 'block',
};

interface IntegrationCardProps {
    integration: {
        id: string;
        name: string;
        description: string;
        icon: string;
        status: 'connected' | 'disconnected' | 'error' | 'pending';
        lastSync?: string;
        error?: string;
        configurable: boolean;
    };
    onConnect: (id: string) => void;
    onDisconnect: (id: string) => void;
    onTest: (id: string) => void;
    onSync?: (id: string) => void;
    disabled?: boolean;
}

const formatDate = (d: string) => {
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'Invalid Date'; }
};

// ── Small action button ───────────────────────────────────────────────────────
function ActionBtn({
    onClick, disabled, children, variant = 'ghost',
}: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    variant?: 'ghost' | 'cyan' | 'red' | 'primary';
}) {
    const styles = {
        ghost: { border: `1px solid ${T.border}`, bgcolor: 'transparent', color: T.textMuted, hoverBg: T.bgHover, hoverBorder: 'rgba(255,255,255,0.15)' },
        cyan: { border: `1px solid ${T.borderCyan}`, bgcolor: T.cyanDim, color: T.cyan, hoverBg: 'rgba(0,224,255,0.15)', hoverBorder: 'rgba(0,224,255,0.35)' },
        red: { border: '1px solid rgba(239,68,68,0.3)', bgcolor: T.redDim, color: T.red, hoverBg: 'rgba(239,68,68,0.18)', hoverBorder: `rgba(239,68,68,0.5)` },
        primary: { border: 'none', bgcolor: '', color: 'white', hoverBg: '', hoverBorder: '' },
    }[variant];

    return (
        <Box
            component="button" type="button"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.6,
                px: 1.8, py: 0.75, borderRadius: '9px',
                border: styles.border,
                bgcolor: variant === 'primary' ? T.gradientBtn : styles.bgcolor,
                background: variant === 'primary' ? T.gradientBtn : undefined,
                color: styles.color,
                fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.18s',
                boxShadow: variant === 'primary' ? `0 0 16px ${T.cyanGlow}` : 'none',
                '&:not(:disabled):hover': {
                    bgcolor: variant === 'primary' ? undefined : styles.hoverBg,
                    background: variant === 'primary' ? T.gradientBtn : undefined,
                    borderColor: styles.hoverBorder,
                    opacity: variant === 'primary' ? 0.88 : 1,
                    transform: 'translateY(-1px)',
                },
            }}
        >
            {children}
        </Box>
    );
}

export default function IntegrationCard({
    integration, onConnect, onDisconnect, onTest, onSync, disabled = false,
}: IntegrationCardProps) {
    const Icon = iconMap[integration.icon] || EmailIcon;
    const sc = STATUS_CONFIG[integration.status] ?? STATUS_CONFIG.disconnected;
    const isConnected = integration.status === 'connected';

    return (
        <Box sx={{
            bgcolor: T.bgCard, backdropFilter: 'blur(16px)',
            borderRadius: '16px', p: 2.5,
            border: `1px solid ${isConnected ? 'rgba(0,224,255,0.12)' : T.border}`,
            transition: 'all 0.2s',
            boxShadow: isConnected ? `0 0 24px rgba(0,224,255,0.04)` : 'none',
            '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: isConnected ? T.borderCyan : 'rgba(255,255,255,0.14)',
                boxShadow: isConnected
                    ? `0 8px 28px rgba(0,0,0,0.4), 0 0 24px ${T.cyanGlow}`
                    : '0 8px 28px rgba(0,0,0,0.4)',
            },
        }}>

            {/* ── Header ── */}
            <Box display="flex" alignItems="flex-start" gap={2} mb={2}>

                {/* Icon circle */}
                <Box sx={{
                    width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
                    bgcolor: isConnected ? T.cyanDim : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isConnected ? T.borderCyan : T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: isConnected ? `0 0 12px ${T.cyanGlow}` : 'none',
                }}>
                    <Icon sx={{ fontSize: 26, color: isConnected ? T.cyan : T.textFaint }} />
                </Box>

                {/* Name + status */}
                <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: T.textPrimary }}>
                            {integration.name}
                        </Typography>
                        <Chip
                            icon={sc.icon ? <Box sx={{ color: `${sc.color} !important`, display: 'flex', ml: '6px !important' }}>{sc.icon}</Box> : undefined}
                            label={sc.label}
                            size="small"
                            sx={{
                                bgcolor: sc.bg, color: sc.color,
                                border: `1px solid ${sc.border}`,
                                fontWeight: 700, fontSize: '0.7rem', height: 24,
                                '& .MuiChip-label': { px: sc.icon ? 0.8 : 1.2 },
                            }}
                        />
                    </Box>
                    <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, lineHeight: 1.5 }}>
                        {integration.description}
                    </Typography>
                </Box>
            </Box>

            {/* ── Last sync ── */}
            {integration.lastSync && (
                <Box sx={{
                    bgcolor: T.bgInput, borderRadius: '10px', p: 1.5, mb: 1.5,
                    border: `1px solid ${T.border}`,
                }}>
                    <Typography sx={labelSx}>Last Synced</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: T.textPrimary }}>
                        {formatDate(integration.lastSync)}
                    </Typography>
                </Box>
            )}

            {/* ── Error banner ── */}
            {integration.error && (
                <Box sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1,
                    bgcolor: T.redDim, border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '10px', p: 1.5, mb: 1.5,
                }}>
                    <ErrorIcon sx={{ fontSize: 15, color: T.red, flexShrink: 0, mt: 0.1 }} />
                    <Typography sx={{ fontSize: '0.78rem', color: T.red, lineHeight: 1.5 }}>
                        {integration.error}
                    </Typography>
                </Box>
            )}

            {/* ── Actions ── */}
            <Box display="flex" gap={1} flexWrap="wrap">
                {isConnected ? (
                    <>
                        {integration.id === 'gmail' && onSync && (
                            <ActionBtn variant="cyan" onClick={() => onSync(integration.id)} disabled={disabled}>
                                <RefreshIcon sx={{ fontSize: 15 }} /> Sync Now
                            </ActionBtn>
                        )}
                        <ActionBtn variant="ghost" onClick={() => onTest(integration.id)} disabled={disabled}>
                            Test
                        </ActionBtn>
                        <ActionBtn variant="red" onClick={() => onDisconnect(integration.id)} disabled={disabled}>
                            Disconnect
                        </ActionBtn>
                    </>
                ) : (
                    <ActionBtn variant="primary" onClick={() => onConnect(integration.id)} disabled={disabled}>
                        Connect
                    </ActionBtn>
                )}
            </Box>
        </Box>
    );
}