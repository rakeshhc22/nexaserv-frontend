"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LiveKitRoom, RoomAudioRenderer, useDataChannel } from "@livekit/components-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import MicIcon from "@mui/icons-material/Mic";
import { useOnboarding } from "@/app/onboarding/OnboardingContext";
import api from "@/lib/api";
import { integrationService } from "@/lib/services/integration.service";
import NeuralBackground from "@/components/NeuralBackground";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  cyan: '#00C8FF',
  purple: '#6450FF',
  dark: '#030810',
  card: 'rgba(8, 20, 48, 0.82)',
  border: 'rgba(0, 200, 255, 0.12)',
  muted: 'rgba(130, 170, 220, 0.5)',
};

interface LiveKitVoiceFlowProps { onComplete: (data: any) => void; }
interface Message { type: 'ai' | 'user'; text: string; }

// ── Voice conversation UI ─────────────────────────────────────────────────────
function VoiceConversation({ onComplete }: LiveKitVoiceFlowProps) {
  const { setActiveStep } = useOnboarding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showGmailConnect, setShowGmailConnect] = useState(false);
  const [showCalendarConnect, setShowCalendarConnect] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/onboarding/progress');
        const { currentStep, business } = res.data.data;
        if (res.data.data.isSetupComplete) { window.location.href = '/dashboard'; return; }
        setActiveStep(Math.max(0, currentStep - 1));
        const completed: number[] = [];
        for (let i = 1; i < currentStep; i++) completed.push(i);
        setCompletedSteps(completed);
        if (business) setCollectedData({ name: business.name, customCategory: business.customCategory, description: business.description, phone: business.phone, email: business.email, website: business.website, services: business.services, workingHours: business.workingHours });
        const stepMessages: Record<number, string> = { 1: "Hi!", 2: "Welcome back! Say 'services' when ready.", 3: "Hi!", 4: "Welcome back! Say 'services' to continue.", 5: "Welcome back! Say 'hours' to set business hours.", 6: "You're all set!" };
        setMessages([{ type: 'ai', text: stepMessages[currentStep] || "Hi!" }]);
        setInitialDataLoaded(true);
      } catch {
        setMessages([{ type: 'ai', text: "Hi! Welcome to Nexaserv." }]);
        setInitialDataLoaded(true);
      }
    };
    fetchProgress();
  }, [setActiveStep]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleDataReceived = useCallback((msg: any) => {
    try {
      const decoder = new TextDecoder();
      const payload = msg.payload instanceof Uint8Array ? msg.payload : new Uint8Array(msg.payload);
      const message = JSON.parse(decoder.decode(payload));

      switch (message.action) {
        case 'ai_message':
          setMessages(prev => {
            if (prev.length > 0 && prev[prev.length - 1].type === 'ai' && prev[prev.length - 1].text === message.text) return prev;
            return [...prev, { type: 'ai', text: message.text }];
          }); break;
        case 'user_message':
          setMessages(prev => {
            if (prev.length > 0 && prev[prev.length - 1].type === 'user' && prev[prev.length - 1].text === message.text) return prev;
            return [...prev, { type: 'user', text: message.text }];
          }); break;
        case 'fill_field':
          if (message.value) {
            const v = message.value;
            if (typeof v === 'string' && (v.includes('?') || v.length > 300)) break;
            setCollectedData(prev => ({ ...prev, [message.field]: message.value }));
          } break;
        case 'step_complete':
          if (message.step && !completedSteps.includes(message.step)) {
            setCompletedSteps(prev => [...prev, message.step]);
            setTimeout(async () => {
              setCollectedData(currentData => {
                let payload: any = {};
                switch (message.step) {
                  case 1:
                    payload = { name: currentData.name || '', category: 'other', customCategory: currentData.customCategory || '', description: currentData.description || '', phone: currentData.phone || '', email: currentData.email || '', website: currentData.website || '', address: { street: '', city: '', state: '', zipCode: '', country: '' } };
                    (async () => { try { await api.put('/onboarding/step/1', payload); await api.put('/onboarding/step/2', { emailConnected: false }); await api.put('/onboarding/step/3', { contactFormFields: ['name', 'email'] }); } catch { } })();
                    break;
                  case 2: api.put('/onboarding/step/4', { services: currentData.services || [] }).catch(() => { }); break;
                  case 3: api.put('/onboarding/step/5', { workingHours: currentData.workingHours || [] }).catch(() => { }); break;
                }
                return currentData;
              });
            }, 500);
            const map: Record<number, number> = { 1: 3, 2: 4, 3: 5 };
            if (map[message.step] !== undefined) setActiveStep(map[message.step]);
          } break;
        case 'show_gmail_connect': setShowGmailConnect(true); break;
        case 'show_calendar_connect': setShowCalendarConnect(true); break;
        case 'voice_complete': onComplete(collectedData); break;
        case 'complete': onComplete(message.data); break;
      }
    } catch (e) { console.error('Error processing data message:', e); }
  }, [onComplete, completedSteps]);

  useDataChannel(handleDataReceived);

  const handleConnectGmail = async () => {
    try {
      setConnectingGmail(true);
      localStorage.setItem('onboardingMode', 'voice');
      localStorage.setItem('voiceOnboardingState', JSON.stringify({ messages, collectedData, completedSteps, timestamp: Date.now() }));
      const res = await api.get('/integrations/gmail/connect?return=onboarding', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      window.location.href = res.data.url;
    } catch { setConnectingGmail(false); }
  };

  const handleConnectCalendar = async () => {
    try {
      setConnectingCalendar(true);
      localStorage.setItem('onboardingMode', 'voice');
      localStorage.setItem('voiceOnboardingState', JSON.stringify({ messages, collectedData, completedSteps, timestamp: Date.now() }));
      window.location.href = await integrationService.getGoogleUrl();
    } catch { setConnectingCalendar(false); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromOAuth = params.get('gmail') === 'connected' || params.get('calendar') === 'connected';
    if (!fromOAuth) return;
    const saved = localStorage.getItem('voiceOnboardingState');
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (Date.now() - state.timestamp < 10 * 60 * 1000) {
        setMessages(state.messages || []);
        setCollectedData(state.collectedData || {});
        setCompletedSteps(state.completedSteps || []);
        setTimeout(() => { setMessages(prev => [...prev, { type: 'ai', text: "Great! I see you've connected. Say 'continue' to move on." }]); setShowGmailConnect(false); setShowCalendarConnect(false); }, 1000);
        setInitialDataLoaded(true);
      }
      localStorage.removeItem('voiceOnboardingState');
    } catch { }
  }, []);

  const connectBtn = (label: string, Icon: any, loading: boolean, onClick: () => void) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <Button variant="contained" startIcon={<Icon />} onClick={onClick} disabled={loading} sx={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, color: 'white', px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: `0 0 20px rgba(0,200,255,0.3)`, '&:hover': { boxShadow: `0 0 35px rgba(0,200,255,0.5)` } }}>
        {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : label}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Neural background */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}><NeuralBackground /></Box>
      {/* Dark overlay */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, background: 'rgba(3,8,20,0.55)' }} />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>

        {/* Header bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.8, borderRadius: 99, bgcolor: 'rgba(0,200,255,0.08)', border: `1px solid rgba(0,200,255,0.2)` }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: C.cyan, boxShadow: `0 0 8px ${C.cyan}`, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }} />
            <MicIcon sx={{ fontSize: '0.85rem', color: C.cyan }} />
            <Typography sx={{ fontSize: '0.7rem', color: C.cyan, fontWeight: 700, letterSpacing: '0.1em' }}>VOICE ASSISTANT ACTIVE</Typography>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', minHeight: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 820, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{
              flex: 1, overflowY: 'auto', px: { xs: 2, md: 4 }, py: 2,
              display: 'flex', flexDirection: 'column', gap: 2,
              justifyContent: messages.length === 0 ? 'center' : 'flex-start',
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(0,200,255,0.15)', borderRadius: 99 },
            }}>
              {messages.length === 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={24} sx={{ color: C.cyan, mb: 1.5 }} />
                  <Typography sx={{ color: C.muted, fontSize: '0.9rem' }}>Connecting to voice assistant...</Typography>
                </Box>
              )}

              {messages.map((msg, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', animation: 'slideIn 0.3s ease-out', '@keyframes slideIn': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Box sx={{ display: 'flex', flexDirection: msg.type === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 1.2, maxWidth: '70%' }}>
                    {/* Avatar */}
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.type === 'ai' ? `linear-gradient(135deg, ${C.cyan}, ${C.purple})` : 'rgba(255,255,255,0.1)', border: msg.type === 'user' ? '1px solid rgba(255,255,255,0.15)' : 'none', boxShadow: msg.type === 'ai' ? `0 0 12px rgba(0,200,255,0.3)` : 'none' }}>
                      {msg.type === 'ai'
                        ? <SmartToyIcon sx={{ fontSize: '1rem', color: 'white' }} />
                        : <PersonIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }} />
                      }
                    </Box>
                    {/* Bubble */}
                    <Box sx={{
                      px: 2.5, py: 1.75, borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: msg.type === 'user'
                        ? `linear-gradient(135deg, ${C.cyan}, ${C.purple})`
                        : C.card,
                      border: msg.type === 'ai' ? `1px solid ${C.border}` : 'none',
                      backdropFilter: 'blur(20px)',
                      boxShadow: msg.type === 'user'
                        ? `0 4px 16px rgba(0,200,255,0.25)`
                        : '0 4px 16px rgba(0,0,0,0.3)',
                    }}>
                      <Typography sx={{ fontSize: '0.68rem', color: msg.type === 'ai' ? C.cyan : 'rgba(255,255,255,0.65)', fontWeight: 700, mb: 0.5, letterSpacing: '0.06em' }}>
                        {msg.type === 'ai' ? 'AI ASSISTANT' : 'YOU'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'rgba(220,240,255,0.92)', fontWeight: 400 }}>
                        {msg.text}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {showGmailConnect && connectBtn('Connect Gmail', EmailIcon, connectingGmail, handleConnectGmail)}
              {showCalendarConnect && connectBtn('Connect Google Calendar', CalendarTodayIcon, connectingCalendar, handleConnectCalendar)}

              <div ref={messagesEndRef} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Exit button */}
      <IconButton onClick={() => window.location.reload()} sx={{ position: 'absolute', bottom: 24, left: 24, width: 48, height: 48, bgcolor: 'rgba(8,20,48,0.8)', backdropFilter: 'blur(16px)', border: `1px solid ${C.border}`, color: C.muted, zIndex: 10, '&:hover': { bgcolor: 'rgba(255,107,107,0.15)', borderColor: 'rgba(255,107,107,0.4)', color: '#FF6B6B', transform: 'scale(1.05)' }, transition: 'all 0.2s ease' }}>
        <CloseIcon sx={{ fontSize: 22 }} />
      </IconButton>

      <RoomAudioRenderer />
    </Box>
  );
}

// ── LiveKit wrapper ───────────────────────────────────────────────────────────
export default function LiveKitVoiceFlow({ onComplete }: LiveKitVoiceFlowProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  useEffect(() => {
    const room = `onboarding-${Date.now()}`;
    const participant = `user-${Math.random().toString(36).substring(7)}`;
    fetch(`/api/livekit-token?room=${room}&participant=${participant}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setToken(d.token); setLoading(false); })
      .catch(() => { setError('Failed to connect to voice service'); setLoading(false); });
  }, []);

  const stateBox = (children: React.ReactNode) => (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#030810', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3 }}><NeuralBackground /></Box>
      <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>{children}</Box>
    </Box>
  );

  if (loading) return stateBox(<>
    <Box sx={{ width: 52, height: 52, borderRadius: '50%', background: `conic-gradient(${C.cyan}, ${C.purple}, ${C.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 1s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } }, mx: 'auto', mb: 2 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: C.dark }} />
    </Box>
    <Typography sx={{ color: C.muted, fontSize: '0.9rem' }}>Connecting to voice assistant...</Typography>
  </>);

  if (error || !token) return stateBox(<>
    <Typography sx={{ color: '#FF6B6B', fontSize: '1rem', fontWeight: 700, mb: 1 }}>⚠️ Connection Error</Typography>
    <Typography sx={{ color: C.muted, fontSize: '0.85rem' }}>{error || 'Unable to connect to voice service'}</Typography>
  </>);

  return (
    <LiveKitRoom token={token} serverUrl={serverUrl} connect audio video={false}>
      <VoiceConversation onComplete={onComplete} />
    </LiveKitRoom>
  );
}