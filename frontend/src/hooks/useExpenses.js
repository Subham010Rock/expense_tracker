import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExpenses, createExpense } from '../api/expenses';

export function useExpenses({ category, sort } = {}) {
  return useQuery({
    queryKey: ['expenses', { category, sort }],
    queryFn: () => fetchExpenses({ category, sort }),
    retry: 2,
    staleTime: 10_000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }) => createExpense(body, idempotencyKey),
    onSuccess: () => {
      // Invalidate all expense queries so the list refreshes
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
