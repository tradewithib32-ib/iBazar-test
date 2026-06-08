/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Inbox, Bell, Calendar, ChevronRight } from 'lucide-react';
import { EmailNotification } from '../types';

interface NotificationInboxProps {
  notifications: EmailNotification[];
  onClear: () => void;
}

export default function NotificationInbox({ notifications, onClear }: NotificationInboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  // Filter emails to the active logged-in customer's list or admin's list, but we show all simulated sent emails for testing simplicity.
  const inboxCount = notifications.length;

  return (
    <div id="visual-email-logger" className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Toggle Button with Red Badge */}
      <button
        id="email-log-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer relative transform hover:scale-105 active:scale-95 transition-all border border-emerald-500/30"
        title="Email Notifications Tracer Logs"
      >
        <Mail className="w-6 h-6 animate-pulse" />
        {inboxCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono font-bold text-xs w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
            {inboxCount}
          </span>
        )}
      </button>

      {/* Slide-out Sidebar Inbox Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="email-drawer-box"
            initial={{ opacity: 0, y: 50, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.93 }}
            className="absolute bottom-16 right-0 bg-white border border-gray-150 shadow-2xl w-80 sm:w-96 rounded-3xl overflow-hidden text-gray-800 flex flex-col max-h-[500px]"
          >
            {/* Top Bar Header */}
            <div className="p-4 bg-teal-850 text-white flex items-center justify-between border-b border-teal-900/40">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-xs tracking-wide">সিমুলেশন ইনবক্স (Email Alerts Log)</h4>
                  <p className="text-[9px] text-white/70">Real-time SMTP Dispatcher Simulation</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={onClear}
                    className="text-[10px] text-emerald-300 hover:text-emerald-100 font-semibold px-2 py-0.5 rounded transition"
                  >
                    ক্লিয়ার
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedEmail(null);
                  }}
                  className="p-1 rounded-full hover:bg-white/10 text-white/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Emails Listing & Detail View Toggle */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 min-h-[250px]">
              {selectedEmail ? (
                /* Focused Single Email Review */
                <div className="bg-gray-950 text-gray-200 p-4 rounded-2xl border border-gray-800 font-mono text-[10.5px] space-y-2.5">
                  <div className="border-b border-gray-800 pb-2 flex justify-between items-center text-[10px]">
                    <span className="text-emerald-400">To: &lt;{selectedEmail.to}&gt;</span>
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      &larr; পিছনে
                    </button>
                  </div>
                  <div>
                    <h5 className="text-amber-300 font-black">Subject: {selectedEmail.subject}</h5>
                    <span className="text-gray-500 text-[9px]">Date: {new Date(selectedEmail.sentAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="whitespace-pre-line text-gray-300 text-xs py-1 border-t border-gray-800/60 leading-relaxed font-sans">
                    {selectedEmail.body}
                  </p>
                </div>
              ) : (
                /* Complete List of triggered notifications */
                notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 min-h-[220px]">
                    <Bell className="w-8 h-8 text-gray-300 mb-2 animate-bounce" />
                    <p className="text-[11px] font-medium text-gray-600">কোনো নোটিফিকেশন নেই।</p>
                    <p className="text-[10px] text-gray-450 mt-1 max-w-[200px] leading-relaxed">
                      পণ্য কিনে চেকআউট করলে বা এডমিন প্যানেল থেকে অর্ডারের বর্তমান স্ট্যাটাস চেঞ্জ করলে এখানে ইমেল ও নোটিফিকেশন স্বয়ংক্রিয় জমা হবে।
                    </p>
                  </div>
                ) : (
                  notifications.slice().reverse().map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setSelectedEmail(e)}
                      className="p-3 bg-white hover:bg-emerald-50/30 border border-gray-150 hover:border-emerald-250 rounded-2xl cursor-pointer transition-all flex justify-between items-center group shadow-xs"
                    >
                      <div className="space-y-0.5 pr-2 flex-1">
                        <div className="flex justify-between text-[9px] text-gray-400">
                          <span className="font-semibold text-emerald-800 truncate max-w-[150px]">To: {e.to}</span>
                          <span className="font-mono">{new Date(e.sentAt).toLocaleTimeString()}</span>
                        </div>
                        <h5 className="font-bold text-xs text-gray-800 line-clamp-1 group-hover:text-emerald-700 transition leading-snug">{e.subject}</h5>
                        <p className="text-[10px] text-gray-500 line-clamp-1 italic font-sans">{e.body.split('\n').filter(Boolean)[1] || e.body}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition shrink-0" />
                    </div>
                  ))
                )
              )}
            </div>

            <div className="p-3 bg-teal-55/10 text-center text-[10px] border-t border-gray-100 text-emerald-800 font-semibold uppercase tracking-wider bg-emerald-50">
              * ডেমো ইমেইল নোটিফায়ার ট্র্যাকার লগার
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
