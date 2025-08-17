import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Settings, Clock, MessageCircle } from 'lucide-react';
import { User, Quiz, Question } from '../types';

interface QuizCreatorProps {
  user: User;
  onBack: () => void;
  darkMode: boolean;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ user, onBack, darkMode }) => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: 0,
    isPublic: true,
    settings: {
      showCorrectAnswers: true,
      showComments: true,
      allowRetake: true,
      randomizeQuestions: false,
    }
  });

  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([{
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    comment: '',
    timeLimit: 0
  }]);

  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      comment: '',
      timeLimit: 0
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    (updatedQuestions[index] as any)[field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const saveQuiz = async () => {
    if (!quizData.title.trim()) {
      alert('يرجى إدخال عنوان الاختبار');
      return;
    }

    if (questions.some(q => !q.text.trim() || q.options.some(opt => !opt.trim()))) {
      alert('يرجى ملء جميع الأسئلة والخيارات');
      return;
    }

    setSaving(true);
    
    try {
      const quiz: Quiz = {
        id: Date.now().toString(),
        title: quizData.title,
        description: quizData.description,
        questions: questions.map((q, index) => ({
          ...q,
          id: `q${index + 1}`
        })),
        creatorId: user.id,
        creatorName: user.name,
        createdAt: new Date(),
        timeLimit: quizData.timeLimit || undefined,
        isPublic: quizData.isPublic,
        settings: quizData.settings
      };

      const existingQuizzes = JSON.parse(localStorage.getItem('clinker-quizzes') || '[]');
      existingQuizzes.push(quiz);
      localStorage.setItem('clinker-quizzes', JSON.stringify(existingQuizzes));

      alert('تم حفظ الاختبار بنجاح!');
      onBack();
    } catch (error) {
      alert('حدث خطأ أثناء حفظ الاختبار');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
            <h1 className="text-2xl font-bold">إنشاء اختبار جديد</h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              الإعدادات
            </button>
            
            <button
              onClick={saveQuiz}
              disabled={saving}
              className={`px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium transition-all hover:from-green-600 hover:to-teal-700 flex items-center gap-2 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ الاختبار'}
            </button>
          </div>
        </div>

        {/* Basic Quiz Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">عنوان الاختبار *</label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              placeholder="أدخل عنوان الاختبار"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">مدة الاختبار (دقيقة)</label>
            <input
              type="number"
              value={quizData.timeLimit}
              onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              placeholder="0 = بدون حد زمني"
              min="0"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">وصف الاختبار</label>
          <textarea
            value={quizData.description}
            onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            placeholder="وصف مختصر للاختبار (اختياري)"
          />
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`mt-6 p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className="text-lg font-semibold mb-4">إعدادات الاختبار</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showCorrectAnswers"
                  checked={quizData.settings.showCorrectAnswers}
                  onChange={(e) => setQuizData({
                    ...quizData,
                    settings: { ...quizData.settings, showCorrectAnswers: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showCorrectAnswers" className="text-sm font-medium">
                  إظهار الإجابات الصحيحة
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showComments"
                  checked={quizData.settings.showComments}
                  onChange={(e) => setQuizData({
                    ...quizData,
                    settings: { ...quizData.settings, showComments: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showComments" className="text-sm font-medium">
                  إظهار تعليقات الأسئلة
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowRetake"
                  checked={quizData.settings.allowRetake}
                  onChange={(e) => setQuizData({
                    ...quizData,
                    settings: { ...quizData.settings, allowRetake: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="allowRetake" className="text-sm font-medium">
                  السماح بإعادة المحاولة
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="randomizeQuestions"
                  checked={quizData.settings.randomizeQuestions}
                  onChange={(e) => setQuizData({
                    ...quizData,
                    settings: { ...quizData.settings, randomizeQuestions: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="randomizeQuestions" className="text-sm font-medium">
                  ترتيب الأسئلة عشوائياً
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className={`backdrop-blur-md rounded-xl p-6 border ${
            darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">السؤال {questionIndex + 1}</h3>
              
              <div className="flex items-center gap-2">
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(questionIndex)}
                    className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    title="حذف السؤال"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium mb-2">نص السؤال *</label>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  placeholder="اكتب السؤال هنا..."
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium mb-3">الخيارات *</label>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                        title="الإجابة الصحيحة"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-gray-50 border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                        placeholder={`الخيار ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  حدد الإجابة الصحيحة بالضغط على الدائرة بجانب الخيار
                </p>
              </div>

              {/* Question Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    تعليق السؤال
                  </label>
                  <textarea
                    value={question.comment}
                    onChange={(e) => updateQuestion(questionIndex, 'comment', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    placeholder="تعليق يظهر بعد الإجابة (اختياري)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    وقت السؤال (ثانية)
                  </label>
                  <input
                    type="number"
                    value={question.timeLimit}
                    onChange={(e) => updateQuestion(questionIndex, 'timeLimit', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    placeholder="0 = بدون حد زمني"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <div className="text-center">
          <button
            onClick={addQuestion}
            className={`px-6 py-3 border-2 border-dashed rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-3 mx-auto ${
              darkMode
                ? 'border-gray-600 text-gray-400 hover:border-blue-400 hover:text-blue-400'
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            إضافة سؤال جديد
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;