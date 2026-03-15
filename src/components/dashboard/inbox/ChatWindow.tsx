'use client';

import {
    Box, Paper, Typography, TextField, IconButton, Avatar, CircularProgress,
    Button, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemButton, ListItemText, Drawer
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachmentIcon from '@mui/icons-material/Attachment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Conversation, Message } from '@/lib/services/inbox.service';
import { useState, useRef, useEffect } from 'react';
import ContactDetails from './ContactDetails';
import api from '@/lib/api';
import { useTheme } from '@mui/material/styles';


interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
    sending: boolean;
    onResolve: () => void;
    onReopen: () => void;
    onResumeAutomation: () => void;
    businessSlug?: string;
    onSendBookingLink?: () => void;
    onNewConversation?: () => void;
}

export default function ChatWindow({
    conversation,
    messages,
    onSendMessage,
    sending,
    onResolve,
    onReopen,
    onResumeAutomation,
    businessSlug,
    onSendBookingLink,
    onNewConversation,
}: ChatWindowProps) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';

    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form dialog
    const [formDialog, setFormDialog] = useState(false);
    const [forms, setForms] = useState<any[]>([]);
    const [loadingForms, setLoadingForms] = useState(false);
    const [selectedFormUrl, setSelectedFormUrl] = useState('');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() && attachments.length === 0) return;
        await onSendMessage(newMessage, attachments);
        setNewMessage('');
        setAttachments([]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeAttachment = (index: number) =>
        setAttachments(prev => prev.filter((_, i) => i !== index));

    const loadForms = async () => {
        setFormDialog(true);
        if (forms.length === 0) {
            setLoadingForms(true);
            try {
                const res = await api.get('/forms');
                if (res.data.success) {
                    setForms(res.data.data.filter((f: any) => f.isPublished));
                }
            } catch (err) {
                console.error('Failed to load forms:', err);
            } finally {
                setLoadingForms(false);
            }
        }
    };

    const handleSendFormLink = () => {
        if (selectedFormUrl) {
            setNewMessage(prev =>
                prev ? `${prev}\nPlease fill out this form: ${selectedFormUrl}`
                    : `Please fill out this form: ${selectedFormUrl}`
            );
            setFormDialog(false);
            setSelectedFormUrl('');
        }
    };

    // ── Design tokens ─────────────────────────────────────────────────────────
    const cardBg = darkMode ? 'rgba(8, 20, 48, 0.72)' : '#ffffff';
    const cardBorder = darkMode ? '1px solid rgba(0,200,255,0.12)' : '1px solid rgba(0,0,0,0.07)';
    const textPrimary = darkMode ? 'rgba(200, 225, 255, 0.88)' : '#1a1a2e';
    const textMuted = darkMode ? 'rgba(130, 170, 220, 0.5)' : 'rgba(0,0,0,0.45)';
    const inputBg = darkMode ? 'rgba(0, 10, 30, 0.6)' : '#ffffff';
    const inputBorder = darkMode ? '1px solid rgba(0,200,255,0.15)' : '1px solid rgba(0,0,0,0.1)';

    const isDisabled = (hasContent: boolean) =>
        !hasContent || conversation?.status === 'resolved';

    // ── Empty state ───────────────────────────────────────────────────────────
    if (!conversation) {
        return (
            <Paper sx={{
                height: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: 3,
                bgcolor: cardBg, backdropFilter: 'blur(16px)', border: cardBorder,
            }}>
                <Box textAlign="center" p={4} sx={{
                    bgcolor: darkMode ? 'rgba(8,20,48,0.4)' : '#f8fafc',
                    borderRadius: 3, border: cardBorder, maxWidth: 400,
                }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '50%',
                        bgcolor: 'rgba(0,200,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2,
                    }}>
                        <Typography sx={{ fontSize: 32 }}>💬</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: textPrimary, mb: 1, fontWeight: 700 }}>
                        Select a conversation
                    </Typography>
                    <Typography variant="body2" sx={{ color: textMuted, mb: 3 }}>
                        Choose a conversation from the list to start messaging.
                    </Typography>
                    {onNewConversation && (
                        <Button
                            variant="contained"
                            onClick={onNewConversation}
                            sx={{
                                background: 'linear-gradient(135deg, #00C8FF, #6450FF)',
                                borderRadius: 2, px: 4, py: 1,
                                fontWeight: 700, textTransform: 'none',
                                boxShadow: '0 0 24px rgba(0,200,255,0.3)',
                                '&:hover': { boxShadow: '0 0 40px rgba(0,200,255,0.5)', transform: 'translateY(-2px)' },
                            }}
                        >
                            Start New Conversation
                        </Button>
                    )}
                </Box>
            </Paper>
        );
    }

    const sendDisabled =
        (!newMessage.trim() && attachments.length === 0) ||
        conversation.status === 'resolved';

    return (
        <Paper sx={{
            height: '100%', display: 'flex', flexDirection: 'column',
            borderRadius: 3, overflow: 'hidden',
            background: cardBg, backdropFilter: 'blur(16px)',
            border: cardBorder, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>

            {/* ── Header ── */}
            <Box sx={{
                p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: darkMode ? '1px solid rgba(0,200,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            }}>
                <Box
                    display="flex" alignItems="center" gap={2}
                    onClick={() => setShowContactDetails(true)}
                    sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                >
                    <Avatar sx={{
                        bgcolor: darkMode ? 'rgba(0,200,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: '#00C8FF',
                        border: '1px solid rgba(0,200,255,0.3)',
                    }}>
                        {conversation.contactId?.name?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: textPrimary }}>
                                {conversation.contactId?.name || 'Unknown Contact'}
                            </Typography>
                            {conversation.metadata?.gmailThreadId && (
                                <Tooltip title="Synced from Gmail">
                                    <EmailOutlinedIcon sx={{ fontSize: 16, color: '#00C8FF' }} />
                                </Tooltip>
                            )}
                        </Box>
                        <Typography variant="caption" sx={{ color: textMuted }}>
                            {conversation.contactId?.email || 'No email'}
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" gap={1}>
                    {conversation.status === 'resolved' ? (
                        <Button
                            size="small" onClick={onReopen}
                            startIcon={<PlayCircleOutlineIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                color: '#00C8FF', bgcolor: 'rgba(0,200,255,0.08)',
                                borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 2,
                                '&:hover': { bgcolor: 'rgba(0,200,255,0.15)' },
                            }}
                        >
                            Reopen
                        </Button>
                    ) : (
                        <Button
                            size="small" onClick={onResolve}
                            startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                color: '#4AFF9F', bgcolor: 'rgba(74,255,159,0.08)',
                                borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 2,
                                '&:hover': { bgcolor: 'rgba(74,255,159,0.15)' },
                            }}
                        >
                            Resolve
                        </Button>
                    )}
                </Box>
            </Box>

            {/* ── Automation paused banner ── */}
            {conversation.automationPaused && (
                <Box sx={{
                    bgcolor: 'rgba(255,184,0,0.1)', color: '#FFB800', p: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,184,0,0.2)',
                }}>
                    <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span role="img" aria-label="warning">⚠️</span>
                        AI Automation is paused. You have taken over.
                    </Typography>
                    <Button
                        size="small" variant="outlined" onClick={onResumeAutomation}
                        sx={{
                            color: '#FFB800', borderColor: 'rgba(255,184,0,0.5)',
                            textTransform: 'none', fontWeight: 600, borderRadius: 1.5,
                            '&:hover': { borderColor: '#FFB800', bgcolor: 'rgba(255,184,0,0.15)' },
                        }}
                    >
                        Resume AI
                    </Button>
                </Box>
            )}

            {/* ── Messages ── */}
            <Box sx={{
                flexGrow: 1, overflowY: 'auto',
                p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                    background: darkMode ? 'rgba(0,200,255,0.15)' : 'rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                },
            }}>
                {messages.length === 0 ? (
                    <Box textAlign="center" color={textMuted} my="auto">
                        <Typography variant="body2">No messages yet. Send the first message!</Typography>
                    </Box>
                ) : (
                    messages.map((msg, index) => {
                        const isOutbound = msg.direction === 'outbound';
                        return (
                            <Box
                                key={msg._id || index}
                                sx={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: isOutbound ? 'flex-end' : 'flex-start',
                                    gap: 0.5,
                                }}
                            >
                                <Typography variant="caption" sx={{ color: textMuted, px: 1, fontSize: '0.65rem' }}>
                                    {isOutbound
                                        ? ((msg as any).automated ? 'Sent by AI' : 'You')
                                        : conversation.contactId?.name}
                                    {' • '}
                                    {new Date(msg.sentAt || (msg as any).createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>

                                {/* ── Message bubble ── */}
                                {/* NOTE: bgcolor cannot accept a gradient string — use background instead */}
                                <Box sx={{
                                    maxWidth: '75%', p: 1.5,
                                    ...(isOutbound
                                        ? {
                                            background: (msg as any).automated
                                                ? 'linear-gradient(135deg, rgba(0,200,255,0.25), rgba(100,80,255,0.25))'
                                                : 'linear-gradient(135deg, #00C8FF, #6450FF)',
                                            color: '#fff',
                                            boxShadow: '0 4px 16px rgba(0,200,255,0.2)',
                                            border: 'none',
                                        }
                                        : {
                                            background: darkMode ? 'rgba(8,20,48,0.9)' : '#f5f5f5',
                                            color: textPrimary,
                                            border: darkMode
                                                ? '1px solid rgba(0,200,255,0.12)'
                                                : '1px solid rgba(0,0,0,0.05)',
                                        }
                                    ),
                                    borderRadius: isOutbound ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                }}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                        {msg.content}
                                    </Typography>

                                    {(msg as any).attachments && (msg as any).attachments.length > 0 && (
                                        <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                                            {(msg as any).attachments.map((url: string, i: number) => (
                                                <Button
                                                    key={i}
                                                    component="a"
                                                    href={url}
                                                    target="_blank"
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<AttachmentIcon sx={{ fontSize: 14 }} />}
                                                    sx={{
                                                        color: isOutbound ? 'rgba(255,255,255,0.9)' : textPrimary,
                                                        borderColor: isOutbound
                                                            ? 'rgba(255,255,255,0.3)'
                                                            : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                                        fontSize: '0.7rem', borderRadius: 1,
                                                        py: 0.2, textTransform: 'none',
                                                    }}
                                                >
                                                    Attachment {i + 1}
                                                </Button>
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                {isOutbound && (msg as any).channel === 'gmail' && (
                                    <Typography variant="caption" sx={{ color: 'rgba(0,200,255,0.5)', fontSize: '0.6rem', pr: 1 }}>
                                        Sent via Gmail
                                    </Typography>
                                )}
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* ── Input area ── */}
            <Box sx={{
                p: 2,
                bgcolor: darkMode ? 'rgba(3,8,16,0.6)' : '#ffffff',
                borderTop: darkMode ? '1px solid rgba(0,200,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            }}>
                {/* Attachment chips */}
                {attachments.length > 0 && (
                    <Box mb={2} display="flex" gap={1} flexWrap="wrap">
                        {attachments.map((file, i) => (
                            <Chip
                                key={i}
                                label={file.name}
                                onDelete={() => removeAttachment(i)}
                                sx={{
                                    bgcolor: darkMode ? 'rgba(0,200,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    color: textPrimary,
                                    border: darkMode ? '1px solid rgba(0,200,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: 1,
                                }}
                                deleteIcon={<CloseIcon sx={{ color: textMuted, '&:hover': { color: '#FF6B6B' } }} />}
                            />
                        ))}
                    </Box>
                )}

                {/* Input row */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    bgcolor: inputBg, border: inputBorder,
                    borderRadius: 3, p: 0.5, pr: 1,
                    transition: 'all 0.2s ease',
                    '&:focus-within': {
                        borderColor: '#00C8FF',
                        boxShadow: darkMode
                            ? '0 0 0 3px rgba(0,200,255,0.08)'
                            : '0 0 0 3px rgba(0,200,255,0.1)',
                    },
                }}>
                    <input
                        type="file" multiple ref={fileInputRef}
                        style={{ display: 'none' }} onChange={handleFileSelect}
                    />

                    <Tooltip title="Attach file">
                        <IconButton
                            size="small"
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ color: textMuted, '&:hover': { color: '#00C8FF', bgcolor: 'rgba(0,200,255,0.08)' } }}
                        >
                            <AttachmentIcon />
                        </IconButton>
                    </Tooltip>

                    {businessSlug && onSendBookingLink && (
                        <Tooltip title="Send Booking Link">
                            <IconButton
                                size="small"
                                onClick={onSendBookingLink}
                                sx={{ color: textMuted, '&:hover': { color: '#6450FF', bgcolor: 'rgba(100,80,255,0.08)' } }}
                            >
                                <InsertLinkIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip title="Send Form">
                        <IconButton
                            size="small"
                            onClick={loadForms}
                            sx={{ color: textMuted, '&:hover': { color: '#00C8FF', bgcolor: 'rgba(0,200,255,0.08)' } }}
                        >
                            <DescriptionOutlinedIcon />
                        </IconButton>
                    </Tooltip>

                    <TextField
                        fullWidth multiline maxRows={4}
                        placeholder={
                            conversation.status === 'resolved'
                                ? 'Conversation resolved. Reopen to send message.'
                                : 'Type your message...'
                        }
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={conversation.status === 'resolved'}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                            mx: 1,
                            '& .MuiInputBase-input': {
                                color: textPrimary, fontSize: '0.9rem',
                                '&::placeholder': { color: textMuted, opacity: 1 },
                            },
                        }}
                    />

                    {sending ? (
                        <CircularProgress size={24} sx={{ color: '#00C8FF', m: 1 }} />
                    ) : (
                        <IconButton
                            onClick={handleSend}
                            disabled={sendDisabled}
                            sx={{
                                background: sendDisabled
                                    ? 'transparent'
                                    : 'linear-gradient(135deg, #00C8FF, #6450FF)',
                                color: sendDisabled ? textMuted : '#fff',
                                borderRadius: 2, width: 40, height: 40,
                                boxShadow: sendDisabled ? 'none' : '0 4px 12px rgba(0,200,255,0.3)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: sendDisabled ? 'none' : 'translateY(-2px)',
                                    boxShadow: sendDisabled ? 'none' : '0 6px 16px rgba(0,200,255,0.4)',
                                },
                            }}
                        >
                            <SendIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* ── Contact details drawer ── */}
            <Drawer
                anchor="right"
                open={showContactDetails}
                onClose={() => setShowContactDetails(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 }, bgcolor: 'background.default' }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={() => setShowContactDetails(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ p: 2 }}>
                    <ContactDetails
                        conversation={conversation}
                        businessSlug={businessSlug || null}
                        onResolve={onResolve}
                        onReopen={onReopen}
                        onSendBookingLink={onSendBookingLink || (() => {})}
                    />
                </Box>
            </Drawer>

            {/* ── Forms dialog ── */}
            <Dialog
                open={formDialog}
                onClose={() => setFormDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: darkMode ? 'rgba(8,20,48,0.95)' : '#ffffff',
                        backdropFilter: 'blur(16px)',
                        border: darkMode ? '1px solid rgba(0,200,255,0.12)' : '1px solid rgba(0,0,0,0.07)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    },
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 700, color: textPrimary,
                    borderBottom: darkMode ? '1px solid rgba(0,200,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                }}>
                    Send Form Link
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    {loadingForms ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress sx={{ color: '#00C8FF' }} />
                        </Box>
                    ) : forms.length === 0 ? (
                        <Typography sx={{ color: textMuted, textAlign: 'center', p: 4 }}>
                            No published forms available. Create one in the Forms tab.
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {forms.map((form) => {
                                const formUrl = `${window.location.origin}/f/${form.publicSlug}`;
                                const selected = selectedFormUrl === formUrl;
                                return (
                                    <ListItem key={form._id} disablePadding sx={{ mb: 1 }}>
                                        <ListItemButton
                                            selected={selected}
                                            onClick={() => setSelectedFormUrl(formUrl)}
                                            sx={{
                                                borderRadius: 2,
                                                border: selected
                                                    ? '1px solid #00C8FF'
                                                    : (darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'),
                                                bgcolor: selected
                                                    ? (darkMode ? 'rgba(0,200,255,0.1)' : 'rgba(0,200,255,0.05)')
                                                    : 'transparent',
                                                '&:hover': {
                                                    bgcolor: selected
                                                        ? (darkMode ? 'rgba(0,200,255,0.12)' : 'rgba(0,200,255,0.07)')
                                                        : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography fontWeight={600} sx={{ color: textPrimary }}>
                                                        {form.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" sx={{ color: textMuted }}>
                                                        {form.description || 'No description'}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2,
                    borderTop: darkMode ? '1px solid rgba(0,200,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                }}>
                    <Button
                        onClick={() => setFormDialog(false)}
                        sx={{ color: textMuted, fontWeight: 600, textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSendFormLink}
                        disabled={!selectedFormUrl}
                        sx={{
                            background: selectedFormUrl
                                ? 'linear-gradient(135deg, #00C8FF, #6450FF)'
                                : 'rgba(130,170,220,0.2)',
                            color: '#ffffff',
                            borderRadius: 2, fontWeight: 700,
                            textTransform: 'none', px: 3,
                            opacity: selectedFormUrl ? 1 : 0.5,
                            '&:hover': {
                                background: selectedFormUrl
                                    ? 'linear-gradient(135deg, #00C8FF, #6450FF)'
                                    : 'rgba(130,170,220,0.2)',
                                boxShadow: selectedFormUrl ? '0 0 20px rgba(0,200,255,0.3)' : 'none',
                            },
                        }}
                    >
                        Insert Link
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}