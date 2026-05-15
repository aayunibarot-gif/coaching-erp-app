import React, { useState, useEffect } from 'react';

export default function IosInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect if device is iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // Detect if app is already running in standalone mode (installed)
    const isInStandaloneMode = () => {
      return ('standalone' in window.navigator) && (window.navigator.standalone);
    };

    // Check if the user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('iosInstallPromptDismissed');

    // Only show if it's iOS, NOT standalone, and NOT dismissed
    if (isIos() && !isInStandaloneMode() && !hasDismissed) {
      // Delay prompt slightly so it's not jarring when the app first loads
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('iosInstallPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-slide-up pb-safe">
      <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        
        <div className="flex items-start gap-4 pt-1">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm overflow-hidden">
            <img src="/icons/icon-192x192.png" alt="App Icon" className="w-full h-full object-cover" />
          </div>
          
          <div className="pr-4">
            <h3 className="font-bold text-slate-900 mb-1 text-base tracking-tight">Install Coaching ERP</h3>
            <p className="text-sm text-slate-500 leading-snug mb-3">
              Add this app to your Home Screen for a seamless, full-screen experience.
            </p>
            
            <div className="flex flex-col gap-2.5 text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold shrink-0">1</span>
                <span>Tap the <svg className="w-[18px] h-[18px] mx-0.5 text-blue-500 inline-block align-text-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg> <b>Share</b> button below</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold shrink-0">2</span>
                <span>Select <svg className="w-[18px] h-[18px] mx-0.5 text-slate-700 inline-block align-text-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg> <b>Add to Home Screen</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
