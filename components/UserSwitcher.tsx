import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Palette,
  X,
  Check,
  Save,
  RefreshCw,
} from 'lucide-react';
import { User as UserType } from '../types';
import { MOCK_USERS } from '../constants';

interface UserSwitcherProps {
  currentUser: UserType;
  onSwitchUser: (user: UserType) => void;
  onLogout: () => void;
}

const UserSwitcher: React.FC<UserSwitcherProps> = ({ currentUser, onSwitchUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [layoutConfig, setLayoutConfig] = useState({
    themeStyle: 'dark',
    themeColor: 'classic' as string,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all border border-slate-200 shadow-sm cursor-pointer"
      >
        <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
          {currentUser.name.charAt(0)}
        </div>
        <div className="flex flex-col items-start leading-none max-w-[120px]">
          <span className="text-xs font-bold text-slate-800 truncate w-full">{currentUser.name}</span>
          <span className="text-[9px] text-slate-400 truncate w-full">{currentUser.department} · {currentUser.role}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50">
          <div className="px-4 py-3 border-b border-slate-100/70 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">{currentUser.department} · {currentUser.role}</div>
            </div>
          </div>

          {/* Role switcher */}
          <div className="p-1.5 border-b border-slate-100">
            <div className="px-3 py-1 text-[10px] text-slate-500 font-semibold">切换角色</div>
            {MOCK_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => { onSwitchUser(user); setIsOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer
                  ${currentUser.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className={`w-2 h-2 rounded-full ${user.avatarColor}`} />
                <span className="font-medium">{user.name}</span>
                <span className="text-[10px] text-slate-400 ml-auto">{user.department}</span>
              </button>
            ))}
          </div>

          <div className="p-1 space-y-0.5">
            <button onClick={() => { setShowSettings(true); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <User className="w-4 h-4 text-slate-400" /> 个人设置
            </button>
            <button onClick={() => { setShowLayout(true); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <Settings className="w-4 h-4 text-slate-400" /> 布局设置
            </button>
          </div>

          <div className="border-t border-slate-100 mt-1 pt-1.5 px-1.5">
            <button onClick={() => { setIsOpen(false); onLogout(); }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
              <LogOut className="w-3.5 h-3.5 mr-2.5 text-red-400" /> 退出登录
            </button>
          </div>
        </div>
      )}

      {/* 布局设置 Modal */}
      {showLayout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" /> 布局设置
              </span>
              <button onClick={() => setShowLayout(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-800 mb-3">主题风格</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'dark', label: '暗色侧边栏', color: 'bg-slate-800' },
                    { id: 'light', label: '亮色侧边栏', color: 'bg-slate-100 border border-slate-200' },
                  ].map(opt => (
                    <div key={opt.id} onClick={() => setLayoutConfig({...layoutConfig, themeStyle: opt.id})}
                      className={`border rounded-lg p-2.5 cursor-pointer flex gap-1.5 relative transition-all ${
                        layoutConfig.themeStyle === opt.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <div className={`w-5 h-10 rounded-sm shrink-0 ${opt.color}`} />
                      <span className="text-[9.5px] font-bold text-slate-700">{opt.label}</span>
                      {layoutConfig.themeStyle === opt.id && (
                        <div className="absolute right-1.5 top-1.5 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-bold text-slate-800 mb-3">主题颜色</h3>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'classic', bg: 'bg-blue-500', label: '经典蓝' },
                    { id: 'emerald', bg: 'bg-emerald-500', label: '翡翠绿' },
                    { id: 'indigo', bg: 'bg-indigo-500', label: '靛蓝' },
                    { id: 'crimson', bg: 'bg-red-500', label: '绯红' },
                    { id: 'amber', bg: 'bg-amber-500', label: '琥珀' },
                  ].map(c => (
                    <button key={c.id} onClick={() => setLayoutConfig({...layoutConfig, themeColor: c.id})}
                      title={c.label}
                      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border border-white hover:scale-110 transition-transform ${c.bg}`}>
                      {layoutConfig.themeColor === c.id && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowLayout(false)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer">
                保存配置
              </button>
              <button onClick={() => setShowLayout(false)}
                className="flex-1 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-bold cursor-pointer">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 个人设置 Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> 个人设置
              </span>
              <button onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1.5">姓名</label>
                <input type="text" defaultValue={currentUser.name}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1.5">部门</label>
                <input type="text" defaultValue={currentUser.department}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-slate-50" readOnly />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1.5">角色</label>
                <input type="text" defaultValue={currentUser.role}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-slate-50" readOnly />
              </div>
            </div>
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowSettings(false)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer">
                保存
              </button>
              <button onClick={() => setShowSettings(false)}
                className="flex-1 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-bold cursor-pointer">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
