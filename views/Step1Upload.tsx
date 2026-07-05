import React, { useRef } from 'react';
import { FileText, Upload, Eye, RotateCcw, Search, Edit3, Database } from 'lucide-react';
import { IngestTask } from '../types';

interface Step1UploadProps {
  tasks: IngestTask[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewInspection: (task: IngestTask) => void;
  onCatalog?: (task: IngestTask) => void;
  onIngest?: (task: IngestTask) => void;
  onReupload?: (task: IngestTask) => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({ 
  tasks, 
  onFileUpload, 
  onViewInspection,
  onCatalog,
  onIngest,
  onReupload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      shelving: 'bg-amber-100 text-amber-700 border-amber-200',
      parsing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cataloging: 'bg-blue-100 text-blue-700 border-blue-200',
      archiving: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      parse_error: 'bg-red-100 text-red-700 border-red-200',
    };
    const labels: Record<string, string> = {
      completed: '入库完成',
      shelving: '待上架',
      parsing: '解析中',
      cataloging: '著录中',
      archiving: '归档中',
      failed: '上传失败',
      parse_error: '解析失败',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'completed' ? 'bg-emerald-500' :
          status === 'failed' || status === 'parse_error' ? 'bg-red-500' :
          status === 'cataloging' ? 'bg-blue-500' :
          'bg-amber-400'
        }`} />
        {labels[status] || status}
      </span>
    );
  };

  const getActionButtons = (task: IngestTask) => {
    switch (task.status) {
      case 'shelving':
        return (
          <button onClick={() => onViewInspection(task)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1">
            <Search size={13} /> 检测
          </button>
        );
      case 'cataloging':
        return (
          <button onClick={() => onCatalog?.(task)}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1">
            <Edit3 size={13} /> 著录
          </button>
        );
      case 'completed':
        return (
          <button onClick={() => onIngest?.(task)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-medium flex items-center gap-1">
            <Database size={13} /> 入库
          </button>
        );
      case 'parse_error':
        return (
          <button onClick={() => onReupload?.(task)}
            className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center gap-1">
            <RotateCcw size={13} /> 重新上传
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 上传记录表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 text-sm">上传记录</h3>
          <div className="flex items-center gap-3">
            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{tasks.length} 项</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center shadow-lg shadow-blue-600/20 transition-all text-xs font-medium"
            >
              <Upload size={13} className="mr-1.5" />
              上传档案包
            </button>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={onFileUpload} />
          </div>
        </div>
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">暂无上传记录，请点击顶部"上传档案包"开始。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">项目名称</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">单体</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">案卷</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">文件大小</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">上传时间</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-700">{task.fileName}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{task.unitCount} 个</td>
                    <td className="px-4 py-3 text-center text-slate-600">{task.volumeCount} 卷</td>
                    <td className="px-4 py-3 text-slate-500">{task.fileSize}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{task.createdAt}</td>
                    <td className="px-4 py-3">
                      {getActionButtons(task)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
