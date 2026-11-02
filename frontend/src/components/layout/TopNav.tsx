import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Globe,
  ExternalLink,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useUIStore } from '../../store';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { Button } from '../ui/Button';

interface TopNavProps {
  onOpenSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenSidebar }) => {
  const { setIsSearchOpen, setActiveQuickAction } = useUIStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      const countData = await api.getUnreadNotificationCount();
      setUnreadCount(countData.unread_count);
    } catch (_) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (_) {}
  };

  const handleMarkOneRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  };

  return (
    <header className="sticky top-0 z-30 h-13 bg-[#0E0E12] border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile menu + Search trigger */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 text-zinc-400 hover:text-white rounded lg:hidden hover:bg-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Search Bar Button (Raycast style) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center w-full max-w-sm px-2.5 py-1 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded transition-all cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-zinc-500 group-hover:text-zinc-300" />
          <span className="flex-1 text-left truncate">Search platform records, sources, research...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono text-zinc-500 bg-zinc-850 rounded border border-zinc-750">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Quick actions + Notifications */}
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="xs"
          leftIcon={<Globe className="w-3 h-3 text-zinc-400" />}
          onClick={() => setActiveQuickAction('url')}
          className="hidden md:inline-flex"
        >
          Collect URL
        </Button>

        <Button
          variant="primary"
          size="xs"
          leftIcon={<Plus className="w-3 h-3" />}
          onClick={() => setActiveQuickAction('source')}
          className="hidden sm:inline-flex"
        >
          Add Source
        </Button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-[#121215] border border-zinc-800 shadow-popover overflow-hidden z-50">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-850 bg-[#16161B]">
                <span className="text-xs font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3 text-zinc-400" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-850">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500 font-mono">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-zinc-850/60 transition-colors ${
                        !n.is_read ? 'bg-zinc-900/60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            {!n.is_read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-zinc-200 truncate block">
                              {n.title}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-500 block pt-0.5">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkOneRead(n.id)}
                            className="p-1 text-zinc-500 hover:text-zinc-200"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
