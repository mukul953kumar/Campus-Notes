import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GraduationCap, ShieldCheck, AlertCircle, ArrowRight, Sparkles, CheckCircle2, Lock, UserCheck } from 'lucide-react';

function extractStudentInfo(email) {
  if (!email || typeof email !== 'string') return { name: '', roll: '' };
  const clean = email.trim().toLowerCase();
  const [localPart] = clean.split('@');
  if (!localPart) return { name: '', roll: '' };

  const matchWithRoll = localPart.match(/^(.*?)(?:[._-]*)?(\d{4,10})$/);
  let rawName = '';
  let roll = '';
  if (matchWithRoll) {
    rawName = matchWithRoll[1];
    roll = matchWithRoll[2];
  } else {
    rawName = localPart;
  }
  rawName = rawName.replace(/^[._-]+|[._-]+$/g, '');
  const words = rawName.split(/[._\-\s]+/).filter(Boolean);
  let formattedName = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  if (!formattedName && roll) {
    formattedName = `Student ${roll}`;
  }
  return { name: formattedName || 'KNIT Student', roll };
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [devEmail, setDevEmail] = useState('mukul.24636@knit.ac.in');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dynamically extract name and roll number from email - student cannot edit name manually
  const { name: detectedName, roll: detectedRoll } = useMemo(() => {
    return extractStudentInfo(devEmail);
  }, [devEmail]);

  const redirectPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Google Identity Services setup
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        const buttonDiv = document.getElementById('google-signin-btn');
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const result = await authService.googleLogin(response.credential);
      login(result.data.token, result.data.user);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const trimmedEmail = devEmail.trim().toLowerCase();
      if (!trimmedEmail.endsWith('@knit.ac.in')) {
        throw new Error('Access restricted: Only @knit.ac.in college emails are permitted.');
      }

      const result = await authService.devLogin(trimmedEmail);
      login(result.data.token, result.data.user);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = (email) => {
    setDevEmail(email);
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* College Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-white mx-auto shadow-xs mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to CampusNotes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kamla Nehru Institute of Technology (KNIT), Sultanpur
          </p>
        </div>

        {/* College Domain Requirement Notice */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl mb-6">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">Verified Student Network:</span> Login is strictly restricted to students and faculty possessing an official college ID ending in{' '}
              <code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-semibold">
                @knit.ac.in
              </code>.
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google One-Click Login Button */}
        <div className="space-y-4">
          <div id="google-signin-btn" className="w-full flex justify-center"></div>

          {!googleClientId && (
            <div className="text-center text-xs text-slate-400 py-1">
              Google OAuth ID can be linked in <code>.env</code>
            </div>
          )}

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider shrink-0 font-medium">
              Student Login Portal
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {/* Quick College Email Form */}
          <form onSubmit={handleDevLogin} className="space-y-4">
            <Input
              label="College Email"
              type="email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              placeholder="e.g. mukul.24636@knit.ac.in"
              helperText="Format: name.rollno@knit.ac.in"
              required
            />

            {/* Auto-extracted Verified Student Card (Immutable) */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-1.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  Auto-Detected Identity
                </span>
                <span className="text-[10px] bg-slate-200/80 text-slate-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-500" /> Read-Only
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Student Name</p>
                  <p className="text-sm font-bold text-slate-900">{detectedName}</p>
                </div>
                {detectedRoll && (
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 font-medium">Student Roll No</p>
                    <p className="text-sm font-mono font-bold text-blue-700">{detectedRoll}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick presets for rapid evaluation */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Presets:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('mukul.24636@knit.ac.in')}
                  className="text-blue-700 hover:underline cursor-pointer font-medium"
                >
                  Mukul (24636)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('shreya.singh.22415@knit.ac.in')}
                  className="text-blue-700 hover:underline cursor-pointer"
                >
                  Shreya (22415)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('admin@knit.ac.in')}
                  className="text-blue-700 hover:underline cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In as {detectedName}
            </Button>
          </form>

        </div>

        {/* Privacy Note */}
        <p className="text-[11px] text-slate-400 text-center mt-6">
          By signing in, you agree to follow the KNIT Sultanpur academic sharing guidelines and respect intellectual property rights.
        </p>

      </div>
    </div>
  );
}
