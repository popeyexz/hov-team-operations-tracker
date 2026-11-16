'use client';

import React, { useState } from 'react';
import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  CheckCheck,
  X,
} from 'lucide-react';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { formatDateDDMMYYYY } from '@/lib/utils';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    triggerTestNotification,
    activeProfile,
  } = useActiveProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestSuccess(false);
    const ok = await triggerTestNotification();
    setIsSendingTest(false);
    if (ok) {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md"
        title="Notifications & Alerts"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#12131d]/95 backdrop-blur-2xl border border-white/[0.1] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100 text-xs tracking-wide">
                  Notifications & Alerts
                </span>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    All clear
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-zinc-800/60 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Test Notification Action Strip */}
            <div className="py-2.5 px-3 my-2 rounded-xl bg-violet-500/[0.08] border border-violet-500/20 flex items-center justify-between gap-2">
              <div className="text-[11px] text-violet-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>
                  {testSuccess ? '✓ Test Alert Sent!' : 'Verify alert delivery'}
                </span>
              </div>
              <button
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? 'Sending...' : 'Test Alert'}
              </button>
            </div>

            {/* Notification Items List */}
            <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 divide-y divide-zinc-800/40 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No notifications yet. You're completely up to date!
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`pt-2.5 pb-2 text-xs flex items-start gap-3 transition-all rounded-xl p-2 ${
                      notif.is_read
                        ? 'opacity-65 hover:opacity-100 bg-transparent'
                        : 'bg-zinc-800/50 border border-white/[0.05] shadow-sm'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'submitted_for_review' && (
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      )}
                      {notif.type === 'needs_work' && (
                        <div className="w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                      )}
                      {notif.type === 'completed' && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      )}
                      {notif.type === 'general' && (
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-zinc-200 text-xs">
                        {notif.title}
                      </div>
                      <div className="text-zinc-400 mt-0.5 leading-relaxed text-[11px]">
                        {notif.message}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                        {formatDateDDMMYYYY(notif.created_at)}
                      </div>
                    </div>

                    {!notif.is_read && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-zinc-500 hover:text-emerald-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
