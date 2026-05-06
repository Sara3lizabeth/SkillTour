import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, ShieldCheck, Printer, X, Download, Share2 } from 'lucide-react';
import { courseService } from '../services/courseService';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Course, Progress } from '../types';
import { cn } from '../lib/utils';

interface UserData {
  displayName: string;
  email: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressId: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, progressId }) => {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [student, setStudent] = useState<UserData | null>(null);
  const [directorName, setDirectorName] = useState('Johan Academy');
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !progressId) return;
      setLoading(true);
      try {
        const progDoc = await getDoc(doc(db, 'progress', progressId));
        if (progDoc.exists()) {
          const progData = { id: progDoc.id, ...progDoc.data() } as Progress;
          setProgress(progData);
          
          const [courseData, userDoc] = await Promise.all([
            courseService.getCourseById(progData.courseId),
            getDoc(doc(db, 'users', progData.userId))
          ]);
          
          setCourse(courseData);
          if (userDoc.exists()) setStudent(userDoc.data() as UserData);

          // Fetch Global Settings
          const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
          if (settingsDoc.exists() && settingsDoc.data().academicDirector) {
            setDirectorName(settingsDoc.data().academicDirector);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, progressId]);

  const handlePrint = () => {
    const printContent = certificateRef.current;
    if (!printContent) return;
    window.print();
  };

  const verificationUrl = `${window.location.origin}/certificate/${progressId}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a0c10]/95 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-red/10 rounded-lg">
                  <Award className="h-5 w-5 text-brand-red" />
                </div>
                <h3 className="text-white font-bold">Vista Previa de Credencial</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint}
                  className="hidden sm:flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors border border-white/5"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / PDF
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-auto p-4 sm:p-10 bg-slate-950/50">
              {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Generando Documento...</p>
                </div>
              ) : (
                <div 
                  ref={certificateRef}
                  className="relative bg-white aspect-[1.414/1] w-full shadow-2xl overflow-hidden print:w-[297mm] print:h-[210mm] mx-auto rounded-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {/* Reuse the exactly same design from previous CertificateView */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ 
                      backgroundImage: 'url(/assets/diplomas/certificate_frame.svg)',
                      backgroundSize: '100% 100%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  ></div>

                  <div className="relative h-full flex flex-col items-center justify-between p-12 sm:p-20 text-center text-[#0A0C10]">
                    <div className="flex flex-col items-center mt-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#0A0C10] flex items-center justify-center rounded-xl rotate-45">
                          <Award className="h-6 w-6 text-brand-red -rotate-45" />
                        </div>
                        <div className="text-left font-sans">
                          <h4 className="font-black text-lg tracking-tighter leading-none">SKILLTOUR</h4>
                          <p className="text-brand-red font-bold text-[8px] uppercase tracking-[0.3em] leading-none mt-1">ACADEMY</p>
                        </div>
                      </div>
                      <div className="h-px w-48 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                    </div>

                    <div className="flex-grow flex flex-col items-center justify-center -mt-4">
                      <p className="text-slate-400 font-bold text-[10px] tracking-[0.4em] uppercase mb-6">Certificado de Finalización</p>
                      
                      <div className="space-y-1 mb-8">
                        <p className="text-slate-500 italic font-serif text-base">Se otorga con distinción el presente título a</p>
                        <h1 className="text-5xl sm:text-6xl font-serif font-black tracking-tight py-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {student?.displayName}
                        </h1>
                      </div>

                      <div className="max-w-xl mx-auto space-y-4">
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                          Por demostrar un dominio excepcional y completar con éxito todos los módulos requeridos y la evaluación final de alta complejidad en:
                        </p>
                        <h2 className="text-2xl font-black uppercase tracking-tight bg-slate-50 px-6 py-2 border-y border-slate-100">
                          {course?.title}
                        </h2>
                      </div>
                    </div>

                    <div className="w-full flex items-end justify-between">
                      <div className="text-left flex items-center gap-4">
                        <div className="p-1.5 border-2 border-[#0A0C10] rounded-lg bg-white">
                          <QRCodeSVG value={verificationUrl} size={60} level="H" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">Verificación Oficial</p>
                          <p className="text-slate-400 text-[9px] font-mono">{progressId.substring(0, 16)}...</p>
                        </div>
                      </div>

                      <div className="absolute left-1/2 -translate-x-1/2 bottom-8">
                        <div className="w-16 h-16 rounded-full border-4 border-brand-red flex items-center justify-center">
                          <ShieldCheck className="h-7 w-7 text-brand-red" />
                        </div>
                      </div>

                      <div className="text-center w-40">
                        <div className="h-12 flex items-end justify-center mb-1">
                          <span className="font-serif italic text-3xl opacity-80" style={{ fontFamily: "'Dancing Script', cursive" }}>
                            {directorName}
                          </span>
                        </div>
                        <div className="h-px bg-slate-300 w-full mb-1"></div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em]">Dirección Académica</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Mobile Actions) */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02] sm:hidden">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-brand-red text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-brand-red/20 active:scale-95"
              >
                <Printer className="h-5 w-5" />
                Imprimir o Guardar PDF
              </button>
            </div>
          </motion.div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
            @media print {
              body * { visibility: hidden; }
              #root { display: none; }
              .fixed { position: static !important; display: block !important; }
              [ref="certificateRef"] { 
                visibility: visible !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                border: none !important;
                background: white !important;
              }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;
