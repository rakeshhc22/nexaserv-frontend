'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '@/lib/api';
import NeuralBackground from '@/components/NeuralBackground';

const C = {
    cyan: '#00C8FF',
    purple: '#6450FF',
    dark: '#030810',
    card: 'rgba(8, 20, 48, 0.72)',
    border: 'rgba(0, 200, 255, 0.15)',
    muted: 'rgba(130, 170, 220, 0.5)',
};

const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: 'rgba(0, 10, 30, 0.6)',
        color: 'rgba(210, 235, 255, 0.9)',
        borderRadius: 1.5,
        fontSize: '0.9rem',
        backdropFilter: 'blur(8px)',
        '& fieldset': { borderColor: 'rgba(0,200,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(0,200,255,0.35)' },
        '&.Mui-focused fieldset': { borderColor: C.cyan },
    },
    '& .MuiInputBase-input::placeholder': { color: 'rgba(100,140,180,0.5)', opacity: 1 },
};

const labelSx = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(180,210,255,0.55)', mb: 0.8, letterSpacing: '0.08em' };

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [business, setBusiness] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirm) { setError('Passwords do not match'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, businessName: business, email, password });
            if (res.data.success) {
                const { token, refreshToken, user } = res.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                router.push('/onboarding');
            }
        } catch (err: any) {
            let msg = 'Registration failed. Please try again.';
            if (err instanceof AxiosError) msg = err.response?.data?.message || msg;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const perks = ['AI voice-guided setup', 'No credit card required', 'Cancel anytime'];

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflow: 'hidden' }}>
            <Box sx={{ position: 'fixed', inset: 0, zIndex: 0 }}><NeuralBackground /></Box>
            <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, rgba(100,80,255,0.07), transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />

            <Box sx={{
                position: 'relative', zIndex: 1, width: '100%', maxWidth: 440,
                background: C.card, backdropFilter: 'blur(24px)',
                border: `1px solid ${C.border}`, borderRadius: 3,
                boxShadow: '0 0 80px rgba(0,0,0,0.5)',
                p: { xs: 3.5, sm: 5 },
                animation: 'cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both',
            }}>
                {/* Brand */}
                <Stack spacing={0.5} alignItems="center" sx={{ mb: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SmartToyIcon sx={{ fontSize: '1rem', color: C.cyan }} />
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.18em', color: C.cyan }}>NEXASERV</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'rgba(220,240,255,0.95)', letterSpacing: '-0.02em' }}>
                        Create your account
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: C.muted }}>
                        Start your free trial — up and running in minutes
                    </Typography>
                </Stack>

                {/* Perks */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mb: 3.5, flexWrap: 'wrap' }}>
                    {perks.map(p => (
                        <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircleIcon sx={{ fontSize: '0.75rem', color: C.cyan }} />
                            <Typography sx={{ fontSize: '0.72rem', color: C.muted }}>{p}</Typography>
                        </Box>
                    ))}
                </Box>

                <form onSubmit={handleRegister}>
                    <Stack spacing={2}>
                        {error && (
                            <Box sx={{ px: 2, py: 1.2, borderRadius: 1.5, background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.18)' }}>
                                <Typography sx={{ color: '#FF7070', fontSize: '0.8rem', textAlign: 'center' }}>{error}</Typography>
                            </Box>
                        )}

                        {/* Two columns: name + business */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                                <Typography sx={labelSx}>FULL NAME</Typography>
                                <TextField fullWidth size="small" placeholder="John Doe"
                                    value={name} onChange={e => setName(e.target.value)} sx={inputSx}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'rgba(0,200,255,0.3)', fontSize: 17 }} /></InputAdornment> } }}
                                />
                            </Box>
                            <Box>
                                <Typography sx={labelSx}>BUSINESS</Typography>
                                <TextField fullWidth size="small" placeholder="Your Biz"
                                    value={business} onChange={e => setBusiness(e.target.value)} sx={inputSx}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: 'rgba(0,200,255,0.3)', fontSize: 17 }} /></InputAdornment> } }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={labelSx}>EMAIL</Typography>
                            <TextField fullWidth size="small" type="email" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} sx={inputSx}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'rgba(0,200,255,0.3)', fontSize: 17 }} /></InputAdornment> } }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={labelSx}>PASSWORD</Typography>
                            <TextField fullWidth size="small" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                                value={password} onChange={e => setPassword(e.target.value)} sx={inputSx}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'rgba(0,200,255,0.3)', fontSize: 17 }} /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(s => !s)} edge="end" size="small" sx={{ color: 'rgba(0,200,255,0.3)', '&:hover': { color: C.cyan } }}>{showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
                                    }
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={labelSx}>CONFIRM PASSWORD</Typography>
                            <TextField fullWidth size="small" type={showConf ? 'text' : 'password'} placeholder="••••••••"
                                value={confirm} onChange={e => setConfirm(e.target.value)} sx={inputSx}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: confirm && confirm === password ? '#4AFF9F' : 'rgba(0,200,255,0.3)', fontSize: 17 }} /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConf(s => !s)} edge="end" size="small" sx={{ color: 'rgba(0,200,255,0.3)', '&:hover': { color: C.cyan } }}>{showConf ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
                                    }
                                }}
                            />
                        </Box>

                        <Button fullWidth type="submit" disabled={loading}
                            endIcon={!loading && <ArrowForwardIcon fontSize="small" />}
                            sx={{
                                mt: 0.5, height: 44, borderRadius: 2, fontWeight: 700, fontSize: '0.92rem', textTransform: 'none',
                                background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                                color: 'white', boxShadow: `0 0 24px rgba(0,200,255,0.22)`,
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 0 40px rgba(0,200,255,0.45)` },
                                '&.Mui-disabled': { opacity: 0.55, background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, color: 'white' },
                                transition: 'all 0.25s ease',
                            }}
                        >
                            {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Create Free Account'}
                        </Button>
                    </Stack>
                </form>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,200,255,0.1)' }} />
                    <Typography sx={{ fontSize: '0.72rem', color: C.muted }}>already a member?</Typography>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(0,200,255,0.1)' }} />
                </Box>

                <Typography sx={{ fontSize: '0.82rem', color: C.muted, textAlign: 'center' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ textDecoration: 'none' }}>
                        <Typography component="span" sx={{ color: C.cyan, fontWeight: 600, fontSize: '0.82rem', '&:hover': { textDecoration: 'underline' } }}>
                            Sign in →
                        </Typography>
                    </Link>
                </Typography>
            </Box>

            <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        </Box>
    );
}