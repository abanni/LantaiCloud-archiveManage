import React from 'react';
import {
  LayoutDashboard,
  Database,
  SlidersHorizontal,
  FileSearch,
  FileKey,
  BarChart3,
  Archive,
  Building2
} from 'lucide-react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

export enum ViewState {
  HOME = 'home',
  INGEST = 'ingest',
  COMPREHENSIVE = 'comprehensive',
  FULLTEXT = 'fulltext',
  UTILIZE = 'utilize',
  STATS = 'stats',
  ARCHIVE_MGMT = 'archive_mgmt'
}

interface NavigationProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string; icon: React.ElementType }[];
}

export const Sidebar: React.FC<NavigationProps> = ({
  currentView,
  onChangeView,
}) => {

  const menuItems: MenuItem[] = [
    { id: ViewState.HOME, label: '首页', icon: LayoutDashboard },
    { id: ViewState.INGEST, label: '入库', icon: Database },
    { id: ViewState.COMPREHENSIVE, label: '综合查询', icon: SlidersHorizontal },
    { id: ViewState.FULLTEXT, label: '全文检索', icon: FileSearch },
    { id: ViewState.UTILIZE, label: '利用', icon: FileKey },
  ];

  return (
    <div className="w-[232px] bg-slate-900 text-white flex flex-col shrink-0 select-none fixed left-0 top-0 h-screen z-50">
      {/* Brand */}
      <div
        className="h-14 flex items-center px-4 gap-2.5 cursor-pointer border-b border-white/5"
        onClick={() => onChangeView(ViewState.HOME)}
      >
        <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shrink-0" />
        <span className="text-sm font-bold tracking-wide">兰台云-数智馆藏</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as ViewState)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-150
              ${currentView === item.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 档案馆管理 */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => onChangeView(ViewState.ARCHIVE_MGMT)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10 text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <Building2 size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">档案馆管理</p>
            <p className="text-[10px] text-emerald-400/80 truncate">昆山市城建档案馆</p>
          </div>
        </button>
      </div>
    </div>
  );
};
