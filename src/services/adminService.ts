import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Progress, Course } from '../types';

export const adminService = {
  // User Management
  async getAllUsers(): Promise<UserProfile[]> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  },

  async updateUserRole(uid: string, role: 'admin' | 'student') {
    await updateDoc(doc(db, 'users', uid), { role });
  },

  async getUserProgress(userId: string): Promise<Progress[]> {
    const q = query(collection(db, 'progress'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Progress));
  },

  // Analytics
  async getDashboardStats() {
    const [usersSnap, coursesSnap, progressSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'progress'))
    ]);

    const users = usersSnap.size;
    const courses = coursesSnap.size;
    const enrollments = progressSnap.size;

    // Calculate completions
    const progressDocs = progressSnap.docs.map(d => d.data() as Progress);
    const totalCompletions = progressDocs.filter(p => p.status === 'completed').length;

    return {
      totalUsers: users,
      totalCourses: courses,
      totalEnrollments: enrollments,
      totalCompletions: totalCompletions,
      recentEnrollments: progressDocs
        .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
        .slice(0, 10)
    };
  }
};
