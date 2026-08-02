import React, { useState } from 'react';
import {
  Heart,
  Copy,
  Check,
  Bot,
  Rocket,
  Wrench,
  Globe,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import gcashQrImg from '../../assets/images/gcash_qr_card_1785667430221.jpg';

export const SupportView: React.FC = () => {
  const { showToast } = useAppStore();
  const [copied, setCopied] = useState(false);

  const gcashNumber = '0955 231 5522';
  const gcashCleanNumber = '09552315522';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(gcashCleanNumber);
    setCopied(true);
    showToast('GCash Number (0955 231 5522) copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Centered Main Support Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 p-8 md:p-10 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Heart className="w-64 h-64 text-white fill-white" />
          </div>

          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transform hover:scale-105 transition">
              <Heart className="w-9 h-9 text-white fill-white animate-pulse" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Support ExamEase
            </h1>

            <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs md:text-sm font-bold tracking-wide">
              ExamEase is free for every educator.
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 md:p-10 space-y-8">
          {/* Intro Section */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              If this application has helped you create exams more efficiently, consider supporting its continued development. Your voluntary donation helps improve the application and keep it free for teachers and schools.
            </p>
          </div>

          {/* Funding Purpose List */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Your support helps fund:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/40 shadow-xs">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🤖 AI service costs</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Covering Gemini API tokens and intelligent analysis operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/40 shadow-xs">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🚀 New features and improvements</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Building new question formats, export tools, and grading features.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/40 shadow-xs">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🛠️ Bug fixes and maintenance</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ensuring high accuracy, stability, and document compatibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/40 shadow-xs">
                <div className="p-2 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-lg shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🌐 Hosting and domain expenses</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Maintaining high availability and cloud infrastructure.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-slate-600 dark:text-slate-400 font-medium italic pt-2">
              Every contribution, regardless of the amount, is sincerely appreciated.
            </p>
          </div>

          <hr className="border-slate-200 dark:border-slate-700/60" />

          {/* GCash Donation Section */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>📱 Donate via GCash</span>
              </h2>
            </div>

            <div className="max-w-xs md:max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-xl border border-slate-200 dark:border-slate-700/80 space-y-5 text-center">
              {/* QR Image Only */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-800 p-1">
                <img
                  src={gcashQrImg}
                  alt="GCash QR Code"
                  className="w-full h-auto rounded-xl object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Mobile Number & Copy Button */}
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                    GCash Number
                  </span>
                  <div className="text-2xl font-black font-mono tracking-wider text-slate-900 dark:text-white mt-0.5">
                    {gcashNumber}
                  </div>
                </div>

                <button
                  onClick={handleCopyNumber}
                  className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy GCash Number</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Scan the QR code using your GCash app or copy the mobile number above to send a donation.
              </p>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700/60" />

          {/* Thank You Footer Note */}
          <div className="text-center max-w-xl mx-auto space-y-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-6 rounded-2xl">
            <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ❤️ Thank You
            </h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Thank you for supporting <strong className="text-slate-900 dark:text-white">ExamEase</strong> and helping keep it free for educators. Your generosity helps improve the platform and empowers teachers to create better assessments for their students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

