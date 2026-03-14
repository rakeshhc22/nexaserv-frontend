'use client';

import { Snackbar, Box, Typography, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

// ── Severity config ───────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
    success: {
        icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
        color: '#4aff9f',
        bg: 'rgba(74,255,159,0.10)',
        border: 'rgba(74,255,159,0.25)',
        glow: 'rgba(74,255,159,0.15)',
    },
    error: {
        icon: <ErrorOutlineIcon sx={{ fontSize: 20 }} />,
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.10)',
        border: 'rgba(239,68,68,0.25)',
        glow: 'rgba(239,68,68,0.15)',
    },
    warning: {
        icon: <WarningAmberIcon sx={{ fontSize: 20 }} />,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.10)',
        border: 'rgba(245,158,11,0.25)',
        glow: 'rgba(245,158,11,0.15)',
    },
    info: {
        icon: <InfoOutlinedIcon sx={{ fontSize: 20 }} />,
        color: '#00e0ff',
        bg: 'rgba(0,224,255,0.10)',
        border: 'rgba(0,224,255,0.25)',
        glow: 'rgba(0,224,255,0.15)',
    },
} as const;

type Severity = keyof typeof SEVERITY_CONFIG;

interface NotificationSnackbarProps {
    open: boolean;
    onClose: () => void;
    message: string;
    severity?: Severity;
}

export default function NotificationSnackbar({
    open, onClose, message, severity = 'success',
}: NotificationSnackbarProps) {
    const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.success;

    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2.5, py: 1.5, borderRadius: '14px',
                bgcolor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${cfg.glow}`,
                minWidth: 280, maxWidth: 420,
                animation: 'snackIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
                '@keyframes snackIn': {
                    from: { opacity: 0, transform: 'translateX(24px) scale(0.97)' },
                    to: { opacity: 1, transform: 'translateX(0) scale(1)' },
                },
            }}>
                {/* Icon */}
                <Box sx={{ color: cfg.color, flexShrink: 0, display: 'flex' }}>
                    {cfg.icon}
                </Box>

                {/* Message */}
                <Typography sx={{
                    flex: 1,
                    color: cfg.color,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                }}>
                    {message}
                </Typography>

                {/* Close */}
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        color: cfg.color, opacity: 0.5, flexShrink: 0,
                        '&:hover': { opacity: 1, bgcolor: 'transparent' },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
        </Snackbar>
    );
}