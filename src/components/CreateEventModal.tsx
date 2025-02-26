import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './atoms/Input';
import { TextArea } from './atoms/TextArea';
import { Button } from './atoms/Button';


interface CreateEventModalProps {
  onSave: (name: string, description?: string) => void;
  onClose: () => void;
}

export function CreateEventModal({ onSave, onClose }: CreateEventModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('events.create')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('events.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('events.namePlaceholder')}
            autoFocus
            required
          />

          <TextArea
            label={t('events.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('events.descriptionPlaceholder')}
            rows={3}
          />

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
            >
              {t('common.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 