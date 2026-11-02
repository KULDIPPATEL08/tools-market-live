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
  Search,
  Command,
  Activity,
  Zap,
  Globe,
  Building2,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '../../store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { setIsSearchOpen } = useUIStore();

  const navigationGroups = [
    {
      group: 'INTELLIGENCE',
      items: [
        { to: '/overview', label: 'Overview', icon: LayoutDashboard },
        { to: '/discover', label: 'Live Intel Feed', icon: Activity, badge: 'LIVE' },
        { to: '/search', label: 'Universal Search', icon: Search, badge: 'OMNI' },
        { to: '/startups', label: 'Startup Radar', icon: Building2 },
        { to: '/ai-radar', label: 'AI Radar', icon: Cpu },
        { to: '/briefings', label: 'Briefings', icon: Sparkles },
        { to: '/gaps', label: 'Market Voids', icon: Compass },
      ],
    },
    {
      group: 'HARVEST & TOOLS',
      items: [
        { to: '/tools', label: 'Tools Directory', icon: Wrench },
        { to: '/datasets', label: 'Dataset Explorer', icon: Database },
        { to: '/collection', label: 'Collection Jobs', icon: Layers },
      ],
    },
    {
      group: 'ANALYSIS',
      items: [
        { to: '/research', label: 'Research Studio', icon: FileText },
        { to: '/saved', label: 'Saved Watchlist', icon: Bookmark },
        { to: '/analytics', label: 'Observatory', icon: BarChart2 },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { to: '/sources', label: 'Data Sources', icon: Radio },
        { to: '/automation', label: 'Automation Rules', icon: Cpu },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
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
          'fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0E0E12] border-r border-zinc-800/80 flex flex-col transition-transform duration-150 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800/80 bg-[#0E0E12]">
          <NavLink to="/overview" className="flex items-center space-x-2.5 group">
            <div className="w-6 h-6 rounded bg-zinc-850 border border-zinc-700/80 flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition-colors">
              <Compass className="w-3.5 h-3.5 text-zinc-200" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block">SCOUTBOARD</span>
              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 -mt-0.5">
                Intelligence Platform
              </span>
            </div>
          </NavLink>
        </div>

        {/* Global Quick Search Launcher (Raycast Style) */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer group"
          >
            <span className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              <span>Search platform...</span>
            </span>
            <span className="font-mono text-[10px] text-zinc-500 bg-zinc-850 px-1.5 py-0.5 rounded border border-zinc-750">
              ⌘K
            </span>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {navigationGroups.map((groupBlock) => (
            <div key={groupBlock.group} className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono font-medium tracking-wider text-zinc-500 uppercase">
                {groupBlock.group}
              </div>
              {groupBlock.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors group',
                        isActive
                          ? 'bg-zinc-850 text-white font-medium shadow-subtle border border-zinc-750'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex items-center space-x-2.5 truncate">
                          <Icon
                            className={clsx(
                              'w-3.5 h-3.5 flex-shrink-0 transition-colors',
                              isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </span>

                        {item.badge && (
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: Node Telemetry */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#0E0E12] flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>NODE ONLINE</span>
          </span>
          <span className="text-zinc-600">v1.2.0</span>
        </div>
      </aside>
    </>
  );
};
