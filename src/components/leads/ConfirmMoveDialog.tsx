'use client';

import { Dialog, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    bgCard: 'rgba(255,255,255,0.03)',
    bgInput: 'rgba(0,10,30,0.6)',
    border: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,224,255,0.15)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.10)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    amber: '#f59e0b',
    amberDim: 'rgba(245,158,11,0.12)',
    amberGlow: 'rgba(245,158,11,0.3)',
    gradientBtn: 'linear-gradient(135deg, #00e0ff 0%, #6450ff 100%)',
    gradientText: 'linear-gradient(135deg, #fff 0%, #aad4ff 60%, #00e0ff 100%)',
    textPrimary: 'rgba(220,240,255,0.95)',
    textMuted: 'rgba(130,170,220,0.55)',
    textFaint: 'rgba(100,140,180,0.40)',
};

interface ConfirmMoveDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    count: number;
    fromColumn: string;
    toColumn: string;
}

export default function ConfirmMoveDialog({
    open, onClose, onConfirm, count, fromColumn, toColumn,
}: ConfirmMoveDialogProps) {
    const leadWord = count === 1 ? 'lead' : 'leads';

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
                        border: `1px solid rgba(245,158,11,0.2)`,
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.06)',
                    }
                }
            }}
        >
            <DialogContent sx={{ p: 3.5 }}>

                {/* Icon + heading */}
                <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                        bgcolor: T.amberDim, border: '1px solid rgba(245,158,11,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(245,158,11,0.12)',
                    }}>
                        <WarningAmberIcon sx={{ color: T.amber, fontSize: 26 }} />
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 800, fontSize: '1.05rem', mb: 0.2,
                            background: T.gradientText,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Confirm Bulk Move
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
                            This action will move multiple leads
                        </Typography>
                    </Box>
                </Box>

                {/* Main message */}
                <Typography sx={{ color: T.textMuted, fontSize: '0.875rem', lineHeight: 1.65, mb: 2 }}>
                    Are you sure you want to move{' '}
                    <Box component="span" sx={{ color: T.amber, fontWeight: 700 }}>{count}</Box>
                    {' '}{leadWord} from{' '}
                    <Box component="span" sx={{ color: T.textPrimary, fontWeight: 700 }}>{fromColumn}</Box>
                    {' '}to{' '}
                    <Box component="span" sx={{ color: T.cyan, fontWeight: 700 }}>{toColumn}</Box>?
                </Typography>

                {/* Column arrow pill */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.2, mb: 2,
                    bgcolor: T.cyanDim, borderRadius: '10px',
                    border: `1px solid ${T.borderCyan}`,
                }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.83rem', color: T.textPrimary }}>
                        {fromColumn}
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: T.cyan }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.83rem', color: T.cyan }}>
                        {toColumn}
                    </Typography>
                </Box>

                {/* Info box */}
                <Box sx={{
                    bgcolor: T.bgInput, borderRadius: '10px',
                    p: 2, border: `1px solid ${T.border}`,
                }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1 }}>
                        This will
                    </Typography>
                    {[
                        `Update the status of all ${count} ${leadWord}`,
                        `Move them to the "${toColumn}" column`,
                        'This action can be undone by moving them back',
                    ].map(line => (
                        <Box key={line} display="flex" alignItems="flex-start" gap={1} mb={0.6}>
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: T.textFaint, flexShrink: 0, mt: '7px' }} />
                            <Typography sx={{ color: T.textMuted, fontSize: '0.8rem', lineHeight: 1.6 }}>
                                {line}
                            </Typography>
                        </Box>
                    ))}
                </Box>
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

                {/* Confirm */}
                <Box
                    component="button" type="button" onClick={onConfirm}
                    sx={{
                        flex: 1, py: 1.1, borderRadius: '10px', border: 'none',
                        bgcolor: T.amber, color: 'white',
                        fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
                        boxShadow: `0 0 20px ${T.amberGlow}`,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#d97706', boxShadow: `0 0 30px rgba(245,158,11,0.5)`, transform: 'translateY(-1px)' },
                    }}
                >
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    Move {count} {count === 1 ? 'Lead' : 'Leads'}
                </Box>
            </DialogActions>
        </Dialog>
    );
}