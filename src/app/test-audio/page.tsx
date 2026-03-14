"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: '#050a14',
  bgCard: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  borderCyan: 'rgba(0,224,255,0.15)',
  cyan: '#00e0ff',
  cyanDim: 'rgba(0,224,255,0.10)',
  cyanGlow: 'rgba(0,224,255,0.25)',
  purple: '#6450ff',
  purpleDim: 'rgba(100,80,255,0.12)',
  green: '#4aff9f',
  greenDim: 'rgba(74,255,159,0.10)',
  red: '#ff6b6b',
  redDim: 'rgba(255,107,107,0.10)',
  textPrimary: 'rgba(220,240,255,0.95)',
  textMuted: 'rgba(130,170,220,0.55)',
  textFaint: 'rgba(100,140,180,0.40)',
  gradient: 'linear-gradient(135deg, #00e0ff 0%, #0070e0 100%)',
  gradientText: 'linear-gradient(135deg, #fff 0%, #aad4ff 60%, #00e0ff 100%)',
};

interface TestButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accent: string;
  accentDim: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function TestButton({ icon, label, sublabel, accent, accentDim, onClick, disabled, loading }: TestButtonProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 2,
        p: 2.5, borderRadius: '14px', border: 'none',
        bgcolor: accentDim,
        outline: `1px solid ${accent}26`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        '&:not(:disabled):hover': {
          outline: `1px solid ${accent}66`,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${accent}18`,
        },
      }}
    >
      {/* Icon circle */}
      <Box sx={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        bgcolor: `${accent}18`, border: `1px solid ${accent}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent, fontSize: '1.2rem',
      }}>
        {loading ? <CircularProgress size={18} sx={{ color: accent }} /> : icon}
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: T.textPrimary, fontWeight: 700, fontSize: '0.88rem', mb: 0.2 }}>
          {label}
        </Typography>
        <Typography sx={{ color: T.textMuted, fontSize: '0.75rem' }}>
          {sublabel}
        </Typography>
      </Box>

      {/* Arrow */}
      {!disabled && !loading && (
        <Typography sx={{ color: `${accent}66`, fontSize: '1rem' }}>›</Typography>
      )}
    </Box>
  );
}

export default function TestAudioPage() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [resultType, setResultType] = useState<'success' | 'error' | null>(null);

  const setResult = (msg: string, type: 'success' | 'error') => {
    setTestResult(msg);
    setResultType(type);
    setActiveTest(null);
  };

  const playTestSound = () => {
    setActiveTest('beep');
    setTestResult('');
    setResultType(null);

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      setResult('Beep played — if you heard it, your speakers are working!', 'success');
    }, 1000);
  };

  const testSpeechSynthesis = () => {
    setActiveTest('speech');
    setTestResult('');
    setResultType(null);

    if (!('speechSynthesis' in window)) {
      setResult('Speech synthesis is not supported in this browser.', 'error');
      return;
    }

    const utterance = new SpeechSynthesisUtterance("Hello! This is a test of your browser's text to speech. Can you hear me?");
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setResult('Voice played — if you heard it, text-to-speech is working!', 'success');
    utterance.onerror = (e) => setResult(`Speech synthesis error: ${e.error}`, 'error');

    window.speechSynthesis.speak(utterance);
  };

  const testAudioElement = () => {
    setActiveTest('html5');
    setTestResult('');
    setResultType(null);

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const dest = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(dest.stream);
    const chunks: Blob[] = [];

    oscillator.connect(gainNode);
    gainNode.connect(dest);
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      setResult('HTML5 audio played — if you heard a sound, it\'s working!', 'success');
    };

    mediaRecorder.start();
    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      mediaRecorder.stop();
    }, 1000);
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      px: 2, position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'fixed',
        top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(0,180,255,0.07) 0%, transparent 70%)',
      },
    }}>
      <Box sx={{ maxWidth: 520, width: '100%', position: 'relative', zIndex: 1 }}>

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
          border: `1px solid ${T.borderCyan}`, borderRadius: '20px',
          p: { xs: 3, sm: 5 },
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          animation: 'cardIn 0.55s cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* Header */}
          <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{
              fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.55rem' },
              letterSpacing: '-0.03em', mb: 0.8,
              background: T.gradientText,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Audio Test
            </Typography>
            <Typography sx={{ color: T.textMuted, fontSize: '0.82rem', lineHeight: 1.6 }}>
              Verify your speakers are working before starting voice onboarding.
            </Typography>
          </Box>

          {/* Test buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <TestButton
              icon={<VolumeUpIcon fontSize="small" />}
              label="Play Beep Sound"
              sublabel="Generates a 440Hz tone using Web Audio API"
              accent={T.cyan}
              accentDim={T.cyanDim}
              onClick={playTestSound}
              disabled={activeTest !== null}
              loading={activeTest === 'beep'}
            />
            <TestButton
              icon={<RecordVoiceOverIcon fontSize="small" />}
              label="Browser Text-to-Speech"
              sublabel="Uses your browser's built-in speech synthesis"
              accent={T.purple}
              accentDim={T.purpleDim}
              onClick={testSpeechSynthesis}
              disabled={activeTest !== null}
              loading={activeTest === 'speech'}
            />
            <TestButton
              icon={<GraphicEqIcon fontSize="small" />}
              label="HTML5 Audio Element"
              sublabel="Records and plays back audio via MediaRecorder"
              accent={T.green}
              accentDim={T.greenDim}
              onClick={testAudioElement}
              disabled={activeTest !== null}
              loading={activeTest === 'html5'}
            />
          </Box>

          {/* Result banner */}
          {testResult && (
            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.5,
              p: 2.5, borderRadius: '12px', mb: 3,
              bgcolor: resultType === 'success' ? T.greenDim : T.redDim,
              border: `1px solid ${resultType === 'success' ? 'rgba(74,255,159,0.25)' : 'rgba(255,107,107,0.25)'}`,
              animation: 'cardIn 0.3s ease both',
            }}>
              {resultType === 'success'
                ? <CheckCircleIcon sx={{ fontSize: '1.1rem', color: T.green, flexShrink: 0, mt: 0.1 }} />
                : <ErrorOutlineIcon sx={{ fontSize: '1.1rem', color: T.red, flexShrink: 0, mt: 0.1 }} />
              }
              <Typography sx={{
                fontSize: '0.82rem', lineHeight: 1.6,
                color: resultType === 'success' ? 'rgba(74,255,159,0.9)' : 'rgba(255,107,107,0.9)',
              }}>
                {testResult}
              </Typography>
            </Box>
          )}

          {/* Troubleshooting */}
          <Box sx={{
            p: 2.5, borderRadius: '12px',
            bgcolor: 'rgba(255,255,255,0.02)',
            border: `1px solid ${T.border}`,
            mb: 3,
          }}>
            <Typography sx={{ color: T.textMuted, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.2 }}>
              Troubleshooting
            </Typography>
            {[
              'Make sure your device volume is turned up',
              'Check that your browser has permission to play audio',
              'Try headphones if built-in speakers aren\'t working',
              'Open browser console (F12) to check for errors',
            ].map(tip => (
              <Box key={tip} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: T.textFaint, flexShrink: 0, mt: '6px' }} />
                <Typography sx={{ color: T.textFaint, fontSize: '0.78rem', lineHeight: 1.6 }}>{tip}</Typography>
              </Box>
            ))}
          </Box>

          {/* Back button */}
          <Box
            component={Link} href="/onboarding"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              py: 1.3, borderRadius: '10px', textDecoration: 'none',
              border: `1px solid ${T.borderCyan}`, bgcolor: T.cyanDim, color: T.cyan,
              fontSize: '0.88rem', fontWeight: 700,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'rgba(0,224,255,0.15)', transform: 'translateY(-1px)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: '0.95rem' }} />
            Back to Onboarding
          </Box>
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
      </Box>

      <style>{`
                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
    </Box>
  );
}