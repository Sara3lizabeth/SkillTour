import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Plus, 
  Book, 
  Users, 
  Settings, 
  BarChart, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Layout,
  RefreshCw
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import CourseEditor from './admin/CourseEditor';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminUsers from './admin/AdminUsers';
import { toast } from 'react-hot-toast';

import { seederService } from '../services/seederService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  const isActive = (path: string) => {
    if (path === '/admin') return location === '/admin' || location === '/admin/';
    return location.startsWith(path);
  };

  return (
    <div className="flex bg-deep-bg min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 hidden lg:block">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-6 h-0.5 bg-brand-red rounded-full"></span>
            <span className="text-[10px] font-mono font-bold text-brand-red uppercase tracking-widest">Master Panel</span>
          </div>
          <nav className="space-y-4">
            <Link 
              to="/admin" 
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-xl transition-all",
                isActive('/admin') 
                  ? "font-bold text-white bg-brand-red/10 border border-brand-red/20 red-glow" 
                  : "font-medium text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Book className="h-4 w-4 mr-3 text-brand-red" />
              Cursos
            </Link>
            <Link 
              to="/admin/users" 
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-xl transition-all",
                isActive('/admin/users') 
                  ? "font-bold text-white bg-brand-red/10 border border-brand-red/20 red-glow" 
                  : "font-medium text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Users className="h-4 w-4 mr-3" />
              Estudiantes
            </Link>
            <Link 
              to="/admin/analytics" 
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-xl transition-all",
                isActive('/admin/analytics') 
                  ? "font-bold text-white bg-brand-red/10 border border-brand-red/20 red-glow" 
                  : "font-medium text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <BarChart className="h-4 w-4 mr-3" />
              Reportes
            </Link>
          </nav>

          <div className="mt-20 pt-10 border-t border-white/5">
             <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-brand-red">
                   <Settings className="h-3 w-3" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Sistema v2.1</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Motor de IA activo y sincronizado con el núcleo docente.</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 lg:p-12 h-screen overflow-y-auto">
        <Routes>
          <Route index element={<CourseList />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="courses/new" element={<CourseEditor />} />
          <Route path="courses/edit/:id" element={<CourseEditor />} />
        </Routes>
      </main>
    </div>
  );
};

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Gestión Académica</h1>
          <p className="text-slate-400 mt-1">Crea, edita y organiza el contenido educativo de alto impacto.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              const confirm = window.confirm('¿Quieres generar los cursos automáticamente usando IA? Esto puede tardar varios minutos.');
              if(!confirm) return;
              const toastId = toast.loading('Sincronizando con el motor de IA...');
              try {
                await seederService.seedAll((msg) => {
                  toast.loading(msg, { id: toastId });
                });
                toast.success('Contenido de fábrica generado con éxito', { id: toastId });
                fetchCourses();
              } catch(e) {
                toast.error('Error en la comunicación con la IA', { id: toastId });
              }
            }}
            className="flex items-center space-x-2 bg-white/5 text-brand-red border border-brand-red/20 px-6 py-3 rounded-xl font-bold text-xs hover:text-white hover:bg-brand-red transition-all uppercase tracking-widest active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generar IA</span>
          </button>
          <Link 
            to="/admin/courses/new"
            className="flex items-center space-x-2 bg-brand-red text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-brand-red-hover shadow-lg transition-all red-glow active:scale-95 uppercase tracking-widest"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Curso</span>
          </Link>
        </div>

      </div>

      <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-slate-900/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar curso en el almacén..." 
              className="w-full pl-11 pr-4 py-3 text-xs rounded-xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-brand-red bg-slate-900/40 text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f141e] text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
              <tr>
                <th className="px-8 py-5">Identificador de Curso</th>
                <th className="px-8 py-5">Vertical</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest font-bold">
                    Sincronizando base de datos...
                  </td>
                </tr>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="h-12 w-20 bg-slate-800 rounded-xl overflow-hidden mr-5 border border-white/5 relative shrink-0">
                          <img src={course.thumbnail} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                        </div>
                        <span className="font-bold text-white tracking-tight">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{course.category}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                        course.isPublished 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-slate-800 text-slate-500 border-white/5"
                      )}>
                        {course.isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                          className="p-3 text-slate-500 hover:text-brand-red bg-white/[0.02] border border-white/5 rounded-xl transition-all active:scale-90"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-3 text-slate-500 hover:text-rose-500 bg-white/[0.02] border border-white/5 rounded-xl transition-all active:scale-90 text-rose-500/60">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest font-bold">
                    Filtro vacío: No hay cursos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
