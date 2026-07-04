import React, { useState } from 'react';
import { Building2, FolderTree, Layers, Settings, FileText, Shield, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface ArchiveMgmtProps {
  currentUser: User;
}

const TabLink: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <div onClick={onClick}
    className={`flex items-center px-6 py-3.5 cursor-pointer text-xs border-l-4 transition-all
      ${active ? 'bg-emerald-50 text-emerald-700 border-emerald-500 font-bold' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}>
    <span className="mr-3 opacity-70">{icon}</span>
    {label}
  </div>
);

export const ArchiveManagement: React.FC<ArchiveMgmtProps> = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'template' | 'audit' | 'project-type' | 'eng-type' | 'type-tree'>('info');

  return (
    <div className="-mt-6 -mx-6 flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="w-full">
          <div className="grid grid-cols-[240px_1fr] gap-6 items-start">
            {/* Left Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                <div className="px-5 py-3 bg-emerald-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>档案馆基础治理</span>
                </div>
                <TabLink active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="档案馆信息" icon={<Building2 className="w-4 h-4" />} />
                <TabLink active={activeTab === 'template'} onClick={() => setActiveTab('template')} label="档案馆模板" icon={<FileText className="w-4 h-4" />} />
                <TabLink active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} label="审核流程配置" icon={<Settings className="w-4 h-4" />} />
              </div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                <div className="px-5 py-3 bg-emerald-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>项目类型管理</span>
                </div>
                <TabLink active={activeTab === 'project-type'} onClick={() => setActiveTab('project-type')} label="项目类型配置" icon={<FolderTree className="w-4 h-4" />} />
                <TabLink active={activeTab === 'eng-type'} onClick={() => setActiveTab('eng-type')} label="工程类型" icon={<Layers className="w-4 h-4" />} />
                <TabLink active={activeTab === 'type-tree'} onClick={() => setActiveTab('type-tree')} label="项目类型树" icon={<FileText className="w-4 h-4" />} />
              </div>
            </div>

            {/* Right Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 min-h-[400px]">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" /> 档案馆信息
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      ['档案馆名称', '昆山市城建档案馆'],
                      ['统一社会信用代码', '12320583MB1A12345X'],
                      ['所属地区', '江苏省苏州市昆山市'],
                      ['档案馆等级', '市级综合档案馆'],
                      ['负责人', '黄晓红'],
                      ['联系电话', '0512-57532014'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">{label}</label>
                        <div className="text-sm font-semibold text-slate-800">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">档案馆地址</label>
                    <div className="text-sm text-slate-700">昆山市前进中路168号</div>
                  </div>
                </div>
              )}

              {activeTab === 'template' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" /> 档案馆模板
                  </h3>
                  <p className="text-xs text-slate-500">管理著录模板与导入导出配置</p>
                  <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg">
                    模板配置功能开发中…
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" /> 审核流程配置
                  </h3>
                  <p className="text-xs text-slate-500">配置档案入库审批流程与节点</p>
                  <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg">
                    审核流程配置功能开发中…
                  </div>
                </div>
              )}

              {activeTab === 'project-type' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-emerald-600" /> 项目类型配置
                  </h3>
                  <p className="text-xs text-slate-500">管理工程项目的大类与小类配置</p>
                  <div className="flex items-center gap-2 text-emerald-600 text-xs">
                    <CheckCircle2 size={14} /> 已加载 18 个大类、295 个分类
                  </div>
                </div>
              )}

              {activeTab === 'eng-type' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" /> 工程类型
                  </h3>
                  <p className="text-xs text-slate-500">管理工程类型分类体系</p>
                  <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg">
                    工程类型管理功能开发中…
                  </div>
                </div>
              )}

              {activeTab === 'type-tree' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" /> 项目类型树
                  </h3>
                  <p className="text-xs text-slate-500">昆山市城建档案馆项目类型分级树</p>
                  <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg">
                    项目类型树可视化功能开发中…
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
