import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { GraduationCap, Mail, Lock, UserPlus, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      toast.success('¡Cuenta creada con éxito!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Error al registrarse: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-bg px-4">
      <div className="max-w-md w-full py-12">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 text-brand-red mb-6 group">
            <div className="p-2 bg-brand-red rounded-xl red-glow group-hover:scale-110 transition-transform">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-extrabold tracking-tighter text-white uppercase">SKILLTOUR</span>
          </Link>
          <h2 className="text-4xl font-black text-white tracking-tight">Únete</h2>
          <p className="mt-2 text-slate-400 font-medium">Forja tu futuro profesional hoy</p>
        </div>

        <div className="glass-card p-10 bg-slate-900/40 border-white/5">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Nombre Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red/50 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Dirección Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Contraseña de Acceso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center hover:bg-brand-red-hover transition-all red-glow disabled:opacity-50 active:scale-95"
            >
              <UserPlus className="h-5 w-5 mr-3" />
              {loading ? 'CREANDO...' : 'REGISTRARME'}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-bold text-brand-red hover:text-white transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
