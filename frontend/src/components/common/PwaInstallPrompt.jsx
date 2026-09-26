import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import Button from './Button';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // Check if user previously dismissed prompt in localStorage
    const isDismissed = localStorage.getItem('campusnotes_pwa_dismissed');
    if (isDismissed) {
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('campusnotes_pwa_dismissed', 'true');
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
            <img src="/pwa-192x192.png" alt="CampusNotes" className="w-7 h-7 object-contain rounded-lg" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Install CampusNotes</span>
              <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-semibold border border-blue-400/30">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 truncate">
              Faster access, notes offline & zero lag
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={handleInstallClick}
            className="text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-sm"
          >
            Install
          </Button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss PWA prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
