import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import Button from '../../components/common/Button';
import { GraduationCap, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, ChevronDown, Lock } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '175488387080-bvcmqddtvbocqmkamlfqk7brjrtgm0bg.apps.googleusercontent.com';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDevFallback, setShowDevFallback] = useState(false);
  const [devEmail, setDevEmail] = useState('mukul.24636@knit.ac.in');

  const redirectPath = location.state?.from?.pathname || '/';

  const handlePostLoginRedirect = (userObj) => {
    if (!userObj?.branch || !userObj?.semester || userObj?.hasCompletedOnboarding === false) {
      navigate('/onboarding', { state: { from: { pathname: redirectPath } }, replace: true });
    } else {
      navigate(redirectPath, { replace: true });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      handlePostLoginRedirect(user);
    }
  }, [isAuthenticated, user]);

  // Google Identity Services setup
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let isSubscribed = true;

    const initGoogleGsi = () => {
      if (window.google?.accounts?.id && isSubscribed) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const buttonDiv = document.getElementById('google-signin-btn');
          if (buttonDiv) {
            buttonDiv.innerHTML = '';
            window.google.accounts.id.renderButton(buttonDiv, {
              theme: 'filled_blue',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
            });
          }

          // Trigger One-Tap prompt
          window.google.accounts.id.prompt();
        } catch (err) {
          console.error('[Google GSI Init Error]', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleGsi;
      document.body.appendChild(script);

      return () => {
        isSubscribed = false;
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }

    return () => {
      isSubscribed = false;
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleCredentialResponse = async (response) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!response.credential) {
        throw new Error('Google credential not received. Please try again.');
      }
      const result = await authService.googleLogin(response.credential);
      login(result.data.token, result.data.user);
      handlePostLoginRedirect(result.data.user);
    } catch (err) {
      setErrorMessage(
        err.message || 'Access restricted: Please select your official @knit.ac.in college Google account.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async (emailToLogin) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const targetEmail = (emailToLogin || devEmail).trim().toLowerCase();
      if (!targetEmail.endsWith('@knit.ac.in')) {
        throw new Error('Only @knit.ac.in college emails are permitted.');
      }
      const result = await authService.devLogin(targetEmail);
      login(result.data.token, result.data.user);
      handlePostLoginRedirect(result.data.user);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-sm">
        
        {/* College Seal & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center text-white mx-auto shadow-md mb-3 ring-4 ring-blue-50">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full font-medium mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Official College Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In with Google
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Kamla Nehru Institute of Technology (KNIT), Sultanpur
          </p>
        </div>

        {/* Domain Requirement Badge */}
        <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950 leading-relaxed">
              <span className="font-semibold block mb-0.5 text-blue-900">
                Single Sign-On (@knit.ac.in)
              </span>
              Direct 1-click authentication using your official KNIT student Google account. No manual details required.
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-6 flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Direct Google Sign-In Container */}
        <div className="space-y-4 py-2">
          
          <div className="flex flex-col items-center justify-center min-h-[50px]">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium py-3">
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying KNIT Google credentials...</span>
              </div>
            ) : (
              <div id="google-signin-btn" className="w-full flex justify-center"></div>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-400 space-y-1 pt-2">
            <p className="flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Student Name & Roll Number are verified from your college ID</span>
            </p>
            <p className="text-slate-400">
              Format: <code className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">name.rollno@knit.ac.in</code>
            </p>
          </div>

        </div>

        {/* Privacy & Syllabus Compliance */}
        <div className="border-t border-slate-100 pt-5 mt-6 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By signing in, you agree to access KNIT academic notes and materials in accordance with institute policies.
          </p>
        </div>

        {/* Collapsible Local Testing Fallback (Only in Development) */}
        {import.meta.env.DEV && (
          <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
            <button
              type="button"
              onClick={() => setShowDevFallback(!showDevFallback)}
              className="text-[11px] text-slate-400 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span>Offline / Local Test Simulator</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showDevFallback ? 'rotate-180' : ''}`} />
            </button>

            {showDevFallback && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Simulate direct Google Sign-in for KNIT students without active internet:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDevLogin('mukul.24636@knit.ac.in')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-blue-600 font-medium cursor-pointer"
                  >
                    Mukul (24636)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDevLogin('shreya.singh.22415@knit.ac.in')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-blue-600 font-medium cursor-pointer"
                  >
                    Shreya (22415)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDevLogin('admin@knit.ac.in')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-blue-600 font-medium cursor-pointer"
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
