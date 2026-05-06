import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  ChevronLeft, 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Award, 
  Menu, 
  X,
  ChevronRight,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Trophy,
  Sparkles,
  Eye,
  RotateCcw
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { Course, Module, Lesson, Progress, Exam, Question } from '../types';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import CertificateModal from '../components/CertificateModal';

const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [progress, setProgress] = useState<Progress | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showExam, setShowExam] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    const checkCompletion = () => {
      if (progress?.status === 'completed') {
        setShowExam(true);
      }
    };
    checkCompletion();
  }, [progress?.status]);

  useEffect(() => {
    if (courseId && user) {
      const loadData = async () => {
        try {
          const c = await courseService.getCourseById(courseId);
          if (!c) return;
          setCourse(c);

          const p = await courseService.getProgress(user.uid, courseId);
          if (!p) {
            const newPid = await courseService.enrollUser(user.uid, courseId);
            const newP = await courseService.getProgress(user.uid, courseId);
            setProgress(newP);
          } else {
            setProgress(p);
          }

          const mods = await courseService.getModules(courseId);
          setModules(mods);

          const lessonMap: Record<string, Lesson[]> = {};
          let firstLesson: Lesson | null = null;
          for (const mod of mods) {
            const modLessons = await courseService.getLessons(courseId, mod.id);
            lessonMap[mod.id] = modLessons;
            if (!firstLesson && modLessons.length > 0) firstLesson = modLessons[0];
          }
          setLessons(lessonMap);
          setCurrentLesson(firstLesson);

          const exams = await courseService.getExams(courseId);
          if (exams.length > 0) setExam(exams[0]);

        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [courseId, user]);

  const toggleLessonCompletion = async (lId: string) => {
    if (!progress || !currentLesson) return;
    const isCompleted = progress.completedLessons.includes(lId);
    let newList;
    
    if (isCompleted) {
      newList = progress.completedLessons.filter(id => id !== lId);
      toast.success('Estado actualizado: No completada');
    } else {
      newList = [...progress.completedLessons, lId];
      toast.success('¡Lección completada!');
      
      // Auto navigation to next lesson
      const allLessons = modules.flatMap(m => lessons[m.id] || []);
      const currentIndex = allLessons.findIndex(l => l.id === lId);
      if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        setTimeout(() => {
          setCurrentLesson(nextLesson);
          setShowExam(false);
          window.scrollTo(0, 0);
        }, 800);
      }
    }
    
    await courseService.updateProgress(progress.id, { completedLessons: newList });
    setProgress({ ...progress, completedLessons: newList });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!course) return <div>Curso no encontrado.</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Sidebar Content List */}
      <aside className={cn(
        "bg-slate-900/40 backdrop-blur-xl border-r border-white/5 overflow-y-auto transition-all duration-300",
        sidebarOpen ? "w-80" : "w-0"
      )}>
        <div className="p-6 border-b border-white/5 bg-slate-900/20">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest font-mono">Curriculum</span>
          </div>
          <h2 className="font-bold text-white tracking-tight leading-tight line-clamp-2 mb-4">{course.title}</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/50 font-bold uppercase">Progreso</span>
            <span className="text-[10px] text-brand-red font-mono">
              {Math.round((((progress?.completedLessons.length || 0) + (progress?.status === 'completed' ? 1 : 0)) / ((Object.values(lessons).flat().length || 0) + (exam ? 1 : 0) || 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-brand-red h-full transition-all duration-700 shadow-[0_0_8px_rgba(255,0,76,0.5)]" 
              style={{ width: `${(((progress?.completedLessons.length || 0) + (progress?.status === 'completed' ? 1 : 0)) / ((Object.values(lessons).flat().length || 0) + (exam ? 1 : 0) || 1)) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="py-6 space-y-6">
          {modules.map((mod, modIdx) => (
            <div key={mod.id}>
              <div className="px-6 py-2 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase flex items-center gap-3">
                <span className="w-4 h-[1px] bg-white/10"></span>
                MOD {modIdx + 1}: {mod.title}
              </div>
              <div className="mt-2">
                {lessons[mod.id]?.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setShowExam(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-6 py-3.5 text-xs transition-all text-left group",
                      currentLesson?.id === lesson.id 
                        ? "bg-brand-red/10 text-white" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    <div className="mr-4 shrink-0 transition-transform group-hover:scale-110">
                      {progress?.completedLessons.includes(lesson.id) ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                          currentLesson?.id === lesson.id 
                            ? "border-brand-red bg-brand-red text-white" 
                            : "border-slate-700 bg-slate-800 text-slate-400 group-hover:border-brand-red/50"
                        )}>
                          <PlayCircle className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <span className={cn("font-medium transition-colors", currentLesson?.id === lesson.id ? "text-brand-red" : "")}>
                       {lesson.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {exam && (
            <div className="px-6 mt-8">
              <button
                onClick={() => {
                  setShowExam(true);
                  setCurrentLesson(null);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest group red-glow",
                  showExam 
                    ? "bg-brand-red border-brand-red text-white" 
                    : "bg-slate-900 border-slate-800 text-brand-red hover:border-brand-red"
                )}
              >
                <div className="flex items-center">
                  <ClipboardCheck className="h-4 w-4 mr-3" />
                  Evaluación Final
                </div>
                <ChevronRight className={cn("h-3 w-3 transition-transform", showExam ? "rotate-90" : "group-hover:translate-x-1")} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-full bg-[#0a0c10] relative">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-1/2 -left-3 -translate-y-1/2 z-50 bg-slate-900 border border-slate-700 rounded-full p-1.5 shadow-2xl text-slate-400 hover:text-white transition-all lg:flex hidden"
        >
          {sidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <div className="flex-grow overflow-y-auto px-6 py-8 md:px-12 md:py-12">
          {showExam ? (
            <div className="glass-card max-w-3xl mx-auto p-12 bg-slate-900/20">
              <ExamView 
                exam={exam!} 
                progress={progress!} 
                onStatusChange={(status) => setProgress({...progress!, status})} 
                onShowCert={() => setShowCertModal(true)}
              />
            </div>
          ) : currentLesson ? (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-2 py-0.5 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded text-[10px] font-bold uppercase tracking-[0.2em]">En curso</div>
                <div className="h-[1px] flex-grow bg-white/5"></div>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-12">
                {currentLesson.title}
              </h1>

              {currentLesson.videoUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-12 shadow-2xl border border-white/5 group relative">
                  <iframe
                    src={currentLesson.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  <div className="glass-card p-8 bg-slate-900/20 border-white/5">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="h-4 w-4 text-brand-red" />
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Resumen de la Lección</h2>
                    </div>
                    <div 
                      className="prose prose-invert prose-slate max-w-none prose-lg prose-headings:font-bold prose-headings:mt-8 prose-p:text-slate-400 prose-p:leading-relaxed prose-p:mb-6 prose-code:bg-slate-800 prose-code:p-1 prose-code:rounded prose-code:text-brand-red space-y-6"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card p-6 border-white/5">
                    <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-6">Acciones</h3>
                    <button 
                      onClick={() => toggleLessonCompletion(currentLesson.id)}
                      className={cn(
                        "w-full flex items-center justify-center py-4 rounded-xl font-bold text-sm transition-all shadow-xl active:scale-95",
                        progress?.completedLessons.includes(currentLesson.id)
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-brand-red text-white hover:bg-brand-red-hover red-glow"
                      )}
                    >
                      {progress?.completedLessons.includes(currentLesson.id) ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-3" />
                          Finalizada
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-3" />
                          Marcar Completa
                        </>
                      )}
                    </button>
                    
                    <div className="mt-8 border-t border-white/5 pt-6">
                       <h4 className="text-[10px] font-bold text-brand-red mb-4 uppercase">Recursos</h4>
                       <div className="flex flex-col gap-2">
                          <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-brand-red rounded-full"></div>
                             Guía-de-Referencia.pdf
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 text-center">
              <div className="w-20 h-20 bg-slate-900/40 rounded-3xl flex items-center justify-center mb-8 border border-white/5 backdrop-blur-xl transition-transform hover:rotate-12">
                <BookOpen className="h-10 w-10 text-brand-red opacity-80" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Comienza tu aprendizaje</h2>
              <p className="max-w-xs text-sm text-slate-400 leading-relaxed">Selecciona una lección del menú para desbloquear el contenido estructurado.</p>
            </div>
          )}
        </div>
        {progress && (
          <CertificateModal 
            isOpen={showCertModal} 
            onClose={() => setShowCertModal(false)} 
            progressId={progress.id} 
          />
        )}
      </div>
    </div>
  );
};

const ExamView: React.FC<{ exam: Exam, progress: Progress, onStatusChange: (status: 'completed' | 'enrolled') => void, onShowCert: () => void }> = ({ exam, progress, onStatusChange, onShowCert }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isRetaking, setIsRetaking] = useState(false);

  const handleSubmit = async () => {
    let correctCount = 0;
    exam.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / exam.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    setIsRetaking(false);

    if (finalScore >= exam.passingScore) {
      const now = new Date().toISOString();
      await courseService.updateProgress(progress.id, { 
        status: 'completed',
        completedAt: now 
      });
      onStatusChange('completed');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success('¡Felicidades! Has aprobado el curso.');
    } else {
      // If score is below passing and was previously completed, revoke completion
      if (progress.status === 'completed') {
        await courseService.updateProgress(progress.id, { 
          status: 'enrolled',
          completedAt: undefined 
        });
        onStatusChange('enrolled');
        toast.error('Has perdido la certificación. Necesitas aprobar de nuevo.');
      } else {
        toast.error('No has alcanzado la puntuación mínima. ¡Sigue intentando!');
      }
    }
  };

  if ((submitted || (progress.status === 'completed' && !submitted)) && !isRetaking) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-8 text-center">
        <div className={cn(
          "h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce",
          (submitted ? score >= exam.passingScore : true) ? "bg-green-100 text-green-600" : "bg-rose-100 text-rose-600"
        )}>
          {(submitted ? score >= exam.passingScore : true) ? <Award className="h-12 w-12" /> : <X className="h-12 w-12" />}
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          {submitted ? `Tu resultado: ${score}%` : '¡Curso Completado!'}
        </h2>
        <p className="text-slate-400 mb-10 text-lg">
          {progress.status === 'completed' || score >= exam.passingScore 
            ? 'Has demostrado dominio sobre este curso. Puedes ver tu diploma o realizar el examen de nuevo.' 
            : `Necesitas un ${exam.passingScore}% para aprobar. Revisa el contenido y vuelve a intentarlo.`}
        </p>
        
        <div className="flex flex-col gap-4">
          {(progress.status === 'completed' || score >= exam.passingScore) && (
            <div className="bg-white/5 p-8 rounded-3xl border border-dashed border-white/10">
              <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-4" />
              <p className="font-bold text-white mb-4">Certificado Desbloqueado</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={onShowCert}
                  className="bg-brand-red text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  VER MI DIPLOMA
                </button>
                <button 
                  onClick={() => { setSubmitted(false); setAnswers({}); setIsRetaking(true); }}
                  className="bg-white/5 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  REHACER EXAMEN
                </button>
              </div>
            </div>
          )}

          {submitted && score < exam.passingScore && (
            <button 
              onClick={() => { setSubmitted(false); setAnswers({}); setIsRetaking(true); }}
              className="bg-brand-red text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-red-hover transition-all"
            >
              Reintentar Examen
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-20 px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-white mb-2">{exam.title}</h1>
        <p className="text-slate-400">Completa todas las preguntas para finalizar el curso.</p>
        <div className="mt-6 flex items-center text-sm font-bold text-brand-red bg-brand-red/10 px-4 py-2 rounded-lg w-fit">
          Requisito: {exam.passingScore}% para aprobar
        </div>
      </div>

      <div className="space-y-12">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="bg-white/5 p-8 rounded-3xl border border-white/5">
            <span className="text-xs font-bold text-brand-red uppercase tracking-widest mb-4 block font-mono">Pregunta {idx + 1}</span>
            <p className="text-xl font-bold text-white mb-8 leading-snug">{q.text}</p>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [q.id]: i })}
                  className={cn(
                    "w-full p-4 text-left rounded-2xl border-2 transition-all font-medium",
                    answers[q.id] === i 
                      ? "bg-brand-red border-brand-red text-white shadow-[0_0_15px_rgba(255,0,76,0.3)]" 
                      : "bg-slate-800/40 border-white/5 text-slate-300 hover:border-brand-red/50 hover:text-white"
                  )}
                >
                  <span className="mr-3 opacity-50">{String.fromCharCode(65 + i)})</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 pb-12">
        <button
          onClick={handleSubmit}
          className="w-full bg-brand-red text-white py-5 rounded-2xl font-bold text-lg hover:bg-brand-red-hover transition-all shadow-xl shadow-brand-red/20"
        >
          Enviar Examen Final
        </button>
      </div>
    </div>
  );
};

export default CourseView;
