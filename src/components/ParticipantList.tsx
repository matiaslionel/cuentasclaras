import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Participant } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface ParticipantListProps {
  participants: Participant[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export function ParticipantList({ participants, onAdd, onDelete }: ParticipantListProps) {
  const { t } = useTranslation();
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;
    onAdd(newParticipantName.trim());
    setNewParticipantName('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('participants.confirmDelete'))) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('participants.title')}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          {t('participants.add')}
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder={t('participants.placeholder')}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('common.cancel')}
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {participants.map(participant => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span className="text-gray-900 dark:text-white">
                {participant.name}
              </span>
              <button
                onClick={() => handleDelete(participant.id)}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 