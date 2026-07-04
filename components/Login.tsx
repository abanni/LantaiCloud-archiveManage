import React, { useState } from 'react';
import { Archive, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { MOCK_USERS } from '../constants';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Find user by username (case-insensitive)
    const user = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user) {
      // For demo purposes, we accept any password if it's not empty
      if (password.length > 0) {
        onLogin(user);
      } else {
        setError('请输入密码');
      }
    } else {
      setError('用户名不存在 (尝试: hjj, lj, gxq, hxh)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-slate-100 p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-slate-800 opacity-90 z-10"></div>
          {/* Abstract Pattern */}
          <div className="absolute inset-0 opacity-20 z-0" 
               style={{
                 backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                 backgroundSize: '24px 24px'
               }}>
          </div>

          <div className="relative z-20">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
              <Archive className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">昆山市<br/>城建档案馆</h1>
            <div className="h-1 w-20 bg-blue-400 mb-6 rounded-full"></div>
            <p className="text-blue-100 text-lg leading-relaxed">
              全生命周期数智馆藏管理平台
            </p>
          </div>

          <div className="relative z-20 mt-12">
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-1">Product by</p>
            <h2 className="text-2xl font-bold text-white tracking-wide">兰台云-数智馆藏</h2>
            <p className="text-white/40 text-xs mt-1">Lantai Cloud Digital Archives</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-10 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">欢迎登录</h2>
            <p className="text-slate-500 text-sm mt-2">请输入您的业务账号以访问内部系统</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white outline-none"
                  placeholder="请输入用户名 (如: hjj)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95"
            >
              安全登录
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              提示：演示环境请使用拼音首字母登录 <br/>
              (hjj: 管理科, lj: 编研科, gxq: 业务科, hxh: 馆长)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};