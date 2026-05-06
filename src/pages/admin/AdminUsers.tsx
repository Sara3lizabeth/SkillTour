import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  CheckCircle2,
  X,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { courseService } from '../../services/courseService';
import { UserProfile, Progress, Course } from '../../types';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<(Progress & { course?: Course })[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Error al cargar la base de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (uid: string, currentRole: 'admin' | 'student') => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await adminService.updateUserRole(uid, newRole);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast.success(`Rol de usuario actualizado a ${newRole}`);
    } catch (error) {
      toast.error('No se pudo actualizar el rol');
    }
  };

  const viewUserProgress = async (user: UserProfile) => {
    setSelectedUser(user);
    setLoadingProgress(true);
    try {
      const progress = await adminService.getUserProgress(user.uid);
      const fullProgress = await Promise.all(progress.map(async (p) => {
        const course = await courseService.getCourseById(p.courseId);
        return { ...p, course: course || undefined };
      }));
      setUserProgress(fullProgress);
    } catch (error) {
      toast.error('Error al cargar el progreso del usuario');
    } finally {
      setLoadingProgress(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Registro de Estudiantes</h1>
          <p className="text-slate-400 mt-1">Gestión centralizada de perfiles y permisos de usuario.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por email o nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-11 pr-4 py-3 text-xs rounded-xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-brand-red bg-slate-900/40 text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f141e] text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
              <tr>
                <th className="px-8 py-5">Perfil de Usuario</th>
                <th className="px-8 py-5">Credencial</th>
                <th className="px-8 py-5">Rango</th>
                <th className="px-8 py-5">Fecha Alta</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest font-bold">
                    Escaneando registros de usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 mr-4 overflow-hidden flex items-center justify-center shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-white tracking-tight leading-none mb-1">
                            {user.displayName || 'Usuario Sin Nombre'}
                          </span>
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none">
                            UID: {user.uid.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Mail className="h-3 w-3 text-brand-red" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all",
                        user.role === 'admin' 
                          ? "bg-brand-red/10 text-brand-red border-brand-red/20" 
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500 font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => viewUserProgress(user)}
                          className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          Ver Progreso
                        </button>
                        <button 
                           onClick={() => handleRoleToggle(user.uid, user.role)}
                           className="p-2 text-slate-600 hover:text-white transition-all"
                           title="Cambiar Rango"
                        >
                           <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest font-bold">
                    No se encontraron registros para "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* User Progress Side Panel */}
      {selectedUser && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#0a0c10] border-l border-white/5 shadow-2xl z-50 animate-in slide-in-from-right duration-300">
          <div className="h-full flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Expediente Académico</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{selectedUser.displayName || selectedUser.email}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-500 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8">
              {loadingProgress ? (
                <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-600 uppercase tracking-widest animate-pulse">
                  Extrayendo registros de Firebase...
                </div>
              ) : userProgress.length > 0 ? (
                <div className="space-y-6">
                  {userProgress.map((p) => (
                    <div key={p.id} className="glass-card p-6 border-white/5 bg-white/[0.02]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-brand-red opacity-50" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-snug">{p.course?.title || 'Curso Externo'}</h4>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Enrolado: {new Date(p.enrolledAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                          p.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                        )}>
                          {p.status}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Lecciones completadas</span>
                           <span className="text-[9px] font-mono text-white">{p.completedLessons.length}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-brand-red red-glow" style={{ width: p.status === 'completed' ? '100%' : '30%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-600">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <ChevronRight className="h-5 w-5 opacity-20" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sin inscripciones activas</p>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-white/5 bg-slate-900/10">
               <button className="w-full py-4 bg-brand-red text-white text-[10px] font-bold uppercase tracking-widest rounded-xl red-glow shadow-xl active:scale-95 transition-all">
                  Generar Reporte PDF
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
