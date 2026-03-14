'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { staffService } from '@/lib/services/staff.service';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    bg: '#050a14',
    bgCard: 'rgba(255,255,255,0.03)',
    bgInput: 'rgba(0,10,30,0.6)',
    border: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,224,255,0.15)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.10)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    purple: '#6450ff',
    green: '#4aff9f',
    greenDim: 'rgba(74,255,159,0.10)',
    red: '#ff6b6b',
    redDim: 'rgba(255,107,107,0.10)',
    textPrimary: 'rgba(220,240,255,0.95)',
    textMuted: 'rgba(130,170,220,0.55)',
    textFaint: 'rgba(100,140,180,0.40)',
    gradient: 'linear-gradient(135deg, #00e0ff 0%, #0070e0 100%)',
    gradientBtn: 'linear-gradient(135deg, #00e0ff 0%, #6450ff 100%)',
    gradientText: 'linear-gradient(135deg, #fff 0%, #aad4ff 60%, #00e0ff 100%)',
};

export default function InvitePage() {
    const params = useParams();
    const token = params?.token as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) return;

        const handleAccept = async () => {
            try {
                const res = await staffService.acceptInvite(token);
                if (res.success) {
                    if (res.userExists) {
                        setSuccess(true);
                    } else {
                        window.location.href = `/register?inviteToken=${token}`;
                    }
                } else {
                    setError(res.message || 'Failed to accept invitation');
                }
            } catch (err: any) {
                console.error('Error accepting invite', err);
                setError(err.response?.data?.message || 'Something went wrong. The link might be invalid or already used.');
            } finally {
                setLoading(false);
            }
        };

        handleAccept();
    }, [token]);

    return (
        <Box sx={{
            minHeight: '100vh', bgcolor: T.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            px: 2, position: 'relative', overflow: 'hidden',
            // Ambient glow
            '&::before': {
                content: '""', position: 'fixed',
                top: '-10%', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '400px', pointerEvents: 'none',
                background: 'radial-gradient(ellipse, rgba(0,180,255,0.07) 0%, transparent 70%)',
            },
        }}>
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>

                {/* Brand pill */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        px: 2.5, py: 0.7, borderRadius: '999px',
                        border: `1px solid ${T.borderCyan}`,
                        bgcolor: T.cyanDim, backdropFilter: 'blur(12px)',
                    }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: T.cyan, boxShadow: `0 0 6px ${T.cyan}` }} />
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.18em', color: T.cyan }}>
                            NEXASERV
                        </Typography>
                    </Box>
                </Box>

                {/* Card */}
                <Box sx={{
                    bgcolor: T.bgCard, backdropFilter: 'blur(24px)',
                    border: `1px solid ${loading ? T.borderCyan :
                            success ? 'rgba(74,255,159,0.2)' :
                                'rgba(255,107,107,0.2)'
                        }`,
                    borderRadius: '20px',
                    p: { xs: 4, sm: 5 },
                    textAlign: 'center',
                    boxShadow: `0 24px 80px rgba(0,0,0,0.45), 0 0 40px ${loading ? 'rgba(0,224,255,0.05)' :
                            success ? 'rgba(74,255,159,0.07)' :
                                'rgba(255,107,107,0.07)'
                        }`,
                    animation: 'cardIn 0.55s cubic-bezier(0.16,1,0.3,1) both',
                    transition: 'border-color 0.4s, box-shadow 0.4s',
                }}>

                    {/* Title */}
                    <Typography sx={{
                        fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.6rem' },
                        letterSpacing: '-0.03em', mb: 0.8,
                        background: T.gradientText,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Team Invitation
                    </Typography>
                    <Typography sx={{ color: T.textMuted, fontSize: '0.82rem', mb: 4 }}>
                        You've been invited to join a team on Nexaserv
                    </Typography>

                    {/* ── Loading ── */}
                    {loading && (
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: `conic-gradient(${T.cyan}, ${T.purple}, ${T.cyan})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                            }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: T.bg }} />
                            </Box>
                            <Typography sx={{ color: T.textMuted, fontSize: '0.85rem' }}>
                                Processing your invitation…
                            </Typography>
                        </Box>
                    )}

                    {/* ── Success ── */}
                    {!loading && success && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{
                                width: 72, height: 72, borderRadius: '50%',
                                bgcolor: T.greenDim, border: '1.5px solid rgba(74,255,159,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 30px rgba(74,255,159,0.15)',
                            }}>
                                <CheckCircleIcon sx={{ fontSize: '2rem', color: T.green }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: T.textPrimary, fontWeight: 700, fontSize: '1rem', mb: 0.8 }}>
                                    Invitation Accepted!
                                </Typography>
                                <Typography sx={{ color: T.textMuted, fontSize: '0.83rem', lineHeight: 1.7 }}>
                                    You're now part of the team. Head to your dashboard to start collaborating.
                                </Typography>
                            </Box>
                            <Box
                                component={Link} href="/dashboard"
                                sx={{
                                    mt: 1, py: 1.3, px: 4, borderRadius: '10px',
                                    background: T.gradientBtn, color: 'white',
                                    fontSize: '0.88rem', fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 1,
                                    boxShadow: `0 0 24px rgba(0,224,255,0.2)`,
                                    transition: 'all 0.2s',
                                    '&:hover': { opacity: 0.88, transform: 'translateY(-2px)', boxShadow: `0 0 36px rgba(0,224,255,0.35)` },
                                }}
                            >
                                Go to Dashboard <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
                            </Box>
                        </Box>
                    )}

                    {/* ── Error ── */}
                    {!loading && error && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{
                                width: 72, height: 72, borderRadius: '50%',
                                bgcolor: T.redDim, border: '1.5px solid rgba(255,107,107,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 30px rgba(255,107,107,0.12)',
                            }}>
                                <ErrorOutlineIcon sx={{ fontSize: '2rem', color: T.red }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: T.textPrimary, fontWeight: 700, fontSize: '1rem', mb: 0.8 }}>
                                    Invitation Failed
                                </Typography>
                                <Typography sx={{ color: T.textMuted, fontSize: '0.83rem', lineHeight: 1.7, mb: 0.5 }}>
                                    {error}
                                </Typography>
                                <Typography sx={{ color: T.textFaint, fontSize: '0.78rem' }}>
                                    Please contact the business owner if you believe this is an error.
                                </Typography>
                            </Box>
                            <Box
                                component={Link} href="/"
                                sx={{
                                    mt: 1, py: 1.3, px: 4, borderRadius: '10px',
                                    border: `1px solid ${T.borderCyan}`,
                                    bgcolor: T.cyanDim, color: T.cyan,
                                    fontSize: '0.88rem', fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: 1,
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: 'rgba(0,224,255,0.15)', transform: 'translateY(-1px)' },
                                }}
                            >
                                Back to Home
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: T.textFaint, letterSpacing: '0.05em' }}>
                        Powered by{' '}
                        <Box component="span" sx={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
                            Nexaserv
                        </Box>
                    </Typography>
                </Box>
            </Container>

            <style>{`
                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </Box>
    );
}