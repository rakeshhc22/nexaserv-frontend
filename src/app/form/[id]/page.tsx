'use client';

import {
    Box, Typography, Container, TextField, RadioGroup,
    FormControlLabel, Radio, FormControl,
    Checkbox, FormGroup, CircularProgress, MenuItem,
    Select, Autocomplete, Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formService, Form } from '@/lib/services/form.service';
import NeuralBackground from '@/components/NeuralBackground';

// ── Design tokens (matches booking page) ─────────────────────────────────────
const T = {
    bg: '#050a14',
    bgCard: 'rgba(255,255,255,0.03)',
    bgInput: 'rgba(0,10,30,0.6)',
    border: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,224,255,0.15)',
    borderFocus: 'rgba(0,224,255,0.5)',
    cyan: '#00e0ff',
    cyanDim: 'rgba(0,224,255,0.10)',
    cyanGlow: 'rgba(0,224,255,0.25)',
    purple: '#6450ff',
    green: '#4aff9f',
    greenDim: 'rgba(74,255,159,0.10)',
    red: '#ff6b6b',
    textPrimary: 'rgba(220,240,255,0.95)',
    textSub: 'rgba(200,225,255,0.88)',
    textMuted: 'rgba(130,170,220,0.55)',
    textFaint: 'rgba(100,140,180,0.40)',
    gradient: 'linear-gradient(135deg, #00e0ff 0%, #0070e0 100%)',
    gradientBtn: 'linear-gradient(135deg, #00e0ff 0%, #6450ff 100%)',
    gradientText: 'linear-gradient(135deg, #fff 0%, #aad4ff 60%, #00e0ff 100%)',
};

// ── Shared input sx ───────────────────────────────────────────────────────────
const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: T.bgInput,
        borderRadius: '10px',
        fontSize: '0.875rem',
        backdropFilter: 'blur(8px)',
        '& fieldset': { borderColor: T.borderCyan },
        '&:hover fieldset': { borderColor: 'rgba(0,224,255,0.35)' },
        '&.Mui-focused fieldset': { borderColor: T.borderFocus, borderWidth: '1px', boxShadow: `0 0 0 3px ${T.cyanGlow}` },
    },
    '& .MuiInputBase-input': {
        color: T.textSub,
        WebkitTextFillColor: T.textSub,
        py: 1.2,
        '&::placeholder': { color: T.textFaint, opacity: 1 },
    },
    '& textarea': { color: `${T.textSub} !important` },
    '& input[type="date"]::-webkit-calendar-picker-indicator': {
        filter: 'invert(0.6) brightness(1.5)',
    },
};

const labelSx = {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: T.textMuted,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    mb: 0.8,
    display: 'block',
};

// ── Full-page wrapper ─────────────────────────────────────────────────────────
function FullPageState({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{
            minHeight: '100vh', position: 'relative', bgcolor: T.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            p: 3, overflow: 'hidden',
        }}>
            <Box sx={{ position: 'fixed', inset: 0, zIndex: 0 }}><NeuralBackground /></Box>
            <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                {children}
            </Box>
        </Box>
    );
}

// ── Reusable card shell ───────────────────────────────────────────────────────
function GlassCard({ children, borderColor = T.borderCyan, glowColor = 'rgba(0,224,255,0.06)' }: {
    children: React.ReactNode;
    borderColor?: string;
    glowColor?: string;
}) {
    return (
        <Box sx={{
            maxWidth: 420, width: '100%',
            bgcolor: T.bgCard, backdropFilter: 'blur(24px)',
            border: `1px solid ${borderColor}`, borderRadius: '20px',
            p: { xs: 4, sm: 5 }, textAlign: 'center',
            boxShadow: `0 0 80px rgba(0,0,0,0.45), 0 0 40px ${glowColor}`,
            animation: 'cardIn 0.55s cubic-bezier(0.16,1,0.3,1) both',
        }}>
            {children}
        </Box>
    );
}

export default function PublicFormPage() {
    const params = useParams();
    const id = params?.id as string;

    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await formService.getPublicForm(id);
                if (data.success) setForm(data.data);
            } catch (e) {
                console.error('Failed to load form', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleAnswerChange = (fieldId: string, value: any) =>
        setAnswers(prev => ({ ...prev, [fieldId]: value }));

    const handleSubmit = async () => {
        if (!id) return;
        setSubmitting(true);
        try {
            await formService.submitForm(id, answers);
            setSubmitted(true);
        } catch (e) {
            console.error('Submission failed', e);
            alert('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <FullPageState>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: `conic-gradient(${T.cyan}, ${T.purple}, ${T.cyan})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: T.bg }} />
                </Box>
                <Typography sx={{ color: T.textFaint, fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                    Loading form…
                </Typography>
            </Box>
        </FullPageState>
    );

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!form) return (
        <FullPageState>
            <GlassCard>
                <Box sx={{
                    width: 60, height: 60, borderRadius: '50%', mx: 'auto', mb: 2.5,
                    bgcolor: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ErrorOutlineIcon sx={{ fontSize: '1.75rem', color: T.red }} />
                </Box>
                <Typography sx={{ color: T.textPrimary, fontWeight: 700, fontSize: '1rem', mb: 0.8 }}>
                    Form not found
                </Typography>
                <Typography sx={{ color: T.textMuted, fontSize: '0.82rem' }}>
                    This form may no longer be available.
                </Typography>
            </GlassCard>
            <Keyframes />
        </FullPageState>
    );

    // ── Success ───────────────────────────────────────────────────────────────
    if (submitted) return (
        <FullPageState>
            {/* Green ambient glow */}
            <Box sx={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(74,255,159,0.07), transparent 70%)',
            }} />
            <GlassCard borderColor="rgba(74,255,159,0.2)" glowColor="rgba(74,255,159,0.07)">
                <Box sx={{
                    width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
                    bgcolor: T.greenDim, border: '1.5px solid rgba(74,255,159,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(74,255,159,0.15)',
                }}>
                    <CheckCircleIcon sx={{ fontSize: '2rem', color: T.green }} />
                </Box>
                <Typography sx={{
                    fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em', mb: 1,
                    background: T.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Thank you!
                </Typography>
                <Typography sx={{ color: T.textMuted, fontSize: '0.85rem', lineHeight: 1.7, mb: 3 }}>
                    Your response has been recorded successfully.
                </Typography>
                {form.business && (
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 1,
                        px: 2.5, py: 0.9, borderRadius: '999px',
                        bgcolor: T.cyanDim, border: `1px solid ${T.borderCyan}`,
                    }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: T.cyan, boxShadow: `0 0 6px ${T.cyan}` }} />
                        <Typography sx={{ fontSize: '0.78rem', color: T.cyan, fontWeight: 600 }}>
                            {form.business.name} will get back to you soon
                        </Typography>
                    </Box>
                )}
            </GlassCard>
            <Keyframes />
        </FullPageState>
    );

    // ── Main Form ─────────────────────────────────────────────────────────────
    return (
        <Box sx={{
            minHeight: '100vh', position: 'relative', bgcolor: T.bg,
            py: { xs: 5, md: 8 }, px: 2, overflow: 'hidden',
        }}>
            <Box sx={{ position: 'fixed', inset: 0, zIndex: 0 }}><NeuralBackground /></Box>

            {/* Ambient glow */}
            <Box sx={{
                position: 'fixed', top: '25%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 700, height: 700, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(circle, rgba(0,224,255,0.05), transparent 70%)',
            }} />

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

                {/* Business info */}
                {form.business && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography sx={{
                            fontWeight: 900, fontSize: { xs: '1.5rem', sm: '1.85rem' },
                            letterSpacing: '-0.03em', mb: 1.5,
                            background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {form.business.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                            {form.business.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                    <EmailIcon sx={{ fontSize: '0.78rem', color: T.textFaint }} />
                                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>{form.business.email}</Typography>
                                </Box>
                            )}
                            {form.business.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                    <PhoneIcon sx={{ fontSize: '0.78rem', color: T.textFaint }} />
                                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>{form.business.phone}</Typography>
                                </Box>
                            )}
                            {form.business.website && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                    <LanguageIcon sx={{ fontSize: '0.78rem', color: T.cyan }} />
                                    <Typography
                                        component="a" href={form.business.website} target="_blank"
                                        sx={{ fontSize: '0.78rem', color: T.cyan, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        {form.business.website.replace(/^https?:\/\//, '')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Form card */}
                <Box sx={{
                    bgcolor: T.bgCard, backdropFilter: 'blur(24px)',
                    border: `1px solid ${T.borderCyan}`, borderRadius: '20px',
                    p: { xs: 3, sm: 5 },
                    boxShadow: '0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,224,255,0.03)',
                    animation: 'cardIn 0.55s cubic-bezier(0.16,1,0.3,1) both',
                }}>

                    {/* Form title + description */}
                    <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${T.border}` }}>
                        <Typography sx={{
                            fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' },
                            letterSpacing: '-0.02em', mb: 0.8,
                            background: T.gradientText,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {form.title}
                        </Typography>
                        {form.description && (
                            <Typography sx={{ color: T.textMuted, fontSize: '0.83rem', lineHeight: 1.7 }}>
                                {form.description}
                            </Typography>
                        )}
                    </Box>

                    {/* Fields */}
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {form.fields.map(field => (
                            <Box key={field.id}>

                                {/* Text / email / phone / number / date */}
                                {['text', 'email', 'phone', 'number', 'date'].includes(field.type) && (
                                    <Box>
                                        <Typography sx={labelSx}>
                                            {field.label}
                                            {field.required && <Box component="span" sx={{ color: T.red, ml: 0.3 }}>*</Box>}
                                        </Typography>
                                        <TextField
                                            fullWidth size="small"
                                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            onChange={e => handleAnswerChange(field.id, e.target.value)}
                                            sx={inputSx}
                                        />
                                    </Box>
                                )}

                                {/* Textarea */}
                                {field.type === 'textarea' && (
                                    <Box>
                                        <Typography sx={labelSx}>
                                            {field.label}
                                            {field.required && <Box component="span" sx={{ color: T.red, ml: 0.3 }}>*</Box>}
                                        </Typography>
                                        <TextField
                                            fullWidth multiline rows={4} size="small"
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            onChange={e => handleAnswerChange(field.id, e.target.value)}
                                            sx={inputSx}
                                        />
                                    </Box>
                                )}

                                {/* Select */}
                                {field.type === 'select' && (
                                    <Box>
                                        <Typography sx={labelSx}>
                                            {field.label}
                                            {field.required && <Box component="span" sx={{ color: T.red, ml: 0.3 }}>*</Box>}
                                        </Typography>
                                        <Select
                                            fullWidth displayEmpty defaultValue=""
                                            onChange={e => handleAnswerChange(field.id, e.target.value)}
                                            sx={{
                                                borderRadius: '10px', fontSize: '0.875rem',
                                                bgcolor: T.bgInput, backdropFilter: 'blur(8px)',
                                                color: T.textSub,
                                                '& .MuiSelect-select': { py: '9px' },
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: T.borderCyan },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,224,255,0.35)' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: T.borderFocus, boxShadow: `0 0 0 3px ${T.cyanGlow}` },
                                                '& .MuiSvgIcon-root': { color: T.textMuted },
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        bgcolor: 'rgba(5,10,20,0.97)', borderRadius: '12px',
                                                        border: `1px solid ${T.borderCyan}`,
                                                        backdropFilter: 'blur(20px)',
                                                        '& .MuiMenuItem-root': {
                                                            fontSize: '0.85rem', color: T.textSub,
                                                            '&:hover': { bgcolor: T.cyanDim },
                                                            '&.Mui-selected': { bgcolor: 'rgba(0,224,255,0.12)', color: T.cyan },
                                                        },
                                                    }
                                                }
                                            }}
                                            renderValue={v => !v
                                                ? <Typography sx={{ color: T.textFaint, fontSize: '0.875rem' }}>Select an option</Typography>
                                                : <Typography sx={{ color: T.textSub, fontSize: '0.875rem' }}>{v as string}</Typography>
                                            }
                                        >
                                            {field.options?.map(opt => (
                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                )}

                                {/* Multiselect */}
                                {field.type === 'multiselect' && (
                                    <Box>
                                        <Typography sx={labelSx}>
                                            {field.label}
                                            {field.required && <Box component="span" sx={{ color: T.red, ml: 0.3 }}>*</Box>}
                                        </Typography>
                                        <Autocomplete
                                            multiple
                                            options={field.options || []}
                                            onChange={(_, v) => handleAnswerChange(field.id, v)}
                                            renderInput={params => (
                                                <TextField {...params} size="small"
                                                    placeholder={field.placeholder || 'Select options'}
                                                    sx={inputSx}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((opt, i) => (
                                                    <Chip
                                                        {...getTagProps({ index: i })}
                                                        key={opt} label={opt} size="small"
                                                        sx={{
                                                            bgcolor: T.cyanDim, color: T.cyan,
                                                            fontSize: '0.7rem', height: 22,
                                                            border: `1px solid rgba(0,224,255,0.25)`,
                                                            '& .MuiChip-deleteIcon': {
                                                                color: 'rgba(0,224,255,0.4)',
                                                                '&:hover': { color: T.cyan },
                                                            },
                                                        }}
                                                    />
                                                ))
                                            }
                                            slotProps={{
                                                paper: {
                                                    sx: {
                                                        bgcolor: 'rgba(5,10,20,0.97)', borderRadius: '12px',
                                                        border: `1px solid ${T.borderCyan}`,
                                                        backdropFilter: 'blur(20px)',
                                                        '& .MuiAutocomplete-option': {
                                                            fontSize: '0.85rem', color: T.textSub,
                                                            '&:hover': { bgcolor: T.cyanDim },
                                                            '&[aria-selected="true"]': { bgcolor: 'rgba(0,224,255,0.12)', color: T.cyan },
                                                        },
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                )}

                                {/* Radio */}
                                {field.type === 'radio' && (
                                    <FormControl component="fieldset">
                                        <Typography sx={labelSx}>
                                            {field.label}
                                            {field.required && <Box component="span" sx={{ color: T.red, ml: 0.3 }}>*</Box>}
                                        </Typography>
                                        <RadioGroup onChange={e => handleAnswerChange(field.id, e.target.value)}>
                                            {field.options?.map(opt => (
                                                <FormControlLabel
                                                    key={opt} value={opt}
                                                    control={<Radio size="small" sx={{ color: T.borderCyan, '&.Mui-checked': { color: T.cyan } }} />}
                                                    label={<Typography sx={{ fontSize: '0.85rem', color: T.textSub }}>{opt}</Typography>}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                )}

                                {/* Checkbox */}
                                {field.type === 'checkbox' && (
                                    <FormControl component="fieldset">
                                        <Typography sx={labelSx}>
                                            {field.label}
                                            {field.required && <Box component="span" sx={{ color: T.red, ml: 0.3 }}>*</Box>}
                                        </Typography>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox size="small"
                                                        onChange={e => handleAnswerChange(field.id, e.target.checked)}
                                                        sx={{ color: T.borderCyan, '&.Mui-checked': { color: T.cyan } }}
                                                    />
                                                }
                                                label={<Typography sx={{ fontSize: '0.85rem', color: T.textSub }}>{field.placeholder || 'Yes, I agree'}</Typography>}
                                            />
                                        </FormGroup>
                                    </FormControl>
                                )}

                            </Box>
                        ))}

                        {/* Submit button */}
                        <Box
                            component="button" type="button"
                            disabled={submitting}
                            onClick={handleSubmit}
                            sx={{
                                mt: 1, py: 1.4, px: 3, width: '100%',
                                borderRadius: '10px', border: 'none',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                background: submitting ? 'rgba(255,255,255,0.06)' : T.gradientBtn,
                                color: submitting ? T.textMuted : 'white',
                                fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                                boxShadow: submitting ? 'none' : `0 0 24px rgba(0,224,255,0.2)`,
                                opacity: submitting ? 0.7 : 1,
                                transition: 'all 0.25s ease',
                                '&:not(:disabled):hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 0 40px rgba(0,224,255,0.4)`,
                                },
                            }}
                        >
                            {submitting
                                ? <CircularProgress size={20} sx={{ color: T.textMuted }} />
                                : <><span>Submit</span><ArrowForwardIcon sx={{ fontSize: '1rem' }} /></>
                            }
                        </Box>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: T.textFaint, letterSpacing: '0.05em' }}>
                            Powered by{' '}
                            <Box component="span" sx={{
                                background: T.gradient,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                fontWeight: 700,
                            }}>
                                Nexaserv
                            </Box>
                        </Typography>
                    </Box>
                </Box>
            </Container>

            <Keyframes />
        </Box>
    );
}

// ── Keyframes ─────────────────────────────────────────────────────────────────
function Keyframes() {
    return (
        <style>{`
            @keyframes cardIn {
                from { opacity: 0; transform: translateY(24px) scale(0.97); }
                to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }
        `}</style>
    );
}