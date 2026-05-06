import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  GripVertical, 
  Trash2, 
  Type, 
  Video, 
  Image as ImageIcon, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  Trophy
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { aiService } from '../../services/aiService';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Course, Module, Lesson } from '../../types';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CourseEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    level: 'beginner',
    category: '',
    thumbnail: '',
    isPublished: false
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const loadCourse = async () => {
        const data = await courseService.getCourseById(id);
        if (data) {
          setCourse(data);
          const mods = await courseService.getModules(id);
          setModules(mods);
          
          const lessonMap: Record<string, Lesson[]> = {};
          for (const mod of mods) {
            const modLessons = await courseService.getLessons(id, mod.id);
            lessonMap[mod.id] = modLessons;
          }
          setLessons(lessonMap);
        }
      };
      loadCourse();
    }
  }, [id]);

  const handleSaveCourse = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (id) {
        await courseService.updateCourse(id, course);
        toast.success('Curso actualizado');
      } else {
        const newId = await courseService.createCourse({
          ...course as any,
          instructorId: user.uid,
        });
        navigate(`/admin/courses/edit/${newId}`);
        toast.success('Curso creado');
      }
    } catch (error) {
      toast.error('Error al guardar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!id) return;
    const title = prompt('Nombre del módulo:');
    if (!title) return;
    
    try {
      await courseService.addModule(id, {
        courseId: id,
        title,
        order: modules.length
      });
      const mods = await courseService.getModules(id);
      setModules(mods);
    } catch (error) {
      toast.error('Error al añadir módulo');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!id) return;
    const title = prompt('Nombre de la lección:');
    if (!title) return;
    
    try {
      await courseService.addLesson(id, moduleId, {
        courseId: id,
        moduleId,
        title,
        content: '',
        videoUrl: '',
        order: (lessons[moduleId]?.length || 0)
      });
      const modLessons = await courseService.getLessons(id, moduleId);
      setLessons({ ...lessons, [moduleId]: modLessons });
    } catch (error) {
      toast.error('Error al añadir lección');
    }
  };

  const handleGenerateAIContent = async (moduleId: string, lessonId: string, lessonTitle: string) => {
    setIsGenerating(lessonId);
    try {
      const content = await aiService.generateLessonContent(course.title || '', lessonTitle);
      // In a real app, we would update the lesson in DB
      toast.success('Contenido generado por IA');
      // Update local state for immediate feedback (simplified)
      setLessons(prev => ({
        ...prev,
        [moduleId]: prev[moduleId].map(l => l.id === lessonId ? { ...l, content } : l)
      }));
    } catch (error) {
      toast.error('Error con la IA');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-10">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center">
          <button onClick={() => navigate('/admin')} className="p-3 mr-6 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-all active:scale-90">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-[1px] bg-brand-red"></span>
              <span className="text-[10px] font-mono font-bold text-brand-red uppercase tracking-widest">Editor Maestro</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{id ? 'Editar Curso' : 'Configurar Nuevo Curso'}</h1>
          </div>
        </div>
        <button
          onClick={handleSaveCourse}
          disabled={loading}
          className="bg-brand-red text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg hover:bg-brand-red-hover transition-all red-glow active:scale-95 text-sm uppercase tracking-widest"
        >
          <Save className="h-4 w-4 mr-3" />
          {loading ? 'MODIFICANDO...' : 'PUBLICAR CAMBIOS'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10 border-white/5 bg-slate-900/20">
            <h3 className="text-xs font-bold mb-8 text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <Type className="h-4 w-4 text-brand-red" />
              Metadatos del Curso
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Nombre del Programa</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 rounded-xl border border-white/5 focus:ring-2 focus:ring-brand-red/50 bg-slate-900/40 text-white placeholder-slate-600 outline-none transition-all shadow-inner"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="Ej: Ingenería del Software con IA"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Sinopsis Ejecutiva</label>
                <textarea
                  className="w-full px-5 py-4 rounded-xl border border-white/5 focus:ring-2 focus:ring-brand-red/50 bg-slate-900/40 text-white placeholder-slate-600 outline-none transition-all h-32 resize-none shadow-inner"
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Describe los objetivos clave de aprendizaje..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Vertical / Categoría</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-xl border border-white/5 focus:ring-2 focus:ring-brand-red/50 bg-slate-900/40 text-white placeholder-slate-600 outline-none transition-all shadow-inner"
                    value={course.category}
                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                    placeholder="Ej: Desarrollo Web"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Nivel de Dificultad</label>
                  <select
                    className="w-full px-5 py-4 rounded-xl border border-white/5 focus:ring-2 focus:ring-brand-red/50 bg-slate-900/40 text-white outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    value={course.level}
                    onChange={(e) => setCourse({ ...course, level: e.target.value as any })}
                  >
                    <option value="beginner">Principiante (Nivel 1)</option>
                    <option value="intermediate">Intermedio (Nivel 5)</option>
                    <option value="expert">Experto (Nivel 10)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum */}
          {id && (
            <>
              <div className="glass-card p-10 border-white/5 bg-slate-900/20">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-brand-red" />
                  Estructura Académica
                </h3>
                <button 
                  onClick={handleAddModule}
                  className="text-[10px] font-bold text-brand-red hover:text-white flex items-center uppercase tracking-widest transition-colors bg-brand-red/10 px-4 py-2 rounded-lg border border-brand-red/20"
                >
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Nuevo Módulo
                </button>
              </div>

              <div className="space-y-8">
                {modules.map((mod) => (
                  <div key={mod.id} className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20 shadow-xl">
                    <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center">
                        <GripVertical className="h-4 w-4 text-slate-600 mr-2" />
                        <span className="font-bold text-white tracking-tight">{mod.title}</span>
                      </div>
                      <button 
                        onClick={() => handleAddLesson(mod.id)}
                        className="text-[10px] font-bold bg-white/5 text-slate-400 border border-white/5 px-4 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                      >
                        + Lección
                      </button>
                    </div>
                    <div className="p-6 space-y-3">
                      {lessons[mod.id]?.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-brand-red/30 transition-all group">
                          <div className="flex items-center overflow-hidden">
                            <FileText className="h-4 w-4 text-brand-red mr-3 shrink-0 opacity-60" />
                            <span className="text-xs font-medium text-slate-300 truncate">{lesson.title}</span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button 
                              onClick={() => handleGenerateAIContent(mod.id, lesson.id, lesson.title)}
                              disabled={isGenerating === lesson.id}
                              className="p-2.5 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors disabled:opacity-50 border border-brand-red/10"
                              title="Enganchar IA"
                            >
                              <Sparkles className={cn("h-4 w-4", isGenerating === lesson.id && "animate-pulse")} />
                            </button>
                            <button className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors border border-white/5">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!lessons[mod.id] || lessons[mod.id].length === 0) && (
                        <div className="text-center py-6 text-[10px] font-mono text-slate-600 uppercase tracking-widest italic font-bold">
                          Fase sin contenido cargado
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-10 border-white/5 bg-slate-900/20">
              <div className="flex items-center justify-between mb-8 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-3">
                   <Trophy className="h-4 w-4 text-brand-red" />
                   Certificación IA
                </div>
                <button 
                  onClick={async () => {
                    if(!id) return;
                    setIsGenerating('exam');
                    try {
                      const questions = await aiService.generateExamQuestions(course.title || '');
                      const examData = {
                        courseId: id,
                        title: `Evaluación de Maestría: ${course.title}`,
                        questions,
                        passingScore: 80
                      };
                      await addDoc(collection(db, `courses/${id}/exams`), examData);
                      toast.success('Examen de certificación generado');
                    } catch(e) {
                      toast.error('Error en el motor de IA');
                    } finally {
                      setIsGenerating(null);
                    }
                  }}
                  disabled={isGenerating === 'exam'}
                  className="text-[10px] font-bold text-brand-red hover:text-white flex items-center uppercase tracking-widest transition-all glass-nav px-5 py-2.5 rounded-xl border border-brand-red/20 red-glow"
                >
                  <Sparkles className={cn("h-4 w-4 mr-2", isGenerating === 'exam' && "animate-pulse")} />
                  GENERAR EVALUACIÓN
                </button>
              </div>
              <p className="text-xs text-slate-500 italic leading-relaxed">El motor de IA analizará el título y la estructura para crear un examen de alta fidelidad que garantice el aprendizaje del estudiante.</p>
            </div>
            </>
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="glass-card p-8 border-white/5 bg-slate-900/20">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-8 font-mono border-b border-white/5 pb-4">Control de Acceso</h3>
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-white tracking-tight">Privacidad</span>
                   <span className="text-[9px] text-slate-500 uppercase mt-0.5">Visibilidad pública</span>
                </div>
                <button
                  onClick={() => setCourse({ ...course, isPublished: !course.isPublished })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-slate-950 focus:ring-2 focus:ring-brand-red ring-offset-2",
                    course.isPublished ? "bg-brand-red" : "bg-slate-800"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-xl",
                    course.isPublished ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">Activo Visual (Poster)</label>
                <div className="aspect-video bg-slate-950/40 rounded-2xl overflow-hidden mb-6 border border-white/5 relative group shadow-2xl">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} className="h-full w-full object-cover transform scale-105" alt="" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700">
                      <ImageIcon className="h-8 w-8 mb-3 opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sin Activo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                </div>
                <div className="relative">
                   <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                   <input
                     type="text"
                     placeholder="URL de imagen (Unsplash/S3)"
                     className="w-full pl-11 pr-4 py-3 text-xs rounded-xl border border-white/5 focus:ring-1 focus:ring-brand-red bg-slate-900/40 text-white outline-none placeholder-slate-600 transition-all font-mono"
                     value={course.thumbnail}
                     onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
