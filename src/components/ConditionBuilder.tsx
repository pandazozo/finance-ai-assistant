import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Condition } from '../services/ruleService';
import { ruleService } from '../services/ruleService';

interface ConditionBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

export default function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const [conditionType, setConditionType] = useState<'technical' | 'fundamental' | 'news'>('technical');

  const addCondition = () => {
    const newCondition: Condition = {
      type: conditionType,
      field: ruleService.getFieldsForType(conditionType)[0],
      operator: '>',
      value: 0,
    };
    onChange([...conditions, newCondition]);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange(newConditions);
  };

  const getValueInputType = (field: string): 'number' | 'boolean' | 'text' => {
    if (field.startsWith('has_')) return 'boolean';
    return 'number';
  };

  const getDefaultValue = (field: string) => {
    if (field.startsWith('has_')) return true;
    return 0;
  };

  return (
    <div className="space-y-4">
      {/* Add Condition Controls */}
      <div className="flex items-center gap-4">
        <select
          value={conditionType}
          onChange={(e) => setConditionType(e.target.value as any)}
          className="bg-bg-dark border border-border rounded-lg px-3 py-2 text-text-primary"
        >
          <option value="technical">技术面</option>
          <option value="fundamental">基本面</option>
          <option value="news">消息面</option>
        </select>
        <button
          onClick={addCondition}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/80"
        >
          <Plus className="w-4 h-4" />
          添加条件
        </button>
      </div>

      {/* Conditions List */}
      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-bg-card rounded-lg border border-border">
            <select
              value={condition.type}
              onChange={(e) => {
                const newType = e.target.value as any;
                const newField = ruleService.getFieldsForType(newType)[0];
                updateCondition(index, {
                  type: newType,
                  field: newField,
                  value: getDefaultValue(newField),
                });
              }}
              className="bg-bg-dark border border-border rounded px-2 py-1 text-text-primary text-sm"
            >
              <option value="technical">技术面</option>
              <option value="fundamental">基本面</option>
              <option value="news">消息面</option>
            </select>

            <select
              value={condition.field}
              onChange={(e) => {
                const newField = e.target.value;
                updateCondition(index, {
                  field: newField,
                  value: getDefaultValue(newField),
                });
              }}
              className="bg-bg-dark border border-border rounded px-2 py-1 text-text-primary text-sm"
            >
              {ruleService.getFieldsForType(condition.type).map((field) => (
                <option key={field} value={field}>
                  {ruleService.getFieldLabel(field)}
                </option>
              ))}
            </select>

            <select
              value={condition.operator}
              onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
              className="bg-bg-dark border border-border rounded px-2 py-1 text-text-primary text-sm"
            >
              <option value=">">{ruleService.getOperatorLabel('>')}</option>
              <option value=">=">{ruleService.getOperatorLabel('>=')}</option>
              <option value="<">{ruleService.getOperatorLabel('<')}</option>
              <option value="<=">{ruleService.getOperatorLabel('<=')}</option>
              <option value="==">{ruleService.getOperatorLabel('==')}</option>
              <option value="!=">{ruleService.getOperatorLabel('!=')}</option>
            </select>

            {getValueInputType(condition.field) === 'boolean' ? (
              <select
                value={String(condition.value)}
                onChange={(e) => updateCondition(index, { value: e.target.value === 'true' })}
                className="bg-bg-dark border border-border rounded px-2 py-1 text-text-primary text-sm"
              >
                <option value="true">是</option>
                <option value="false">否</option>
              </select>
            ) : (
              <input
                type="number"
                value={condition.value as number}
                onChange={(e) => updateCondition(index, { value: Number(e.target.value) })}
                className="w-24 bg-bg-dark border border-border rounded px-2 py-1 text-text-primary text-sm"
              />
            )}

            <button
              onClick={() => removeCondition(index)}
              className="text-text-secondary hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
