import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Cpu,
  PlayCircle,
  BarChart3,
  Settings,
  Bot,
  Sparkles,
  Send,
  Bell,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Code2,
  X,
  Zap,
  TrendingUp,
  Search,
  Filter,
  Server,
  Sliders,
  Database
} from 'lucide-react';
import Chart from 'chart.js/auto';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({
    total_executions: 0,
    total_success: 0,
    total_failed: 0,
    success_rate: 0,
    hours_saved: 0
  });
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copilotInput, setCopilotInput] = useState('');

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Busca dados da API
  const fetchData = async () => {
    try {
      const [resMetrics, resLogs] = await Promise.all([
        axios.get(`${API_BASE}/dashboard/summary`),
        axios.get(`${API_BASE}/logs/`)
      ]);
      setMetrics(resMetrics.data);
      setLogs(resLogs.data);
    } catch (error) {
      console.error("Erro ao buscar dados do Dashboard:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Inicialização e atualização do Gráfico
  useEffect(() => {
    if (activeTab === 'dashboard' && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [
            {
              label: 'Sucessos',
              data: [120, 190, 450, 680, 520, metrics.total_success || 310],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Falhas',
              data: [5, 2, 12, 8, 4, metrics.total_failed || 1],
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.05)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
            y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } }
          }
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [metrics, activeTab]);

  // Ação de Self-Healing
  const handleSelfHealing = async () => {
    if (!selectedLog) return;
    setFixing(true);
    try {
      await axios.post(`${API_BASE}/logs/self-healing/apply-fix`, {
        log_id: selectedLog.id,
        corrected_code: selectedLog.suggested_fix || "Patch aplicado com sucesso."
      });

      setSuccessBanner(`⚡ Self-Healing Aplicado! O robô ${selectedLog.robot_name} foi corrigido e reexecutado com sucesso.`);

      fetchData();

      setTimeout(() => {
        setSuccessBanner('');
        setSelectedLog(null);
      }, 2200);

    } catch (error) {
      console.error("Erro ao aplicar Self-Healing:", error);
      alert("Falha ao aplicar a correção autônoma. Verifique se o backend está ativo.");
    } finally {
      setFixing(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    (log.robot_name && log.robot_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.process_code && log.process_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.status && log.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-[#0b0f19] text-gray-200 font-sans overflow-hidden">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo & Header Sidebar */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-gray-800 mb-6">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">Orchestrator</h1>
              <span className="text-xs text-indigo-400 font-medium tracking-wider">AI POWERED</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${activeTab === 'dashboard'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('robots')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${activeTab === 'robots'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Cpu className="w-4 h-4" /> Robots
            </button>
            <button
              onClick={() => setActiveTab('executions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${activeTab === 'executions'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <PlayCircle className="w-4 h-4" /> Executions
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${activeTab === 'metrics'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <BarChart3 className="w-4 h-4" /> Metrics & AI Insights
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${activeTab === 'settings'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </nav>
        </div>

        {/* AI Copilot Card */}
        <div className="bg-gray-900/80 border border-indigo-500/30 rounded-xl p-3.5 mt-auto">
          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Copilot Assistant
          </div>
          <p className="text-xs text-gray-400 mb-3">Solicite diagnósticos de logs ou otimização de fila ao agente de IA.</p>
          <div className="relative">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="Ex: Otimizar fila..."
              className="w-full bg-gray-800 border border-gray-700 text-xs rounded-lg pl-2.5 pr-8 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button className="absolute right-1.5 top-1.5 p-1 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">

        {/* Top Header */}
        <header className="h-16 bg-[#111827]/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white capitalize">{activeTab} Control Center</h2>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> System Operational
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-indigo-500/30"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Synchronize
            </button>
            <div className="h-6 w-px bg-gray-800"></div>
            <button className="relative text-gray-400 hover:text-white transition">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-gray-800"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white border border-indigo-400/30">
                AI
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Admin Operator</p>
                <p className="text-gray-400">admin@orchestrator.ai</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Container Condicional por Aba */}
        <main className="p-6 space-y-6">

          {/* ABA DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-400">TOTAL EXECUTIONS</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Activity className="w-4 h-4" /></div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-2xl font-bold text-white">{metrics.total_executions}</h3>
                    <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +12.4% este mês
                    </span>
                  </div>
                </div>

                <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-400">SUCCESS RATE</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-2xl font-bold text-white">{metrics.success_rate}%</h3>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.success_rate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-400">FAILED DETECTED</span>
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-2xl font-bold text-rose-400">{metrics.total_failed}</h3>
                    <span className="text-xs text-gray-400 mt-1 inline-block">Demandam atenção do Self-Healing</span>
                  </div>
                </div>

                <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-400">SAVED HOURS (AI)</span>
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Clock className="w-4 h-4" /></div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-2xl font-bold text-white">{metrics.hours_saved} hrs</h3>
                    <span className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3" /> Eficiência otimizada por IA
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts & Robot Health Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Execution Metrics & AI Anomalies</h3>
                      <p className="text-xs text-gray-400">Desempenho de execuções em tempo real</p>
                    </div>
                    <select className="bg-gray-800 text-xs border border-gray-700 text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none">
                      <option>Últimas 24h</option>
                      <option>Últimos 7 dias</option>
                    </select>
                  </div>
                  <div className="h-64 relative">
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>

                <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col">
                  <h3 className="text-sm font-semibold text-white mb-1">Robot Nodes Status</h3>
                  <p className="text-xs text-gray-400 mb-4">Monitoramento de carga e saúde técnica</p>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-64">
                    <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800/80">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-white">RPA-FINANCE-01</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">RUNNING</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                        <span>CPU: 42%</span>
                        <span>RAM: 1.2 GB</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800/80">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-white">RPA-LOGISTICS-02</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">RUNNING</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                        <span>CPU: 18%</span>
                        <span>RAM: 850 MB</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800/80">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-white">RPA-HR-ONBOARDING</span>
                        <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-medium">ATTENTION</span>
                      </div>
                      <p className="text-[11px] text-rose-400/90 mt-1">Anomalia detectada em logs recentes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Recent Execution Logs & AI Inspector</h3>
                    <p className="text-xs text-gray-400">Histórico em tempo real integrado com diagnóstico preditivo</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar logs..."
                        className="bg-gray-800 border border-gray-700 text-xs rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-gray-500 focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2" />
                    </div>
                    <button className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Filtrar
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-gray-900/50 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                      <tr>
                        <th className="p-3.5 pl-5">Robô / Processo</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Duração</th>
                        <th className="p-3.5 pr-5">Ações / Diagnóstico IA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-800/30 transition">
                          <td className="p-3.5 pl-5">
                            <div className="font-semibold text-white">{log.robot_name}</div>
                            <div className="text-[11px] text-gray-400">{log.process_code}</div>
                          </td>
                          <td className="p-3.5">
                            {log.robot_name && log.robot_name.includes('(Self-Healed)') ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1 shadow-sm">
                                <Zap className="w-3 h-3 text-purple-400" /> SELF-HEALED
                              </span>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${log.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                {log.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-gray-400">{log.execution_time_seconds}s</td>
                          <td className="p-3.5 pr-5">
                            {log.status === 'FAILED' ? (
                              <button
                                onClick={() => {
                                  setSuccessBanner('');
                                  setSelectedLog(log);
                                }}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1.5"
                              >
                                <Bot className="w-3.5 h-3.5" /> Inspect IA
                              </button>
                            ) : (
                              <span className="text-gray-500 font-medium">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-gray-500">
                            Nenhum registro de log encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ABA ROBOTS */}
          {activeTab === 'robots' && (
            <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" /> Gerenciamento de Robôs & Workers
              </h3>
              <p className="text-xs text-gray-400">Visualização detalhada dos nós conectados e alocação de recursos do ambiente RPA.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-sm">RPA-FINANCE-01</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">Ativo</span>
                  </div>
                  <p className="text-xs text-gray-400">Processo: Emissão de Notas Fiscais SAP</p>
                  <div className="text-xs text-gray-400 flex justify-between pt-2">
                    <span>CPU: 42%</span>
                    <span>Memória: 1.2 GB</span>
                  </div>
                </div>

                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-sm">RPA-LOGISTICS-02</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">Ativo</span>
                  </div>
                  <p className="text-xs text-gray-400">Processo: Rastreio de Cargas em Lote</p>
                  <div className="text-xs text-gray-400 flex justify-between pt-2">
                    <span>CPU: 18%</span>
                    <span>Memória: 850 MB</span>
                  </div>
                </div>

                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-sm">RPA-HR-ONBOARDING</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-medium">Em Alerta</span>
                  </div>
                  <p className="text-xs text-gray-400">Processo: Cadastro de Colaboradores</p>
                  <div className="text-xs text-gray-400 flex justify-between pt-2">
                    <span>CPU: 88%</span>
                    <span>Memória: 2.1 GB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA EXECUTIONS */}
          {activeTab === 'executions' && (
            <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-400" /> Histórico Completo de Execuções
              </h3>
              <p className="text-xs text-gray-400">Consulte o registro cronológico de todas as automações disparadas.</p>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/50 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Robô</th>
                      <th className="p-3">Código do Processo</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Duração</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-800/30 transition">
                        <td className="p-3 text-gray-500">#{log.id}</td>
                        <td className="p-3 font-semibold text-white">{log.robot_name}</td>
                        <td className="p-3 text-gray-400">{log.process_code}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">{log.execution_time_seconds}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA METRICS & AI INSIGHTS */}
          {activeTab === 'metrics' && (
            <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" /> Relatórios de Métricas & Diagnósticos por IA
              </h3>
              <p className="text-xs text-gray-400">Análise analítica do tempo economizado, falhas por tipo de exceção e sugestões de otimização.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase">Eficiência Operacional</h4>
                  <p className="text-2xl font-bold text-white">{metrics.hours_saved} Horas Poupadas</p>
                  <p className="text-xs text-gray-400">Equivalente a aproximadamente {Math.round(metrics.hours_saved / 8)} dias úteis de trabalho manual economizados.</p>
                </div>

                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase">Taxa Global de Sucesso</h4>
                  <p className="text-2xl font-bold text-white">{metrics.success_rate}%</p>
                  <p className="text-xs text-gray-400">Com base em {metrics.total_executions} execuções registradas na base de dados.</p>
                </div>
              </div>
            </div>
          )}

          {/* ABA SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" /> Configurações do Sistema
                </h3>
                <p className="text-xs text-gray-400">Ajustes de integrações com o Gemini AI, chaves de API e banco de dados.</p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">URL Base da API Backend</label>
                  <input
                    type="text"
                    disabled
                    value={API_BASE}
                    className="w-full bg-gray-900 border border-gray-800 text-xs rounded-lg p-2.5 text-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Modelo de IA Ativo</label>
                  <input
                    type="text"
                    disabled
                    value="Gemini 1.5 Flash (Google AI)"
                    className="w-full bg-gray-900 border border-gray-800 text-xs rounded-lg p-2.5 text-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal de Inspeção de IA */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#111827] w-full max-w-2xl rounded-xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">

            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-rose-400 font-bold text-base flex items-center gap-2">
                <Cpu className="w-5 h-5" /> Diagnóstico da IA - {selectedLog.robot_name}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner de Sucesso */}
            {successBanner && (
              <div className="bg-emerald-950/80 text-emerald-200 p-3.5 rounded-lg mb-4 font-semibold text-sm flex items-center gap-2 border border-emerald-500/40 shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successBanner}</span>
              </div>
            )}

            {/* Log de Erro Bruto */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Log de Erro Bruto:</h4>
              <pre className="bg-gray-950 p-3 rounded-lg text-rose-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-gray-800">
                {selectedLog.error_message}
              </pre>
            </div>

            {/* Causa Raiz Sanitizada */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1.5">Causa Raiz Identificada pela IA:</h4>
              <div className="bg-sky-950/50 p-3 rounded-lg text-sky-200 text-xs border border-sky-800/50">
                {selectedLog.ai_diagnosis && selectedLog.ai_diagnosis.includes("<!DOCTYPE html>")
                  ? "Erro de conexão/firewall ao consultar a API do Gemini. Verifique a rede."
                  : (selectedLog.ai_diagnosis || "Analisando log...")}
              </div>
            </div>

            {/* Sugestão de Correção Sanitizada */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> Sugestão de Correção Técnico/Código:
              </h4>
              <pre className="bg-gray-950 p-3 rounded-lg text-emerald-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-emerald-900/50">
                {selectedLog.suggested_fix && selectedLog.suggested_fix.includes("<!DOCTYPE html>")
                  ? "Conexão bloqueada pela rede corporativa/firewall. Desconecte da VPN para validar a chamada."
                  : (selectedLog.suggested_fix || "Carregando solução...")}
              </pre>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Fechar
              </button>
              <button
                onClick={handleSelfHealing}
                disabled={fixing || !!successBanner}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-lg ${fixing
                  ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                  }`}
              >
                <Zap className="w-4 h-4" />
                {fixing ? "Aplicando Patch..." : "Aplicar Correção Autônoma (Self-Healing)"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}