import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { GraduationCap, Mail, Lock, LogIn, Chrome } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Error al iniciar sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('¡Sesión iniciada con éxito!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Error con Google: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-bg px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 text-brand-red mb-6 group">
            <div className="p-2 bg-brand-red rounded-xl red-glow group-hover:scale-110 transition-transform">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-extrabold tracking-tighter text-white">SKILLTOUR</span>
          </Link>
          <h2 className="text-4xl font-black text-white tracking-tight">¡Hola!</h2>
          <p className="mt-2 text-slate-400 font-medium">Panel de acceso para estudiantes</p>
        </div>

        <div className="glass-card p-10 bg-slate-900/40 border-white/5">
          <form onSubmit={handleEmailLogin} className="space-y-6">
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
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Contraseña Segura</label>
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
              <LogIn className="h-5 w-5 mr-3" />
              {loading ? 'INGRESANDO...' : 'ENTRAR'}
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="px-4 bg-transparent text-slate-500">Acceso Rápido</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center bg-white/5 border border-white/5 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all shadow-sm active:scale-95"
            >
              <Chrome className="h-5 w-5 mr-3 text-brand-red" />
              Ingresar con Google
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-bold text-brand-red hover:text-white transition-colors">
              Regístrate ahora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
