import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Globe,
  Radio,
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

  // Close dropdown on outside click
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

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-space-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile menu + Search trigger */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center w-full max-w-md px-3.5 py-2 text-sm text-slate-400 bg-space-800/60 border border-slate-800 hover:border-slate-700 rounded-lg shadow-inner group transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 mr-2.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
          <span className="flex-1 text-left truncate">Search intelligence records, sources, research...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-800 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Quick actions + Notifications + Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Quick Actions */}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Globe className="w-3.5 h-3.5 text-sky-400" />}
          onClick={() => setActiveQuickAction('url')}
          className="hidden md:inline-flex"
        >
          Collect URL
        </Button>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setActiveQuickAction('source')}
          className="hidden sm:inline-flex"
        >
          Add Source
        </Button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 text-slate-950 font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-space-800 border border-slate-700/80 shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-space-850">
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-750 transition-colors ${
                        !n.is_read ? 'bg-sky-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-slate-200">
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="p-1 text-slate-400 hover:text-sky-400 cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-sky-400/30">
            SC
          </div>
          <div className="hidden xl:block text-left">
            <span className="block text-xs font-semibold text-slate-200 leading-tight">
              Lead Researcher
            </span>
            <span className="block text-[10px] font-mono text-emerald-400 leading-tight">
              PRO ACCESS
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

