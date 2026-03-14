import { useState, useEffect } from 'react';
import {
    Box, Typography, IconButton, Dialog, CircularProgress,
} from '@mui/material';
import {
    ChevronLeft, ChevronRight, CalendarToday,
    AccessTime, LocationOnOutlined, Close, EventOutlined,
} from '@mui/icons-material';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import {
    format, addDays, startOfWeek, isSameDay,
    setHours, setMinutes,
} from 'date-fns';
import { Booking } from '@/lib/services/booking.service';
import BookingList from './BookingList';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useBookingsStore } from '@/store/bookingsStore';
import { useSettingsStore } from '@/store/settingsStore';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    bg: '#050a14',
    bgCard: 'rgba(255,255,255,0.03)',
    bgInput: 'rgba(0,10,30,0.6)',
    bgHover: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,224,255,0.15)',
    borderFocus: 'rgba(0,224,255,0.5)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.10)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    purple: '#6450ff',
    green: '#10b981',
    greenDim: 'rgba(16,185,129,0.15)',
    amber: '#f59e0b',
    amberDim: 'rgba(245,158,11,0.15)',
    red: '#ef4444',
    redDim: 'rgba(239,68,68,0.15)',
    blue: '#3b82f6',
    blueDim: 'rgba(59,130,246,0.15)',
    pink: '#ec4899',
    pinkDim: 'rgba(236,72,153,0.15)',
    textPrimary: 'rgba(220,240,255,0.95)',
    textMuted: 'rgba(130,170,220,0.55)',
    textFaint: 'rgba(100,140,180,0.40)',
    gradient: 'linear-gradient(135deg, #00e0ff 0%, #0070e0 100%)',
    gradientBtn: 'linear-gradient(135deg, #00e0ff 0%, #6450ff 100%)',
    gradientText: 'linear-gradient(135deg, #fff 0%, #aad4ff 60%, #00e0ff 100%)',
};

const HOUR_HEIGHT = 120;

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
    confirmed: { bg: T.greenDim, text: T.green, border: 'rgba(16,185,129,0.3)' },
    pending: { bg: T.amberDim, text: T.amber, border: 'rgba(245,158,11,0.3)' },
    cancelled: { bg: T.redDim, text: T.red, border: 'rgba(239,68,68,0.3)' },
    completed: { bg: T.blueDim, text: T.blue, border: 'rgba(59,130,246,0.3)' },
    'no-show': { bg: T.pinkDim, text: T.pink, border: 'rgba(236,72,153,0.3)' },
};
const getStatusConfig = (s: string) => STATUS_CONFIG[s] ?? STATUS_CONFIG.pending;

// ── Shared input sx ───────────────────────────────────────────────────────────
const inputSx = {
    width: '100%', p: 1,
    borderRadius: '10px',
    border: `1px solid ${T.borderCyan}`,
    bgcolor: T.bgInput,
    color: T.textPrimary,
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    height: '38px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    '&:focus': {
        borderColor: T.borderFocus,
        boxShadow: `0 0 0 3px ${T.cyanGlow}`,
    },
    '&::placeholder': { color: T.textFaint, opacity: 1 },
};

const labelSx = {
    fontSize: '0.72rem', fontWeight: 700,
    color: T.textMuted, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    mb: 0.6, display: 'block',
};

export default function BookingCalendar({ bookings }: { bookings: Booking[] }) {
    const { creating, createBooking: createBookingAction } = useBookingsStore();
    const { workingHours, fetchSettings } = useSettingsStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [newBookingDialog, setNewBookingDialog] = useState(false);
    const [newBookingData, setNewBookingData] = useState({
        date: new Date(), timeSlot: '09:00',
        clientName: '', clientEmail: '', clientPhone: '',
        serviceType: '', duration: 60, notes: '',
    });

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    // ── Time range from working hours ─────────────────────────────────────────
    const getTimeRange = () => {
        if (!workingHours?.length) return { startHour: 9, endHour: 17 };
        const open = workingHours.filter(w => w.isOpen);
        if (!open.length) return { startHour: 9, endHour: 17 };
        let s = 24, e = 0;
        open.forEach(w => {
            const sh = parseInt(w.start.split(':')[0]);
            const eh = parseInt(w.end.split(':')[0]);
            if (sh < s) s = sh;
            if (eh > e) e = eh;
        });
        return { startHour: s, endHour: e };
    };

    const { startHour, endHour } = getTimeRange();
    const totalHours = endHour - startHour;
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const handlePrev = () => setCurrentDate(addDays(currentDate, -7));
    const handleNext = () => setCurrentDate(addDays(currentDate, 7));
    const handleToday = () => setCurrentDate(new Date());

    const openBookingDialog = (b: Booking) => { setSelectedBooking(b); setDialogOpen(true); };
    const closeDialog = () => { setDialogOpen(false); setSelectedBooking(null); };

    const handleTimeSlotClick = (day: Date, hour: number) => {
        const dt = setHours(setMinutes(day, 0), hour);
        setNewBookingData({ ...newBookingData, date: dt, timeSlot: format(dt, 'HH:mm') });
        setNewBookingDialog(true);
    };

    const handleCreateBooking = async () => {
        const result = await createBookingAction({
            clientName: newBookingData.clientName,
            clientEmail: newBookingData.clientEmail,
            clientPhone: newBookingData.clientPhone,
            serviceType: newBookingData.serviceType,
            date: newBookingData.date.toISOString(),
            timeSlot: newBookingData.timeSlot,
            duration: newBookingData.duration,
            notes: newBookingData.notes,
        });
        if (result.success) {
            setNewBookingDialog(false);
            setNewBookingData({ date: new Date(), timeSlot: '09:00', clientName: '', clientEmail: '', clientPhone: '', serviceType: '', duration: 60, notes: '' });
        } else {
            alert(result.error || 'Failed to create booking. Please try again.');
        }
    };

    const getBookingStyle = (booking: Booking) => {
        const m = booking.timeSlot.match(/(\d+):(\d+)/);
        if (!m) return { top: '0px', height: '60px' };
        let h = parseInt(m[1]);
        const min = parseInt(m[2]);
        if (booking.timeSlot.toLowerCase().includes('pm') && h !== 12) h += 12;
        else if (booking.timeSlot.toLowerCase().includes('am') && h === 12) h = 0;
        return {
            top: `${(h - startHour + min / 60) * HOUR_HEIGHT}px`,
            height: `${((booking.duration || 60) / 60) * HOUR_HEIGHT}px`,
        };
    };

    const isCreateDisabled = !newBookingData.clientName || !newBookingData.clientEmail || !newBookingData.serviceType || creating;

    // shared dialog paper sx
    const dialogPaperSx = {
        borderRadius: '20px',
        bgcolor: '#070f1e',
        border: `1px solid ${T.borderCyan}`,
        backdropFilter: 'blur(24px)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{
                bgcolor: T.bg, borderRadius: '24px', p: 3,
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                border: `1px solid ${T.border}`,
                height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>

                {/* ── Header ── */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>

                    {/* Title + date picker trigger */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography sx={{
                            fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.03em',
                            background: T.gradientText,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {format(currentDate, 'MMMM, yyyy')}
                        </Typography>
                        <IconButton
                            onClick={() => setDatePickerOpen(true)}
                            sx={{ bgcolor: T.bgCard, borderRadius: '10px', color: T.textMuted, border: `1px solid ${T.border}`, '&:hover': { bgcolor: T.bgHover, color: T.cyan } }}
                        >
                            <EventOutlined sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">

                        {/* View switcher */}
                        <Box sx={{ bgcolor: T.bgCard, border: `1px solid ${T.border}`, p: 0.5, borderRadius: '12px', display: 'flex', gap: 0.5 }}>
                            {([
                                { mode: 'list', icon: <ViewListIcon sx={{ fontSize: 17 }} />, label: 'List' },
                                { mode: 'calendar', icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 17 }} />, label: 'Calendar' },
                            ] as const).map(v => (
                                <Box
                                    key={v.mode}
                                    component="button"
                                    type="button"
                                    onClick={() => setViewMode(v.mode)}
                                    sx={{
                                        display: 'inline-flex', alignItems: 'center', gap: 0.8,
                                        px: 2, py: 0.75, borderRadius: '10px', border: 'none',
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        fontSize: '0.83rem', fontWeight: 700,
                                        transition: 'all 0.18s',
                                        color: viewMode === v.mode ? T.cyan : T.textMuted,
                                        bgcolor: viewMode === v.mode ? T.cyanDim : 'transparent',
                                        boxShadow: viewMode === v.mode ? `0 0 12px ${T.cyanGlow}` : 'none',
                                        '&:hover': { bgcolor: viewMode === v.mode ? T.cyanDim : T.bgHover },
                                    }}
                                >
                                    {v.icon}{v.label}
                                </Box>
                            ))}
                        </Box>

                        {/* Navigation */}
                        <Box display="flex" gap={1} alignItems="center">
                            <IconButton onClick={handlePrev} sx={{ bgcolor: T.bgCard, borderRadius: '10px', color: T.textMuted, border: `1px solid ${T.border}`, '&:hover': { color: T.cyan, bgcolor: T.cyanDim } }}>
                                <ChevronLeft />
                            </IconButton>
                            <Box
                                component="button" type="button" onClick={handleToday}
                                sx={{
                                    px: 3, py: 1, borderRadius: '10px', border: 'none',
                                    background: T.gradientBtn, color: 'white',
                                    fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                                    cursor: 'pointer', boxShadow: `0 0 16px ${T.cyanGlow}`,
                                    transition: 'all 0.2s',
                                    '&:hover': { opacity: 0.88 },
                                }}
                            >
                                Today
                            </Box>
                            <IconButton onClick={handleNext} sx={{ bgcolor: T.bgCard, borderRadius: '10px', color: T.textMuted, border: `1px solid ${T.border}`, '&:hover': { color: T.cyan, bgcolor: T.cyanDim } }}>
                                <ChevronRight />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                {/* ── Body ── */}
                {viewMode === 'list' ? (
                    <BookingList bookings={bookings} />
                ) : (
                    <Box display="flex" flexDirection="column" height="100%" sx={{ overflow: 'hidden' }}>

                        {/* Day headers */}
                        <Box display="flex" justifyContent="space-between" mb={2} pr="16px">
                            <Box width="60px" />
                            {weekDays.map((day, i) => {
                                const isToday = isSameDay(day, new Date());
                                const isSelected = isSameDay(day, currentDate);
                                return (
                                    <Box
                                        key={i} flex={1}
                                        display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                                        onClick={() => setCurrentDate(day)}
                                        sx={{
                                            height: '90px', borderRadius: '16px', mx: 0.5, cursor: 'pointer',
                                            background: isToday ? T.gradientBtn : isSelected ? T.cyanDim : 'transparent',
                                            border: `2px solid ${isToday ? 'transparent' : isSelected ? T.cyan : 'transparent'}`,
                                            color: isToday ? 'white' : T.textPrimary,
                                            boxShadow: isToday ? `0 0 20px ${T.cyanGlow}` : 'none',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: isToday ? '' : T.bgHover },
                                        }}
                                    >
                                        <Typography sx={{ opacity: 0.7, fontWeight: 500, fontSize: '0.75rem', mb: 0.5 }}>
                                            {format(day, 'EEE')}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem' }}>
                                            {format(day, 'd')}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Calendar grid */}
                        <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative', pt: 2 }}>
                            <Box display="flex" height={`${totalHours * HOUR_HEIGHT}px`}>

                                {/* Time column */}
                                <Box sx={{ width: '60px', flexShrink: 0, position: 'relative' }}>
                                    {Array.from({ length: totalHours }).map((_, i) => {
                                        const hour = startHour + i;
                                        return (
                                            <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, position: 'relative' }}>
                                                <Typography sx={{
                                                    position: 'absolute', top: 0, left: 10,
                                                    color: T.textFaint, fontWeight: 600, fontSize: '0.72rem',
                                                    transform: 'translateY(-50%)',
                                                }}>
                                                    {format(setHours(new Date(), hour), 'h aaa')}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                {/* Grid body */}
                                <Box sx={{ flex: 1, position: 'relative' }}>
                                    {/* Hour lines */}
                                    {Array.from({ length: totalHours }).map((_, i) => (
                                        <Box key={i} sx={{
                                            position: 'absolute', top: i * HOUR_HEIGHT,
                                            left: 0, right: 0, pointerEvents: 'none', zIndex: 0,
                                            borderTop: `1px solid ${T.border}`,
                                        }} />
                                    ))}

                                    {/* Day columns */}
                                    {weekDays.map((day, dayIndex) => {
                                        const isSelected = isSameDay(day, currentDate);
                                        return (
                                            <Box
                                                key={dayIndex}
                                                sx={{
                                                    position: 'absolute',
                                                    left: `${(dayIndex / 7) * 100}%`,
                                                    width: `${100 / 7}%`,
                                                    height: '100%',
                                                    bgcolor: isSelected ? 'rgba(0,224,255,0.02)' : 'transparent',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                                                }}
                                            >
                                                {/* Clickable slots */}
                                                {Array.from({ length: totalHours }).map((_, hi) => (
                                                    <Box
                                                        key={`slot-${dayIndex}-${hi}`}
                                                        onClick={() => handleTimeSlotClick(day, startHour + hi)}
                                                        sx={{
                                                            position: 'absolute', top: hi * HOUR_HEIGHT,
                                                            left: 0, right: 0, height: `${HOUR_HEIGHT}px`,
                                                            zIndex: 1, cursor: 'pointer',
                                                            '&:hover': {
                                                                bgcolor: T.cyanDim,
                                                                '&::after': {
                                                                    content: '"+"',
                                                                    position: 'absolute', top: '50%', left: '50%',
                                                                    transform: 'translate(-50%,-50%)',
                                                                    fontSize: '2rem', fontWeight: 200,
                                                                    color: T.textFaint,
                                                                }
                                                            },
                                                        }}
                                                    />
                                                ))}

                                                {/* Booking chips */}
                                                {bookings
                                                    .filter(b => isSameDay(new Date(b.date), day))
                                                    .map(booking => {
                                                        const styles = getBookingStyle(booking);
                                                        const sc = getStatusConfig(booking.status);
                                                        return (
                                                            <Box
                                                                key={booking._id}
                                                                onClick={() => openBookingDialog(booking)}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: styles.top, height: styles.height,
                                                                    left: '5%', width: '90%',
                                                                    bgcolor: sc.bg,
                                                                    border: `1px solid ${sc.border}`,
                                                                    borderRadius: '12px', p: 1.5,
                                                                    overflow: 'hidden', cursor: 'pointer',
                                                                    zIndex: 10, transition: 'transform 0.15s, box-shadow 0.15s',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.02)', zIndex: 20,
                                                                        boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
                                                                    },
                                                                }}
                                                            >
                                                                <Typography sx={{ color: sc.text, fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, mb: 0.3 }}>
                                                                    {booking.clientName}
                                                                </Typography>
                                                                <Typography sx={{ color: sc.text, opacity: 0.8, fontWeight: 500, fontSize: '0.68rem', display: 'block' }}>
                                                                    {booking.timeSlot}
                                                                </Typography>
                                                                <Typography sx={{ color: sc.text, opacity: 0.65, fontWeight: 500, fontSize: '0.68rem', display: 'block' }}>
                                                                    {booking.serviceType}
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    })}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* ── Booking details dialog ── */}
                <Dialog
                    open={dialogOpen} onClose={closeDialog}
                    slotProps={{ paper: { sx: { ...dialogPaperSx, width: 380, maxWidth: '90vw', p: 0 } } }}
                >
                    <Box sx={{ p: 3, position: 'relative' }}>
                        <IconButton onClick={closeDialog} size="small" sx={{ position: 'absolute', right: 12, top: 12, color: T.textMuted, '&:hover': { color: T.cyan } }}>
                            <Close sx={{ fontSize: 18 }} />
                        </IconButton>

                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: T.textPrimary, mb: 2.5, pr: 4, background: T.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {selectedBooking?.clientName}
                        </Typography>

                        {/* Date */}
                        <InfoRow icon={<CalendarToday sx={{ fontSize: 15, color: T.cyan }} />}>
                            {selectedBooking && format(new Date(selectedBooking.date), 'EEEE, d MMMM yyyy')}
                        </InfoRow>

                        {/* Time + Duration */}
                        <Box display="flex" gap={1.5} mb={1.5}>
                            <InfoRow icon={<AccessTime sx={{ fontSize: 15, color: T.cyan }} />} flex>
                                {selectedBooking?.timeSlot}
                            </InfoRow>
                            <InfoRow flex>
                                {selectedBooking?.duration} min
                            </InfoRow>
                        </Box>

                        {/* Service */}
                        <InfoRow icon={<LocationOnOutlined sx={{ fontSize: 15, color: T.cyan }} />}>
                            {selectedBooking?.serviceType}
                        </InfoRow>

                        {/* Status */}
                        <Box sx={{ bgcolor: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', p: 1.5, mb: 1.5 }}>
                            <Typography sx={{ ...labelSx, mb: 0.3 }}>Status</Typography>
                            <Typography sx={{ fontWeight: 700, color: getStatusConfig(selectedBooking?.status || '').text, textTransform: 'capitalize', fontSize: '0.875rem' }}>
                                {selectedBooking?.status}
                            </Typography>
                        </Box>

                        {/* Notes */}
                        {selectedBooking?.notes && (
                            <Box sx={{ bgcolor: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', p: 1.5, mb: 2 }}>
                                <Typography sx={{ ...labelSx, mb: 0.3 }}>Notes</Typography>
                                <Typography sx={{ color: T.textPrimary, fontSize: '0.875rem' }}>{selectedBooking.notes}</Typography>
                            </Box>
                        )}

                        <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Box
                                component="button" type="button" onClick={closeDialog}
                                sx={{
                                    px: 4, py: 1, borderRadius: '10px', border: 'none',
                                    background: T.gradientBtn, color: 'white',
                                    fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
                                    cursor: 'pointer', boxShadow: `0 0 16px ${T.cyanGlow}`,
                                    transition: 'all 0.2s', '&:hover': { opacity: 0.88 },
                                }}
                            >
                                Close
                            </Box>
                        </Box>
                    </Box>
                </Dialog>

                {/* ── Date picker dialog ── */}
                <Dialog
                    open={datePickerOpen} onClose={() => setDatePickerOpen(false)}
                    slotProps={{ paper: { sx: dialogPaperSx } }}
                >
                    <Box sx={{
                        p: 3,
                        '& .MuiPickersDay-root.Mui-selected': { bgcolor: `${T.cyan} !important`, color: T.bg },
                        '& .MuiPickersDay-today': { borderColor: `${T.cyan} !important` },
                        '& .MuiPickersCalendarHeader-switchViewButton': { color: T.cyan },
                        '& .MuiPickersArrowSwitcher-button': { color: T.cyan },
                        '& .MuiPickersYear-yearButton.Mui-selected': { bgcolor: `${T.cyan} !important`, color: T.bg },
                        '& .MuiPickersMonth-monthButton.Mui-selected': { bgcolor: `${T.cyan} !important`, color: T.bg },
                    }}>
                        <Typography sx={{ fontWeight: 700, color: T.textPrimary, mb: 2 }}>Select Date</Typography>
                        <DatePicker
                            value={currentDate}
                            onChange={d => { if (d) { setCurrentDate(d); setDatePickerOpen(false); } }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    sx: {
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px', color: T.textPrimary,
                                            '& fieldset': { borderColor: T.borderCyan },
                                            '&:hover fieldset': { borderColor: 'rgba(0,224,255,0.35)' },
                                            '&.Mui-focused fieldset': { borderColor: T.borderFocus },
                                        },
                                        '& .MuiInputLabel-root': { color: T.textMuted, '&.Mui-focused': { color: T.cyan } },
                                        '& .MuiIconButton-root': { color: T.cyan },
                                    }
                                }
                            }}
                        />
                    </Box>
                </Dialog>

                {/* ── New booking dialog ── */}
                <Dialog
                    open={newBookingDialog} onClose={() => setNewBookingDialog(false)}
                    maxWidth="sm" fullWidth
                    slotProps={{ paper: { sx: dialogPaperSx } }}
                >
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', background: T.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                New Booking
                            </Typography>
                            <IconButton onClick={() => setNewBookingDialog(false)} size="small" sx={{ color: T.textMuted, '&:hover': { color: T.cyan } }}>
                                <Close sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={2}>
                            {/* Date + time summary */}
                            <Box sx={{ bgcolor: T.cyanDim, border: `1px solid ${T.borderCyan}`, borderRadius: '10px', p: 1.5 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={0.75}>
                                    <CalendarToday sx={{ color: T.cyan, fontSize: 15 }} />
                                    <Typography fontWeight={700} sx={{ color: T.textPrimary, fontSize: '0.875rem' }}>
                                        {format(newBookingData.date, 'EEEE, MMMM d, yyyy')}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <AccessTime sx={{ color: T.cyan, fontSize: 15 }} />
                                    <Typography fontWeight={700} sx={{ color: T.textPrimary, fontSize: '0.875rem' }}>
                                        {newBookingData.timeSlot}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Fields */}
                            {[
                                { key: 'clientName', label: 'Client Name *', type: 'text', ph: 'Enter client name' },
                                { key: 'clientEmail', label: 'Client Email *', type: 'email', ph: 'client@example.com' },
                                { key: 'clientPhone', label: 'Client Phone', type: 'tel', ph: '+91 98765 43210' },
                                { key: 'serviceType', label: 'Service Type *', type: 'text', ph: 'e.g., Consultation, Haircut' },
                            ].map(f => (
                                <Box key={f.key}>
                                    <Typography sx={labelSx}>{f.label}</Typography>
                                    <Box
                                        component="input"
                                        type={f.type}
                                        value={(newBookingData as any)[f.key]}
                                        onChange={(e: any) => setNewBookingData({ ...newBookingData, [f.key]: e.target.value })}
                                        placeholder={f.ph}
                                        sx={inputSx}
                                    />
                                </Box>
                            ))}

                            {/* Duration */}
                            <Box>
                                <Typography sx={labelSx}>Duration (minutes)</Typography>
                                <Box
                                    component="select"
                                    value={newBookingData.duration}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, duration: parseInt(e.target.value) })}
                                    sx={{ ...inputSx, cursor: 'pointer' }}
                                >
                                    {[30, 45, 60, 90, 120].map(d => (
                                        <option key={d} value={d} style={{ background: '#070f1e' }}>
                                            {d < 60 ? `${d} minutes` : d === 60 ? '1 hour' : `${d / 60} hours`}
                                        </option>
                                    ))}
                                </Box>
                            </Box>

                            {/* Notes */}
                            <Box>
                                <Typography sx={labelSx}>Notes</Typography>
                                <Box
                                    component="textarea"
                                    value={newBookingData.notes}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                                    placeholder="Add any additional notes…"
                                    rows={2}
                                    sx={{ ...inputSx, height: 'auto', resize: 'vertical' }}
                                />
                            </Box>

                            {/* Actions */}
                            <Box display="flex" gap={1.5}>
                                <Box
                                    component="button" type="button"
                                    onClick={() => setNewBookingDialog(false)}
                                    sx={{
                                        flex: 1, py: 1.1, borderRadius: '10px', border: `1px solid ${T.borderCyan}`,
                                        bgcolor: 'transparent', color: T.textMuted,
                                        fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit',
                                        cursor: 'pointer', transition: 'all 0.18s',
                                        '&:hover': { bgcolor: T.bgHover, color: T.textPrimary },
                                    }}
                                >
                                    Cancel
                                </Box>
                                <Box
                                    component="button" type="button"
                                    onClick={isCreateDisabled ? undefined : handleCreateBooking}
                                    disabled={isCreateDisabled}
                                    sx={{
                                        flex: 1, py: 1.1, borderRadius: '10px', border: 'none',
                                        background: isCreateDisabled ? 'rgba(255,255,255,0.06)' : T.gradientBtn,
                                        color: isCreateDisabled ? T.textMuted : 'white',
                                        fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
                                        cursor: isCreateDisabled ? 'not-allowed' : 'pointer',
                                        boxShadow: isCreateDisabled ? 'none' : `0 0 20px ${T.cyanGlow}`,
                                        transition: 'all 0.2s',
                                        '&:not(:disabled):hover': { opacity: 0.88 },
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                                    }}
                                >
                                    {creating ? <><CircularProgress size={16} sx={{ color: 'white' }} /><span>Creating…</span></> : 'Create Booking'}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
}

// ── Small helper component ────────────────────────────────────────────────────
function InfoRow({ icon, children, flex }: { icon?: React.ReactNode; children: React.ReactNode; flex?: boolean }) {
    return (
        <Box sx={{
            ...(flex ? { flex: 1 } : {}),
            bgcolor: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: '10px', p: 1.5, mb: flex ? 0 : 1.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
            {icon}
            <Typography fontWeight={600} sx={{ color: T.textPrimary, fontSize: '0.875rem' }}>
                {children}
            </Typography>
        </Box>
    );
}