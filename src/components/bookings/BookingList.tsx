'use client';

import { useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip,
    IconButton, Menu, MenuItem, ListItemIcon,
    ListItemText, TextField, InputAdornment,
    Avatar, Divider,
} from '@mui/material';
import {
    MoreVert, CheckCircleOutline, CancelOutlined,
    DoneAll, SearchOutlined, FilterListOutlined,
    EventAvailableOutlined,
} from '@mui/icons-material';
import { Booking } from '@/lib/services/booking.service';
import { useRouter } from 'next/navigation';
import { useBookingsStore } from '@/store/bookingsStore';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    bg: '#050a14',
    bgCard: 'rgba(255,255,255,0.03)',
    bgHover: 'rgba(255,255,255,0.05)',
    bgInput: 'rgba(0,10,30,0.6)',
    border: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,224,255,0.15)',
    borderFocus: 'rgba(0,224,255,0.5)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.10)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    textPrimary: 'rgba(220,240,255,0.95)',
    textMuted: 'rgba(130,170,220,0.55)',
    textFaint: 'rgba(100,140,180,0.40)',
    green: '#10b981',
    greenDim: 'rgba(16,185,129,0.12)',
    amber: '#f59e0b',
    amberDim: 'rgba(245,158,11,0.12)',
    red: '#ef4444',
    redDim: 'rgba(239,68,68,0.12)',
    blue: '#3b82f6',
    blueDim: 'rgba(59,130,246,0.12)',
    gradient: 'linear-gradient(135deg, #00e0ff 0%, #0070e0 100%)',
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
    confirmed: { bg: T.greenDim, text: T.green, border: 'rgba(16,185,129,0.25)' },
    pending: { bg: T.amberDim, text: T.amber, border: 'rgba(245,158,11,0.25)' },
    cancelled: { bg: T.redDim, text: T.red, border: 'rgba(239,68,68,0.25)' },
    completed: { bg: T.blueDim, text: T.blue, border: 'rgba(59,130,246,0.25)' },
};
const getStatusConfig = (s: string) => STATUS_CONFIG[s] ?? { bg: T.bgCard, text: T.textMuted, border: T.border };

const labelSx = {
    fontSize: '0.72rem', fontWeight: 700,
    color: T.textFaint, letterSpacing: '0.1em',
};

interface BookingListProps { bookings: Booking[] }

export default function BookingList({ bookings }: BookingListProps) {
    const router = useRouter();
    const { updateBookingStatus } = useBookingsStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, b: Booking) => { setAnchorEl(e.currentTarget); setSelectedBooking(b); };
    const handleMenuClose = () => { setAnchorEl(null); setSelectedBooking(null); };

    const handleStatusUpdate = async (status: string) => {
        if (!selectedBooking) return;
        await updateBookingStatus(selectedBooking._id, status);
        handleMenuClose();
    };

    const filteredBookings = bookings.filter(b => {
        const statusMatch =
            statusFilter === 'all' ? true :
                statusFilter === 'upcoming' ? (b.status === 'confirmed' || b.status === 'pending') :
                    statusFilter === 'completed' ? b.status === 'completed' :
                        b.status === 'cancelled';
        if (!statusMatch) return false;
        const q = searchQuery.toLowerCase();
        return (
            b.clientName.toLowerCase().includes(q) ||
            b.serviceType.toLowerCase().includes(q) ||
            (b.assignedTo?.name || '').toLowerCase().includes(q)
        );
    });

    const FILTER_OPTS: { key: typeof statusFilter; label: string }[] = [
        { key: 'all', label: 'All Bookings' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ];
    const filterLabel = FILTER_OPTS.find(f => f.key === statusFilter)?.label ?? 'Filter';

    // shared menu paper sx
    const menuPaperSx = {
        borderRadius: '14px',
        bgcolor: 'rgba(5,10,20,0.97)',
        border: `1px solid ${T.borderCyan}`,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        mt: 1,
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* ── Control bar ── */}
            <Box display="flex" alignItems="center" gap={1.5} mb={3} flexWrap="wrap">

                {/* Search */}
                <TextField
                    placeholder="Search customers…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{
                        flex: 1, minWidth: 200,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            bgcolor: T.bgInput,
                            backdropFilter: 'blur(8px)',
                            fontSize: '0.875rem',
                            color: T.textPrimary,
                            '& fieldset': { borderColor: T.borderCyan },
                            '&:hover fieldset': { borderColor: 'rgba(0,224,255,0.35)' },
                            '&.Mui-focused fieldset': { borderColor: T.borderFocus, boxShadow: `0 0 0 3px ${T.cyanGlow}` },
                        },
                        '& .MuiInputBase-input::placeholder': { color: T.textFaint, opacity: 1 },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlined sx={{ fontSize: 18, color: T.textMuted }} />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Filter button */}
                <Box
                    component="button"
                    type="button"
                    onClick={e => setFilterAnchorEl(e.currentTarget)}
                    sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        px: 2, height: 40, borderRadius: '10px',
                        border: `1px solid ${T.borderCyan}`,
                        bgcolor: T.cyanDim, color: T.cyan,
                        fontSize: '0.85rem', fontWeight: 700, fontFamily: 'inherit',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 0.18s',
                        '&:hover': { bgcolor: 'rgba(0,224,255,0.15)' },
                    }}
                >
                    <FilterListOutlined sx={{ fontSize: 17 }} />
                    {filterLabel}
                </Box>

                {/* Filter menu */}
                <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={() => setFilterAnchorEl(null)}
                    transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    slotProps={{ paper: { sx: { ...menuPaperSx, minWidth: 200 } } }}
                >
                    {FILTER_OPTS.map(opt => (
                        <MenuItem
                            key={opt.key}
                            onClick={() => { setStatusFilter(opt.key); setFilterAnchorEl(null); }}
                            selected={statusFilter === opt.key}
                            sx={{
                                py: 1.3, fontSize: '0.875rem', fontWeight: 500,
                                color: statusFilter === opt.key ? T.cyan : T.textPrimary,
                                '&.Mui-selected': { bgcolor: T.cyanDim },
                                '&.Mui-selected:hover': { bgcolor: 'rgba(0,224,255,0.15)' },
                                '&:hover': { bgcolor: T.bgHover },
                            }}
                        >
                            {opt.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* ── Table ── */}
            <TableContainer sx={{
                borderRadius: '16px', overflow: 'auto', flex: 1,
                bgcolor: T.bgCard, backdropFilter: 'blur(16px)',
                border: `1px solid ${T.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                maxHeight: 'calc(100vh - 240px)',
            }}>
                <Table sx={{ minWidth: 800 }}>

                    {/* Head */}
                    <TableHead>
                        <TableRow sx={{ borderBottom: `1px solid ${T.border}` }}>
                            {['CUSTOMER', 'SERVICE', 'DATE / TIME', 'ASSIGNED TO', 'STATUS', 'ACTIONS'].map((h, i) => (
                                <TableCell
                                    key={h}
                                    align={i === 5 ? 'right' : 'left'}
                                    sx={{
                                        py: 2, pl: i === 0 ? 4 : 2, pr: i === 5 ? 4 : 2,
                                        ...labelSx, border: 'none',
                                        bgcolor: 'rgba(0,224,255,0.03)',
                                    }}
                                >
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* Body */}
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ py: 10, textAlign: 'center', border: 'none' }}>
                                    <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                                        <EventAvailableOutlined sx={{ fontSize: 48, color: T.textFaint }} />
                                        <Typography fontWeight={700} sx={{ color: T.textPrimary }}>No Bookings Found</Typography>
                                        <Typography variant="body2" sx={{ color: T.textMuted }}>
                                            Try adjusting your filters or search query
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : filteredBookings.map(row => {
                            const sc = getStatusConfig(row.status);
                            return (
                                <TableRow
                                    key={row._id}
                                    onClick={() => router.push(`/dashboard/bookings/${row._id}`)}
                                    sx={{
                                        cursor: 'pointer',
                                        borderBottom: `1px solid ${T.border}`,
                                        transition: 'background 0.15s',
                                        '&:last-child td': { border: 0 },
                                        '&:hover': { bgcolor: T.bgHover },
                                    }}
                                >
                                    {/* Customer */}
                                    <TableCell sx={{ py: 2.5, pl: 4, border: 'none' }}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{
                                                width: 40, height: 40, borderRadius: '10px',
                                                bgcolor: T.cyanDim, color: T.cyan,
                                                fontWeight: 800, fontSize: '0.95rem',
                                                border: `1px solid ${T.borderCyan}`,
                                            }}>
                                                {row.clientName.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={700} sx={{ color: T.textPrimary, fontSize: '0.9rem' }}>
                                                    {row.clientName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: T.textFaint }}>
                                                    @{row.clientName.toLowerCase().replace(/\s/g, '')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Service */}
                                    <TableCell sx={{ border: 'none' }}>
                                        <Chip
                                            label={row.serviceType}
                                            size="small"
                                            sx={{
                                                bgcolor: T.cyanDim, color: T.cyan,
                                                fontWeight: 700, fontSize: '0.72rem',
                                                border: `1px solid ${T.borderCyan}`,
                                                borderRadius: '8px', height: 26,
                                            }}
                                        />
                                    </TableCell>

                                    {/* Date / Time */}
                                    <TableCell sx={{ border: 'none' }}>
                                        <Typography fontWeight={600} sx={{ color: T.textPrimary, fontSize: '0.85rem' }}>
                                            {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: T.textMuted }}>
                                            {row.timeSlot}
                                        </Typography>
                                    </TableCell>

                                    {/* Assigned */}
                                    <TableCell sx={{ border: 'none' }}>
                                        {row.assignedTo ? (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{
                                                    width: 26, height: 26, fontSize: '0.72rem',
                                                    bgcolor: T.bgHover, color: T.textPrimary,
                                                    border: `1px solid ${T.border}`,
                                                }}>
                                                    {row.assignedTo.name.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600} sx={{ color: T.textPrimary }}>
                                                    {row.assignedTo.name}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: T.textFaint, fontStyle: 'italic' }}>
                                                Unassigned
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell sx={{ border: 'none' }}>
                                        <Chip
                                            label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                            size="small"
                                            sx={{
                                                bgcolor: sc.bg, color: sc.text,
                                                fontWeight: 700, fontSize: '0.72rem',
                                                border: `1px solid ${sc.border}`,
                                                borderRadius: '8px', height: 26, px: 0.5,
                                            }}
                                        />
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="right" sx={{ pr: 3, border: 'none' }}>
                                        <IconButton
                                            size="small"
                                            onClick={e => { e.stopPropagation(); handleMenuOpen(e, row); }}
                                            sx={{
                                                color: T.textMuted, borderRadius: '8px', p: 0.8,
                                                '&:hover': { color: T.cyan, bgcolor: T.cyanDim },
                                            }}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Status update menu ── */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: { sx: { ...menuPaperSx, minWidth: 240 } } }}
            >
                <MenuItem
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={selectedBooking?.status === 'confirmed'}
                    sx={{ py: 1.4, fontSize: '0.875rem', fontWeight: 500, color: T.textPrimary, '&:hover': { bgcolor: T.bgHover } }}
                >
                    <ListItemIcon><CheckCircleOutline fontSize="small" sx={{ color: T.green }} /></ListItemIcon>
                    <ListItemText>Mark as Confirmed</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={selectedBooking?.status === 'completed'}
                    sx={{ py: 1.4, fontSize: '0.875rem', fontWeight: 500, color: T.textPrimary, '&:hover': { bgcolor: T.bgHover } }}
                >
                    <ListItemIcon><DoneAll fontSize="small" sx={{ color: T.blue }} /></ListItemIcon>
                    <ListItemText>Mark as Completed</ListItemText>
                </MenuItem>
                <Divider sx={{ borderColor: T.border, my: 0.5 }} />
                <MenuItem
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={selectedBooking?.status === 'cancelled'}
                    sx={{ py: 1.4, fontSize: '0.875rem', fontWeight: 500, color: T.red, '&:hover': { bgcolor: T.redDim } }}
                >
                    <ListItemIcon><CancelOutlined fontSize="small" sx={{ color: T.red }} /></ListItemIcon>
                    <ListItemText>Cancel Booking</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}