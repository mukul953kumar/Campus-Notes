import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import BrandLogo from '../../components/common/BrandLogo';
import { ShieldCheck, AlertCircle, Sparkles, Lock } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '175488387080-bvcmqddtvbocqmkamlfqk7brjrtgm0bg.apps.googleusercontent.com';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        err.message || 'Access restricted: Please select your official institute Google account.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-sm">
        
        {/* College Seal & Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size="lg" isClickable={false} />
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
                Institutional Single Sign-On
              </span>
              Use your registered college student ID to sign in. 1-click verification directly via Google.
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
                <span>Verifying institutional student ID...</span>
              </div>
            ) : (
              <div id="google-signin-btn" className="w-full flex justify-center"></div>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-400 space-y-1 pt-2">
            <p className="flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Student profile & academic branch are verified securely from your institute ID</span>
            </p>
          </div>

        </div>

        {/* Privacy & Syllabus Compliance */}
        <div className="border-t border-slate-100 pt-5 mt-6 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By signing in, you agree to access KNIT academic notes and materials in accordance with institute policies.
          </p>
        </div>



      </div>
    </div>
  );
}
