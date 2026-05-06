import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, GraduationCap, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center red-glow">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SKILLTOUR</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/courses" className="text-slate-400 hover:text-white px-1 py-1 text-sm font-medium transition-colors">
                Catálogo
              </Link>
              {user && (
                <Link to="/dashboard" className="text-slate-400 hover:text-white px-1 py-1 text-sm font-medium transition-colors">
                  Mis Cursos
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-slate-400 hover:text-white px-1 py-1 text-sm font-medium transition-colors flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-3 group">
                  <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-xs font-bold text-white group-hover:text-brand-red transition-all">
                      {profile?.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-brand-red uppercase tracking-widest font-mono">
                      {profile?.role || 'Estudiante'}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 overflow-hidden transition-all group-hover:border-brand-red/50">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-500 group-hover:text-brand-red transition-all" />
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-brand-red transition-colors bg-white/5 rounded-lg border border-white/5"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-red text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-red-hover transition-all red-glow"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
