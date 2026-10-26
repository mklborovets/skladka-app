import { useState } from 'react';
import { CurrencyCode, groupRepository } from '@entities/group';

export interface UseCreateGroupReturn {
  name: string;
  baseCurrency: CurrencyCode;
  isSubmitting: boolean;
  error: string | null;
  setName: (name: string) => void;
  setBaseCurrency: (currency: CurrencyCode) => void;
  reset: () => void;
  submitGroup: (creatorId: string) => Promise<string | null>;
}

export const useCreateGroup = (
  onCreated?: (groupId: string) => void
): UseCreateGroupReturn => {
  const [name, setName] = useState<string>('');
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>('USD');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setBaseCurrency('USD');
    setIsSubmitting(false);
    setError(null);
  };

  const submitGroup = async (creatorId: string): Promise<string | null> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a group name');
      return null;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const groupId = await groupRepository.createGroupDoc({
        name: trimmed,
        baseCurrency,
        creatorId,
      });

      reset();
      onCreated?.(groupId);
      return groupId;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create group';
      setError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    baseCurrency,
    isSubmitting,
    error,
    setName,
    setBaseCurrency,
    reset,
    submitGroup,
  };
};
