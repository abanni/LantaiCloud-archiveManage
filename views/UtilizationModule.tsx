
import React, { useState, useEffect } from 'react';
import { MOCK_LOGS } from '../constants';
import { Clock, ShieldAlert, UserCheck, Plus, X, ShoppingCart } from 'lucide-react';
import { SelectionItem } from '../types';

interface UtilizationModuleProps {
  basket?: SelectionItem[];
  setBasket?: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
}

export const UtilizationModule: React.FC<UtilizationModuleProps> = ({ basket = [], setBasket }) => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [utilizationContent, setUtilizationContent] = useState('');

  // Auto-fill form if basket has items when mounting or updating
  useEffect(() => {
    if (basket.length > 0) {
      setShowRegisterForm(true);
      const content = basket.map(item => 
        `[${item.type === 'FILE' ? '文件' : '整卷'}] ${item.title} (${item.code})`
      ).join('\n');
      setUtilizationContent(content);
    }
  }, [basket]);

  const handleClose = () => {
    setShowRegisterForm(false);
    // Optional: Clear basket on cancel? keeping it for now.
  };

  const handleSubmit = () => {
    setShowRegisterForm(false);
    if (setBasket) setBasket([]); // Clear basket after submission
    alert("利用登记已提交，并在系统生成审批记录。");
  };

  const translateUserType = (type: string) => {
    switch(type) {
      case 'Internal': return '内部人员';
      case 'External': return '外部人员';
      case 'Researcher': return '科研人员';
      default: return type;
    }
  };

  const translateType = (type: string) => {
    switch(type) {
      case 'View': return '查阅';
      case 'Download': return '下载';
      case 'Print': return '打印';
      default: return type;
    }
  };

  // Helper for rendering checkboxes
  const CheckboxGroup = ({ options }: { options: string[] }) => (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {options.map((opt, idx) => (
        <label key={idx} className="flex items-center space-x-1 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 border-slate-300 rounded text-blue-600 focus:ring-blue-500" />
          <span className="text-xs text-slate-700">{opt}</span>
        </label>
      ))}
      <div className="flex items-center border-b border-slate-300 min-w-[60px]"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">档案利用管理</h2>
          <p className="text-slate-500">管理查阅申请、借阅登记及安全审计日志。</p>
        </div>
        {!showRegisterForm && (
          <div className="flex gap-4">
            {basket.length > 0 && (
               <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                 <ShoppingCart size={16} className="mr-2"/>
                 <span className="text-sm font-bold">清单中待登记: {basket.length} 项</span>
               </div>
            )}
            <button 
              onClick={() => {
                setUtilizationContent(''); // Reset for clean start
                setShowRegisterForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg flex items-center shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Plus size={18} className="mr-2" />
              登记新利用
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Utilization Form (Paper Style) */}
        {showRegisterForm && (
          <div className="lg:col-span-4 bg-white p-8 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-top-4 relative">
             <button 
               onClick={handleClose}
               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
             >
               <X size={24} />
             </button>

             {basket.length > 0 && (
               <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800 flex items-center">
                 <ShoppingCart size={16} className="mr-2"/>
                 已自动关联查询选中的 {basket.length} 项档案资源
               </div>
             )}

             {/* Form Header */}
             <div className="flex justify-end mb-4 items-center">
                <span className="font-bold text-slate-700 mr-2">编号:</span>
                <input type="text" className="border-b border-slate-400 w-32 focus:outline-none px-1 text-right font-mono" defaultValue={basket.length > 0 ? "AUTO-20240523" : ""} />
             </div>

             <div className="border-2 border-slate-800">
                {/* Row 1 */}
                <div className="flex border-b border-slate-400">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">利用人</div>
                  <div className="flex-1 border-r border-slate-400 p-1">
                    <input type="text" className="w-full h-full p-1 outline-none bg-transparent" />
                  </div>
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">身份证号码</div>
                  <div className="flex-1 p-1">
                    <input type="text" className="w-full h-full p-1 outline-none bg-transparent" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex border-b border-slate-400">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">利用单位</div>
                  <div className="flex-[2] border-r border-slate-400 p-1">
                    <input type="text" className="w-full h-full p-1 outline-none bg-transparent" />
                  </div>
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">联系电话</div>
                  <div className="flex-1 p-1">
                    <input type="text" className="w-full h-full p-1 outline-none bg-transparent" />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex border-b border-slate-400 min-h-[48px]">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700 text-center leading-tight">
                    利用人身份<br/><span className="font-normal text-xs">(打√确认)</span>
                  </div>
                  <div className="flex-1 p-3 flex items-center">
                    <CheckboxGroup options={[
                      '建设单位', '施工单位', '产权单位', '律师', '物业单位',
                      '房屋产权人', '党政、纪检、司法机关', '其他'
                    ]} />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="flex border-b border-slate-400 min-h-[48px]">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700 text-center leading-tight">
                    利用凭证<br/><span className="font-normal text-xs">(打√确认)</span>
                  </div>
                  <div className="flex-1 p-3 flex items-center">
                    <CheckboxGroup options={[
                      '身份证', '律师证', '房产证', '法院调查令',
                      '介绍信', '委托书', '物业合同', '其他证件'
                    ]} />
                  </div>
                </div>

                {/* Row 5 */}
                <div className="flex border-b border-slate-400 min-h-[48px]">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700 text-center leading-tight">
                    利用用途<br/><span className="font-normal text-xs">(打√确认)</span>
                  </div>
                  <div className="flex-1 p-3 flex items-center">
                    <CheckboxGroup options={[
                      '复印备案', '领取房产证', '生产建设', '解决纠纷',
                      '查阅核对', '调查取证', '其他'
                    ]} />
                  </div>
                </div>

                {/* Row 6: Content (Auto-filled) */}
                <div className="flex border-b border-slate-400 min-h-[120px]">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">利用内容</div>
                  <div className="flex-1 p-2">
                    <textarea 
                      className="w-full h-full resize-none outline-none bg-transparent text-sm font-mono" 
                      placeholder="请输入利用内容..."
                      value={utilizationContent}
                      onChange={(e) => setUtilizationContent(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Row 7 */}
                <div className="flex border-b border-slate-400 min-h-[80px]">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">利用效果</div>
                  <div className="flex-1 p-2">
                    <textarea className="w-full h-full resize-none outline-none bg-transparent text-sm"></textarea>
                  </div>
                </div>

                {/* Row 8 */}
                <div className="flex border-b border-slate-400">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">利用方式</div>
                  <div className="flex-[2] border-r border-slate-400 p-2 flex items-center">
                    <div className="flex gap-8">
                       <label className="flex items-center space-x-1 cursor-pointer hover:text-blue-600 transition-colors">
                         <input type="checkbox" className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-500" />
                         <span className="text-sm font-medium">下载</span>
                       </label>
                       <label className="flex items-center space-x-1 cursor-pointer hover:text-blue-600 transition-colors">
                         <input type="checkbox" className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-500" />
                         <span className="text-sm font-medium">打印</span>
                       </label>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-100 border-l border-slate-400"></div>
                </div>

                {/* Row 9 */}
                <div className="flex border-b border-slate-400">
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">接待人</div>
                  <div className="flex-[2] border-r border-slate-400 p-1">
                     <input type="text" className="w-full h-full p-1 outline-none bg-transparent" />
                  </div>
                  <div className="w-24 bg-slate-100 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">利用卷数</div>
                  <div className="flex-1 p-1">
                     <input type="text" className="w-full h-full p-1 outline-none bg-transparent text-center" />
                  </div>
                </div>

                {/* Row 10 */}
                <div className="flex bg-slate-50 min-h-[100px]">
                  <div className="w-24 p-2 border-r border-slate-400 flex items-center justify-center text-sm font-bold text-slate-700">备注</div>
                  <div className="flex-1 p-4 grid grid-cols-2 gap-x-8 gap-y-4">
                      <div className="flex items-center">
                         <span className="text-sm text-slate-600 w-20">取件人姓名:</span>
                         <input type="text" className="border-b border-slate-300 flex-1 outline-none bg-transparent px-1" />
                      </div>
                      <div className="flex items-center">
                         <span className="text-sm text-slate-600 w-20">联系电话:</span>
                         <input type="text" className="border-b border-slate-300 flex-1 outline-none bg-transparent px-1" />
                      </div>
                      <div className="flex items-center">
                         <span className="text-sm text-slate-600 w-20">身份证号码:</span>
                         <input type="text" className="border-b border-slate-300 flex-1 outline-none bg-transparent px-1" />
                      </div>
                      <div className="flex items-center">
                         <span className="text-sm text-slate-600 w-20">取件日期:</span>
                         <input type="text" className="border-b border-slate-300 flex-1 outline-none bg-transparent px-1" />
                      </div>
                  </div>
                </div>
             </div>

             {/* Footer Date */}
             <div className="flex justify-end mt-4 items-center gap-2">
                <span className="font-bold text-slate-700">日期:</span>
                <input type="date" className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-600" />
             </div>

             <div className="mt-6 flex justify-center space-x-4">
               <button onClick={handleClose} className="px-6 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded shadow-sm">取消</button>
               <button onClick={handleSubmit} className="px-8 py-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700 font-medium">确认登记并提交</button>
             </div>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-700">访问审计日志</h3>
            <button className="text-xs text-blue-600 hover:underline">导出日志</button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">利用编号</th>
                <th className="px-6 py-3">时间</th>
                <th className="px-6 py-3">利用人</th>
                <th className="px-6 py-3">档案题名</th>
                <th className="px-6 py-3">方式</th>
                <th className="px-6 py-3">目的</th>
                <th className="px-6 py-3">结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.id}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-slate-400" />
                      {log.accessTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{log.userName}</div>
                    <div className="text-xs text-slate-400">{translateUserType(log.userType)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="truncate max-w-xs text-slate-700" title={log.archiveTitle}>{log.archiveTitle}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                      ${log.type === 'Download' ? 'bg-amber-50 text-amber-700' : 
                        log.type === 'Print' ? 'bg-purple-50 text-purple-700' : 
                        'bg-blue-50 text-blue-700'}`}>
                      {translateType(log.type)}
                    </span>
                  </td>
                   <td className="px-6 py-4 text-slate-600">
                    {log.purpose}
                  </td>
                  <td className="px-6 py-4">
                    {log.result === 'Success' ? (
                      <span className="flex items-center text-emerald-600 text-xs font-medium">
                        <UserCheck size={14} className="mr-1" /> 通过
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500 text-xs font-medium">
                        <ShieldAlert size={14} className="mr-1" /> 拒绝
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
