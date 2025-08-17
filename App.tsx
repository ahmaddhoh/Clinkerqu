import React, { useState, useEffect } from 'react';
import { Sun, Moon, Trophy } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import QuizCreator from './components/QuizCreator';
import QuizPlayer from './components/QuizPlayer';
import Results from './components/Results';
import { User, Quiz } from './types';
import './index.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'auth' | 'dashboard' | 'create' | 'play' | 'results'>('auth');
  const [darkMode, setDarkMode] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizId, setQuizId] = useState<string>('');

  useEffect(() => {
    const savedUser = localStorage.getItem('clinker-user');
    const savedTheme = localStorage.getItem('clinker-theme');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check for quiz ID in URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('quiz');
    if (id) {
      setQuizId(id);
      setCurrentPage('play');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('clinker-theme', !darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('clinker-user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('clinker-user');
    setCurrentPage('auth');
  };

  const handleCreateQuiz = () => {
    setCurrentPage('create');
  };

  const handlePlayQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentPage('play');
  };

  const handleViewResults = () => {
    setCurrentPage('results');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setCurrentQuiz(null);
    setQuizId('');
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        darkMode 
          ? 'bg-gray-900/70 border-gray-700' 
          : 'bg-white/70 border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CLINKER Quiz 🏆
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">From CLINKER</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  تسجيل خروج
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'auth' && (
          <AuthPage onLogin={handleLogin} darkMode={darkMode} />
        )}
        
        {currentPage === 'dashboard' && user && (
          <Dashboard
            user={user}
            onCreateQuiz={handleCreateQuiz}
            onPlayQuiz={handlePlayQuiz}
            onViewResults={handleViewResults}
            darkMode={darkMode}
          />
        )}
        
        {currentPage === 'create' && user && (
          <QuizCreator
            user={user}
            onBack={handleBackToDashboard}
            darkMode={darkMode}
          />
        )}
        
        {currentPage === 'play' && (
          <QuizPlayer
            quizId={quizId}
            quiz={currentQuiz}
            user={user}
            onBack={handleBackToDashboard}
            darkMode={darkMode}
          />
        )}
        
        {currentPage === 'results' && user && (
          <Results
            user={user}
            onBack={handleBackToDashboard}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-20 py-8 border-t transition-colors ${
        darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            تطبيق CLINKER Quiz - منصة الاختبارات التفاعلية
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            للاقتراحات والدعم: ahmaddh331@gmail.com
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;