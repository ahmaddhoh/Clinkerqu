import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Users, BarChart3, Download, Filter } from 'lucide-react';
import { User, Quiz, QuizResult } from '../types';

interface ResultsProps {
  user: User;
  onBack: () => void;
  darkMode: boolean;
}

const Results: React.FC<ResultsProps> = ({ user, onBack, darkMode }) => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('all');
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterResults();
  }, [selectedQuiz, results]);

  const loadData = () => {
    const allResults = JSON.parse(localStorage.getItem('clinker-results') || '[]');
    const allQuizzes = JSON.parse(localStorage.getItem('clinker-quizzes') || '[]');
    
    setResults(allResults);
    setQuizzes(user.isAdmin ? allQuizzes : allQuizzes.filter((q: Quiz) => q.creatorId === user.id));
  };

  const filterResults = () => {
    let filtered = results;
    
    if (selectedQuiz !== 'all') {
      filtered = filtered.filter(result => result.quizId === selectedQuiz);
    }
    
    if (!user.isAdmin) {
      const userQuizIds = quizzes.map(q => q.id);
      filtered = filtered.filter(result => 
        userQuizIds.includes(result.quizId) || result.userId === user.id
      );
    }
    
    // Sort by score (highest first) then by completion time
    filtered.sort((a, b) => {
      const aPercentage = (a.score / a.totalQuestions) * 100;
      const bPercentage = (b.score / b.totalQuestions) * 100;
      
      if (aPercentage !== bPercentage) {
        return bPercentage - aPercentage;
      }
      
      return a.timeSpent - b.timeSpent;
    });
    
    setFilteredResults(filtered);
  };

  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz?.title || 'اختبار محذوف';
  };

  const generateLeaderboardPDF = () => {
    if (filteredResults.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const selectedQuizTitle = selectedQuiz !== 'all' 
      ? getQuizTitle(selectedQuiz)
      : 'جميع الاختبارات';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>نتائج الاختبارات - CLINKER Quiz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
          .header, .footer { text-align: center; margin: 20px 0; font-weight: bold; color: #3B82F6; }
          .leaderboard { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .leaderboard th, .leaderboard td { border: 1px solid #ddd; padding: 12px; text-align: center; }
          .leaderboard th { background-color: #3B82F6; color: white; }
          .rank-1 { background-color: #ffd700; }
          .rank-2 { background-color: #c0c0c0; }
          .rank-3 { background-color: #cd7f32; }
          @media print { 
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">🏆 CLINKER Quiz - نتائج الاختبارات 🏆</div>
        <h1 style="text-align: center; color: #3B82F6;">لوحة المتصدرين</h1>
        <h2 style="text-align: center; color: #666;">${selectedQuizTitle}</h2>
        <hr>
        
        <table class="leaderboard">
          <thead>
            <tr>
              <th>الترتيب</th>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>النتيجة</th>
              <th>النسبة المئوية</th>
              <th>الوقت المستغرق</th>
              <th>تاريخ الاختبار</th>
            </tr>
          </thead>
          <tbody>
            ${filteredResults.map((result, index) => {
              const percentage = Math.round((result.score / result.totalQuestions) * 100);
              const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
              const timeSpent = `${Math.floor(result.timeSpent / 60)}:${(result.timeSpent % 60).toString().padStart(2, '0')}`;
              
              return `
                <tr class="${rankClass}">
                  <td>${index + 1}</td>
                  <td>${result.userName}</td>
                  <td>${result.userEmail}</td>
                  <td>${result.score}/${result.totalQuestions}</td>
                  <td>${percentage}%</td>
                  <td>${timeSpent}</td>
                  <td>${new Date(result.completedAt).toLocaleDateString('ar-SA')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">🏆 CLINKER Quiz - منصة الاختبارات التفاعلية 🏆</div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getOverallStats = () => {
    const totalParticipants = filteredResults.length;
    const totalQuizzes = selectedQuiz === 'all' ? quizzes.length : 1;
    const avgScore = totalParticipants > 0 
      ? filteredResults.reduce((sum, result) => sum + (result.score / result.totalQuestions), 0) / totalParticipants 
      : 0;

    return {
      totalParticipants,
      totalQuizzes,
      avgScore: Math.round(avgScore * 100)
    };
  };

  const stats = getOverallStats();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className={`backdrop-blur-md rounded-xl p-6 border ${
        darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                نتائج الاختبارات
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user.isAdmin ? 'جميع نتائج الاختبارات في النظام' : 'نتائج اختباراتك ومشاركاتك'}
              </p>
            </div>
          </div>

          <button
            onClick={generateLeaderboardPDF}
            disabled={filteredResults.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filteredResults.length > 0
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            تحميل النتائج
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
          }`}>
            <h3 className="font-bold text-2xl text-blue-600 dark:text-blue-400">
              {stats.totalParticipants}
            </h3>
            <p className="text-blue-600 dark:text-blue-300">إجمالي المشاركين</p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-green-900/50' : 'bg-green-100'
          }`}>
            <h3 className="font-bold text-2xl text-green-600 dark:text-green-400">
              {stats.avgScore}%
            </h3>
            <p className="text-green-600 dark:text-green-300">متوسط النتائج</p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
          }`}>
            <h3 className="font-bold text-2xl text-purple-600 dark:text-purple-400">
              {stats.totalQuizzes}
            </h3>
            <p className="text-purple-600 dark:text-purple-300">عدد الاختبارات</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
          >
            <option value="all">جميع الاختبارات</option>
            {quizzes.map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard */}
      <div className={`backdrop-blur-md rounded-xl p-6 border ${
        darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
      }`}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          لوحة المتصدرين
        </h2>

        {filteredResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <th className="text-right py-3 px-4 font-semibold">الترتيب</th>
                  <th className="text-right py-3 px-4 font-semibold">المشارك</th>
                  <th className="text-right py-3 px-4 font-semibold">الاختبار</th>
                  <th className="text-right py-3 px-4 font-semibold">النتيجة</th>
                  <th className="text-right py-3 px-4 font-semibold">النسبة</th>
                  <th className="text-right py-3 px-4 font-semibold">الوقت</th>
                  <th className="text-right py-3 px-4 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => {
                  const percentage = Math.round((result.score / result.totalQuestions) * 100);
                  const timeSpent = `${Math.floor(result.timeSpent / 60)}:${(result.timeSpent % 60).toString().padStart(2, '0')}`;
                  
                  return (
                    <tr 
                      key={result.id} 
                      className={`border-b transition-colors ${
                        darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'
                      } ${
                        index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        index === 1 ? 'bg-gray-50 dark:bg-gray-700/20' :
                        index === 2 ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            index === 2 ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          {index < 3 && (
                            <span className="text-lg">
                              {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{result.userName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{result.userEmail}</p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          {getQuizTitle(result.quizId)}
                        </p>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className="font-mono text-lg">
                          {result.score}/{result.totalQuestions}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className={`inline-flex px-2 py-1 rounded-full text-sm font-semibold ${
                          percentage >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          percentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {percentage}%
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className="font-mono">{timeSpent}</span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <p className="text-sm">{new Date(result.completedAt).toLocaleDateString('ar-SA')}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.completedAt).toLocaleTimeString('ar-SA')}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج لعرضها</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedQuiz === 'all' 
                ? 'لم يشارك أحد في الاختبارات بعد'
                : 'لم يشارك أحد في هذا الاختبار بعد'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;