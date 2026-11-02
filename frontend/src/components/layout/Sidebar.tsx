import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Layers,
  Database,
  FileText,
  Wrench,
  BarChart2,
  Cpu,
  Bookmark,
  Settings,
  Sparkles,
  Radio,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/collection', label: 'Collection', icon: Layers },
    { to: '/sources', label: 'Sources', icon: Radio },
    { to: '/research', label: 'Research', icon: FileText },
    { to: '/tools', label: 'Tools', icon: Wrench },
    { to: '/gaps', label: 'Market Gaps', icon: Sparkles },
    { to: '/datasets', label: 'Datasets', icon: Database },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/automation', label: 'Automation', icon: Cpu },
    { to: '/saved', label: 'Saved Items', icon: Bookmark },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-space-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-space-950">
          <NavLink to="/overview" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-400 transition-colors shadow-sm">
              <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
            <div>
              <span className="font-bold text-base tracking-wide text-white">TOOLS MARKET</span>
              <span className="block text-[10px] font-mono font-medium text-emerald-400 tracking-wider uppercase">
                LIVE INTELLIGENCE
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#121824] border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-4 h-4 mr-3 transition-colors',
                        isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff9d]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Health / Status Indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-space-950/60">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>COLLECTION NODE</span>
            </span>
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Engine v1.0 • Free-first • Airgap Safe
          </div>
        </div>
      </aside>
    </>
  );
};
