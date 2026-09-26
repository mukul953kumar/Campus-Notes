import React, { createContext, useContext, useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';

const PwaContext = createContext(null);

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone display mode
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Chrome, Edge, Android)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuideModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('Install prompt failed:', err);
        setShowGuideModal(true);
      }
    } else {
      // If browser doesn't support beforeinstallprompt or on iOS, show guide modal
      setShowGuideModal(true);
    }
  };

  return (
    <PwaContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        isInstallable: !isInstalled,
        promptInstall,
        openGuideModal: () => setShowGuideModal(true),
        closeGuideModal: () => setShowGuideModal(false),
      }}
    >
      {children}

      {/* PWA Install Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center p-1.5 shadow-md shrink-0">
                  <img src="/pwa-192x192.png" alt="CampusNotes" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                    Install CampusNotes App
                  </h3>
                  <p className="text-xs text-slate-500">
                    KNIT Sultanpur Student Academic Platform
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Benefits Banner */}
            <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>Why Install the App?</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant 1-tap launch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Offline notes access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Full screen experience</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lightweight & fast</span>
                </div>
              </div>
            </div>

            {/* Platform-Specific Instructions */}
            {isIOS ? (
              // iOS Safari Instructions
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  How to Install on iPhone / iPad:
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="leading-relaxed">
                      Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-700" /> <strong>Share</strong> icon in the Safari bottom toolbar.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="leading-relaxed">
                      Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" /> <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="leading-relaxed">
                      Tap <strong>"Add"</strong> in the top right corner to confirm.
                    </p>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              // Browser has prompt ready
              <div className="text-center py-2 space-y-3">
                <p className="text-xs text-slate-600">
                  Click the button below to install CampusNotes directly to your device desktop or home screen.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  icon={Download}
                  onClick={promptInstall}
                  className="w-full justify-center font-bold text-sm shadow-md"
                >
                  Install CampusNotes Now
                </Button>
              </div>
            ) : (
              // Desktop Chrome / Edge / Android Instructions
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  How to Install on Chrome / Edge / Android:
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <Monitor className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Desktop (Windows / Mac):</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Click the <strong>Install</strong> icon on the right side of your browser URL address bar, or click Menu (⋮) &gt; <strong>"Install CampusNotes..."</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <Smartphone className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Android Phone:</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Tap Menu (⋮) in the top-right corner of Chrome, then select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuideModal(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
}
