import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Search, Filter, BookOpen, Clock, Star, ArrowRight } from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { motion } from 'motion/react';

const CourseCatalog: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0a0c10] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-0.5 bg-brand-red rounded-full"></span>
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-brand-red uppercase">Academia Profesional</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Explora el <span className="text-brand-red">Catálogo</span></h1>
            <p className="text-slate-400 mt-2 max-w-lg">Contenido técnico de alto rendimiento curado por expertos y optimizado con IA.</p>
          </div>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="¿Qué quieres aprender hoy?"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-brand-red/50 bg-slate-900/40 backdrop-blur-xl text-white placeholder-slate-500 shadow-2xl transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -8 }}
                className="glass-card overflow-hidden group flex flex-col border-white/5 active:scale-95"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md",
                      course.level === 'beginner' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      course.level === 'intermediate' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      {course.level === 'beginner' ? 'Iniciación' : course.level === 'intermediate' ? 'Medio' : 'Experto'}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-center text-[10px] font-bold text-brand-red mb-2 uppercase tracking-[0.1em] font-mono">
                    {course.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 leading-tight tracking-tight">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-widest">
                      <BookOpen className="h-3.5 w-3.5 mr-2 text-brand-red" />
                      Diploma PRO
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
                      className="bg-slate-800/80 p-3 rounded-xl text-white hover:bg-brand-red transition-all active:scale-90 red-glow"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-card border-dashed">
            <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No encontramos cursos</h3>
            <p className="text-slate-500">Prueba con otros términos de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
