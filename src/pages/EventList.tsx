import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Event } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import { CreateEventModal } from '../components/CreateEventModal';
import toast from 'react-hot-toast';

export function EventList() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error(t('notifications.error.loadEvents'));
    }
  };

  const handleCreateEvent = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          name,
          description,
          participants: [],
          expenses: []
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [data, ...prev]);
      setShowCreateModal(false);
      toast.success(t('notifications.success.eventCreated'));
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(t('notifications.error.createEvent'));
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(t('events.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');  // UUID inválido que nunca existirá

      if (error) throw error;

      setEvents([]);
      toast.success(t('notifications.success.allEventsDeleted'));
    } catch (error) {
      console.error('Error deleting events:', error);
      toast.error(t('notifications.error.deleteEvents'));
    }
  };

  const onDelete = async (eventId: string) => {
    if (!window.confirm(t('events.confirmDelete'))) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== eventId));
      toast.success(t('notifications.success.eventDeleted'));
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(t('notifications.error.deleteEvent'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 flex-col sm:flex-row gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('events.title')}
        </h1>
        <div className="flex items-center gap-3 flex-wrap justify-center w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            {t('events.new')}
          </button>
          {events.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={20} />
              {t('events.deleteAll')}
            </button>
          )}
        </div>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {event.name}
              </h2>
              {event.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {event.description}
                </p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="block">{event.participants.length} {t('participants.title')}</span>
                <span className="block">{event.expenses.length} {t('expenses.title')}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          {t('events.empty')}
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal
          onSave={handleCreateEvent}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
} 