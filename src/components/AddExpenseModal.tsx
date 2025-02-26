import React, { useState, useEffect } from 'react';
import { Expense, Split } from '../types';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

interface AddExpenseModalProps {
  users: { id: string; name: string; }[];
  expense?: Expense | null;
  onSave: (expenseData: Partial<Expense>) => void;
  onClose: () => void;
}

interface Participant {
  userId: string;
  amount: number;
}

// Función para calcular la división exacta sin error de redondeo global
const calculateEqualSplit = (total: number, parts: Participant[]): Participant[] => {
  const count = parts.length;
  if (count === 0) return parts;
  // Calcular el monto base para cada participante (redondeado a dos decimales)
  const baseAmount = parseFloat((total / count).toFixed(2));
  // Inicialmente asignamos el mismo valor a todos
  const newParts = parts.map(p => ({ ...p, amount: baseAmount }));
  // Calculamos la suma asignada y la diferencia
  const sumAssigned = baseAmount * count;
  const diff = parseFloat((total - sumAssigned).toFixed(2));
  // Agregamos la diferencia al primer participante
  newParts[0].amount = parseFloat((newParts[0].amount + diff).toFixed(2));
  return newParts;
};

export function AddExpenseModal({ users, expense, onSave, onClose }: AddExpenseModalProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [paidBy, setPaidBy] = useState(expense?.payer || expense?.paid_by || users[0]?.id || '');
  const [isCustomSplit, setIsCustomSplit] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Este useEffect inicializa los participantes basándose en si el gasto ya existe o es nuevo
  useEffect(() => {
    if (users.length > 0) {
      const total = amount ? parseFloat(amount) : 0;
      
      if (expense) {
        if (expense.splits) {
          // Modo edición: convertimos los porcentajes almacenados a montos
          const splits = expense.splits.map((split: Split) => ({
            userId: split.user_id,
            amount: parseFloat(((split.percentage / 100) * expense.amount).toFixed(2))
          }));
          setParticipants(splits);
          setIsCustomSplit(true);
        } else if (expense.participants) {
          // Si no hay splits pero hay participants, crear división igualitaria
          const participantData = expense.participants.map(pid => ({
            userId: pid,
            amount: total / expense.participants.length
          }));
          setParticipants(participantData);
        }
      } else {
        // Modo creación: preseleccionamos solo al usuario que paga
        setParticipants([{ userId: paidBy, amount: total }]);
      }
    }
  }, [users, expense, amount, paidBy]);

  // Actualizar montos cuando cambie el "amount" y no se use división personalizada
  useEffect(() => {
    if (!isCustomSplit && amount) {
      const totalAmount = parseFloat(amount);
      setParticipants(prev => calculateEqualSplit(totalAmount, prev));
    }
  }, [amount, isCustomSplit]);

  // Ajusta los montos en modo división personalizada cuando el monto total cambia
  useEffect(() => {
    if (isCustomSplit && amount) {
      const totalAmount = parseFloat(amount);
      const sumParticipants = participants.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(sumParticipants - totalAmount) > 0.01) {
        const diff = parseFloat((totalAmount - sumParticipants).toFixed(2));
        setParticipants(prev => {
          if (prev.length === 0) return prev;
          return prev.map((p, idx) => {
            if (idx === 0) {
              return { ...p, amount: parseFloat((p.amount + diff).toFixed(2)) };
            }
            return p;
          });
        });
      }
    }
  }, [amount, isCustomSplit, participants]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error(t('expenses.descriptionRequired'));
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('expenses.amountRequired'));
      return;
    }

    if (!paidBy) {
      toast.error(t('expenses.paidByRequired'));
      return;
    }

    // Verificar que haya al menos un participante seleccionado
    if (participants.length === 0) {
      toast.error(t('expenses.noParticipantsSelected'));
      return;
    }

    const totalExpense = parseFloat(amount);

    // Convertir los montos a porcentajes
    const splits = participants.map(p => ({
      user_id: p.userId,
      percentage: parseFloat(((p.amount / totalExpense) * 100).toFixed(2))
    }));

    // Ajustar la suma de porcentajes a 100%
    const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
    const diff = parseFloat((100 - totalPercentage).toFixed(2));
    if (splits.length > 0) {
      splits[0].percentage = parseFloat((splits[0].percentage + diff).toFixed(2));
    }

    // Solo incluir los IDs de los participantes seleccionados
    const participantIds = participants.map(p => p.userId);

    const expenseData = {
      ...(expense ? { id: expense.id } : {}),
      description: description.trim(),
      amount: totalExpense,
      payer: paidBy,
      paid_by: paidBy,
      participants: participantIds,
      splits
    };

    console.log('Submitting expense data:', expenseData);
    onSave(expenseData);
  };

  const toggleParticipant = (userId: string) => {
    let newParticipants: Participant[];
    
    if (participants.some(p => p.userId === userId)) {
      newParticipants = participants.filter(p => p.userId !== userId);
    } else {
      const totalAmount = amount ? parseFloat(amount) : 0;
      const amountPerParticipant = !isCustomSplit && participants.length > 0 
        ? totalAmount / (participants.length + 1)
        : 0;
      
      newParticipants = [...participants, { userId, amount: amountPerParticipant }];
    }

    if (!isCustomSplit && amount) {
      newParticipants = calculateEqualSplit(parseFloat(amount), newParticipants);
    }

    setParticipants(newParticipants);
  };

  // Actualizar el monto de un participante usando el updater funcional
  const updateParticipantAmount = (userId: string, newAmount: string) => {
    setParticipants(prev =>
      prev.map(p =>
        p.userId === userId ? { ...p, amount: parseFloat(newAmount) || 0 } : p
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {expense ? t('expenses.edit') : t('expenses.new')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('expenses.description')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('expenses.amount')}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('expenses.paidBy')}
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('expenses.participants')}
            </label>
            <div className="mb-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isCustomSplit}
                  onChange={(e) => {
                    setIsCustomSplit(e.target.checked);
                    if (!e.target.checked) {
                      // Si se desactiva la división personalizada, recalcula la división igualitaria
                      setParticipants(prev => calculateEqualSplit(parseFloat(amount), prev));
                    }
                  }}
                  className="mr-2"
                />
                {t('expenses.customSplit')}
              </label>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center p-2 rounded-lg ${
                    participants.some(p => p.userId === user.id)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <label className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={participants.some(p => p.userId === user.id)}
                      onChange={() => toggleParticipant(user.id)}
                      className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 
                        focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <span className="flex-1">{user.name}</span>
                  </label>
                  {isCustomSplit && participants.some(p => p.userId === user.id) && (
                    <input
                      type="number"
                      value={participants.find(p => p.userId === user.id)?.amount || 0}
                      onChange={(e) => updateParticipantAmount(user.id, e.target.value)}
                      className="w-24 p-1 rounded border-gray-300 dark:border-gray-600 
                        dark:bg-gray-700 dark:text-gray-100 focus:ring-blue-500 
                        focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                      min="0"
                      step="0.01"
                    />
                  )}
                  {!isCustomSplit && participants.some(p => p.userId === user.id) && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {participants.find(p => p.userId === user.id)?.amount.toFixed(2)}€
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {t('expenses.totalSelected')}: {participants.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}€
              {amount && ` / ${parseFloat(amount).toFixed(2)}€`}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}