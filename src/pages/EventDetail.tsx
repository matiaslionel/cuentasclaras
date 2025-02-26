import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Event, Expense } from '../types';
import { eventService } from '../services/eventService';
import { ExpenseList } from '../components/ExpenseList';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { BalanceList } from '../components/BalanceList';
import { ParticipantList } from '../components/ParticipantList';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    console.log('Loading event with ID:', eventId);
    if (!eventId) return;
    try {
      setLoading(true);
      const data = await eventService.getEvent(eventId);
      console.log('Received event data:', data);
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error(t('notifications.error.loadEvent'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (name: string) => {
    if (!eventId) return;
    try {
      const updatedEvent = await eventService.addParticipant(eventId, name);
      setEvent(updatedEvent);
      toast.success(t('notifications.success.participantAdded'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('notifications.error.addParticipant'));
    }
  };

  const handleAddExpense = async (expenseData: Partial<Expense>) => {
    if (!eventId) return;
    try {
      const updatedEvent = await eventService.addExpense(eventId, expenseData as Omit<Expense, 'id' | 'created_at'>);
      setEvent(updatedEvent);
      setShowAddExpense(false);
      toast.success(t('notifications.success.expenseAdded'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('notifications.error.addExpense'));
    }
  };

  const handleEditExpense = async (expenseId: string, expenseData: Partial<Expense>) => {
    if (!eventId) return;
    try {
      const updatedEvent = await eventService.updateExpense(eventId, expenseId, expenseData);
      setEvent(updatedEvent);
      setEditingExpense(null);
      toast.success(t('notifications.success.expenseUpdated'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('notifications.error.updateExpense'));
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!eventId || !window.confirm(t('expenses.confirmDelete'))) return;
    try {
      const updatedEvent = await eventService.deleteExpense(eventId, expenseId);
      setEvent(updatedEvent);
      toast.success(t('notifications.success.expenseDeleted'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('notifications.error.deleteExpense'));
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!eventId) return;
    try {
      const updatedEvent = await eventService.deleteParticipant(eventId, participantId);
      setEvent(updatedEvent);
      toast.success(t('notifications.success.participantDeleted'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('notifications.error.deleteParticipant'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">
          {t('common.loading')}...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">
          {t('common.eventNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        {t('common.back')}
      </button>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {event.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <ParticipantList
            participants={event.participants}
            onAdd={handleAddParticipant}
            onDelete={handleDeleteParticipant}
          />

          <ExpenseList
            event={event}
            onAddExpense={() => setShowAddExpense(true)}
            onEditExpense={(expense) => setEditingExpense(expense)}
            onDeleteExpense={handleDeleteExpense}
          />
          <BalanceList
            expenses={event.expenses}
            users={event.participants}
          />
      </div>

      {(showAddExpense || editingExpense) && (
        <AddExpenseModal
          users={event.participants}
          expense={editingExpense}
          onSave={editingExpense ? handleEditExpense.bind(null, editingExpense.id) : handleAddExpense}
          onClose={() => {
            setShowAddExpense(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
} 