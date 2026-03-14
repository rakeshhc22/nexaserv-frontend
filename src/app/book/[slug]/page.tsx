'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { bookingService } from '@/lib/services/booking.service';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardActionArea,
    Container,
    Step,
    Stepper,
    StepLabel,
    TextField,
    Divider,
    CircularProgress,
    Chip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

// ── Theme tokens ──────────────────────────────────────────────────────────────
const T = {
    bg: '#050a14',
    bgCard: 'rgba(255,255,255,0.03)',
    bgCardHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.08)',
    borderFocus: 'rgba(0,224,255,0.5)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.15)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    textPrimary: '#f0f6ff',
    textSecondary: '#8ba3c7',
    textMuted: '#4a6080',
    green: '#10b981',
    greenDim: 'rgba(16,185,129,0.15)',
    red: '#ff4d4d',
    redDim: 'rgba(255,77,77,0.15)',
    gradient: 'linear-gradient(135deg, #00e0ff 0%, #0088ff 100%)',
    gradientBtn: 'linear-gradient(135deg, #00e0ff 0%, #0070e0 100%)',
};

const steps = ['Select Service', 'Date & Time', 'Your Details'];

interface Service {
    _id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
}

interface Business {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    services?: Service[];
    operatingHours?: {
        [key: string]: { isOpen: boolean; start: string; end: string };
    };
    workingHours?: {
        [key: string]: { isOpen: boolean; start: string; end: string };
    };
}

const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const period = currentHour >= 12 ? 'PM' : 'AM';
        const displayHour = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
        const displayMin = currentMin.toString().padStart(2, '0');
        slots.push(`${displayHour}:${displayMin} ${period}`);
        currentMin += 60;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
    }
    return slots;
};

// ── Shared input sx ───────────────────────────────────────────────────────────
const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        bgcolor: 'rgba(255,255,255,0.04)',
        '& fieldset': { borderColor: T.border },
        '&:hover fieldset': { borderColor: 'rgba(0,224,255,0.3)' },
        '&.Mui-focused fieldset': { borderColor: T.borderFocus, borderWidth: '1px', boxShadow: `0 0 0 3px ${T.cyanGlow}` },
    },
    '& .MuiInputLabel-root': {
        color: T.textSecondary,
        fontSize: '0.875rem',
        fontWeight: 600,
        '&.Mui-focused': { color: T.cyan },
    },
    '& .MuiOutlinedInput-input': {
        color: T.textPrimary,
        fontSize: '0.875rem',
        py: 1.3,
    },
    '& .MuiInputBase-inputMultiline': { color: T.textPrimary },
};

export default function PublicBookingPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [business, setBusiness] = useState<Business | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });

    useEffect(() => {
        if (!slug) return;
        const fetchBusiness = async () => {
            try {
                const data = await bookingService.getPublicBusinessInfo(slug);
                if (data.success) {
                    setBusiness(data.data);
                    setServices(data.data.services || []);
                }
            } catch (error) {
                console.error('Failed to load business info', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, [slug]);

    useEffect(() => {
        if (!selectedDate || selectedServiceId) return;
        const hours = business?.operatingHours || business?.workingHours;
        if (hours) {
            const date = new Date(selectedDate + 'T00:00:00');
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayHours = hours[dayNames[date.getDay()]];
            if (dayHours?.isOpen) {
                setTimeSlots(generateTimeSlots(dayHours.start, dayHours.end));
            } else {
                setTimeSlots([]);
            }
        } else {
            setTimeSlots(generateTimeSlots('09:00', '17:00'));
        }
    }, [selectedDate, business, selectedServiceId]);

    useEffect(() => {
        if (!selectedDate || !selectedServiceId || !slug) return;
        const fetchBookedSlots = async () => {
            try {
                const service = services.find(s => s._id === selectedServiceId);
                const response = await bookingService.getPublicAvailableSlots(
                    slug, selectedDate, service?.name, service?.duration
                );
                if (response.success && response.slots) {
                    setTimeSlots(response.slots.map((s: any) => s.time));
                    setBookedSlots(response.slots.filter((s: any) => !s.available).map((s: any) => s.time));
                }
            } catch (error) {
                console.error('Failed to fetch booked slots:', error);
                setBookedSlots([]);
            }
        };
        fetchBookedSlots();
    }, [selectedDate, selectedServiceId, slug, services]);

    const handleNext = () => setActiveStep(p => p + 1);
    const handleBack = () => setActiveStep(p => p - 1);

    const handleBookingSubmit = async () => {
        if (!selectedServiceId || !selectedDate || !selectedTime) return;
        const service = services.find(s => s._id === selectedServiceId);
        setSubmitting(true);
        try {
            await bookingService.createPublicBooking(slug, {
                clientName: formData.name,
                clientEmail: formData.email,
                clientPhone: formData.phone,
                serviceType: service?.name || 'Standard',
                date: selectedDate,
                timeSlot: selectedTime,
                duration: service?.duration || 60,
                notes: formData.notes,
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Booking failed', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isNextDisabled =
        (activeStep === 0 && !selectedServiceId) ||
        (activeStep === 1 && (!selectedDate || !selectedTime)) ||
        (activeStep === 2 && (!formData.name || !formData.email || !formData.phone)) ||
        submitting;

    const selectedService = services.find(s => s._id === selectedServiceId);

    // ── Full-screen states ────────────────────────────────────────────────────
    const fullScreenWrap = (children: React.ReactNode) => (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.bg, p: 3 }}>
            {children}
        </Box>
    );

    if (loading) return fullScreenWrap(
        <CircularProgress sx={{ color: T.cyan }} size={40} />
    );

    if (submitted) return fullScreenWrap(
        <Container maxWidth="sm">
            <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '20px', bgcolor: T.bgCard, border: `1px solid ${T.border}`, backdropFilter: 'blur(20px)' }}>
                <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: T.greenDim, border: `1px solid ${T.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircleIcon sx={{ fontSize: 36, color: T.green }} />
                </Box>
                <Typography variant="h5" fontWeight="800" sx={{ color: T.textPrimary, mb: 1.5, letterSpacing: '-0.5px' }}>
                    Booking Confirmed!
                </Typography>
                <Typography variant="body2" sx={{ color: T.textSecondary, mb: 2 }}>
                    Your appointment is booked. Check your email for details.
                </Typography>
                <Typography variant="caption" sx={{ color: T.textMuted }}>
                    {business?.name} will contact you shortly.
                </Typography>
            </Paper>
        </Container>
    );

    if (!business) return fullScreenWrap(
        <Container maxWidth="sm">
            <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '20px', bgcolor: T.bgCard, border: `1px solid ${T.border}` }}>
                <Typography variant="h6" sx={{ color: T.textSecondary }}>
                    Business not found or no longer available.
                </Typography>
            </Paper>
        </Container>
    );

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <Box sx={{
            minHeight: '100vh', bgcolor: T.bg, py: 6, px: 2, position: 'relative', overflow: 'hidden',
            // Subtle radial glow matching landing page
            '&::before': {
                content: '""', position: 'fixed', top: '-20%', left: '50%',
                transform: 'translateX(-50%)',
                width: '600px', height: '400px',
                background: 'radial-gradient(ellipse, rgba(0,180,255,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
            }
        }}>
            <Container maxWidth="md">

                {/* Business Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    {/* Badge pill — matches landing page style */}
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.6, borderRadius: '999px', border: `1px solid ${T.border}`, bgcolor: T.bgCard, backdropFilter: 'blur(10px)', mb: 2 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: T.cyan, boxShadow: `0 0 6px ${T.cyan}` }} />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: T.textSecondary, textTransform: 'uppercase' }}>
                            Online Booking
                        </Typography>
                    </Box>

                    <Typography variant="h4" fontWeight="900" sx={{
                        background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px', mb: 1.5, fontSize: { xs: '1.75rem', sm: '2.25rem' }
                    }}>
                        {business.name}
                    </Typography>

                    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2.5}>
                        {business.email && (
                            <Typography sx={{ fontSize: '0.8rem', color: T.textMuted }}>{business.email}</Typography>
                        )}
                        {business.phone && (
                            <Typography sx={{ fontSize: '0.8rem', color: T.textMuted }}>{business.phone}</Typography>
                        )}
                        {business.website && (
                            <Typography component="a" href={business.website} target="_blank"
                                sx={{ fontSize: '0.8rem', color: T.cyan, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                {business.website.replace(/^https?:\/\//, '')}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Main Booking Card */}
                <Paper elevation={0} sx={{
                    p: { xs: 3, sm: 5 },
                    borderRadius: '20px',
                    bgcolor: T.bgCard,
                    border: `1px solid ${T.border}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                }}>

                    {/* Card Header */}
                    <Box mb={4}>
                        <Typography variant="h5" fontWeight="800" sx={{ color: T.textPrimary, letterSpacing: '-0.5px', mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.35rem' } }}>
                            Book an Appointment
                        </Typography>
                        <Typography sx={{ color: T.textSecondary, fontSize: '0.8rem' }}>
                            Choose a service and select your preferred date and time
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{
                        mb: 4,
                        '& .MuiStepLabel-label': {
                            color: T.textMuted, fontWeight: 600, fontSize: '0.72rem',
                            '&.Mui-active': { color: T.cyan, fontWeight: 700 },
                            '&.Mui-completed': { color: T.green, fontWeight: 700 },
                        },
                        '& .MuiStepIcon-root': {
                            color: 'rgba(255,255,255,0.08)',
                            '&.Mui-active': { color: T.cyan },
                            '&.Mui-completed': { color: T.green },
                        },
                        '& .MuiStepConnector-line': { borderColor: T.border },
                    }}>
                        {steps.map(label => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>

                    <Divider sx={{ mb: 4, borderColor: T.border }} />

                    {/* ── Step Content ── */}
                    <Box minHeight="300px">

                        {/* Step 1 — Select Service */}
                        {activeStep === 0 && (
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: T.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
                                    Choose a Service
                                </Typography>
                                <Grid container spacing={2}>
                                    {services.length === 0 ? (
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ p: 3, textAlign: 'center', borderRadius: '12px', border: `1px dashed ${T.border}` }}>
                                                <Typography sx={{ color: T.textMuted, fontSize: '0.875rem' }}>
                                                    No services available at the moment.
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ) : services.map(service => {
                                        const isSelected = selectedServiceId === service._id;
                                        return (
                                            <Grid size={{ xs: 12 }} key={service._id}>
                                                <Card variant="outlined" sx={{
                                                    borderRadius: '14px',
                                                    borderColor: isSelected ? T.cyan : T.border,
                                                    borderWidth: isSelected ? '1.5px' : '1px',
                                                    bgcolor: isSelected ? T.cyanDim : T.bgCard,
                                                    transition: 'all 0.2s',
                                                    boxShadow: isSelected ? `0 0 20px ${T.cyanGlow}` : 'none',
                                                    '&:hover': { borderColor: T.cyan, bgcolor: isSelected ? T.cyanDim : T.bgCardHover },
                                                }}>
                                                    <CardActionArea onClick={() => setSelectedServiceId(service._id)} sx={{ p: 2.5 }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                            <Box flex={1}>
                                                                <Typography fontWeight="700" sx={{ color: T.textPrimary, mb: 0.5, fontSize: '0.95rem' }}>
                                                                    {service.name}
                                                                </Typography>
                                                                <Typography sx={{ color: T.textSecondary, mb: 1.5, fontSize: '0.8rem', lineHeight: 1.5 }}>
                                                                    {service.description}
                                                                </Typography>
                                                                <Box display="flex" gap={1} flexWrap="wrap">
                                                                    <Chip
                                                                        icon={<AccessTimeIcon sx={{ fontSize: 13, color: `${T.cyan} !important` }} />}
                                                                        label={`${service.duration} min`}
                                                                        size="small"
                                                                        sx={{ bgcolor: T.cyanDim, color: T.cyan, fontWeight: 700, fontSize: '0.7rem', border: `1px solid rgba(0,224,255,0.2)`, height: '24px' }}
                                                                    />
                                                                    <Chip
                                                                        icon={<CurrencyRupeeIcon sx={{ fontSize: 13, color: `${T.green} !important` }} />}
                                                                        label={service.price}
                                                                        size="small"
                                                                        sx={{ bgcolor: T.greenDim, color: T.green, fontWeight: 700, fontSize: '0.7rem', border: `1px solid rgba(16,185,129,0.2)`, height: '24px' }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                            {isSelected && (
                                                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: T.cyanDim, display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 1, flexShrink: 0 }}>
                                                                    <CheckCircleIcon sx={{ color: T.cyan, fontSize: 20 }} />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </CardActionArea>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        )}

                        {/* Step 2 — Date & Time */}
                        {activeStep === 1 && (
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: T.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
                                    Select Date
                                </Typography>
                                <TextField
                                    type="date"
                                    fullWidth
                                    sx={{ mb: 4, ...inputSx }}
                                    InputLabelProps={{ shrink: true }}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    value={selectedDate}
                                />

                                <Typography sx={{ fontWeight: 700, color: T.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
                                    Available Times
                                </Typography>

                                {timeSlots.length === 0 ? (
                                    <Box sx={{ py: 3, px: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px dashed ${T.border}` }}>
                                        <Typography sx={{ color: T.textMuted, fontSize: '0.8rem' }}>
                                            {selectedDate ? 'No available times — the business may be closed this day.' : 'Please select a date first.'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={1.5}>
                                        {timeSlots.map(time => {
                                            const isBooked = bookedSlots.includes(time);
                                            const isSelected = selectedTime === time;
                                            return (
                                                <Grid size={{ xs: 6, sm: 4 }} key={time}>
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={() => !isBooked && setSelectedTime(time)}
                                                        disabled={isBooked}
                                                        sx={{
                                                            width: '100%',
                                                            py: 1,
                                                            borderRadius: '10px',
                                                            fontWeight: 700,
                                                            fontSize: '0.78rem',
                                                            fontFamily: 'inherit',
                                                            border: `1px solid ${isBooked ? T.redDim : isSelected ? T.cyan : T.border}`,
                                                            color: isBooked ? T.red : isSelected ? T.bg : T.textSecondary,
                                                            background: isBooked ? T.redDim : isSelected ? T.gradientBtn : 'transparent',
                                                            boxShadow: isSelected ? `0 0 16px ${T.cyanGlow}` : 'none',
                                                            textDecoration: isBooked ? 'line-through' : 'none',
                                                            cursor: isBooked ? 'not-allowed' : 'pointer',
                                                            transition: 'all 0.18s',
                                                            '&:not(:disabled):hover': {
                                                                borderColor: T.cyan,
                                                                color: isSelected ? T.bg : T.cyan,
                                                                bgcolor: isSelected ? '' : T.cyanDim,
                                                            },
                                                        }}
                                                    >
                                                        {time}
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                )}
                            </Box>
                        )}

                        {/* Step 3 — Your Details */}
                        {activeStep === 2 && (
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: T.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
                                    Your Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Full Name" required value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            InputLabelProps={{ shrink: true }} sx={inputSx} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Email Address" type="email" required value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            InputLabelProps={{ shrink: true }} sx={inputSx} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Phone Number" required value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            InputLabelProps={{ shrink: true }} sx={inputSx} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField fullWidth multiline rows={3} label="Notes (Optional)" value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            InputLabelProps={{ shrink: true }} sx={inputSx} />
                                    </Grid>
                                </Grid>

                                {/* Booking Summary */}
                                <Box sx={{ mt: 3, p: 2.5, bgcolor: 'rgba(0,224,255,0.04)', borderRadius: '14px', border: `1px solid rgba(0,224,255,0.12)` }}>
                                    <Typography sx={{ fontWeight: 700, color: T.cyan, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                                        Booking Summary
                                    </Typography>
                                    <Divider sx={{ borderColor: T.border, mb: 1.5 }} />
                                    {[
                                        { label: 'Service', value: selectedService?.name },
                                        { label: 'Date', value: selectedDate },
                                        { label: 'Time', value: selectedTime },
                                        { label: 'Duration', value: `${selectedService?.duration} minutes` },
                                    ].map(row => (
                                        <Box key={row.label} display="flex" justifyContent="space-between" mb={0.8}>
                                            <Typography sx={{ color: T.textMuted, fontSize: '0.78rem' }}>{row.label}</Typography>
                                            <Typography sx={{ color: T.textSecondary, fontWeight: 600, fontSize: '0.78rem' }}>{row.value}</Typography>
                                        </Box>
                                    ))}
                                    <Divider sx={{ borderColor: T.border, my: 1.2 }} />
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography sx={{ color: T.textPrimary, fontWeight: 700, fontSize: '0.875rem' }}>Total</Typography>
                                        <Typography sx={{ color: T.green, fontWeight: 800, fontSize: '0.875rem' }}>
                                            ₹{selectedService?.price}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Navigation */}
                    <Box display="flex" justifyContent="space-between" mt={4} pt={3} borderTop={`1px solid ${T.border}`}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{
                                borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                                px: 3, py: 1, color: T.textSecondary,
                                '&:hover': { bgcolor: T.bgCardHover, color: T.textPrimary },
                                '&:disabled': { color: T.textMuted },
                            }}
                        >
                            Back
                        </Button>

                        <Box
                            component="button"
                            type="button"
                            onClick={activeStep === steps.length - 1 ? handleBookingSubmit : handleNext}
                            disabled={isNextDisabled}
                            sx={{
                                borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                                px: 4, py: 1.1, fontSize: '0.875rem', fontFamily: 'inherit',
                                background: isNextDisabled ? 'rgba(255,255,255,0.06)' : T.gradientBtn,
                                color: isNextDisabled ? T.textMuted : T.bg,
                                border: 'none',
                                cursor: isNextDisabled ? 'not-allowed' : 'pointer',
                                boxShadow: isNextDisabled ? 'none' : `0 0 20px ${T.cyanGlow}`,
                                transition: 'all 0.2s',
                                '&:not(:disabled):hover': { opacity: 0.88, boxShadow: `0 0 30px ${T.cyanGlow}` },
                            }}
                        >
                            {submitting ? (
                                <CircularProgress size={18} sx={{ color: T.bg }} />
                            ) : activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next →'}
                        </Box>
                    </Box>

                    {/* Footer */}
                    <Box mt={3} textAlign="center">
                        <Typography sx={{ fontSize: '0.7rem', color: T.textMuted, letterSpacing: '0.05em' }}>
                            Powered by{' '}
                            <Box component="span" sx={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
                                Nexaserv
                            </Box>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}