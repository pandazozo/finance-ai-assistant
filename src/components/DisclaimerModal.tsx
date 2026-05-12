import { AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
  onConfirm: () => void;
}

export default function DisclaimerModal({ onConfirm }: DisclaimerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">风险揭示</h2>
        </div>
        
        <div className="space-y-3 text-sm text-text-secondary mb-6">
          <p>尊敬的投资者：</p>
          <p>在使用本产品前，请您仔细阅读以下风险提示：</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>本产品仅供投资参考，不构成任何投资建议</li>
            <li>投资者据此操作，风险自担</li>
            <li>AI分析结果可能存在误差，仅供参考</li>
            <li>过往业绩不代表未来表现</li>
          </ul>
        </div>

        <button
          onClick={onConfirm}
          className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90"
        >
          我已阅读并同意
        </button>
      </div>
    </div>
  );
}
