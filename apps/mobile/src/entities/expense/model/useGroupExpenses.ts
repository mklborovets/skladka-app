import { useEffect, useState } from 'react';
import { expenseRepository } from '../api/expenseRepository';
import { ExpenseDoc } from './types';

export interface UseGroupExpensesReturn {
  expenses: ExpenseDoc[];
  isLoading: boolean;
  error: string | null;
}

export const useGroupExpenses = (groupId: string): UseGroupExpensesReturn => {
  const [expenses, setExpenses] = useState<ExpenseDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = expenseRepository.subscribeToGroupExpenses(
      groupId,
      loaded => {
        setExpenses(loaded);
        setIsLoading(false);
      },
      err => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [groupId]);

  return {
    expenses,
    isLoading,
    error,
  };
};
