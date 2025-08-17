import React, { useState, useEffect } from 'react';
import { Plus, Play, BarChart3, Share2, Edit, Trash2, Users, Clock, Trophy } from 'lucide-react';
import { User, Quiz } from '../types';

interface DashboardProps {
  user: User;
  onCreateQuiz: () => void;
  onPlayQuiz: (quiz: Quiz) => void;
  onViewResults: () => void;
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onCreateQuiz, 
  onPlayQuiz, 
  onViewResults, 
  darkMode 
}) => {
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [selectedTab, setSelectedTab] = useState<'my' | 'all'>('my');

  useEffect(() => {
    loadQuizzes();
  }, [user]);

  const loadQuizzes = () => {
    const quizzes = JSON.parse(localStorage.getItem('clinker-quizzes') || '[]');
    setAllQuizzes(quizzes);
    setUserQuizzes(quizzes.filter((quiz: Quiz) => quiz.creatorId === user.id));
  };

  const deleteQuiz = (quizId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      const quizzes = JSON.parse(localStorage.getItem('clinker-quizzes') || '[]');
      const updatedQuizzes = quizzes.filter((quiz: Quiz) => quiz.id !== quizId);
      localStorage.setItem('clinker-quizzes', JSON.stringify(updatedQuizzes));
      loadQuizzes();
    }
  };

  const shareQuiz = (quizId: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?quiz=${quizId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('تم نسخ رابط الاختبار! يمكنك مشاركته الآن.');
  };

  const getQuizStats = (quiz: Quiz) => {
    const results = JSON.parse(localStorage.getItem('clinker-results') || '[]');
    const quizResults = results.filter((result: any) => result.quizId === quiz.id);
    const participants = quizResults.length;
    const avgScore = participants > 0 
      ? quizResults.reduce((sum: number, result: any) => sum + result.score, 0) / participants 
      : 0;
    
    return { participants, avgScore: Math.round(avgScore * 100) / 100 };
  };

  const QuizCard: React.FC<{ quiz: Quiz; showActions?: boolean }> = ({ quiz, showActions = false }) => {
    const stats = getQuizStats(quiz);
    
    return (
      <div className={`backdrop-blur-md rounded-xl p-6 border transition-all hover:scale-[1.02] hover:shadow-lg ${
        darkMode 
          ? 'bg-gray-800/70 border-gray-700 hover:bg-gray-800/90' 
          : 'bg-white/70 border-gray-200 hover:bg-white/90'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                {quiz.description}
              </p>
            )}
          </div>
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => shareQuiz(quiz.id)}
                className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                title="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteQuiz(quiz.id)}
                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{stats.participants} مشارك</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">متوسط النتيجة: {stats.avgScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-500" />
            <span className="text-sm">{quiz.questions.length} سؤال</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm">
              {quiz.timeLimit ? `${quiz.timeLimit} دقيقة` : 'بدون وقت محدد'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPlayQuiz(quiz)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all hover:from-blue-600 hover:to-purple-700 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            تشغيل الاختبار
          </button>
          {showActions && (
            <button
              onClick={onViewResults}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              النتائج
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          بواسطة: {quiz.creatorName} • {new Date(quiz.createdAt).toLocaleDateString('ar-SA')}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`backdrop-blur-md rounded-2xl p-8 border ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800/70 to-blue-900/50 border-gray-700' 
          : 'bg-gradient-to-r from-white/70 to-blue-50/70 border-gray-200'
      }`}>
        <h2 className="text-3xl font-bold mb-4">
          مرحباً {user.name}! 👋
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {user.isAdmin 
            ? 'مرحباً بك في لوحة تحكم المدير. يمكنك إدارة جميع الاختبارات في النظام.'
            : 'ابدأ في إنشاء اختباراتك التفاعلية أو شارك في الاختبارات المتاحة.'
          }
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
          }`}>
            <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">
              {userQuizzes.length}
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              الاختبارات التي أنشأتها
            </p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-green-900/50' : 'bg-green-100'
          }`}>
            <h3 className="font-bold text-lg text-green-600 dark:text-green-400">
              {allQuizzes.length}
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              إجمالي الاختبارات
            </p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
          }`}>
            <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400">
              {JSON.parse(localStorage.getItem('clinker-results') || '[]').filter((r: any) => r.userId === user.id).length}
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-300">
              الاختبارات التي شاركت بها
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onCreateQuiz}
          className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-8 rounded-xl font-bold transition-all transform hover:scale-105 hover:shadow-lg flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          إنشاء اختبار جديد
        </button>
        
        <button
          onClick={onViewResults}
          className={`py-3 px-8 rounded-xl font-bold transition-all transform hover:scale-105 hover:shadow-lg flex items-center gap-3 ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          عرض النتائج
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className={`flex rounded-xl p-1 ${
          darkMode ? 'bg-gray-800/70' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setSelectedTab('my')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'my'
                ? 'bg-blue-500 text-white shadow-md'
                : darkMode 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            اختباراتي ({userQuizzes.length})
          </button>
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'all'
                ? 'bg-blue-500 text-white shadow-md'
                : darkMode 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            جميع الاختبارات ({allQuizzes.length})
          </button>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedTab === 'my' ? (
          userQuizzes.length > 0 ? (
            userQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} showActions={true} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className={`backdrop-blur-md rounded-2xl p-8 ${
                darkMode ? 'bg-gray-800/70' : 'bg-white/70'
              }`}>
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2">لم تقم بإنشاء أي اختبارات بعد</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  ابدأ في إنشاء اختبارك الأول وشاركه مع الآخرين
                </p>
                <button
                  onClick={onCreateQuiz}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-medium transition-all hover:from-blue-600 hover:to-purple-700"
                >
                  إنشاء اختبار الآن
                </button>
              </div>
            </div>
          )
        ) : (
          allQuizzes.length > 0 ? (
            allQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} showActions={quiz.creatorId === user.id || user.isAdmin} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className={`backdrop-blur-md rounded-2xl p-8 ${
                darkMode ? 'bg-gray-800/70' : 'bg-white/70'
              }`}>
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">لا توجد اختبارات متاحة</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  كن أول من ينشئ اختباراً في النظام
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;