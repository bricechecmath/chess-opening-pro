
import React from 'react';
import { LayoutDashboard, BookOpen, GraduationCap, BarChart3, Target, Settings, Menu, Shield } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, collapsed, setCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'repertoire', label: 'Répertoire', icon: <BookOpen size={20} /> },
    { id: 'study', label: 'Étudier', icon: <GraduationCap size={20} /> },
    { id: 'analysis', label: 'Analyse', icon: <BarChart3 size={20} /> },
    { id: 'preparation', label: 'Préparation', icon: <Target size={20} /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`bg-slate-900 text-slate-300 h-screen transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} sticky top-0 border-r border-slate-800`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-tighter uppercase leading-none">CHESS OPENINGS</span>
            <span className="text-blue-500 font-bold text-xs">PRO</span>
          </div>
        )}
        {collapsed && <Shield size={24} className="text-blue-500" />}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors ml-auto">
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activePage === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {!collapsed && <span className="font-semibold text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className={`flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
          {!collapsed && (
            <div className="mb-2">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Created by</p>
              <p className="text-sm font-bold text-white">KingWoulfic</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
              KW
            </div>
            {!collapsed && (
              <p className="text-[10px] text-slate-500 font-medium">v1.2.0 Stable</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
