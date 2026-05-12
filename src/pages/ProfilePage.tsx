import { Settings, HelpCircle, Shield, Bell, FileText, Share2, LogOut, User } from 'lucide-react';
import { useWatchList, useRiskPreference, useAlertConfig, useDisclaimer } from '@/stores';
import { useAppStore } from '@/stores/useAppStore';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { watchList } = useAppStore();
  const { config: riskPreference } = useRiskPreference();
  const { enabled, threshold } = useAlertConfig();

  const menuItems = [
    { icon: Bell, label: '消息通知', value: enabled ? '开启' : '关闭', path: '/notifications' },
    { icon: FileText, label: '交易记录', value: '查看', path: '/history' },
    { icon: Share2, label: '分享应用', value: '', path: '#' },
    { icon: HelpCircle, label: '帮助中心', value: '', path: '/help' },
    { icon: Shield, label: '隐私设置', value: '', path: '/privacy' },
    { icon: Settings, label: '系统设置', value: '', path: '/settings' },
  ];

  const getRiskLevel = () => {
    if (riskPreference.high >= 50) return '积极';
    if (riskPreference.high >= 30) return '稳健';
    return '保守';
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <div className="flex-none p-4 border-b border-border">
        <h1 className="text-lg font-bold text-text-primary">个人中心</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
            <div className="w-14 h-14 rounded-full bg-primary/30 flex items-center justify-center">
              <User size={28} className="text-primary-light" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-text-primary">AI投资助手用户</h2>
              <p className="text-sm text-text-secondary">专业版会员</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium">
              升级
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-bg-card border border-white/5 text-center">
              <div className="text-2xl font-bold text-text-primary mb-1">{watchList.length}</div>
              <div className="text-xs text-text-secondary">自选股</div>
            </div>
            <div className="p-4 rounded-xl bg-bg-card border border-white/5 text-center">
              <div className="text-2xl font-bold text-primary-light mb-1">{riskLevel}</div>
              <div className="text-xs text-text-secondary">风险偏好</div>
            </div>
            <div className="p-4 rounded-xl bg-bg-card border border-white/5 text-center">
              <div className="text-2xl font-bold text-up mb-1">+0.0%</div>
              <div className="text-xs text-text-secondary">今日收益</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-white/5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">风险偏好设置</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm text-text-secondary">{riskLevel}</span>
              </div>
              <Link to="/settings" className="text-xs text-primary-light">
                修改设置
              </Link>
            </div>
            <div className="mt-2 flex gap-1">
              <div className="flex-1 h-1.5 rounded-full bg-bg-dark">
                <div 
                  className="h-full rounded-full bg-primary-light"
                  style={{ width: `${(riskPreference.high / 100) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-secondary">
              <span>保守</span>
              <span>稳健</span>
              <span>积极</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-white/5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">自选股概览</h3>
            {watchList.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary">暂无自选股</p>
                <Link to="/watchlist" className="text-xs text-primary-light mt-2 inline-block">
                  添加自选
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {watchList.slice(0, 3).map((stock) => (
                  <div 
                    key={stock.code}
                    className="flex items-center justify-between p-2 rounded-lg bg-bg-dark/50"
                  >
                    <div>
                      <span className="text-sm font-medium text-text-primary">{stock.name}</span>
                      <span className="text-xs text-text-secondary ml-2 font-mono">{stock.code}</span>
                    </div>
                    <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </span>
                  </div>
                ))}
                {watchList.length > 3 && (
                  <Link to="/watchlist" className="text-xs text-primary-light text-center block py-2">
                    查看全部 {watchList.length} 只
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-bg-card border border-white/5 overflow-hidden">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                className={`w-full flex items-center justify-between p-4 hover:bg-bg-hover transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-text-secondary" />
                  <span className="text-sm text-text-primary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className={`text-sm ${
                      item.value === '开启' ? 'text-primary-light' : 'text-text-secondary'
                    }`}>
                      {item.value}
                    </span>
                  )}
                  <span className="text-xs text-text-secondary/60">→</span>
                </div>
              </button>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-bg-card border border-white/5 text-text-secondary hover:text-text-primary transition-colors">
            <LogOut size={18} />
            <span className="text-sm">退出登录</span>
          </button>

          <div className="text-center text-xs text-text-secondary/60">
            版本 1.0.0 · 金融AI投资助手
          </div>
        </div>
      </div>
    </div>
  );
}
