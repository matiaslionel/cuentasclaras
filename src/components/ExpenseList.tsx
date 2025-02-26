import { Expense, Participant, Event } from '../types';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface ExpenseListProps {
  event: Event;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export function ExpenseList({
  event,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}: ExpenseListProps) {
  const { t } = useTranslation();

  if (event.participants.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('expenses.title')}
        </h2>
        <div className="text-center text-gray-500 dark:text-gray-400">
          {t('expenses.minimumParticipants')}
        </div>
      </div>
    );
  }

  const getUserName = (userId: string) => {
    return event.participants.find(u => u.id === userId)?.name || t('common.unknown');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('expenses.title')}
        </h2>
        <button
          onClick={onAddExpense}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          {t('expenses.add')}
        </button>
      </div>

      {event.expenses.length > 0 ? (
        <div className="space-y-4">
          {event.expenses.map(expense => (
            <div
              key={expense.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {expense.description}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>{t('expenses.paidBy', { 
                    name: event.participants.find(u => u.id === (expense.payer || expense.paid_by))?.name || t('common.unknown') 
                  })}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('expenses.participants')}: {
                      expense.participants && expense.participants.length > 0 
                        ? expense.participants
                            .map(pid => event.participants.find(u => u.id === pid)?.name)
                            .filter(Boolean)
                            .join(', ')
                        : t('expenses.noParticipants')
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(expense.amount)}
                </span>
                
                <button
                  onClick={() => onEditExpense(expense)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Edit2 size={18} />
                </button>
                
                <button
                  onClick={() => onDeleteExpense(expense.id)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          {t('expenses.empty')}
        </div>
      )}
    </div>
  );
}