import React from 'react';
import { User } from '../types';
import { UserPlus, Trash2 } from 'lucide-react';

interface UserListProps {
  users: User[];
  onAddUser: () => void;
  onDeleteUser: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onAddUser, onDeleteUser }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 sm:relative bg-white rounded-t-2xl sm:rounded-lg shadow-lg sm:shadow p-4 max-h-[80vh] sm:max-h-none overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold">Usuarios</h2>
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 w-full sm:w-auto justify-center"
        >
          <UserPlus size={18} />
          <span>Agregar Usuario</span>
        </button>
      </div>
      
      <div className="space-y-2 pb-safe">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                {user.name[0].toUpperCase()}
              </div>
              <span className="truncate font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => onDeleteUser(user.id)}
              className="text-red-500 hover:text-red-600 p-2 flex-shrink-0"
              aria-label={`Eliminar ${user.name}`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No hay usuarios. ¡Agrega uno!
          </p>
        )}
      </div>
    </div>
  );
};