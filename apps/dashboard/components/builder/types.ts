// Shared types for criteria_jsonb and segment rules

export interface CriteriaCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'between';
  value: any;
}

export interface CriteriaGroup {
  logic: 'AND' | 'OR';
  conditions: (CriteriaCondition | CriteriaGroup)[];
}

export function isGroup(c: CriteriaCondition | CriteriaGroup): c is CriteriaGroup {
  return 'logic' in c && 'conditions' in c;
}

export function createEmptyGroup(logic: 'AND' | 'OR' = 'AND'): CriteriaGroup {
  return { logic, conditions: [] };
}

export function createEmptyCondition(): CriteriaCondition {
  return { field: '', operator: 'eq', value: '' };
}

// Client-side evaluator for live preview
export function evaluateCriteria(
  criteria: CriteriaGroup,
  record: Record<string, any>,
): boolean {
  const evalCondition = (cond: CriteriaCondition): boolean => {
    const val = record[cond.field];
    const numVal = Number(val);
    const numTarget = Number(cond.value);

    switch (cond.operator) {
      case 'eq': return String(val) === String(cond.value);
      case 'neq': return String(val) !== String(cond.value);
      case 'gt': return !isNaN(numVal) && numVal > numTarget;
      case 'gte': return !isNaN(numVal) && numVal >= numTarget;
      case 'lt': return !isNaN(numVal) && numVal < numTarget;
      case 'lte': return !isNaN(numVal) && numVal <= numTarget;
      case 'in': return Array.isArray(cond.value) && cond.value.map(String).includes(String(val));
      case 'not_in': return Array.isArray(cond.value) && !cond.value.map(String).includes(String(val));
      case 'contains': return typeof val === 'string' && val.toLowerCase().includes(String(cond.value).toLowerCase());
      case 'between': {
        if (!Array.isArray(cond.value) || cond.value.length !== 2) return false;
        return !isNaN(numVal) && numVal >= Number(cond.value[0]) && numVal <= Number(cond.value[1]);
      }
      default: return false;
    }
  };

  const evalNode = (node: CriteriaCondition | CriteriaGroup): boolean => {
    if (isGroup(node)) {
      return node.logic === 'AND'
        ? node.conditions.every(evalNode)
        : node.conditions.some(evalNode);
    }
    return evalCondition(node);
  };

  return evalNode(criteria);
}
