import { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Users, 
  Settings2, 
  MapPin, 
  Search, 
  ExternalLink, 
  ArrowRight,
  ChevronRight,
  Database,
  Globe,
  Loader2
} from 'lucide-react';

// Configuration
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQsyThr92EM-P9SOrfCeVle4aIEjRdQmzHHyG75wHdkMNFqGvTggW1wFiWUzJJTyVBUA/exec';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [masterData, setMasterData] = useState<any[]>([]);
  const [societyData, setSocietyData] = useState<any>({});

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: 'society', label: 'Society', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'master', label: 'Master', icon: Settings2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'cbse', label: 'CBSE & Zone', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  useEffect(() => {
    if (activeTab !== 'home') {
      fetchData(activeTab === 'cbse' ? 'CBSE & Zone' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    }
  }, [activeTab]);

  const fetchData = async (tabName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?tab=${encodeURIComponent(tabName)}`);
      const data = await response.json();
      
      if (tabName === 'Society') {
        const transposed: any = {};
        if (data.length > 0) {
          // Re-finding society names correctly based on first column being labels
          const firstColKey = Object.keys(data[0])[0];
          const actualSocietyNames = Object.keys(data[0]).filter(k => k !== firstColKey && k !== 'rowNumber');

          actualSocietyNames.forEach(name => {
            transposed[name] = {};
            data.forEach((row: any) => {
              const docType = row[firstColKey];
              transposed[name][docType as string] = row[name];
            });
          });
        }
        setSocietyData(transposed);
      } else if (tabName === 'Master') {
        const transposedYears: any[] = [];
        if (data.length > 0) {
          const firstColKey = Object.keys(data[0])[0];
          const yearKeys = Object.keys(data[0]).filter(k => k !== firstColKey && k !== 'rowNumber');
          
          yearKeys.forEach(year => {
            const docs = data.map((row: any) => ({
              name: row[firstColKey],
              link: row[year]
            })).filter((d: any) => d.link && String(d.link).startsWith('http'));
            
            transposedYears.push({
              year,
              documents: docs
            });
          });
        }
        setMasterData(transposedYears);
      } else {
        setMasterData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-40 transition-colors duration-1000 ${
          activeTab === 'society' ? 'bg-emerald-200' : 
          activeTab === 'master' ? 'bg-blue-200' : 
          activeTab === 'cbse' ? 'bg-purple-200' : 'bg-slate-200'
        }`} />
        <div className={`absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-30 transition-colors duration-1000 ${
          activeTab === 'society' ? 'bg-teal-200' : 
          activeTab === 'master' ? 'bg-indigo-200' : 
          activeTab === 'cbse' ? 'bg-fuchsia-200' : 'bg-gray-200'
        }`} />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 fixed inset-y-0 left-0 z-50">
        <div className="p-10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
              activeTab === 'society' ? 'bg-emerald-500 shadow-emerald-200' : 
              activeTab === 'master' ? 'bg-blue-500 shadow-blue-200' : 
              activeTab === 'cbse' ? 'bg-purple-500 shadow-purple-200' : 'bg-slate-900 shadow-slate-200'
            }`}>
              <Database size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                ? `${item.bg} ${item.color} font-bold shadow-sm ring-1 ring-inset ${item.bg.replace('bg-', 'ring-').replace('50', '200')}` 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-xs uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-10">
          <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Globe size={40} />
            </div>
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 mb-2 uppercase">System Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider">Live & Secure</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 lg:pl-72 transition-all duration-500">
        <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32 lg:pb-12">
          
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              <header className="max-w-2xl">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-6 border border-indigo-100 shadow-sm">
                  WELCOME BACK, ADMINISTRATOR
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                  Education Management <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Console</span>
                </h1>
                <p className="text-slate-500 text-lg md:text-xl leading-relaxed font-medium">
                  A high-performance administrative hub for managing educational societies, regional zones, and system masters.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {navItems.filter(i => i.id !== 'home').map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{ animationDelay: `${idx * 150}ms` }}
                    className="group relative bg-white/70 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-200/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 text-left hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                  >
                    <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      <item.icon size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">{item.label}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">Access the centralized registry for {item.label.toLowerCase()} data management.</p>
                    <div className="flex items-center text-[10px] font-black tracking-[0.2em] text-slate-900 group-hover:translate-x-3 transition-transform duration-500">
                      EXPLORE MODULE <ArrowRight size={16} className="ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Society Tab */}
          {activeTab === 'society' && (
            <div className="animate-in fade-in duration-700">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-emerald-600 font-black tracking-[0.3em] text-[10px]">
                    <div className="w-8 h-[2px] bg-emerald-600/30 rounded-full" />
                    <span>SOCIETY REGISTRY</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Organization Profile</h2>
                </div>
                <div className="relative group max-w-md w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search societies..." 
                    className="pl-14 pr-8 py-5 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-[2.5rem] text-sm w-full shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </header>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-emerald-50 rounded-full" />
                    <Loader2 className="absolute inset-0 w-20 h-20 text-emerald-500 animate-spin" />
                  </div>
                  <p className="text-slate-400 font-black tracking-[0.4em] text-[10px] uppercase">Retrieving Cloud Data</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {Object.keys(societyData).filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((societyName, idx) => (
                    <div key={idx} className="group bg-white/70 backdrop-blur-xl rounded-[3rem] border border-slate-200/50 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col">
                      <div className="p-10 bg-gradient-to-br from-emerald-500/5 to-transparent border-b border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 text-emerald-600">
                          <Users size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight group-hover:text-emerald-700 transition-colors">{societyName}</h3>
                      </div>
                      <div className="p-10 space-y-4 flex-1">
                        {Object.entries(societyData[societyName]).map(([docTitle, link], dIdx) => (
                          <div key={dIdx} className="group/item flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
                            <span className="text-sm font-bold text-slate-700 group-hover/item:text-slate-900">{docTitle}</span>
                            <a 
                              href={link as string} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black tracking-widest hover:bg-emerald-600 hover:text-white shadow-sm hover:shadow-emerald-200 transition-all duration-300"
                            >
                              VIEW DOCUMENT <ExternalLink size={14} className="ml-2" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Master Tab */}
          {activeTab === 'master' && (
            <div className="animate-in fade-in duration-700">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-blue-600 font-black tracking-[0.3em] text-[10px]">
                    <div className="w-8 h-[2px] bg-blue-600/30 rounded-full" />
                    <span>CONFIGURATIONS</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Master Data Hub</h2>
                </div>
                <div className="relative group max-w-md w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search years..." 
                    className="pl-14 pr-8 py-5 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-[2.5rem] text-sm w-full shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </header>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-50 rounded-full" />
                    <Loader2 className="absolute inset-0 w-20 h-20 text-blue-500 animate-spin" />
                  </div>
                  <p className="text-slate-400 font-black tracking-[0.4em] text-[10px] uppercase">Retrieving Master Records</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {masterData.filter(session => session.year.toLowerCase().includes(searchQuery.toLowerCase())).map((session, idx) => (
                    <div key={idx} className="group bg-white/70 backdrop-blur-xl rounded-[3rem] border border-slate-200/50 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col">
                      <div className="p-10 bg-gradient-to-br from-blue-500/5 to-transparent border-b border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-blue-600">
                            <Settings2 size={24} />
                          </div>
                          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase">Session</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight group-hover:text-blue-700 transition-colors">{session.year}</h3>
                      </div>
                      <div className="p-10 space-y-4 flex-1">
                        {session.documents.map((doc: any, dIdx: number) => (
                          <div key={dIdx} className="group/item flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                            <span className="text-sm font-bold text-slate-700 group-hover/item:text-slate-900">{doc.name}</span>
                            <a 
                              href={doc.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black tracking-widest hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-blue-200 transition-all duration-300"
                            >
                              VIEW <ExternalLink size={14} className="ml-2" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CBSE Tab */}
          {activeTab === 'cbse' && (
            <div className="animate-in fade-in duration-700">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-purple-600 font-black tracking-[0.3em] text-[10px]">
                    <div className="w-8 h-[2px] bg-purple-600/30 rounded-full" />
                    <span>REGIONAL MAPPING</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">CBSE & Zone Registry</h2>
                </div>
                <div className="relative group max-w-md w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Filter records..." 
                    className="pl-14 pr-8 py-5 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-[2.5rem] text-sm w-full shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </header>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-50 rounded-full" />
                    <Loader2 className="absolute inset-0 w-20 h-20 text-purple-500 animate-spin" />
                  </div>
                  <p className="text-slate-400 font-black tracking-[0.4em] text-[10px] uppercase">Synchronizing Records</p>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-slate-200/50 shadow-2xl overflow-hidden overflow-x-auto ring-1 ring-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-purple-600">
                        {Object.keys(masterData[0] || {}).map((header, i) => (
                          <th key={i} className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.25em] text-white/90 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white/40">
                      {masterData.filter(row => 
                        Object.values(row).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()))
                      ).map((row, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-all duration-300">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-10 py-6 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                              {String(val).startsWith('http') ? (
                                <a href={String(val)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black tracking-widest border border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
                                  OPEN LINK <ChevronRight size={14} className="ml-1" />
                                </a>
                              ) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-8 left-8 right-8 z-50">
        <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex justify-between items-center px-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 relative ${
                activeTab === item.id 
                ? 'bg-white scale-110 shadow-xl' 
                : 'text-slate-400'
              }`}
            >
              <item.icon size={22} className={`transition-all duration-500 ${activeTab === item.id ? item.color : ''}`} />
              <div className={`absolute -bottom-1 w-1 h-1 rounded-full transition-all duration-500 ${activeTab === item.id ? item.color.replace('text-', 'bg-') : 'opacity-0'}`} />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
