import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { EventList } from './pages/EventList';
import { EventDetail } from './pages/EventDetail';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { LanguageSelector } from './components/LanguageSelector';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors flex justify-center">
        <div className="w-full max-w-[500px] relative">
          <div className="fixed top-4 right-4 flex gap-2">
            <LanguageSelector />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-yellow-500" />
              ) : (
                <Moon className="w-6 h-6 text-gray-500" />
              )}
            </button>
          </div>
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;