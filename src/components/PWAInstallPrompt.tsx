import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles, Share, PlusSquare, ExternalLink, Smartphone, CheckCircle2 } from 'lucide-react';
import { MomentumLogo } from './MomentumLogo';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Detect if running as standalone PWA
    const standaloneCheck = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standaloneCheck);

    if (standaloneCheck) {
      return;
    }

    // 2. Check iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // 4. Check localStorage status
    const installedState = localStorage.getItem('pwa_installed') === 'true';
    setIsInstalled(installedState);

    const dismissedUntil = localStorage.getItem('pwa_dismissed_until');
    const isDismissed = dismissedUntil && Date.now() < Number(dismissedUntil);

    // Show banner automatically if not installed and not dismissed recently
    if (!installedState && !isDismissed) {
      // Short delay for smooth slide-in
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!installedState && !isDismissed) {
        setIsBannerVisible(true);
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      setIsBannerVisible(false);
      setIsModalOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger native browser install or show modal instructions
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
        setIsBannerVisible(false);
        setIsModalOpen(false);
      } else {
        const snoozeTime = Date.now() + 2 * 24 * 60 * 60 * 1000;
        localStorage.setItem('pwa_dismissed_until', String(snoozeTime));
        setIsBannerVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Open modal with step-by-step instructions for iOS / browsers without beforeinstallprompt
      setIsModalOpen(true);
      setIsBannerVisible(false);
    }
  };

  const handleDismissBanner = () => {
    const snoozeTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa_dismissed_until', String(snoozeTime));
    setIsBannerVisible(false);
  };

  // If running in standalone mode, do not display install UI
  if (isStandalone || isInstalled) {
    return null;
  }

  return (
    <>
      {/* 1. Header Quick Install Trigger Button */}
      <div className="fixed top-3.5 right-36 sm:right-44 md:right-52 z-40 hidden min-[400px]:flex items-center">
        <button
          id="pwa-header-install-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#76DFCB]/20 hover:bg-[#76DFCB]/35 text-[#137B7C] border border-[#76DFCB]/60 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
          title="Install Momentum as App"
        >
          <Download size={13} className="text-[#137B7C] stroke-[2.5]" />
          <span className="hidden sm:inline font-brand">Get App</span>
          <span className="sm:hidden font-brand">App</span>
        </button>
      </div>

      {/* 2. Bottom Floating Banner */}
      <AnimatePresence>
        {isBannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed bottom-20 md:bottom-6 right-0 md:right-6 left-0 md:left-auto mx-4 md:mx-0 z-50 max-w-sm md:max-w-md bg-[#FEFBEC] rounded-3xl border border-[#DFD8C4] shadow-[0_12px_36px_rgba(48,18,8,0.12)] p-4 select-none"
            id="pwa-install-banner"
          >
            <div className="flex items-start gap-3.5">
              {/* App Icon */}
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 rounded-2xl bg-[#FEFBEC] border border-[#DFD8C4] shadow-2xs flex items-center justify-center p-1">
                  <MomentumLogo size={36} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#EF681E] text-white p-0.5 rounded-full border-2 border-[#FEFBEC] flex items-center justify-center">
                  <Sparkles size={10} className="fill-white" />
                </div>
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-[#301208] font-brand" id="pwa-banner-title">
                    Install Momentum
                  </h3>
                  <button
                    id="pwa-btn-close-icon"
                    onClick={handleDismissBanner}
                    className="text-[#68614E] hover:text-[#301208] p-1 transition-colors rounded-full hover:bg-[#F3EFE0] cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={15} />
                  </button>
                </div>
                <p className="text-xs text-[#68614E] mt-0.5 leading-relaxed font-medium" id="pwa-banner-desc">
                  Install Momentum on your home screen for quick offline access and a native app experience.
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3" id="pwa-banner-actions">
                  <button
                    id="pwa-btn-install"
                    onClick={handleInstallClick}
                    className="bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Download size={14} strokeWidth={2.5} />
                    <span>Install App</span>
                  </button>
                  <button
                    id="pwa-btn-later"
                    onClick={handleDismissBanner}
                    className="bg-[#F3EFE0] hover:bg-[#E9E4D3] text-[#301208] font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Detailed Instruction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative overflow-hidden"
              id="pwa-install-modal"
            >
              {/* Top decoration gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-turquoise-400 via-turquoise-500 to-amber-400" />

              {/* Close Button */}
              <button
                id="pwa-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#FEFBEC] border border-[#DFD8C4] shadow-xs flex items-center justify-center p-1.5">
                  <MomentumLogo size={42} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 font-rounded">
                    Install Momentum App
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Get the full standalone mobile & desktop app
                  </p>
                </div>
              </div>

              {/* Dynamic Content depending on device / browser support */}
              {deferredPrompt ? (
                <div className="space-y-4">
                  <div className="bg-turquoise-50/60 border border-turquoise-100 p-3.5 rounded-2xl text-xs text-turquoise-900 leading-relaxed">
                    Ready to install! Click the button below to add Momentum directly to your device home screen or desktop apps.
                  </div>
                  <button
                    id="pwa-modal-direct-install-btn"
                    onClick={handleInstallClick}
                    className="w-full bg-turquoise-500 hover:bg-turquoise-600 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-md shadow-turquoise-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Download size={18} strokeWidth={2.5} />
                    <span>Install Now</span>
                  </button>
                </div>
              ) : isIOS ? (
                /* iOS Specific Instructions */
                <div className="space-y-4">
                  <p className="text-xs text-neutral-600 font-medium">
                    To install Momentum on your iPhone or iPad:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <div className="p-1.5 bg-turquoise-100 text-turquoise-700 rounded-xl">
                        <Share size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-800">1. Tap the Share button</p>
                        <p className="text-neutral-500 text-[11px]">Located in Safari's bottom toolbar</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <div className="p-1.5 bg-turquoise-100 text-turquoise-700 rounded-xl">
                        <PlusSquare size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-800">2. Select "Add to Home Screen"</p>
                        <p className="text-neutral-500 text-[11px]">Scroll down the share menu options</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <div className="p-1.5 bg-turquoise-100 text-turquoise-700 rounded-xl">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-800">3. Tap "Add"</p>
                        <p className="text-neutral-500 text-[11px]">Momentum icon will appear on your home screen</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* General Browser / IFrame Instructions */
                <div className="space-y-4">
                  {isInIframe && (
                    <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-2xl text-xs text-amber-800 leading-relaxed">
                      💡 <strong>Tip:</strong> If you are inside the preview frame, open Momentum in a main tab or mobile browser first.
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <div className="p-1.5 bg-turquoise-100 text-turquoise-700 rounded-xl">
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-800">Browser Install Option</p>
                        <p className="text-neutral-500 text-[11px]">Look for the install icon <Download size={12} className="inline mx-0.5" /> in your browser address bar or menu.</p>
                      </div>
                    </div>
                  </div>

                  {isInIframe && (
                    <button
                      id="pwa-modal-open-new-tab"
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <ExternalLink size={15} />
                      <span>Open Momentum in New Tab</span>
                    </button>
                  )}
                </div>
              )}

              {/* Modal footer */}
              <div className="mt-5 pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  id="pwa-modal-done-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
