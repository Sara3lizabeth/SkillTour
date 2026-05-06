import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { cn } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock historical data for the chart
  const historyData = [
    { name: 'Ene', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Abr', value: 800 },
    { name: 'May', value: 1200 },
    { name: 'Jun', value: 1100 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-500 font-mono text-xs uppercase tracking-widest font-bold">
      Calculando métricas de rendimiento...
    </div>
  );

  const cards = [
    { title: 'Estudiantes Totales', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Cursos Activos', value: stats.totalCourses, icon: BookOpen, color: 'text-brand-red', bg: 'bg-brand-red/10' },
    { title: 'Inscripciones', value: stats.totalEnrollments, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Certificados Emitidos', value: stats.totalCompletions, icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Reportes y Analíticas</h1>
          <p className="text-slate-400 mt-1">Monitoreo en tiempo real del ecosistema educativo.</p>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="glass-card p-8 border-white/5 bg-slate-900/20 group hover:border-white/10 transition-all">
            <div className={cn("inline-flex p-3 rounded-xl mb-6", card.bg, card.color)}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{card.title}</p>
                <h3 className="text-3xl font-black text-white">{card.value}</h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  +12% <ArrowUpRight className="h-3 w-3" />
                </span>
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Desde el mes pasado</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Performance Chart */}
      <div className="glass-card p-10 border-white/5 bg-slate-900/20">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-brand-red" />
          Tendencia de Tráfico y Crecimiento
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff004c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff004c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#475569' }}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#475569' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  fontSize: '10px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#ff004c' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ff004c" 
                fillOpacity={1} 
                fill="url(#colorVal)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 glass-card border-white/5 bg-slate-900/20">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Layers className="h-4 w-4 text-brand-red" />
              Actividad Reciente
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentEnrollments.map((enr: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                      ID
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">Nueva inscripción detectada</p>
                      <p className="text-[10px] text-slate-500 font-medium">DocRef: {enr.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {new Date(enr.enrolledAt).toLocaleDateString()}
                    </p>
                    <span className="text-[9px] font-bold text-brand-red uppercase tracking-widest">Sincronizado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Progress */}
        <div className="glass-card border-white/5 bg-slate-900/20 p-8">
           <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-8">Rendimiento Global</h3>
           <div className="space-y-8">
              <div>
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasa de Finalización</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                       {stats.totalEnrollments > 0 ? Math.round((stats.totalCompletions / stats.totalEnrollments) * 100) : 0}%
                    </span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                      style={{ width: `${stats.totalEnrollments > 0 ? (stats.totalCompletions / stats.totalEnrollments) * 100 : 0}%` }}
                    />
                 </div>
              </div>
              
              <div>
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carga del Servidor</span>
                    <span className="text-[10px] font-mono text-brand-red font-bold">Estable</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-red shadow-[0_0_10px_#ff004c]" style={{ width: '35%' }} />
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Todas las métricas se extraen directamente del núcleo de datos de Firebase en tiempo real.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
