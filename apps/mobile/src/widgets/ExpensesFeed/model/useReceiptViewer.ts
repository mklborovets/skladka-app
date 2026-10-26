import { useState } from 'react';
import { ReceiptDoc, receiptRepository } from '@entities/receipt';

export interface UseReceiptViewerReturn {
  isOpen: boolean;
  receipt: ReceiptDoc | null;
  isLoading: boolean;
  error: string | null;
  openReceipt: (expenseId: string) => Promise<void>;
  closeReceipt: () => void;
}

export const useReceiptViewer = (groupId: string): UseReceiptViewerReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<ReceiptDoc | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const openReceipt = async (expenseId: string): Promise<void> => {
    try {
      setIsOpen(true);
      setIsLoading(true);
      setError(null);
      const data = await receiptRepository.getReceipt(groupId, expenseId);
      if (!data) {
        setError('Receipt image not found');
        return;
      }
      setReceipt(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load receipt image';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeReceipt = (): void => {
    setIsOpen(false);
    setReceipt(null);
    setError(null);
  };

  return {
    isOpen,
    receipt,
    isLoading,
    error,
    openReceipt,
    closeReceipt,
  };
};
