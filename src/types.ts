export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'expert';
  category: string;
  thumbnail: string;
  instructorId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl: string;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  questions: Question[];
  passingScore: number;
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  examResults?: Record<string, number>;
  status: 'enrolled' | 'completed';
  enrolledAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
}
