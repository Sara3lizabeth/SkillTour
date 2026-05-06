import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course, Module, Lesson, Exam, Progress } from '../types';

export const courseService = {
  // Courses
  async getCourses() {
    const querySnapshot = await getDocs(query(collection(db, 'courses'), where('isPublished', '==', true)));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  },

  async getAllCourses() {
    const querySnapshot = await getDocs(collection(db, 'courses'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  },

  async getCourseById(id: string) {
    const docSnap = await getDoc(doc(db, 'courses', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Course;
    }
    return null;
  },

  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...course,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async updateCourse(id: string, data: Partial<Course>) {
    await updateDoc(doc(db, 'courses', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  // Modules
  async getModules(courseId: string) {
    const q = query(collection(db, `courses/${courseId}/modules`), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
  },

  async addModule(courseId: string, module: Omit<Module, 'id'>) {
    const docRef = await addDoc(collection(db, `courses/${courseId}/modules`), module);
    return docRef.id;
  },

  // Lessons
  async getLessons(courseId: string, moduleId: string) {
    const q = query(collection(db, `courses/${courseId}/modules/${moduleId}/lessons`), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
  },

  async addLesson(courseId: string, moduleId: string, lesson: Omit<Lesson, 'id'>) {
    const docRef = await addDoc(collection(db, `courses/${courseId}/modules/${moduleId}/lessons`), lesson);
    return docRef.id;
  },

  // Progress
  async getProgress(userId: string, courseId: string) {
    const q = query(collection(db, 'progress'), where('userId', '==', userId), where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Progress;
    }
    return null;
  },

  async enrollUser(userId: string, courseId: string) {
    const existing = await this.getProgress(userId, courseId);
    if (existing) return existing.id;

    const newProgress: Omit<Progress, 'id'> = {
      userId,
      courseId,
      completedLessons: [],
      status: 'enrolled',
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'progress'), newProgress);
    return docRef.id;
  },

  async updateProgress(progressId: string, data: Partial<Progress>) {
    await updateDoc(doc(db, 'progress', progressId), {
      ...data,
      lastAccessedAt: new Date().toISOString(),
    });
  },

  async getExams(courseId: string) {
    const querySnapshot = await getDocs(collection(db, `courses/${courseId}/exams`));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
  },

  async getUserEnrolledCourses(userId: string) {
    const q = query(collection(db, 'progress'), where('userId', '==', userId));
    const progressSnapshot = await getDocs(q);
    const progressDocs = progressSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Progress));
    
    const enrolledCourses = [];
    for (const prog of progressDocs) {
      const courseDoc = await getDoc(doc(db, 'courses', prog.courseId));
      if (courseDoc.exists()) {
        enrolledCourses.push({
          ...(courseDoc.data() as Course),
          id: courseDoc.id,
          progress: prog
        });
      }
    }
    return enrolledCourses;
  }
};
