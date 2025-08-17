import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Download, RotateCcw } from 'lucide-react';
import { User, Quiz, QuizResult } from '../types';

interface QuizPlayerProps {
  quizId: string;
  quiz?: Quiz | null;
  user: User | null;
  onBack: () => void;
  darkMode: boolean;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizId, quiz: propQuiz, user, onBack, darkMode }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(propQuiz || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    if (!quiz && quizId) {
      const quizzes = JSON.parse(localStorage.getItem('clinker-quizzes') || '[]');
      const foundQuiz = quizzes.find((q: Quiz) => q.id === quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
        if (!user) {
          setShowUserForm(true);
        } else {
          initializeQuiz(foundQuiz);
        }
      } else {
        alert('الاختبار غير موجود');
        onBack();
        return;
      }
    } else if (quiz) {
      if (!user) {
        setShowUserForm(true);
      } else {
        initializeQuiz(quiz);
      }
    }
  }, [quiz, quizId, user]);

  const initializeQuiz = (quizData: Quiz) => {
    setStartTime(new Date());
    setQuestionStartTime(new Date());
    setSelectedAnswers(new Array(quizData.questions.length).fill(-1));
    
    if (quizData.timeLimit) {
      setTimeLeft(quizData.timeLimit * 60);
    }
    
    if (quizData.questions[0]?.timeLimit) {
      setQuestionTimeLeft(quizData.questions[0].timeLimit);
    }
  };

  useEffect(() => {
    if (!quiz || showResults || showUserForm) return;

    const interval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }

      if (questionTimeLeft > 0) {
        setQuestionTimeLeft(prev => {
          if (prev <= 1) {
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, questionTimeLeft, showResults, showUserForm]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setQuestionStartTime(new Date());
      
      const nextQuestion = quiz.questions[nextIndex];
      if (nextQuestion?.timeLimit) {
        setQuestionTimeLeft(nextQuestion.timeLimit);
      } else {
        setQuestionTimeLeft(0);
      }
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    if (!quiz) return;

    const endTime = new Date();
    const totalTimeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    let score = 0;
    const answers = quiz.questions.map((question, index) => {
      const isCorrect = selectedAnswers[index] === question.correctAnswer;
      if (isCorrect) score++;
      
      return {
        questionId: question.id,
        selectedAnswer: selectedAnswers[index],
        isCorrect,
        timeSpent: 0 // Simplified for this demo
      };
    });

    const currentUser = user || { id: 'guest', name: userInfo.name, email: userInfo.email };
    
    const result: QuizResult = {
      id: Date.now().toString(),
      quizId: quiz.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      score,
      totalQuestions: quiz.questions.length,
      answers,
      completedAt: new Date(),
      timeSpent: totalTimeSpent
    };

    // Save result
    const existingResults = JSON.parse(localStorage.getItem('clinker-results') || '[]');
    existingResults.push(result);
    localStorage.setItem('clinker-results', JSON.stringify(existingResults));

    setQuizResult(result);
    setShowResults(true);
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name.trim() || !userInfo.email.trim()) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    setShowUserForm(false);
    if (quiz) {
      initializeQuiz(quiz);
    }
  };

  const generatePDF = () => {
    if (!quiz) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${quiz.title} - CLINKER Quiz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
          .header, .footer { text-align: center; margin: 20px 0; font-weight: bold; color: #3B82F6; }
          .question { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .question-title { font-weight: bold; margin-bottom: 10px; }
          .option { margin: 5px 0; padding: 5px; }
          .correct { background-color: #d4edda; border-radius: 4px; }
          .page-break { page-break-before: always; }
          @media print { 
            body { -webkit-print-color-adjust: exact; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <div class="header">🏆 CLINKER Quiz 🏆</div>
        <h1 style="text-align: center; color: #3B82F6;">${quiz.title}</h1>
        ${quiz.description ? `<p style="text-align: center; color: #666;">${quiz.description}</p>` : ''}
        <hr>
        
        ${quiz.questions.map((question, index) => `
          <div class="question">
            <div class="question-title">السؤال ${index + 1}: ${question.text}</div>
            ${question.options.map((option, optIndex) => `
              <div class="option ${optIndex === question.correctAnswer ? 'correct' : ''}">
                ${String.fromCharCode(65 + optIndex)}) ${option}
                ${optIndex === question.correctAnswer ? ' ✓' : ''}
              </div>
            `).join('')}
            ${question.comment ? `<div style="margin-top: 10px; font-style: italic; color: #666;">تعليق: ${question.comment}</div>` : ''}
          </div>
        `).join('')}
        
        <div class="footer">🏆 CLINKER Quiz 🏆</div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const retakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz?.questions.length || 0).fill(-1));
    setShowResults(false);
    setQuizResult(null);
    if (quiz) {
      initializeQuiz(quiz);
    }
  };

  if (showUserForm) {
    return (
      <div className="max-w-md mx-auto">
        <div className={`backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200'
        }`}>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">معلومات المشارك</h2>
            <p className="opacity-90">يرجى إدخال بياناتك للمشاركة في الاختبار</p>
          </div>

          <form onSubmit={handleUserInfoSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-all hover:from-blue-600 hover:to-purple-700"
            >
              بدء الاختبار
            </button>

            <button
              type="button"
              onClick={onBack}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              العودة
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">الاختبار غير موجود</h2>
        <button
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors"
        >
          العودة
        </button>
      </div>
    );
  }

  if (showResults && quizResult) {
    const percentage = Math.round((quizResult.score / quizResult.totalQuestions) * 100);
    
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Results Header */}
        <div className={`backdrop-blur-md rounded-2xl p-8 border text-center ${
          darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : '📚'}
          </div>
          
          <h2 className="text-3xl font-bold mb-4">انتهى الاختبار!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
            }`}>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {quizResult.score}/{quizResult.totalQuestions}
              </h3>
              <p className="text-blue-600 dark:text-blue-300">الإجابات الصحيحة</p>
            </div>
            
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-green-900/50' : 'bg-green-100'
            }`}>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                {percentage}%
              </h3>
              <p className="text-green-600 dark:text-green-300">النسبة المئوية</p>
            </div>
            
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
            }`}>
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatTime(quizResult.timeSpent)}
              </h3>
              <p className="text-purple-600 dark:text-purple-300">الوقت المستغرق</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={generatePDF}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 px-6 rounded-lg font-medium transition-all hover:from-green-600 hover:to-teal-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تحميل PDF
            </button>
            
            {quiz.settings.allowRetake && (
              <button
                onClick={retakeQuiz}
                className={`py-2 px-6 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                إعادة المحاولة
              </button>
            )}
            
            <button
              onClick={onBack}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        {quiz.settings.showCorrectAnswers && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">مراجعة الإجابات</h3>
            
            {quiz.questions.map((question, index) => {
              const userAnswer = quizResult.answers[index];
              const isCorrect = userAnswer.isCorrect;
              
              return (
                <div key={question.id} className={`backdrop-blur-md rounded-xl p-6 border ${
                  darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
                }`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2 rounded-full ${
                      isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">السؤال {index + 1}: {question.text}</h4>
                      
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`p-3 rounded-lg border ${
                            optIndex === question.correctAnswer
                              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                              : optIndex === userAnswer.selectedAnswer && !isCorrect
                                ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                                : darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              <div className="flex gap-2">
                                {optIndex === question.correctAnswer && (
                                  <span className="text-green-600 dark:text-green-400 text-sm">✓ صحيح</span>
                                )}
                                {optIndex === userAnswer.selectedAnswer && optIndex !== question.correctAnswer && (
                                  <span className="text-red-600 dark:text-red-400 text-sm">✗ اختيارك</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {quiz.settings.showComments && question.comment && (
                        <div className={`mt-4 p-3 rounded-lg ${
                          darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                        }`}>
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            💡 {question.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className={`backdrop-blur-md rounded-xl p-6 border mb-8 ${
        darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
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
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {timeLeft > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            السؤال {currentQuestionIndex + 1} من {quiz.questions.length}
          </div>
          
          {questionTimeLeft > 0 && (
            <div className="flex items-center gap-2 text-red-500">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(questionTimeLeft)}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className={`backdrop-blur-md rounded-xl p-8 border ${
        darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
      }`}>
        <h2 className="text-2xl font-bold mb-8">{currentQuestion.text}</h2>
        
        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-right p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                selectedAnswers[currentQuestionIndex] === index
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                  : darkMode
                    ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400'
                }`}>
                  {selectedAnswers[currentQuestionIndex] === index && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedAnswers[currentQuestionIndex] !== -1 ? 'تم اختيار الإجابة' : 'اختر إجابة للمتابعة'}
          </div>
          
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === -1}
            className={`px-8 py-3 rounded-xl font-bold transition-all transform ${
              selectedAnswers[currentQuestionIndex] !== -1
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;