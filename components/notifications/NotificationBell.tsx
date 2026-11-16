'use client';

import React, { useState } from 'react';
import { Bell, Check, Clock, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { formatDateDDMMYYYY } from '@/lib/utils';

export function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead } = useActiveProfile();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl glass-pill hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-white/15 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-2 max-h-80 overflow-y-auto space-y-2 divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No notifications yet. You're all caught up!
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`pt-2.5 pb-2 text-xs flex items-start gap-3 transition-colors ${
                      notif.is_read ? 'opacity-65' : 'bg-white/5 p-2 rounded-xl'
                    }`}
                  >
                    <div className="mt-0.5">
                      {notif.type === 'submitted_for_review' && (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                      {notif.type === 'needs_work' && (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                      {notif.type === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {notif.type === 'general' && (
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-200">{notif.title}</div>
                      <div className="text-slate-400 mt-0.5 leading-relaxed">{notif.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {formatDateDDMMYYYY(notif.created_at)}
                      </div>
                    </div>
                    {!notif.is_read && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-slate-400 hover:text-emerald-400 p-1 rounded"
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
