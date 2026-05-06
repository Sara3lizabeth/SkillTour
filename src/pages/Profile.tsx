import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Settings, 
  Camera, 
  Save, 
  Award, 
  ShieldCheck, 
  LayoutDashboard, 
  Upload, 
  Trash2, 
  Trophy, 
  Clock, 
  Eye, 
  Download 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { courseService } from '../services/courseService';
import { Course, Progress } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CertificateModal from '../components/CertificateModal';

interface EnrolledCourse extends Course {
  progress: Progress;
}

const Profile: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'academy' | 'diplomas'>(isAdmin ? 'academy' : 'profile');
  const [completedCourses, setCompletedCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
        if (settingsDoc.exists()) {
          setDirectorName(settingsDoc.data().academicDirector || '');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;
      try {
        const enrolled = await courseService.getUserEnrolledCourses(user.uid);
        const completed = enrolled.filter(c => c.progress.status === 'completed');
        setCompletedCourses(completed);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      }
    };
    fetchEnrolledCourses();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { 
      toast.error('La imagen es demasiado grande. El límite es 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        photoURL
      });
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        academicDirector: directorName,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Configuración de la academia actualizada');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Configuración</h1>
            <p className="text-slate-500 font-medium">Gestiona tu identidad y los parámetros de la academia</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                activeTab === 'profile' ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" : "text-slate-400 hover:text-white"
              )}
            >
              <User className="h-4 w-4" />
              Mi Perfil
            </button>
            <button
              onClick={() => setActiveTab('diplomas')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                activeTab === 'diplomas' ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" : "text-slate-400 hover:text-white"
              )}
            >
              <Award className="h-4 w-4" />
              Mis Diplomas
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('academy')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                  activeTab === 'academy' ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" : "text-slate-400 hover:text-white"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Académico
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 border-white/5 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12 pointer-events-none">
                <User className="h-64 w-64 text-white" />
              </div>

              <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-red/50">
                        {photoURL ? (
                          <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="h-10 w-10 text-slate-700" />
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 bg-brand-red p-2.5 rounded-xl shadow-lg border border-white/10 hover:scale-110 transition-transform active:scale-95"
                      >
                        <Upload className="h-4 w-4 text-white" />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                    {photoURL && (
                      <button 
                        type="button"
                        onClick={() => setPhotoURL('')}
                        className="text-[10px] text-slate-500 uppercase font-bold tracking-widest hover:text-rose-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar Foto
                      </button>
                    )}
                  </div>

                  <div className="flex-grow space-y-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all font-bold"
                          placeholder="Tu nombre real para certificados"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Email (Sólo lectura)</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-slate-600 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">URL Foto de Perfil (Opcional)</label>
                      <input
                        type="url"
                        value={photoURL.startsWith('data:') ? 'Imagen cargada localmente' : photoURL}
                        disabled={photoURL.startsWith('data:')}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="https://ejemplo.com/tu-foto.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-brand-red text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-brand-red-hover transition-all shadow-xl shadow-brand-red/20 disabled:opacity-50 active:scale-95"
                  >
                    <Save className="h-5 w-5" />
                    {loading ? 'Guardando...' : 'Actualizar Perfil'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'academy' && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 border-white/5 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12 pointer-events-none">
                <Award className="h-64 w-64 text-white" />
              </div>

              <form onSubmit={handleUpdateSettings} className="relative z-10 space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-500/10 rounded-2xl">
                    <ShieldCheck className="h-8 w-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Parametrización Académica</h3>
                    <p className="text-slate-500 text-sm">Estos datos se reflejarán automáticamente en todos los certificados emitidos</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Nombre de la Dirección Académica (Firma)</label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-serif text-lg italic"
                      placeholder="Ej: Johan Pérez Academy"
                      required
                    />
                  </div>
                  
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex items-start gap-4">
                    <div className="mt-1">
                      <Award className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-amber-500/80 text-sm font-medium leading-relaxed">
                        El nombre ingresado aparecerá en la sección de firma de los certificados digitales. Se recomienda usar el nombre completo del director o de la institución.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-xl shadow-amber-900/20 disabled:opacity-50 active:scale-95"
                  >
                    <Save className="h-5 w-5" />
                    {loading ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'diplomas' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-red/10 rounded-2xl">
                  <Trophy className="h-8 w-8 text-brand-red" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Mis Conquistas</h3>
                  <p className="text-slate-500 text-sm">Certificados oficiales emitidos por tus logros académicos</p>
                </div>
              </div>

              {completedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
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
              ) : (
                <div className="glass-card p-20 text-center border-dashed border-white/10">
                  <Award className="h-16 w-16 text-slate-700 mx-auto mb-6" />
                  <h4 className="text-xl font-bold text-white mb-2">Aún no tienes diplomas</h4>
                  <p className="text-slate-500 max-w-sm mx-auto font-medium">Completa tus cursos y aprueba las evaluaciones finales para desbloquear tus certificaciones oficiales.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

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

export default Profile;
