import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Brain, Trophy, Users, Star, CheckCircle2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-deep-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-red/10 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-red/5 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-nav border border-white/5 mb-8 animate-pulse">
                <span className="w-2 h-2 bg-brand-red rounded-full shadow-[0_0_8px_#ff004c]"></span>
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] font-mono">Infraestructura Escalar Activa</span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-10 leading-[1.1]">
                DOMINA EL <span className="text-brand-red">FUTURO</span> DE LAS HABILIDADES
              </h1>
              <p className="text-lg leading-relaxed text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
                Plataforma de alto rendimiento diseñada para la maestría técnica. Contenido inmersivo en tecnología, mecánica y oficios críticos, optimizado con Inteligencia Artificial.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto rounded-xl bg-brand-red px-10 py-4 text-sm font-bold text-white shadow-2xl hover:bg-brand-red-hover transition-all transform hover:scale-105 active:scale-95 red-glow uppercase tracking-widest"
                >
                  Explorar Catálogo
                </Link>
                <Link to="/register" className="w-full sm:w-auto px-10 py-4 text-sm font-bold text-white hover:text-brand-red transition-all flex items-center justify-center gap-2 group uppercase tracking-widest">
                  Registro de Cadete <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-24">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="h-[1px] w-12 bg-slate-800"></div>
               <h2 className="text-[10px] font-bold text-brand-red uppercase tracking-[0.4em]">Propulsión Educativa</h2>
               <div className="h-[1px] w-12 bg-slate-800"></div>
            </div>
            <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Arquitectura diseñada para la eficiencia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div 
                whileHover={{ y: -10 }}
                className="glass-card p-10 border-white/5 bg-slate-900/20 group transition-all hover:border-brand-red/30"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red text-white red-glow transform group-hover:rotate-12 transition-transform">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Núcleo de IA Generativa</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">Lecciones dinámicas que se adaptan a tu ritmo, con síntesis de contenido y evaluaciones automatizadas de alta precisión.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -10 }}
                className="glass-card p-10 border-white/5 bg-slate-900/20 group transition-all hover:border-brand-red/30"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red text-white red-glow transform group-hover:rotate-12 transition-transform">
                  <Trophy className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Certificación de Rango</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">Créditos académicos verificables en blockchain que validan tus competencias técnicas ante la industria global inmediata.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -10 }}
                className="glass-card p-10 border-white/5 bg-slate-900/20 group transition-all hover:border-brand-red/30"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red text-white red-glow transform group-hover:rotate-12 transition-transform">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Ecosistema Aplicado</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">Entornos de simulación y laboratorios prácticos donde aplicas la teoría en casos de uso reales del mercado laboral.</p>
              </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="glass-card p-12 sm:p-20 border-brand-red/20 text-center relative overflow-hidden bg-slate-900/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-8 leading-tight">
              ¿ESTÁS LISTO PARA EL <span className="text-brand-red">SIGUIENTE NIVEL</span>?
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-400 mb-12 font-medium">
              Únete a la legión de profesionales que ya están redefiniendo sus industrias con nuestra metodología de aprendizaje.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center rounded-xl bg-brand-red px-12 py-5 text-sm font-bold text-white shadow-2xl hover:bg-brand-red-hover transition-all red-glow active:scale-95 uppercase tracking-widest"
            >
              INICIAR PROTOCOLO <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
