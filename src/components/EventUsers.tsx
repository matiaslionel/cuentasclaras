import { useState, useEffect } from 'react';
import { User } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface EventUsersProps {
  eventId: string;
  onUsersChange?: (users: User[]) => void;
}

export function EventUsers({ eventId, onUsersChange }: EventUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadUsers();
  }, [eventId]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('event_users')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      setUsers(data || []);
      onUsersChange?.(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(t('notifications.error.loadUsers'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('event_users')
        .insert([
          {
            event_id: eventId,
            name: newUserName.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const updatedUsers = [...users, data];
      setUsers(updatedUsers);
      onUsersChange?.(updatedUsers);
      setNewUserName('');
      setShowAddUser(false);
      toast.success(t('notifications.success.userAdded'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('notifications.error.addUser'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('participants.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('event_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      onUsersChange?.(updatedUsers);
      toast.success(t('notifications.success.userDeleted'));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('notifications.error.deleteUser'));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">{t('participants.title')}</h2>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
        >
          <Plus size={20} />
          {t('participants.add')}
        </button>
      </div>

      <div className="space-y-2">
        {users?.map(user => (
          <div key={user.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="dark:text-white">{user.name}</span>
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('participants.new')}</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('participants.placeholder')}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('participants.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 