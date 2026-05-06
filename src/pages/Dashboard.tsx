import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { Course, Progress } from '../types';
import { cn } from '../lib/utils';
import { BookOpen, Trophy, Clock, ChevronRight, PlayCircle, Award, LayoutDashboard, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CertificateModal from '../components/CertificateModal';

interface EnrolledCourse extends Course {
  progress: Progress;
  totalLessons: number;
  totalExams: number;
}

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);

  const completedCourses = enrolledCourses.filter(c => c.progress.status === 'completed');
  const inProgressCourses = enrolledCourses.filter(c => c.progress.status !== 'completed');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;
      try {
        const allCourses = await courseService.getAllCourses();
        const enrollmentPromises = allCourses.map(async course => {
          const progress = await courseService.getProgress(user.uid, course.id);
          if (progress) {
            // Get counts (lesson counts could be cached ideally, but fetching for dashboard)
            const modules = await courseService.getModules(course.id);
            let lessonsCount = 0;
            for (const mod of modules) {
              const lessons = await courseService.getLessons(course.id, mod.id);
              lessonsCount += lessons.length;
            }
            const exams = await courseService.getExams(course.id);
            return { 
              ...course, 
              progress, 
              totalLessons: lessonsCount, 
              totalExams: exams.length 
            };
          }
          return null;
        });
        const results = await Promise.all(enrollmentPromises);
        setEnrolledCourses(results.filter(Boolean) as EnrolledCourse[]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-deep-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="bg-deep-bg min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-0.5 bg-brand-red rounded-full"></span>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-brand-red uppercase">Portal del Estudiante</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
            <LayoutDashboard className="h-8 w-8 mr-3 text-brand-red" />
            Hola, {profile?.displayName || user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-2">Continúa donde lo dejaste y alcanza tus metas hoy mismo.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 flex items-center border-white/5">
            <div className="h-12 w-12 rounded-2xl bg-brand-red/10 flex items-center justify-center mr-4">
              <BookOpen className="h-6 w-6 text-brand-red" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Cursos Inscritos</p>
              <p className="text-2xl font-bold text-white">{enrolledCourses.length}</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center border-white/5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Lecciones Listas</p>
              <p className="text-2xl font-bold text-white">
                {enrolledCourses.reduce((sum, c) => sum + (c.progress.completedLessons?.length || 0), 0)}
              </p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center border-white/5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mr-4">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Certificados</p>
              <p className="text-2xl font-bold text-white">
                {enrolledCourses.filter(c => c.progress.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
           <h2 className="text-xl font-bold text-white tracking-tight">Cursos en seguimiento</h2>
        </div>

        {inProgressCourses.length > 0 ? (
          <div className="space-y-6 mb-16">
            {inProgressCourses.map((course) => (
              <div key={course.id} className="glass-card p-6 border-white/5 hover:border-brand-red/30 transition-all group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 relative">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-mono font-bold text-brand-red uppercase tracking-widest mb-1">{course.category}</div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{course.title}</h3>
                      </div>
                      <span className="px-3 py-1 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                        En progreso
                      </span>
                    </div>

                    <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        <span>Progreso actual</span>
                        <span className="text-brand-red font-mono">
                          {(() => {
                            const totalSteps = course.totalLessons + (course.totalExams > 0 ? 1 : 0);
                            const completedSteps = (course.progress.completedLessons?.length || 0) + (course.progress.status === 'completed' ? 1 : 0);
                            return Math.round((completedSteps / (totalSteps || 1)) * 100);
                          })()}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-red h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,0,76,0.5)]"
                          style={{ 
                            width: `${(() => {
                              const totalSteps = course.totalLessons + (course.totalExams > 0 ? 1 : 0);
                              const completedSteps = (course.progress.completedLessons?.length || 0) + (course.progress.status === 'completed' ? 1 : 0);
                              return (completedSteps / (totalSteps || 1)) * 100;
                            })()}%` 
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                      <Link
                        to={`/courses/${course.id}`}
                        className="inline-flex items-center space-x-2 bg-brand-red text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-red-hover transition-all red-glow active:scale-95"
                      >
                        <PlayCircle className="h-4 w-4" />
                        <span>CONTINUAR CURSO</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : enrolledCourses.length > 0 && inProgressCourses.length === 0 ? (
          <div className="p-12 text-center glass-card border-white/5 mb-16">
            <p className="text-slate-500 font-medium italic">Has completado todos tus cursos actuales. ¡Excelente trabajo!</p>
          </div>
        ) : null}

        {/* Certificates Section */}
        {completedCourses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                 <Trophy className="h-6 w-6 text-amber-500" />
                 Mis Certificados
               </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
              {completedCourses.map((course) => (
                <div key={course.id} className="glass-card p-6 border-white/10 bg-white/[0.02] flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform">
                    <Award className="h-32 w-32 text-brand-red" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="text-[10px] font-bold text-brand-red uppercase tracking-[0.2em] mb-2">Credencial Académica</div>
                    <h3 className="text-2xl font-black text-white mb-2 leading-tight max-w-[80%]">{course.title}</h3>
                    <p className="text-slate-500 text-sm mb-8 flex items-center gap-2 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      Completado el {course.progress.completedAt ? format(new Date(course.progress.completedAt), 'PPP', { locale: es }) : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <button 
                      onClick={() => setSelectedCertId(course.progress.id)}
                      className="flex-grow flex items-center justify-center gap-2 bg-white/5 text-white px-6 py-3 rounded-xl font-bold text-sm border border-white/5 hover:bg-white/10 transition-all active:scale-95"
                    >
                      <Eye className="h-4 w-4" />
                      VER DIPLOMA
                    </button>
                    <button 
                      onClick={() => setSelectedCertId(course.progress.id)}
                      className="flex items-center justify-center gap-2 bg-brand-red text-white p-3 rounded-xl font-bold transition-all red-glow active:scale-95"
                      title="Descargar Certificado"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {enrolledCourses.length === 0 && (
          <div className="text-center py-24 glass-card border-dashed border-white/10">
            <BookOpen className="h-14 w-14 text-slate-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Tu aula está vacía</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto">Comienza tu viaje de aprendizaje hoy mismo explorando nuestra selección de cursos premium.</p>
            <Link to="/courses" className="bg-brand-red text-white px-10 py-4 rounded-xl font-bold hover:bg-brand-red-hover transition-all red-glow inline-block">
              EXPLORAR CATÁLOGO
            </Link>
          </div>
        )}

        {/* Certificate Modal */}
        <CertificateModal 
          isOpen={!!selectedCertId} 
          onClose={() => setSelectedCertId(null)} 
          progressId={selectedCertId || ''} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
