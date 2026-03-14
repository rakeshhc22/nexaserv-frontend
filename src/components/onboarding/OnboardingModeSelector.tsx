"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MicIcon from "@mui/icons-material/Mic";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TuneIcon from "@mui/icons-material/Tune";
import PublicIcon from "@mui/icons-material/Public";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  cyan: '#00C8FF',
  purple: '#6450FF',
  muted: 'rgba(130, 170, 220, 0.5)',
  card: 'rgba(8, 20, 48, 0.75)',
  border: 'rgba(0, 200, 255, 0.12)',
};

interface OnboardingModeSelectorProps {
  onSelectMode: (mode: "manual" | "voice") => void;
}

const voiceFeatures = [
  { icon: <BoltIcon sx={{ fontSize: 13 }} />, label: "3x faster than typing" },
  { icon: <RecordVoiceOverIcon sx={{ fontSize: 13 }} />, label: "AI understands natural speech" },
  { icon: <CheckCircleIcon sx={{ fontSize: 13 }} />, label: "Review and edit before saving" },
];

const manualFeatures = [
  { icon: <TuneIcon sx={{ fontSize: 13 }} />, label: "Complete control over input" },
  { icon: <PublicIcon sx={{ fontSize: 13 }} />, label: "Works in all browsers" },
  { icon: <AccessTimeIcon sx={{ fontSize: 13 }} />, label: "Takes about 5 minutes" },
];

export default function OnboardingModeSelector({ onSelectMode }: OnboardingModeSelectorProps) {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setIsSupported(false);
  }, []);

  const handleVoiceMode = async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice mode requires Chrome or Edge browser."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      if (!window.speechSynthesis) { alert("Text-to-speech not supported in this browser."); return; }
      onSelectMode("voice");
    } catch {
      alert("Microphone access is required for voice mode. Please allow it in your browser settings.");
    }
  };

  return (
    <Box sx={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "60vh", textAlign: "center", px: 2,
    }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 6 }}>
        {/* AI badge */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          px: 2.5, py: 0.7, borderRadius: 99, mb: 3,
          border: `1px solid rgba(0,200,255,0.25)`,
          background: 'rgba(0,200,255,0.07)',
        }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
          <Typography sx={{ fontSize: '0.7rem', color: C.cyan, fontWeight: 700, letterSpacing: '0.12em' }}>
            AI-POWERED ONBOARDING
          </Typography>
        </Box>

        <Typography variant="h3" sx={{
          fontWeight: 800, fontSize: { xs: '1.9rem', sm: '2.4rem' },
          letterSpacing: '-0.03em', lineHeight: 1.1, mb: 2,
          background: `linear-gradient(135deg, #fff 0%, #AAD4FF 50%, ${C.cyan} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Welcome to Nexaserv
        </Typography>
        <Typography sx={{
          color: C.muted, fontSize: { xs: '0.95rem', sm: '1.05rem' },
          maxWidth: 480, mx: 'auto', lineHeight: 1.7,
        }}>
          Let's set up your business workspace. Choose how you'd like to get started:
        </Typography>
      </Box>

      {/* ── Mode Cards ── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        sx={{ width: '100%', maxWidth: 900, mb: 4, justifyContent: 'center' }}
      >
        {/* ── Voice Card ── */}
        <Box
          onClick={() => isSupported && handleVoiceMode()}
          sx={{
            flex: 1, p: { xs: 4, md: 5 },
            borderRadius: 3,
            background: isSupported
              ? `linear-gradient(135deg, rgba(0,200,255,0.1), rgba(100,80,255,0.08))`
              : 'rgba(8,20,48,0.5)',
            border: isSupported
              ? `1px solid rgba(0,200,255,0.3)`
              : `1px solid rgba(0,200,255,0.08)`,
            backdropFilter: 'blur(20px)',
            cursor: isSupported ? 'pointer' : 'not-allowed',
            opacity: isSupported ? 1 : 0.5,
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.35s ease',
            boxShadow: isSupported ? `0 0 30px rgba(0,200,255,0.08)` : 'none',
            '&:hover': isSupported ? {
              transform: 'translateY(-6px)',
              boxShadow: `0 16px 48px rgba(0,200,255,0.18)`,
              borderColor: C.cyan,
            } : {},
          }}
        >
          {/* AI badge */}
          {isSupported && (
            <Box sx={{
              position: 'absolute', top: 16, right: 16,
              display: 'inline-flex', alignItems: 'center', gap: 0.6,
              px: 1.5, py: 0.4, borderRadius: 99,
              bgcolor: 'rgba(0,200,255,0.12)',
              border: `1px solid rgba(0,200,255,0.25)`,
            }}>
              <AutoAwesomeIcon sx={{ fontSize: '0.75rem', color: C.cyan }} />
              <Typography sx={{ fontSize: '0.65rem', color: C.cyan, fontWeight: 700, letterSpacing: '0.08em' }}>
                AI POWERED
              </Typography>
            </Box>
          )}

          {/* Icon */}
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 3,
            background: isSupported
              ? `radial-gradient(circle, rgba(0,200,255,0.2), rgba(0,200,255,0.05))`
              : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${isSupported ? 'rgba(0,200,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isSupported ? `0 0 24px rgba(0,200,255,0.2)` : 'none',
          }}>
            <MicIcon sx={{ fontSize: 30, color: isSupported ? C.cyan : 'rgba(255,255,255,0.2)' }} />
          </Box>

          <Typography sx={{
            fontWeight: 800, fontSize: '1.3rem', mb: 1,
            color: isSupported ? 'rgba(220,240,255,0.95)' : 'rgba(255,255,255,0.3)',
            letterSpacing: '-0.02em',
          }}>
            Voice Assistant
          </Typography>
          <Typography sx={{
            color: C.muted, lineHeight: 1.7, mb: 3.5, fontSize: '0.9rem',
          }}>
            Speak naturally and let AI fill in your business details. Fast, easy, and hands-free.
          </Typography>

          {/* Features */}
          <Stack spacing={1.2} sx={{ textAlign: 'left', mb: 4 }}>
            {voiceFeatures.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{
                  width: 22, height: 22, borderRadius: 1, flexShrink: 0,
                  bgcolor: 'rgba(0,200,255,0.1)',
                  border: '1px solid rgba(0,200,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.cyan,
                }}>
                  {f.icon}
                </Box>
                <Typography sx={{ color: C.muted, fontSize: '0.82rem' }}>{f.label}</Typography>
              </Box>
            ))}
          </Stack>

          <Button
            fullWidth disabled={!isSupported}
            endIcon={isSupported ? <ArrowForwardIcon fontSize="small" /> : undefined}
            sx={{
              height: 46, borderRadius: 2,
              background: isSupported
                ? `linear-gradient(135deg, ${C.cyan}, ${C.purple})`
                : 'rgba(255,255,255,0.06)',
              color: 'white', fontWeight: 700, fontSize: '0.95rem',
              textTransform: 'none',
              boxShadow: isSupported ? `0 0 24px rgba(0,200,255,0.25)` : 'none',
              '&:hover': isSupported ? {
                transform: 'translateY(-2px)',
                boxShadow: `0 0 40px rgba(0,200,255,0.45)`,
              } : {},
              transition: 'all 0.25s ease',
            }}
          >
            {isSupported ? "Start with Voice" : "Not Supported"}
          </Button>

          {!isSupported && (
            <Typography sx={{ color: C.muted, fontSize: '0.72rem', mt: 1 }}>
              Requires Chrome or Edge browser
            </Typography>
          )}
        </Box>

        {/* ── Manual Card ── */}
        <Box
          onClick={() => onSelectMode("manual")}
          sx={{
            flex: 1, p: { xs: 4, md: 5 },
            borderRadius: 3,
            background: C.card,
            border: `1px solid ${C.border}`,
            backdropFilter: 'blur(20px)',
            cursor: 'pointer',
            transition: 'all 0.35s ease',
            '&:hover': {
              transform: 'translateY(-6px)',
              borderColor: 'rgba(0,200,255,0.25)',
              boxShadow: `0 16px 48px rgba(0,200,255,0.08)`,
            },
          }}
        >
          {/* Icon */}
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 3,
            bgcolor: 'rgba(255,255,255,0.04)',
            border: `1.5px solid rgba(255,255,255,0.08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <EditIcon sx={{ fontSize: 28, color: 'rgba(180,210,255,0.5)' }} />
          </Box>

          <Typography sx={{
            fontWeight: 800, fontSize: '1.3rem', mb: 1,
            color: 'rgba(220,240,255,0.95)', letterSpacing: '-0.02em',
          }}>
            Manual Entry
          </Typography>
          <Typography sx={{ color: C.muted, lineHeight: 1.7, mb: 3.5, fontSize: '0.9rem' }}>
            Fill out the forms step-by-step at your own pace. Traditional and reliable.
          </Typography>

          <Stack spacing={1.2} sx={{ textAlign: 'left', mb: 4 }}>
            {manualFeatures.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{
                  width: 22, height: 22, borderRadius: 1, flexShrink: 0,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(180,210,255,0.4)',
                }}>
                  {f.icon}
                </Box>
                <Typography sx={{ color: C.muted, fontSize: '0.82rem' }}>{f.label}</Typography>
              </Box>
            ))}
          </Stack>

          <Button
            fullWidth variant="outlined"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            sx={{
              height: 46, borderRadius: 2,
              borderColor: 'rgba(0,200,255,0.2)',
              color: 'rgba(200,225,255,0.7)',
              fontWeight: 700, fontSize: '0.95rem',
              textTransform: 'none',
              backdropFilter: 'blur(8px)',
              background: 'rgba(0,200,255,0.04)',
              '&:hover': {
                borderColor: 'rgba(0,200,255,0.4)',
                background: 'rgba(0,200,255,0.09)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.25s ease',
            }}
          >
            Continue Manually
          </Button>
        </Box>
      </Stack>

      {/* Footer note */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoOutlinedIcon sx={{ fontSize: 15, color: 'rgba(0,200,255,0.25)' }} />
        <Typography sx={{ color: 'rgba(130,170,220,0.35)', fontSize: '0.8rem' }}>
          You can switch between modes at any time during onboarding
        </Typography>
      </Box>
    </Box>
  );
}