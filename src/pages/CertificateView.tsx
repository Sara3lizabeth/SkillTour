import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, ShieldCheck, Printer, Share2, Download, CheckCircle2 } from 'lucide-react';
import { courseService } from '../services/courseService';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Course, Progress } from '../types';

interface UserData {
  displayName: string;
  email: string;
}

const CertificateView: React.FC = () => {
  const { progressId } = useParams<{ progressId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [student, setStudent] = useState<UserData | null>(null);
  const [directorName, setDirectorName] = useState('Johan Academy');
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!progressId) return;

      try {
        // Fetch Progress
        const progDoc = await getDoc(doc(db, 'progress', progressId));
        if (!progDoc.exists()) {
          setError('Certificado no encontrado');
          setLoading(false);
          return;
        }
        const progData = { id: progDoc.id, ...progDoc.data() } as Progress;
        
        if (progData.status !== 'completed') {
          setError('El curso aún no ha sido completado');
          setLoading(false);
          return;
        }
        setProgress(progData);

        // Fetch Course
        const courseData = await courseService.getCourseById(progData.courseId);
        setCourse(courseData);

        // Fetch Student Data (Public or Private)
        const userDoc = await getDoc(doc(db, 'users', progData.userId));
        if (userDoc.exists()) {
          setStudent(userDoc.data() as UserData);
        }

        // Fetch Global Settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
        if (settingsDoc.exists() && settingsDoc.data().academicDirector) {
          setDirectorName(settingsDoc.data().academicDirector);
        }

      } catch (err) {
        console.error(err);
        setError('Error al cargar el certificado');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [progressId]);

  const handlePrint = () => {
    window.print();
  };

  const verificationUrl = window.location.href;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin"></div>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Validando Credenciales...</p>
        </div>
      </div>
    );
  }

  if (error || !course || !progress || !student) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Error de Verificación</h1>
          <p className="text-slate-400 mb-8">{error || 'Información incompleta'}</p>
          <Link to="/" className="bg-brand-red text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-red-hover transition-colors inline-block">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-5xl mx-auto space-y-8 print:space-y-0">
        
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-brand-red/10 p-2 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-brand-red" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Credencial Digital Verificada</p>
              <p className="text-slate-400 text-xs font-mono">HASH: {progressId?.substring(0, 12).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/5 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all border border-white/5 active:scale-95"
            >
              <Printer className="h-4 w-4" />
              Imprimir / Guardar PDF
            </button>
            <button className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-red-hover transition-all shadow-lg shadow-brand-red/20 active:scale-95">
              <Share2 className="h-4 w-4" />
              Compartir Logro
            </button>
          </div>
        </div>

        {/* Certificate Rendering */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          ref={certificateRef}
          className="relative bg-white aspect-[1.414/1] w-full shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden print:shadow-none print:w-[297mm] print:h-[210mm] print:mx-auto"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Base Frame SVG layer */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              backgroundImage: 'url(/assets/diplomas/certificate_frame.svg)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>

          <div className="relative h-full flex flex-col items-center justify-between p-20 text-center">
            
            {/* Header: Brand Identity */}
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#0A0C10] flex items-center justify-center rounded-xl rotate-45">
                  <Award className="h-7 w-7 text-brand-red -rotate-45" />
                </div>
                <div className="text-left">
                  <h4 className="text-[#0A0C10] font-black text-xl tracking-tighter leading-none">SKILLTOUR</h4>
                  <p className="text-brand-red font-bold text-[10px] uppercase tracking-[0.3em] leading-none mt-1">ACADEMY</p>
                </div>
              </div>
              <div className="h-px w-64 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col items-center justify-center -mt-8">
              <p className="text-slate-400 font-medium text-sm tracking-[0.4em] uppercase mb-10">Certificado de Finalización</p>
              
              <div className="space-y-2 mb-12">
                <p className="text-slate-500 italic font-serif text-lg">Se otorga con distinción el presente título a</p>
                <h1 className="text-7xl font-serif font-black text-[#0A0C10] tracking-tight py-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {student.displayName}
                </h1>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <p className="text-slate-500 font-medium leading-relaxed">
                  Por demostrar un dominio excepcional y completar con éxito todos los módulos requeridos, laboratorios prácticos y la evaluación final de alta complejidad en:
                </p>
                <h2 className="text-3xl font-black text-[#0A0C10] uppercase tracking-tight bg-slate-50 px-8 py-3 border-y border-slate-100">
                  {course.title}
                </h2>
              </div>
            </div>

            {/* Bottom Section: Verification & Signatures */}
            <div className="w-full flex items-end justify-between">
              
              {/* Validation Column */}
              <div className="text-left flex items-center gap-6">
                <div className="p-2 border-2 border-[#0A0C10] rounded-xl bg-white shadow-sm">
                  <QRCodeSVG 
                    value={verificationUrl} 
                    size={80} 
                    level="H" 
                    includeMargin={false}
                  />
                </div>
                <div>
                  <p className="text-[#0A0C10] text-[9px] font-black uppercase tracking-widest mb-1">Verificación Oficial</p>
                  <p className="text-slate-400 text-[10px] font-mono break-all max-w-[120px]">{progressId}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      {new Date(progress.completedAt || new Date()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Stamp */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-12">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full animate-spin-slow opacity-10" viewBox="0 0 100 100">
                    <path id="circlePath" fill="none" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    <text className="text-[8px] font-bold uppercase tracking-widest fill-[#0A0C10]">
                      <textPath xlinkHref="#circlePath">VERIFIED ACHIEVEMENT • SKILLTOUR ACADEMY • WORLD CLASS EDUCATION •</textPath>
                    </text>
                  </svg>
                  <div className="w-20 h-20 rounded-full border-4 border-brand-red flex items-center justify-center shadow-xl shadow-brand-red/10">
                    <div className="w-16 h-16 rounded-full border border-dashed border-brand-red/30 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-brand-red" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Column */}
              <div className="text-center w-48">
                <div className="h-16 flex items-end justify-center mb-2">
                  <span className="font-serif italic text-4xl text-[#0A0C10] opacity-80" style={{ fontFamily: "'Dancing Script', cursive" }}>
                    {directorName}
                  </span>
                </div>
                <div className="h-px bg-slate-300 w-full mb-2"></div>
                <p className="text-[#0A0C10] text-[9px] font-black uppercase tracking-[0.2em]">Dirección Académica</p>
                <p className="text-slate-400 text-[8px] font-medium tracking-widest mt-1 uppercase">Sello de Autenticidad</p>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Support Info */}
        <div className="text-center pb-12 print:hidden">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Este documento puede ser impreso o guardado como PDF para validación física.
          </p>
        </div>
      </div>
      
      {/* Styles for print and special fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
        
        @media print {
          body { visibility: hidden; background: white !important; }
          #root { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          [ref="certificateRef"], .print-section { 
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CertificateView;
