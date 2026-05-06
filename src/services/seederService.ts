import { courseService } from './courseService';
import { aiService } from './aiService';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, limit, query } from 'firebase/firestore';

const COURSES_TO_GENERATE = [
  "Secretaria Recepcionista y Servicio al Cliente - Parte 1",
  "Secretaria Recepcionista y Servicio al Cliente - Parte 2",
  "Estilista de Belleza - Parte 1",
  "Estilista de Belleza - Parte 2",
  "Cajero Bancario Computarizado - Parte 1",
  "Cajero Bancario Computarizado - Parte 2",
  "Uñas Acrílicas - Parte 1",
  "Uñas Acrílicas - Parte 2"
];

const LESSON_TITLES = [
  "Fundamentos y Protocolos de Operación",
  "Técnicas Avanzadas y Aplicación Práctica",
  "Estrategias de Optimización y Resolución",
  "Especialización Selectiva y Caso Real",
  "Gestión Crítica y Calidad Total",
  "Maestría Final y Salida Laboral"
];

export const seederService = {
  async needsSeeding(): Promise<boolean> {
    const q = query(collection(db, "courses"), limit(1));
    const snap = await getDocs(q);
    return snap.empty;
  },

  async seedCourse(courseTitle: string, onProgress?: (msg: string) => void) {
    const log = (msg: string) => onProgress?.(msg);
    
    try {
      log(`${courseTitle}: Creando infraestructura...`);
      
      const courseId = await courseService.createCourse({
        title: courseTitle,
        description: `Programa de formación técnica profesional en ${courseTitle}. Contenido de alto rendimiento diseñado para la formación de expertos.`,
        category: "Academia Profesional",
        level: "intermediate",
        thumbnail: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80`,
        instructorId: "system",
        isPublished: true
      });

      const moduleId = await courseService.addModule(courseId, {
        courseId,
        title: "Capacitación Técnica Avanzada",
        order: 0
      });

      // 6 Lessons + 2 Exams in order: L1, L2, L3, E1, L4, L5, L6, EF
      
      // Part 1: Lessons 1-3
      for (let i = 0; i < 3; i++) {
        log(`${courseTitle}: Generando Módulo Real ${i+1}...`);
        const content = await aiService.generateFactoryLesson(courseTitle, LESSON_TITLES[i]);
        await courseService.addLesson(courseId, moduleId, {
          courseId,
          moduleId,
          title: LESSON_TITLES[i],
          content,
          videoUrl: "",
          order: i
        });
      }

      // Exam 1
      log(`${courseTitle}: Generando EXAMEN INTERMEDIO...`);
      const questions1 = await aiService.generateExamQuestions(courseTitle + " (Práctica Técnica)");
      await addDoc(collection(db, `courses/${courseId}/exams`), {
        courseId,
        title: "EXAMEN 1: Validación de Competencias",
        questions: questions1,
        passingScore: 80,
        order: 3
      });

      // Part 2: Lessons 4-6
      for (let i = 3; i < 6; i++) {
        log(`${courseTitle}: Generando Módulo Real ${i+1}...`);
        const content = await aiService.generateFactoryLesson(courseTitle, LESSON_TITLES[i]);
        await courseService.addLesson(courseId, moduleId, {
          courseId,
          moduleId,
          title: LESSON_TITLES[i],
          content,
          videoUrl: "",
          order: i + 1
        });
      }

      // Final Exam
      log(`${courseTitle}: Generando EXAMEN FINAL...`);
      const questionsFinal = await aiService.generateExamQuestions(courseTitle + " (Certificación Final)");
      await addDoc(collection(db, `courses/${courseId}/exams`), {
        courseId,
        title: "EXAMEN FINAL: Certificación Profesional",
        questions: questionsFinal,
        passingScore: 85,
        order: 8
      });

      return true;
    } catch (error) {
      console.error(`Failure seeding ${courseTitle}:`, error);
      log(`ERROR en ${courseTitle}: ${error}`);
      return false;
    }
  },

  async seedAll(onProgress?: (msg: string) => void) {
    for (const title of COURSES_TO_GENERATE) {
      await this.seedCourse(title, onProgress);
    }
  }
};
