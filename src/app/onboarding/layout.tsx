'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import NeuralBackground from '@/components/NeuralBackground';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    cyan: '#00C8FF',
    purple: '#6450FF',
    dark: '#030810',
    card: 'rgba(8, 20, 48, 0.82)',
    border: 'rgba(0, 200, 255, 0.12)',
    muted: 'rgba(130, 170, 220, 0.5)',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <OnboardingProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: C.dark }}>

                {/* ── Left Sidebar ── */}
                <Box sx={{
                    width: { xs: '100%', md: '340px' },
                    height: '100vh',
                    background: 'rgba(3, 8, 20, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRight: `1px solid ${C.border}`,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    p: 5,
                    position: 'fixed',
                    zIndex: 10,
                }}>
                    {/* Brand */}
                    <Box sx={{ mb: 8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: 1.5,
                                background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 0 16px rgba(0,200,255,0.3)`,
                            }}>
                                <SmartToyIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                            </Box>
                            <Typography sx={{
                                fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.1em',
                                background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                NEXASERV
                            </Typography>
                        </Box>
                        <Typography sx={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.6 }}>
                            Set up your business workspace in just a few steps
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    <Box sx={{ flexGrow: 1 }}>
                        <OnboardingStepper />
                    </Box>

                    {/* Footer */}
                    <Typography sx={{ color: 'rgba(100,140,180,0.3)', fontSize: '0.72rem' }}>
                        © 2026 Nexaserv. All rights reserved.
                    </Typography>
                </Box>

                {/* ── Main Content ── */}
                <Box sx={{
                    flexGrow: 1,
                    ml: { md: '340px' },
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    bgcolor: C.dark,
                    overflow: 'hidden',
                }}>
                    {/* Subtle neural bg in content area */}
                    <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4 }}>
                        <NeuralBackground />
                    </Box>
                    {/* Radial glow */}
                    <Box sx={{
                        position: 'absolute', top: '40%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 600, height: 600, borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(0,200,255,0.05), transparent 70%)`,
                        pointerEvents: 'none', zIndex: 0,
                    }} />
                    <Box sx={{ maxWidth: '660px', width: '100%', px: { xs: 3, md: 6 }, py: 8, position: 'relative', zIndex: 1 }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </OnboardingProvider>
    );
}

function OnboardingStepper() {
    const { activeStep, steps } = useOnboarding();

    return (
        <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
                '& .MuiStep-root': { mb: 0 },
                '& .MuiStepLabel-root': { padding: 0 },
                '& .MuiStepLabel-iconContainer': { paddingRight: 2 },
                '& .MuiStepLabel-label': {
                    color: 'rgba(130,170,220,0.45)',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                },
                '& .MuiStepLabel-label.Mui-active': {
                    color: 'rgba(220,240,255,0.95)',
                    fontWeight: 700,
                    fontSize: '1rem',
                },
                '& .MuiStepLabel-label.Mui-completed': {
                    color: '#00C8FF',
                    fontWeight: 600,
                },
                '& .MuiStepIcon-root': {
                    width: 32, height: 32,
                    color: 'rgba(8,20,48,0.9)',
                    border: '2px solid rgba(0,200,255,0.2)',
                    borderRadius: '50%',
                    '&.Mui-active': {
                        color: 'transparent',
                        border: 'none',
                        background: `linear-gradient(135deg, #00C8FF, #6450FF)`,
                        borderRadius: '50%',
                        boxShadow: '0 0 16px rgba(0,200,255,0.4)',
                    },
                    '&.Mui-completed': {
                        color: '#00C8FF',
                        border: 'none',
                    },
                    '& text': {
                        fill: 'white',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                    },
                },
                '& .MuiStepConnector-root': { marginLeft: '15px' },
                '& .MuiStepConnector-line': {
                    borderColor: 'rgba(0,200,255,0.12)',
                    borderLeftWidth: 2,
                    minHeight: 28,
                },
                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                    borderColor: 'rgba(0,200,255,0.4)',
                },
                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                    borderColor: 'rgba(0,200,255,0.3)',
                },
            }}
        >
            {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
            ))}
        </Stepper>
    );
}