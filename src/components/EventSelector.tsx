import { Event } from '../types';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EventSelectorProps {
  events: Event[];
  onSelectEvent: (eventId: string | null) => void;
  onCreateEvent: () => void;
}

export function EventSelector({ events, onSelectEvent, onCreateEvent }: EventSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t('events.appTitle')}
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={onCreateEvent}
            className="w-full flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            {t('events.createNew')}
          </button>

          {events.length > 0 && (
            <>
              <div className="text-sm text-gray-500 text-center my-4">
                {t('events.selectExisting')}
              </div>
              <div className="space-y-2">
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event.id)}
                    className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{event.name}</div>
                    {event.description && (
                      <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 