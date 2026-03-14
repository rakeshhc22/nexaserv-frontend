'use client';

import { Dialog, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    bgCard: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,224,255,0.15)',
    borderFocus: 'rgba(0,224,255,0.5)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.10)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    red: '#ef4444',
    redDim: 'rgba(239,68,68,0.12)',
    redGlow: 'rgba(239,68,68,0.35)',
    textPrimary: 'rgba(220,240,255,0.95)',
    textMuted: 'rgba(130,170,220,0.55)',
    gradientBtn: 'linear-gradient(135deg, #00e0ff 0%, #6450ff 100%)',
};

interface ConfirmDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export default function ConfirmDeleteDialog({
    open, onClose, onConfirm, title, message,
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '20px',
                        bgcolor: '#070f1e',
                        border: `1px solid rgba(239,68,68,0.2)`,
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(239,68,68,0.07)',
                    }
                }
            }}
        >
            <DialogContent sx={{ p: 3.5 }}>

                {/* Icon + heading */}
                <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                        bgcolor: T.redDim, border: '1px solid rgba(239,68,68,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(239,68,68,0.12)',
                    }}>
                        <DeleteOutlineIcon sx={{ color: T.red, fontSize: 26 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: T.textPrimary, mb: 0.2 }}>
                            {title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
                            This action cannot be undone
                        </Typography>
                    </Box>
                </Box>

                {/* Message */}
                <Typography sx={{ color: T.textMuted, fontSize: '0.875rem', lineHeight: 1.65 }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 0, gap: 1.5 }}>
                {/* Cancel */}
                <Box
                    component="button" type="button" onClick={onClose}
                    sx={{
                        flex: 1, py: 1.1, borderRadius: '10px',
                        border: `1px solid ${T.borderCyan}`,
                        bgcolor: T.cyanDim, color: T.cyan,
                        fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
                        cursor: 'pointer', transition: 'all 0.18s',
                        '&:hover': { bgcolor: 'rgba(0,224,255,0.15)' },
                    }}
                >
                    Cancel
                </Box>

                {/* Delete */}
                <Box
                    component="button" type="button" onClick={onConfirm}
                    sx={{
                        flex: 1, py: 1.1, borderRadius: '10px', border: 'none',
                        bgcolor: T.red, color: 'white',
                        fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
                        cursor: 'pointer',
                        boxShadow: `0 0 20px ${T.redGlow}`,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#dc2626', boxShadow: `0 0 30px rgba(239,68,68,0.5)`, transform: 'translateY(-1px)' },
                    }}
                >
                    Delete
                </Box>
            </DialogActions>
        </Dialog>
    );
}