import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { seederService } from '../services/seederService';
import { Sparkles, Terminal, Database, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SystemInitializer: React.FC = () => {
  const { profile } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const checkAndSeed = async () => {
      // Priority seeding for the assigned admin or any admin
      if (profile?.role === 'admin' || profile?.email === 'clasesdejohan@gmail.com') {
        const needsSeed = await seederService.needsSeeding();
        if (needsSeed) {
          setIsSeeding(true);
          try {
            await seederService.seedAll((msg) => {
              setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-12));
            });
            setIsComplete(true);
            setTimeout(() => {
              setIsSeeding(false);
              window.location.reload(); // Refresh to show content
            }, 2000);
          } catch (err) {
            setLogs(prev => [...prev, `!!! ERROR CRÍTICO: ${err}`]);
          }
        }
      }
    };

    checkAndSeed();
  }, [profile]);

  if (!isSeeding) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0c10] flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-red/20 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-brand-red/10 blur-[150px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl relative"
      >
        <div className="glass-card p-10 border-brand-red/30 bg-slate-900/40 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-red/10 border border-brand-red/20 mb-8 animate-pulse">
            <Database className="h-3 w-3 text-brand-red" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] font-mono">Infraestructura Crítica</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
            {isComplete ? 'SISTEMA INICIALIZADO' : 'INICIALIZANDO ECOSISTEMA'}
          </h2>
          
          <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
            {isComplete 
              ? 'Todos los módulos técnicos han sido cargados y sincronizados con éxito. Redireccionando...' 
              : 'El motor de IA está generando 12 programas de formación profesional con lecciones y evaluaciones de alto impacto.'}
          </p>

          <div className="space-y-4 mb-10">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-red shadow-[0_0_15px_#ff004c]"
                animate={isComplete ? { width: '100%' } : { width: ['0%', '100%'] }}
                transition={isComplete ? { duration: 0.5 } : { duration: 10, repeat: Infinity }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest">
              <span>Sync Protocol</span>
              <span>{isComplete ? '100%' : 'En Progreso'}</span>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-6 font-mono text-[10px] text-left h-40 overflow-y-auto border border-white/5 custom-scrollbar">
            <div className="flex items-center gap-2 text-brand-red mb-3">
              <Terminal className="h-3 w-3" />
              <span className="uppercase font-bold tracking-widest">System Log</span>
            </div>
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-slate-400 mb-1"
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {isComplete && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-emerald-400 mt-2 font-bold"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>NÚCLEO DOCENTE ACTIVO</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-brand-red/50 font-bold uppercase tracking-[0.4em]">Por favor, no cierre esta ventana</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemInitializer;
