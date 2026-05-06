import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 text-white mb-4">
              <GraduationCap className="h-8 w-8 text-brand-red" />
              <span className="text-xl font-bold tracking-tight">Skilltour Academy</span>
            </div>
            <p className="text-slate-400 max-w-md">
              La plataforma de educación técnica líder, diseñada para transformar tu curiosidad en competencias laborales de alto impacto con el poder de la IA.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-brand-red transition-colors">Cursos</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-red transition-colors">Mi Progreso</Link></li>
              <li><Link to="/courses" className="hover:text-brand-red transition-colors">Certificados</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>soporte@skilltour.com</li>
              <li>+1 (829) 857 2943</li>
              <li>Santo Domingo, RD</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Skilltour Academy. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
