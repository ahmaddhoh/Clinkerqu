export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  comment?: string;
  timeLimit?: number; // in seconds
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  creatorId: string;
  creatorName: string;
  createdAt: Date;
  timeLimit?: number; // total quiz time in minutes
  isPublic: boolean;
  settings: {
    showCorrectAnswers: boolean;
    showComments: boolean;
    allowRetake: boolean;
    randomizeQuestions: boolean;
  };
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  completedAt: Date;
  timeSpent: number; // total time in seconds
}

export interface QuizAttempt {
  userId: string;
  userName: string;
  userEmail: string;
  startedAt: Date;
  currentQuestionIndex: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    timeSpent: number;
  }[];
}