import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Expense, Participant } from '../types';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Balance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

interface BalanceListProps {
  expenses: Expense[];
  users: Participant[];
}

export function BalanceList({ expenses = [], users = [] }: BalanceListProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const calculateBalances = (): Balance[] => {
    // Inicializar balance para cada usuario
    const balanceMap = new Map<string, number>();
    users.forEach(user => {
      balanceMap.set(user.id, 0);
    });

    // Calcular el balance total para cada usuario
    expenses.forEach(expense => {
      // El que paga recibe el dinero
      const previousPayerBalance = balanceMap.get(expense.paid_by) || 0;
      balanceMap.set(expense.paid_by, previousPayerBalance + expense.amount);

      // Restar a cada participante su parte según los splits
      expense.splits.forEach(split => {
        const amount = (split.percentage / 100) * expense.amount;
        const previousUserBalance = balanceMap.get(split.user_id) || 0;
        balanceMap.set(split.user_id, previousUserBalance - amount);
      });
    });

    // Convertir balances en deudas entre usuarios
    const debts: Balance[] = [];
    const userIds = Array.from(balanceMap.keys());

    // Ordenar usuarios por balance (de más negativo a más positivo)
    userIds.sort((a, b) => (balanceMap.get(a) || 0) - (balanceMap.get(b) || 0));

    let i = 0;
    let j = userIds.length - 1;

    while (i < j) {
      const debtorId = userIds[i];
      const creditorId = userIds[j];
      const debtorBalance = balanceMap.get(debtorId) || 0;
      const creditorBalance = balanceMap.get(creditorId) || 0;

      if (Math.abs(debtorBalance) < 0.01 && Math.abs(creditorBalance) < 0.01) {
        i++;
        j--;
        continue;
      }

      const amount = Math.min(Math.abs(debtorBalance), creditorBalance);
      if (amount > 0.01) {
        debts.push({
          fromUserId: debtorId,
          toUserId: creditorId,
          amount: parseFloat(amount.toFixed(2))
        });
      }

      balanceMap.set(debtorId, debtorBalance + amount);
      balanceMap.set(creditorId, creditorBalance - amount);

      if (Math.abs(balanceMap.get(debtorId) || 0) < 0.01) i++;
      if (Math.abs(balanceMap.get(creditorId) || 0) < 0.01) j--;
    }

    return debts;
  };

  const balances = calculateBalances();

  const copyToClipboard = async () => {
    try {
      const text = balances
        .map(balance => {
          const fromUser = users.find(u => u.id === balance.fromUserId);
          const toUser = users.find(u => u.id === balance.toUserId);
          return `${fromUser?.name} → ${toUser?.name}: ${new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
          }).format(balance.amount)}`;
        })
        .join('\n');

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('notifications.success.copied'));
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error(t('notifications.error.copy'));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('balances.title')}
        </h2>
        {balances.length > 0 && (
          <button
            onClick={copyToClipboard}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={t('balances.copy')}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {balances.length > 0 ? (
          balances.map((balance, index) => {
            const fromUser = users.find(u => u.id === balance.fromUserId);
            const toUser = users.find(u => u.id === balance.toUserId);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {fromUser?.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">→</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {toUser?.name}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(balance.amount)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {t('balances.noDebts')}
          </div>
        )}
      </div>
    </div>
  );
}