import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Play, Settings, Zap, CheckCircle } from 'lucide-react';
import { useRuleStore } from '../stores/ruleStore';
import { Rule, Condition } from '../services/ruleService';
import ConditionBuilder from '../components/ConditionBuilder';

export default function RuleEditorPage() {
  const navigate = useNavigate();
  const {
    rules,
    presets,
    currentRule,
    loading,
    error,
    fetchRules,
    fetchPresets,
    createRule,
    updateRule,
    deleteRule,
    matchRule,
    setCurrentRule,
    clearError,
  } = useRuleStore();

  const [ruleName, setRuleName] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>('AND');
  const [isCreating, setIsCreating] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState<{ count: number; stocks: string[] } | null>(null);

  useEffect(() => {
    fetchRules();
    fetchPresets();
  }, []);

  useEffect(() => {
    if (currentRule) {
      setRuleName(currentRule.name);
      setConditions(currentRule.conditions);
      setConditionLogic(currentRule.conditionLogic);
      setIsCreating(false);
    }
  }, [currentRule]);

  const handleSave = async () => {
    if (!ruleName.trim()) {
      alert('请输入规则名称');
      return;
    }
    if (conditions.length === 0) {
      alert('请至少添加一个条件');
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        await createRule({ name: ruleName, conditions, conditionLogic });
        navigate(-1);
      } else if (currentRule?.id) {
        await updateRule(currentRule.id, { name: ruleName, conditions, conditionLogic });
        navigate(-1);
      }
    } catch (err) {
      console.error('保存规则失败:', err);
      alert('保存规则失败');
    } finally {
      setSaving(false);
    }
  };

  const handleMatch = async () => {
    if (!currentRule?.id) return;
    setMatching(null);
    try {
      const result = await matchRule(currentRule.id);
      setMatching(result);
    } catch (err) {
      console.error('匹配规则失败:', err);
      alert('匹配规则失败');
    }
  };

  const handleDelete = async () => {
    if (!currentRule?.id) return;
    if (!confirm('确定要删除这个规则吗？')) return;

    try {
      await deleteRule(currentRule.id);
      navigate(-1);
    } catch (err) {
      console.error('删除规则失败:', err);
      alert('删除规则失败');
    }
  };

  const handleUsePreset = (preset: any) => {
    setRuleName(preset.name);
    setConditions(preset.conditions);
    setConditionLogic(preset.conditionLogic);
    setIsCreating(true);
  };

  const handleNewRule = () => {
    setCurrentRule(null);
    setRuleName('');
    setConditions([]);
    setConditionLogic('AND');
    setIsCreating(true);
    setMatching(null);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg-card rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">自定义规则</h1>
        </div>
        <button
          onClick={handleNewRule}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/80"
        >
          <Settings className="w-4 h-4" />
          新建规则
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Rules List */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">我的规则</h2>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => setCurrentRule(rule)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentRule?.id === rule.id ? 'border-accent bg-accent/10' : 'border-border bg-bg-card hover:border-accent/50'
                  }`}
                >
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-sm text-text-secondary mt-1">
                    {rule.conditions.length}个条件 · {rule.conditionLogic}
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <div className="p-4 bg-bg-card rounded-lg border border-border text-center text-text-secondary">
                  暂无规则，创建一个吧！
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">预设策略</h2>
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3 rounded-lg border border-border bg-bg-card"
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-sm text-text-secondary mt-1 mb-2">
                    {preset.description}
                  </div>
                  <button
                    onClick={() => handleUsePreset(preset)}
                    className="text-accent text-sm hover:underline"
                  >
                    使用此策略
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="lg:col-span-2">
          <div className="bg-bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-6">
              {isCreating ? '创建规则' : '编辑规则'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">规则名称</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="例如：突破新高策略"
                  className="w-full bg-bg-dark border border-border rounded-lg px-4 py-3 text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">条件逻辑</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="AND"
                      checked={conditionLogic === 'AND'}
                      onChange={() => setConditionLogic('AND')}
                    />
                    <span>全部满足（AND）</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="OR"
                      checked={conditionLogic === 'OR'}
                      onChange={() => setConditionLogic('OR')}
                    />
                    <span>任一满足（OR）</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">条件设置</label>
                <ConditionBuilder conditions={conditions} onChange={setConditions} />
              </div>

              {!isCreating && currentRule?.id && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    实时匹配
                  </h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleMatch}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Play className="w-4 h-4" />
                      运行匹配
                    </button>
                    {matching && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        匹配到 {matching.count} 只股票
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/80 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存规则'}
                </button>
                {!isCreating && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除规则
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
