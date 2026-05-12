import { useState } from 'react';
import { useRiskPreference, useAlertConfig } from '@/stores';

export default function SettingsPage() {
  const { config, setConfig, answers, setAnswers } = useRiskPreference();
  const { threshold, setThreshold, enabled, setEnabled } = useAlertConfig();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const questions = [
    {
      id: 1,
      question: '你能接受单日最大亏损多少？',
      options: [
        { label: '5%以内', value: 0 },
        { label: '10%以内', value: 1 },
        { label: '20%以内', value: 2 },
        { label: '30%以上', value: 3 }
      ]
    },
    {
      id: 2,
      question: '你的投资周期通常是？',
      options: [
        { label: '隔日超短', value: 0 },
        { label: '1周内', value: 1 },
        { label: '1个月内', value: 2 },
        { label: '1个月以上', value: 3 }
      ]
    },
    {
      id: 3,
      question: '你更倾向于？',
      options: [
        { label: '少量高收益', value: 0 },
        { label: '稳定增值', value: 2 },
        { label: '均衡型', value: 1 }
      ]
    }
  ];

  const [currentAnswers, setCurrentAnswers] = useState<number[]>([]);

  const calculateRiskPreference = (answers: number[]) => {
    if (answers.length < 3) return null;
    const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
    if (avg <= 0.5) {
      return { high: 50, medium: 30, low: 20 };
    } else if (avg <= 1.5) {
      return { high: 40, medium: 35, low: 25 };
    } else {
      return { high: 30, medium: 35, low: 35 };
    }
  };

  const handleAnswer = (questionIndex: number, answerValue: number) => {
    const newAnswers = [...currentAnswers];
    newAnswers[questionIndex] = answerValue;
    setCurrentAnswers(newAnswers);

    if (questionIndex === 0) {
      setAnswers([answerValue]);
    } else {
      setAnswers([...answers.slice(0, 0), answerValue]);
    }
  };

  const handleQuestionnaireComplete = () => {
    const newConfig = calculateRiskPreference(currentAnswers);
    if (newConfig) {
      setConfig(newConfig);
    }
    setShowQuestionnaire(false);
  };

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <div className="flex-none p-4 border-b border-border">
        <h1 className="text-lg font-bold text-text-primary">设置</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">
        <div className="bg-bg-card rounded-lg">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-text-primary">风险偏好配置</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">高风险层</span>
                <span className="text-text-primary">{config.high}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.high}
                onChange={(e) => setConfig({ ...config, high: Number(e.target.value) })}
                className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">中风险层</span>
                <span className="text-text-primary">{config.medium}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.medium}
                onChange={(e) => setConfig({ ...config, medium: Number(e.target.value) })}
                className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">低风险层</span>
                <span className="text-text-primary">{config.low}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.low}
                onChange={(e) => setConfig({ ...config, low: Number(e.target.value) })}
                className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="w-full py-2 text-primary text-sm hover:underline"
            >
              重新测试风险偏好
            </button>
          </div>
        </div>

        <div className="bg-bg-card rounded-lg">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-text-primary">异动提醒设置</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-primary">启用异动提醒</span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  enabled ? 'bg-primary' : 'bg-bg-dark'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">提醒阈值</span>
                <span className="text-text-primary">{threshold}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>1%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-card rounded-lg">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-text-primary">免责声明</h2>
          </div>
          <div className="p-4 text-sm text-text-secondary">
            <p className="mb-2">本产品仅供投资参考，不构成任何投资建议。</p>
            <p>投资者据此操作，风险自担。AI分析结果可能存在误差，仅供参考。</p>
          </div>
        </div>
      </div>

      {showQuestionnaire && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-bg-card rounded-t-2xl max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-bg-card p-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary text-center">风险偏好测试</h2>
            </div>
            <div className="p-4">
              {questions.map((q, qIndex) => (
                <div key={q.id} className="mb-6">
                  <p className="text-text-primary mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(qIndex, opt.value)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          currentAnswers[qIndex] === opt.value
                            ? 'bg-primary text-white'
                            : 'bg-bg-dark text-text-primary hover:bg-bg-hover'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={handleQuestionnaireComplete}
                disabled={currentAnswers.length < 3}
                className={`w-full py-3 rounded-lg font-medium ${
                  currentAnswers.length < 3
                    ? 'bg-bg-dark text-text-secondary'
                    : 'bg-primary text-white'
                }`}
              >
                完成测试
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
