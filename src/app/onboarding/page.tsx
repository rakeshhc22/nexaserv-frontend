'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { BusinessData } from '@/types/business';
import { useOnboarding } from './OnboardingContext';
import { integrationService, Integration } from '@/lib/services/integration.service';
import OnboardingModeSelector from '@/components/onboarding/OnboardingModeSelector';
import LiveKitVoiceFlow from '@/components/onboarding/LiveKitVoiceFlow';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    cyan: '#00C8FF',
    purple: '#6450FF',
    dark: '#030810',
    card: 'rgba(8, 20, 48, 0.72)',
    border: 'rgba(0, 200, 255, 0.12)',
    muted: 'rgba(130, 170, 220, 0.5)',
    text: 'rgba(200, 225, 255, 0.88)',
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
        '&.Mui-focused fieldset': { borderColor: C.cyan, boxShadow: '0 0 0 3px rgba(0,200,255,0.08)' },
    },
    '& .MuiInputBase-input': {
        color: 'rgba(210,235,255,0.9) !important',
        WebkitTextFillColor: 'rgba(210,235,255,0.9) !important',
        '&::placeholder': { color: 'rgba(100,140,180,0.45)', opacity: 1 },
    },
    '& textarea': { color: 'rgba(210,235,255,0.9) !important' },
    '& input[type="time"]': { colorScheme: 'dark' },
};

const labelSx = {
    fontSize: '0.72rem', fontWeight: 700,
    color: 'rgba(180,210,255,0.55)',
    letterSpacing: '0.08em', mb: 0.8, display: 'block',
};

const ctaBtn = {
    height: 46, borderRadius: 2,
    background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
    color: 'white', fontWeight: 700, fontSize: '0.92rem',
    textTransform: 'none' as const,
    boxShadow: `0 0 24px rgba(0,200,255,0.22)`,
    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 0 40px rgba(0,200,255,0.45)` },
    '&.Mui-disabled': { opacity: 0.45, background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, color: 'white' },
    transition: 'all 0.25s ease',
};

export default function OnboardingPage() {
    const { activeStep, setActiveStep, steps } = useOnboarding();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingGmail, setSavingGmail] = useState(false);
    const [savingCalendar, setSavingCalendar] = useState(false);
    const [integrations, setIntegrations] = useState<Record<string, Integration>>({});
    const [onboardingMode, setOnboardingMode] = useState<'select' | 'manual' | 'voice'>('select');
    const router = useRouter();

    const [businessData, setBusinessData] = useState<BusinessData>({
        name: '', category: 'other', customCategory: '', description: '',
        phone: '', email: '', website: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        emailConnected: false,
        contactFormFields: ['name', 'email'],
        workingHours: [
            { day: 'monday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'tuesday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'wednesday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'thursday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'friday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'saturday', start: '10:00', end: '14:00', isOpen: false },
            { day: 'sunday', start: '10:00', end: '14:00', isOpen: false },
        ],
        services: [{ name: 'Consultation', duration: 30, price: 0, description: 'Initial meeting' }],
    });

    const fetchProgress = useCallback(async () => {
        try {
            const res = await api.get('/onboarding/progress');
            const { currentStep, business } = res.data.data;
            if (res.data.data.isSetupComplete) { router.push('/dashboard'); return; }
            setBusinessData(prev => ({
                ...prev, ...business,
                address: business.address || prev.address,
                workingHours: business.workingHours?.length ? business.workingHours : prev.workingHours,
                contactFormFields: business.contactFormFields?.length ? business.contactFormFields : prev.contactFormFields,
                services: business.services?.length ? business.services : prev.services,
            }));
            setActiveStep(Math.max(0, currentStep - 1));
        } catch (e) { console.error('Failed to fetch progress', e); }
        finally { setLoading(false); }
    }, [router, setActiveStep]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fromOAuth = params.get('gmail') === 'connected' || params.get('calendar') === 'connected';
        if (fromOAuth) {
            const saved = localStorage.getItem('onboardingMode');
            setOnboardingMode(saved === 'voice' ? 'voice' : 'manual');
            setLoading(false);
            localStorage.removeItem('onboardingMode');
            return;
        }
        if (onboardingMode === 'manual') fetchProgress();
        else if (onboardingMode === 'select') setLoading(false);
        loadIntegrationStatus();
    }, [fetchProgress, onboardingMode]);

    const loadIntegrationStatus = async () => {
        try { setIntegrations(await integrationService.getStatus()); } catch { }
    };

    const handleConnectGoogleCalendar = async () => {
        try {
            setSavingCalendar(true);
            localStorage.setItem('onboardingMode', 'manual');
            const res = await api.get('/integrations/google/connect?return=onboarding', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            window.location.href = res.data.url;
        } catch { setSavingCalendar(false); }
    };

    const handleConnectGmail = async () => {
        try {
            setSavingGmail(true);
            localStorage.setItem('onboardingMode', 'manual');
            const res = await api.get('/integrations/gmail/connect?return=onboarding', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            window.location.href = res.data.url;
        } catch { setSavingGmail(false); }
    };

    const isNextDisabled = useMemo(() => {
        switch (activeStep) {
            case 0: return !businessData.name.trim() || !businessData.customCategory?.trim() || !businessData.description.trim();
            case 1: return false;
            case 2: return businessData.contactFormFields.length < 2;
            case 3: return !businessData.services.length || !businessData.services.every(s => s.name.trim() && s.duration >= 15 && s.price >= 1);
            case 4: return !businessData.workingHours.some(h => h.isOpen);
            default: return false;
        }
    }, [activeStep, businessData]);

    const handleNext = async () => {
        setSaving(true);
        try {
            const stepNum = activeStep + 1;
            let payload: any = {};
            switch (stepNum) {
                case 1: payload = { name: businessData.name, category: businessData.category, description: businessData.description, phone: businessData.phone, email: businessData.email, website: businessData.website, address: businessData.address }; break;
                case 2: payload = { emailConnected: businessData.emailConnected }; break;
                case 3: payload = { contactFormFields: businessData.contactFormFields }; break;
                case 4: payload = { services: businessData.services }; break;
                case 5: payload = { workingHours: businessData.workingHours }; break;
                case 6:
                    const res = await api.post('/onboarding/complete');
                    if (res.data.success) {
                        const { token, refreshToken, user, business } = res.data.data;
                        localStorage.setItem('token', token);
                        localStorage.setItem('refreshToken', refreshToken);
                        localStorage.setItem('user', JSON.stringify(user));
                        localStorage.setItem('selectedBusinessId', user.businessId || business?._id || '');
                        window.location.href = '/dashboard'; return;
                    }
                    router.push('/dashboard'); return;
            }
            if (stepNum < 6) { await api.put(`/onboarding/step/${stepNum}`, payload); setActiveStep(activeStep + 1); }
        } catch (e) { console.error('Failed to save step', e); }
        finally { setSaving(false); }
    };

    const handleBack = () => setActiveStep(activeStep - 1);

    const getStepTitle = () => ['Welcome to Nexaserv', 'Connect Your Tools', 'Set Up Lead Capture', 'Define Your Services', 'Set Your Availability', 'Ready to Launch!'][activeStep] || '';
    const getStepDesc = () => [
        'Let\'s start by setting up your business profile. This helps us personalize your workspace.',
        'Connect Gmail and Google Calendar to automate your workflow and never miss an appointment.',
        'Configure the fields for your contact forms to automatically capture leads.',
        'Add the services you offer with pricing and duration so customers can book easily.',
        'Set your business hours so clients know when you\'re available.',
        'Your workspace is ready. Enter your dashboard and start managing your business.',
    ][activeStep] || '';

    // ── Mode selector ──────────────────────────────────────────────────────────
    if (onboardingMode === 'select') {
        return <OnboardingModeSelector onSelectMode={(mode) => { setOnboardingMode(mode); if (mode === 'manual') fetchProgress(); }} />;
    }

    // ── Voice flow ─────────────────────────────────────────────────────────────
    if (onboardingMode === 'voice') {
        return (
            <Box sx={{ position: 'fixed', top: 0, left: { xs: 0, md: '340px' }, right: 0, bottom: 0, zIndex: 100 }}>
                <LiveKitVoiceFlow onComplete={async (voiceData) => {
                    setBusinessData(prev => ({ ...prev, ...voiceData }));
                    try {
                        setActiveStep(0); await api.put('/onboarding/step/1', { name: voiceData.name, category: voiceData.category || 'other', customCategory: voiceData.customCategory, description: voiceData.description, phone: voiceData.phone || '', email: voiceData.email || '', website: voiceData.website || '', address: voiceData.address || { street: '', city: '', state: '', zipCode: '', country: '' } });
                        setActiveStep(1); await api.put('/onboarding/step/2', { emailConnected: false });
                        setActiveStep(2); await api.put('/onboarding/step/3', { contactFormFields: ['name', 'email'] });
                        setActiveStep(3); await api.put('/onboarding/step/4', { services: voiceData.services?.length ? voiceData.services : [{ name: 'Consultation', duration: 30, price: 0, description: 'Initial meeting' }] });
                        setActiveStep(4); await api.put('/onboarding/step/5', { workingHours: voiceData.workingHours?.length ? voiceData.workingHours : businessData.workingHours });
                        setActiveStep(5); await api.post('/onboarding/complete');
                        window.location.href = '/dashboard';
                    } catch (e) { console.error('Failed to save voice onboarding data', e); }
                }} />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: `conic-gradient(${C.cyan}, ${C.purple}, ${C.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 1s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: C.dark }} />
                </Box>
            </Box>
        );
    }

    // ── Step renderers ─────────────────────────────────────────────────────────
    const renderStep1 = () => (
        <Stack spacing={3}>
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={labelSx}>BUSINESS NAME</Typography>
                    <TextField fullWidth size="small" placeholder="e.g., Rocky's Salon" value={businessData.name} onChange={e => setBusinessData({ ...businessData, name: e.target.value })} sx={inputSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={labelSx}>CATEGORY</Typography>
                    <TextField fullWidth size="small" placeholder="e.g., Salon, Consulting" value={businessData.customCategory || ''} onChange={e => setBusinessData({ ...businessData, category: 'other', customCategory: e.target.value })} sx={inputSx} />
                </Grid>
            </Grid>
            <Box>
                <Typography sx={labelSx}>DESCRIPTION</Typography>
                <TextField fullWidth multiline rows={4} size="small" placeholder="Briefly describe what your business does..." value={businessData.description} onChange={e => setBusinessData({ ...businessData, description: e.target.value })} sx={inputSx} />
                <Typography sx={{ color: 'rgba(130,170,220,0.3)', fontSize: '0.72rem', mt: 0.5, textAlign: 'right' }}>{businessData.description.length} / 500</Typography>
            </Box>
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={labelSx}>PHONE <Box component="span" sx={{ color: C.muted, fontWeight: 400, fontSize: '0.68rem' }}>optional</Box></Typography>
                    <TextField fullWidth size="small" placeholder="+91 98765 43210" value={businessData.phone} onChange={e => setBusinessData({ ...businessData, phone: e.target.value })} sx={inputSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={labelSx}>EMAIL <Box component="span" sx={{ color: C.muted, fontWeight: 400, fontSize: '0.68rem' }}>optional</Box></Typography>
                    <TextField fullWidth size="small" placeholder="hello@yourbusiness.com" value={businessData.email} onChange={e => setBusinessData({ ...businessData, email: e.target.value })} sx={inputSx} />
                </Grid>
            </Grid>
            <Box>
                <Typography sx={labelSx}>WEBSITE <Box component="span" sx={{ color: C.muted, fontWeight: 400, fontSize: '0.68rem' }}>optional</Box></Typography>
                <TextField fullWidth size="small" placeholder="https://yourbusiness.com" value={businessData.website} onChange={e => setBusinessData({ ...businessData, website: e.target.value })} sx={inputSx} />
            </Box>
        </Stack>
    );

    const integrationCard = (
        key: string, label: string, sub: string, Icon: any,
        isConnected: boolean, saving: boolean, onClick: () => void
    ) => (
        <Box sx={{
            p: 3.5, borderRadius: 2.5,
            background: C.card, backdropFilter: 'blur(16px)',
            border: isConnected ? '1px solid rgba(74,255,159,0.25)' : `1px solid ${C.border}`,
            boxShadow: isConnected ? '0 0 20px rgba(74,255,159,0.06)' : 'none',
            transition: 'all 0.3s ease',
            '&:hover': { borderColor: isConnected ? 'rgba(74,255,159,0.4)' : 'rgba(0,200,255,0.25)', transform: 'translateY(-2px)' },
        }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: isConnected ? 'rgba(74,255,159,0.1)' : 'rgba(0,200,255,0.08)',
                        border: isConnected ? '1px solid rgba(74,255,159,0.2)' : '1px solid rgba(0,200,255,0.12)',
                        display: 'flex',
                    }}>
                        <Icon sx={{ color: isConnected ? '#4AFF9F' : C.cyan, fontSize: 26 }} />
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ color: 'rgba(220,240,255,0.95)', fontWeight: 700, fontSize: '1rem' }}>{label}</Typography>
                            {isConnected && <CheckCircleIcon sx={{ color: '#4AFF9F', fontSize: '1rem' }} />}
                        </Box>
                        <Typography sx={{ color: C.muted, fontSize: '0.82rem', mt: 0.3 }}>{sub}</Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained" size="small" onClick={onClick} disabled={saving}
                    sx={{
                        background: isConnected ? 'rgba(74,255,159,0.1)' : `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                        color: isConnected ? '#4AFF9F' : 'white',
                        border: isConnected ? '1px solid rgba(74,255,159,0.25)' : 'none',
                        borderRadius: 1.5, textTransform: 'none', fontWeight: 600,
                        px: 3, py: 1, fontSize: '0.85rem',
                        boxShadow: isConnected ? 'none' : '0 0 16px rgba(0,200,255,0.2)',
                        '&:hover': { boxShadow: isConnected ? 'none' : '0 0 24px rgba(0,200,255,0.4)' },
                        '&.Mui-disabled': { opacity: 0.6, background: isConnected ? 'rgba(74,255,159,0.1)' : `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, color: isConnected ? '#4AFF9F' : 'white' },
                    }}
                >
                    {saving ? <CircularProgress size={16} sx={{ color: 'currentColor' }} /> : (isConnected ? 'Connected' : 'Connect')}
                </Button>
            </Stack>
        </Box>
    );

    const renderStep2 = () => (
        <Stack spacing={2.5}>
            {integrationCard('gmail', 'Connect Gmail', 'View inbox and send emails from dashboard', EmailIcon, integrations['gmail']?.status === 'connected', savingGmail, handleConnectGmail)}
            {integrationCard('google-calendar', 'Google Calendar', 'Sync your business bookings and availability', CalendarTodayIcon, integrations['google-calendar']?.status === 'connected', savingCalendar, handleConnectGoogleCalendar)}
        </Stack>
    );

    const renderStep3 = () => (
        <Grid container spacing={2}>
            {['name', 'email'].map(field => (
                <Grid size={{ xs: 12, sm: 6 }} key={field}>
                    <Box sx={{
                        p: 3, borderRadius: 2,
                        background: C.card, backdropFilter: 'blur(12px)',
                        border: `1px solid ${C.border}`,
                        '&:hover': { borderColor: 'rgba(0,200,255,0.25)' },
                        transition: 'all 0.2s',
                    }}>
                        <FormControlLabel
                            control={<Checkbox checked={businessData.contactFormFields.includes(field)} disabled={field === 'name' || field === 'email'} onChange={e => { const f = businessData.contactFormFields; setBusinessData({ ...businessData, contactFormFields: e.target.checked ? [...f, field] : f.filter(x => x !== field) }); }} sx={{ color: 'rgba(0,200,255,0.25)', '&.Mui-checked': { color: C.cyan }, '&.Mui-checked.Mui-disabled': { color: C.cyan } }} />}
                            label={<Typography sx={{ color: 'rgba(220,240,255,0.9)', fontWeight: 600 }}>{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>}
                            sx={{ m: 0 }}
                        />
                    </Box>
                </Grid>
            ))}
        </Grid>
    );

    const renderStep4 = () => (
        <Stack spacing={2.5}>
            {businessData.services.map((service, i) => (
                <Box key={i} sx={{ p: 3, borderRadius: 2, background: C.card, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, '&:hover': { borderColor: 'rgba(0,200,255,0.25)' }, transition: 'all 0.2s' }}>
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={labelSx}>SERVICE NAME</Typography>
                            <TextField fullWidth size="small" placeholder="e.g., Haircut" value={service.name} onChange={e => { const s = [...businessData.services]; s[i].name = e.target.value; setBusinessData({ ...businessData, services: s }); }} sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 5, sm: 2.5 }}>
                            <Typography sx={labelSx}>DURATION (min)</Typography>
                            <TextField fullWidth size="small" type="number" placeholder="30" value={service.duration || ''} onChange={e => { const s = [...businessData.services]; s[i].duration = e.target.value === '' ? 0 : parseInt(e.target.value) || 0; setBusinessData({ ...businessData, services: s }); }} inputProps={{ min: 0 }} sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 5, sm: 2.5 }}>
                            <Typography sx={labelSx}>PRICE (₹)</Typography>
                            <TextField fullWidth size="small" type="number" placeholder="500" value={service.price || ''} onChange={e => { const s = [...businessData.services]; s[i].price = e.target.value === '' ? 0 : parseInt(e.target.value) || 0; setBusinessData({ ...businessData, services: s }); }} inputProps={{ min: 0 }} sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton size="small" sx={{ color: C.muted, '&:hover': { color: '#FF6B6B', bgcolor: 'rgba(255,107,107,0.08)' } }} onClick={() => setBusinessData({ ...businessData, services: businessData.services.filter((_, idx) => idx !== i) })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => setBusinessData({ ...businessData, services: [...businessData.services, { name: '', duration: 30, price: 0, description: '' }] })} sx={{ color: C.muted, alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, '&:hover': { color: C.cyan, bgcolor: 'rgba(0,200,255,0.06)' } }}>
                Add another service
            </Button>
        </Stack>
    );

    const renderStep5 = () => (
        <Stack spacing={2}>
            {businessData.workingHours.map((wh, i) => (
                <Box key={wh.day} sx={{ p: 2.5, borderRadius: 2, background: C.card, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(0,200,255,0.25)' } }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel control={<Checkbox size="small" checked={wh.isOpen} onChange={e => { const h = [...businessData.workingHours]; h[i].isOpen = e.target.checked; setBusinessData({ ...businessData, workingHours: h }); }} sx={{ color: 'rgba(0,200,255,0.25)', '&.Mui-checked': { color: C.cyan } }} />} label={<Typography sx={{ color: wh.isOpen ? 'rgba(220,240,255,0.9)' : C.muted, fontWeight: wh.isOpen ? 700 : 500, fontSize: '0.9rem' }}>{wh.day.charAt(0).toUpperCase() + wh.day.slice(1)}</Typography>} />
                        </Grid>
                        {wh.isOpen && (
                            <>
                                <Grid size={{ xs: 5, sm: 4 }}>
                                    <TextField type="time" size="small" fullWidth value={wh.start} onChange={e => { const h = [...businessData.workingHours]; h[i].start = e.target.value; setBusinessData({ ...businessData, workingHours: h }); }} sx={inputSx} />
                                </Grid>
                                <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Typography sx={{ color: C.muted, fontWeight: 600 }}>—</Typography>
                                </Grid>
                                <Grid size={{ xs: 5, sm: 4 }}>
                                    <TextField type="time" size="small" fullWidth value={wh.end} onChange={e => { const h = [...businessData.workingHours]; h[i].end = e.target.value; setBusinessData({ ...businessData, workingHours: h }); }} sx={inputSx} />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            ))}
        </Stack>
    );

    const renderStep6 = () => (
        <Box sx={{ py: 4, textAlign: 'center' }}>
            {/* Glow circle */}
            <Box sx={{ width: 100, height: 100, borderRadius: '50%', mx: 'auto', mb: 4, background: `radial-gradient(circle, rgba(0,200,255,0.15), rgba(100,80,255,0.1))`, border: `1.5px solid rgba(0,200,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0,200,255,0.2)' }}>
                <RocketLaunchIcon sx={{ fontSize: '2.8rem', color: C.cyan }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.03em', mb: 2, background: `linear-gradient(135deg, #fff 0%, #AAD4FF 60%, ${C.cyan} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                You're All Set!
            </Typography>
            <Typography sx={{ color: C.muted, mb: 6, lineHeight: 1.7, maxWidth: 420, mx: 'auto' }}>
                Your business workspace is ready. Start managing leads, bookings, and automations from your personalized dashboard.
            </Typography>
            <Button variant="contained" size="large" onClick={handleNext} disabled={saving} endIcon={!saving && <ArrowForwardIcon />} sx={{ ...ctaBtn, px: 8, py: 1.8, fontSize: '1rem' }}>
                {saving ? 'Launching...' : 'Enter Dashboard'}
            </Button>
        </Box>
    );

    const renderContent = () => [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6][activeStep]?.() ?? null;

    return (
        <Box sx={{ width: '100%', py: { xs: 4, md: 0 } }}>
            {/* ── Step header ── */}
            <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.6, borderRadius: 99, mb: 2.5, bgcolor: 'rgba(0,200,255,0.07)', border: `1px solid rgba(0,200,255,0.2)` }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
                    <Typography sx={{ color: C.cyan, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.12em' }}>
                        STEP {activeStep + 1} OF {steps.length}
                    </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.8rem' }, letterSpacing: '-0.03em', mb: 1, background: `linear-gradient(135deg, #fff 0%, #AAD4FF 60%, ${C.cyan} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {getStepTitle()}
                </Typography>
                <Typography sx={{ color: C.muted, lineHeight: 1.7, fontSize: '0.88rem', maxWidth: 480 }}>
                    {getStepDesc()}
                </Typography>
            </Box>

            {renderContent()}

            {/* ── Navigation ── */}
            {activeStep < 5 && (
                <Box sx={{ display: 'flex', alignItems: 'center', pt: 5, mt: 5, borderTop: `1px solid rgba(0,200,255,0.08)` }}>
                    <Button startIcon={<ArrowBackIcon fontSize="small" />} disabled={activeStep === 0} onClick={handleBack} sx={{ color: C.muted, fontWeight: 600, textTransform: 'none', visibility: activeStep === 0 ? 'hidden' : 'visible', '&:hover': { color: 'rgba(220,240,255,0.8)', bgcolor: 'rgba(0,200,255,0.05)' } }}>
                        Back
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button variant="contained" disabled={saving || isNextDisabled} onClick={handleNext} endIcon={!saving && <ArrowForwardIcon fontSize="small" />} sx={ctaBtn}>
                        {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (activeStep === steps.length - 2 ? 'Complete Setup' : 'Next Step')}
                    </Button>
                </Box>
            )}
        </Box>
    );
}