import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddUserModalProps {
  onSave: (name: string) => void;
  onClose: () => void;
  existingUsers: { id: string; name: string }[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ onSave, onClose, existingUsers }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [modalLogs, setModalLogs] = useState<string[]>([]);
  const [showDebug] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
  });

  const handleSave = () => {
    setModalLogs(prev => [...prev, 'handleSave called']);
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor ingrese un nombre de usuario');
      setModalLogs(prev => [...prev, 'Error: nombre vacío']);
      return;
    }

    const nameExists = existingUsers.some(
      user => user.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      setError('Este nombre de usuario ya existe');
      setModalLogs(prev => [...prev, 'Error: nombre duplicado']);
      return;
    }

    setModalLogs(prev => [...prev, `Llamando a onSave con: ${trimmedName}`]);
    onSave(trimmedName);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 add-user-modal z-[60]">
      <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-auto">
        {showDebug && (
          <div className="mb-4 bg-yellow-100 p-2 rounded">
            <h4 className="font-bold">Modal Logs:</h4>
            {modalLogs.map((log, index) => (
              <div key={index} className="text-sm">{log}</div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Agregar Nuevo Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              autoFocus
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className={`w-full border rounded p-2 ${
                error ? 'border-red-500' : ''
              }`}
              placeholder="Ingrese nombre de usuario"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Agregar Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};