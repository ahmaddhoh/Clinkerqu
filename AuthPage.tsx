import React, { useState } from 'react';
import { User, Key, Mail, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
  darkMode: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const users = JSON.parse(localStorage.getItem('clinker-users') || '[]');
        const user = users.find((u: UserType) => u.email === formData.email);
        
        if (!user) {
          setError('المستخدم غير موجود');
          return;
        }

        // Check admin credentials
        if (formData.email === 'ahmaddh331@gmail.com' && formData.password === '1348709wwe') {
          const adminUser: UserType = {
            id: 'admin',
            name: 'المدير العام',
            email: 'ahmaddh331@gmail.com',
            isAdmin: true,
            createdAt: new Date()
          };
          onLogin(adminUser);
          return;
        }

        // Simple password check (in real app, use proper authentication)
        const savedPassword = localStorage.getItem(`clinker-password-${user.id}`);
        if (savedPassword !== formData.password) {
          setError('كلمة المرور غير صحيحة');
          return;
        }

        onLogin(user);
      } else {
        // Register logic
        if (!formData.name || !formData.email || !formData.password) {
          setError('جميع الحقول مطلوبة');
          return;
        }

        if (formData.password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          return;
        }

        const users = JSON.parse(localStorage.getItem('clinker-users') || '[]');
        
        if (users.some((u: UserType) => u.email === formData.email)) {
          setError('البريد الإلكتروني مستخدم بالفعل');
          return;
        }

        const newUser: UserType = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          isAdmin: false,
          createdAt: new Date()
        };

        users.push(newUser);
        localStorage.setItem('clinker-users', JSON.stringify(users));
        localStorage.setItem(`clinker-password-${newUser.id}`, formData.password);
        
        onLogin(newUser);
      }
    } catch (err) {
      setError('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className={`backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden ${
        darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-gray-200'
      }`}>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="opacity-90">
            {isLogin ? 'مرحباً بك في CLINKER Quiz' : 'انضم إلى منصة الاختبارات التفاعلية'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                      : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pr-10 pl-4 py-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                    : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pr-10 pl-12 py-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                    : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="أدخل كلمة المرور"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-[1.02] hover:shadow-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {loading ? 'جاري المعالجة...' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب؟ تسجيل الدخول'}
            </button>
          </div>

          {isLogin && (
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
            }`}>
              <h3 className="font-medium mb-2">مرحبا بكم في اختبارات كلينكر:</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                From: CLINKER 🥇<br />
                
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;