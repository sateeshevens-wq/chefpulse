import React from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'chef' | 'b2b' | 'catering' | 'emergency';
  priority?: 'normal' | 'high' | 'critical';
  read: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2150] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-neutral-900 border-l border-neutral-800 h-full p-5 shadow-2xl flex flex-col justify-between text-neutral-100">
        
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h3 className="text-base font-black text-white">Push Notifications</h3>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between py-2 text-xs text-neutral-400">
            <span>{notifications.length} Updates</span>
            <button
              onClick={onMarkAllAsRead}
              className="text-amber-400 hover:underline font-semibold"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-2 space-y-2.5 overflow-y-auto max-h-[75vh] pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => {
                const isEmergency = n.type === 'emergency' || n.priority === 'critical';
                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      isEmergency
                        ? 'bg-rose-950/70 border-rose-500/80 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                        : n.read
                        ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isEmergency && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                            🚨 SOS EMERGENCY
                          </span>
                        )}
                        <span className="truncate">{n.title}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-normal shrink-0 ml-2">{n.time}</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${isEmergency ? 'text-rose-200' : 'text-neutral-300'}`}>
                      {n.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-800 text-center text-[10px] text-neutral-500">
          Simulated Web Push Notifications & Service Worker
        </div>
      </div>
    </div>
  );
};
