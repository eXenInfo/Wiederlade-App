/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Scale, 
  Database, 
  Plus, 
  Trash2, 
  Info, 
  ChevronRight,
  Euro,
  Weight,
  Layers,
  Save,
  History,
  Target,
  Upload,
  Loader2,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CostInputs, LoadRecord, GRAINS_PER_KG, GRAINS_PER_GRAM, AnalysisResult } from './types';
import { GoogleGenAI } from "@google/genai";

export default function App() {
  const [activeTab, setActiveTab] = useState<'costs' | 'converter' | 'loads' | 'analysis'>('costs');
  
  // Cost Calculator State
  const [costs, setCosts] = useState<CostInputs>({
    powderPrice: 85.00,
    powderWeight: 1,
    powderCharge: 42.0,
    primerPrice: 65.00,
    primerCount: 1000,
    bulletPrice: 35.00,
    bulletCount: 100,
    brassPrice: 45.00,
    brassCount: 50,
    brassLife: 5
  });

  // Converter State
  const [convGrains, setConvGrains] = useState<string>('15.43');
  const [convGrams, setConvGrams] = useState<string>('1.00');

  // Load Manager State
  const [loads, setLoads] = useState<LoadRecord[]>([]);
  const [newLoad, setNewLoad] = useState<Partial<LoadRecord>>({});

  useEffect(() => {
    const savedLoads = localStorage.getItem('reloading_loads');
    if (savedLoads) {
      setLoads(JSON.parse(savedLoads));
    }
  }, []);

  const saveLoads = (updatedLoads: LoadRecord[]) => {
    setLoads(updatedLoads);
    localStorage.setItem('reloading_loads', JSON.stringify(updatedLoads));
  };

  const calculatedCosts = useMemo(() => {
    const powderCostPerGrain = (costs.powderPrice / costs.powderWeight) / GRAINS_PER_KG;
    const powderCost = powderCostPerGrain * costs.powderCharge;
    const primerCost = costs.primerPrice / costs.primerCount;
    const bulletCost = costs.bulletPrice / costs.bulletCount;
    const brassCost = (costs.brassPrice / costs.brassCount) / costs.brassLife;
    
    const total = powderCost + primerCost + bulletCost + brassCost;
    
    return {
      powder: powderCost,
      primer: primerCost,
      bullet: bulletCost,
      brass: brassCost,
      total: total,
      per100: total * 100
    };
  }, [costs]);

  const handleGrainsChange = (val: string) => {
    setConvGrains(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setConvGrams((num / GRAINS_PER_GRAM).toFixed(4));
    }
  };

  const handleGramsChange = (val: string) => {
    setConvGrams(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setConvGrains((num * GRAINS_PER_GRAM).toFixed(2));
    }
  };

  const addLoad = () => {
    if (newLoad.name && newLoad.caliber) {
      const record: LoadRecord = {
        id: crypto.randomUUID(),
        name: newLoad.name || '',
        caliber: newLoad.caliber || '',
        bulletWeight: newLoad.bulletWeight || 0,
        powderType: newLoad.powderType || '',
        powderCharge: newLoad.powderCharge || 0,
        primerType: newLoad.primerType || '',
        date: new Date().toLocaleDateString('de-DE')
      };
      saveLoads([record, ...loads]);
      setNewLoad({});
    }
  };

  const deleteLoad = (id: string) => {
    saveLoads(loads.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-[#141414]/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Wiederlade-Rechner</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-full">
            {[
              { id: 'costs', label: 'Kosten', icon: Euro },
              { id: 'converter', label: 'Umrechner', icon: Scale },
              { id: 'loads', label: 'Ladungen', icon: Database },
              { id: 'analysis', label: 'Analyse', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-[#141414] shadow-sm' 
                    : 'text-[#141414]/50 hover:text-[#141414]'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'costs' && (
            <motion.div
              key="costs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Inputs */}
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#141414]/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#5A5A40]/10 rounded-lg flex items-center justify-center text-[#5A5A40]">
                        <Layers size={18} />
                      </div>
                      <h2 className="text-lg font-semibold">Komponenten & Preise</h2>
                    </div>
                    <button 
                      onClick={() => setCosts({
                        powderPrice: 85.00,
                        powderWeight: 1,
                        powderCharge: 42.0,
                        primerPrice: 65.00,
                        primerCount: 1000,
                        bulletPrice: 35.00,
                        bulletCount: 100,
                        brassPrice: 45.00,
                        brassCount: 50,
                        brassLife: 5
                      })}
                      className="text-xs text-[#141414]/30 hover:text-[#141414] transition-colors flex items-center gap-1"
                    >
                      <History size={12} />
                      Zurücksetzen
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Powder */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Pulver</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.powderPrice} 
                              onChange={e => setCosts({...costs, powderPrice: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Preis"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">€</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.powderWeight} 
                              onChange={e => setCosts({...costs, powderWeight: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Menge"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">kg</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={costs.powderCharge} 
                          onChange={e => setCosts({...costs, powderCharge: parseFloat(e.target.value) || 0})}
                          className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                          placeholder="Ladung (Grains)"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">gr</span>
                      </div>
                    </div>

                    {/* Primers */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Zündhütchen</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.primerPrice} 
                              onChange={e => setCosts({...costs, primerPrice: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Preis"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">€</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.primerCount} 
                              onChange={e => setCosts({...costs, primerCount: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Stück"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">Stk</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bullets */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Geschosse</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.bulletPrice} 
                              onChange={e => setCosts({...costs, bulletPrice: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Preis"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">€</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.bulletCount} 
                              onChange={e => setCosts({...costs, bulletCount: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Stück"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">Stk</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Brass */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Hülsen</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.brassPrice} 
                              onChange={e => setCosts({...costs, brassPrice: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Preis"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">€</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              value={costs.brassCount} 
                              onChange={e => setCosts({...costs, brassCount: parseFloat(e.target.value) || 0})}
                              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                              placeholder="Stück"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">Stk</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={costs.brassLife} 
                          onChange={e => setCosts({...costs, brassLife: parseFloat(e.target.value) || 1})}
                          className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                          placeholder="Wiederverwendungen"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#141414]/30">Zyklen</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Results Sidebar */}
              <div className="space-y-6">
                <section className="bg-[#5A5A40] text-white rounded-3xl p-8 shadow-xl">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6">Ergebnis</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="text-4xl font-light mb-1">{calculatedCosts.total.toFixed(2)} €</div>
                      <div className="text-xs opacity-60 uppercase tracking-wider">Pro Schuss</div>
                    </div>
                    
                    <div className="h-px bg-white/10" />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60">100 Schuss</span>
                        <span className="font-medium">{calculatedCosts.per100.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60">Pulveranteil</span>
                        <span className="font-medium">{calculatedCosts.powder.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60">Geschossanteil</span>
                        <span className="font-medium">{calculatedCosts.bullet.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="bg-white rounded-2xl p-6 border border-[#141414]/5 flex items-start gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Spar-Tipp</h4>
                    <p className="text-xs text-[#141414]/60 leading-relaxed">
                      Durch das Wiederladen sparst du oft bis zu 50% gegenüber Fabrikmunition.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'converter' && (
            <motion.div
              key="converter"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <section className="bg-white rounded-3xl p-10 shadow-sm border border-[#141414]/5">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-[#5A5A40]/10 rounded-xl flex items-center justify-center text-[#5A5A40]">
                    <Scale size={24} />
                  </div>
                  <h2 className="text-2xl font-semibold">Einheitenumrechner</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Grains (gr)</label>
                    <input 
                      type="number" 
                      value={convGrains}
                      onChange={e => handleGrainsChange(e.target.value)}
                      className="w-full text-4xl font-light bg-transparent border-b-2 border-[#141414]/10 py-4 focus:border-[#5A5A40] outline-none transition-colors"
                    />
                  </div>

                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#F5F5F0] rounded-full items-center justify-center text-[#141414]/20">
                    <ChevronRight size={24} />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Gramm (g)</label>
                    <input 
                      type="number" 
                      value={convGrams}
                      onChange={e => handleGramsChange(e.target.value)}
                      className="w-full text-4xl font-light bg-transparent border-b-2 border-[#141414]/10 py-4 focus:border-[#5A5A40] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-12 p-6 bg-[#F5F5F0] rounded-2xl">
                  <div className="text-xs text-[#141414]/40 font-medium mb-2">REFERENZ</div>
                  <div className="text-sm text-[#141414]/70">1 Gramm = {GRAINS_PER_GRAM.toFixed(4)} Grains</div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'loads' && (
            <motion.div
              key="loads"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* New Load Form */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#141414]/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#5A5A40]/10 rounded-lg flex items-center justify-center text-[#5A5A40]">
                      <Plus size={18} />
                    </div>
                    <h2 className="text-lg font-semibold">Neue Ladung erfassen</h2>
                  </div>
                  <button 
                    onClick={addLoad}
                    disabled={!newLoad.name || !newLoad.caliber}
                    className="bg-[#5A5A40] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4A4A35] transition-colors disabled:opacity-30"
                  >
                    Speichern
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input 
                    placeholder="Bezeichnung (z.B. Target Load)" 
                    value={newLoad.name || ''}
                    onChange={e => setNewLoad({...newLoad, name: e.target.value})}
                    className="bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <input 
                    placeholder="Kaliber (z.B. .308 Win)" 
                    value={newLoad.caliber || ''}
                    onChange={e => setNewLoad({...newLoad, caliber: e.target.value})}
                    className="bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <input 
                    placeholder="Geschossgewicht (gr)" 
                    type="number"
                    value={newLoad.bulletWeight || ''}
                    onChange={e => setNewLoad({...newLoad, bulletWeight: parseFloat(e.target.value) || 0})}
                    className="bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <input 
                    placeholder="Pulversorte" 
                    value={newLoad.powderType || ''}
                    onChange={e => setNewLoad({...newLoad, powderType: e.target.value})}
                    className="bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <input 
                    placeholder="Ladung (gr)" 
                    type="number"
                    value={newLoad.powderCharge || ''}
                    onChange={e => setNewLoad({...newLoad, powderCharge: parseFloat(e.target.value) || 0})}
                    className="bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <input 
                    placeholder="Zündhütchen" 
                    value={newLoad.primerType || ''}
                    onChange={e => setNewLoad({...newLoad, primerType: e.target.value})}
                    className="bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </section>

              {/* Load List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#141414]/40 px-2">
                  <History size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Gespeicherte Ladungen</span>
                </div>
                
                {loads.length === 0 ? (
                  <div className="bg-white/50 border border-dashed border-[#141414]/10 rounded-3xl p-12 text-center">
                    <p className="text-sm text-[#141414]/40">Noch keine Ladungen gespeichert.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loads.map(load => (
                      <motion.div 
                        layout
                        key={load.id}
                        className="bg-white rounded-2xl p-6 border border-[#141414]/5 flex justify-between items-start group"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{load.name}</h4>
                            <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-full font-bold">{load.caliber}</span>
                          </div>
                          <p className="text-xs text-[#141414]/50 mb-4">{load.date}</p>
                          
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <div className="text-[11px]">
                              <span className="opacity-40 block uppercase tracking-tighter">Geschoss</span>
                              <span className="font-medium">{load.bulletWeight} gr</span>
                            </div>
                            <div className="text-[11px]">
                              <span className="opacity-40 block uppercase tracking-tighter">Pulver</span>
                              <span className="font-medium">{load.powderCharge} gr {load.powderType}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteLoad(load.id)}
                          className="text-[#141414]/20 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <AnalysisTab />
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-[#141414]/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-[#141414]/40">
            © {new Date().getFullYear()} Wiederlade-Rechner. Alle Angaben ohne Gewähr.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-[#141414]/40 hover:text-[#141414] transition-colors">Impressum</a>
            <a href="#" className="text-xs text-[#141414]/40 hover:text-[#141414] transition-colors">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AnalysisTab() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New inputs
  const [bulletDiameter, setBulletDiameter] = useState<string>('7.62'); // Default .308
  const [expectedShots, setExpectedShots] = useState<string>('5');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";

      const base64Data = selectedImage.split(',')[1];
      
      const prompt = `
        Analysiere dieses Trefferbild (Schussgruppe auf einer Zielscheibe).
        
        PARAMETER:
        - Geschossdurchmesser (Referenz): ${bulletDiameter} mm
        - Erwartete Anzahl Schüsse: ${expectedShots}
        
        AUFGABEN:
        1. Identifiziere alle Einschusslöcher (bis zu ${expectedShots}).
        2. Nutze den Geschossdurchmesser (${bulletDiameter} mm) als primären Maßstab für die Berechnung.
        3. Berechne den Streukreis (Extreme Spread) in Millimetern (Mitte-zu-Mitte).
        4. Werte die Ringe der Zielscheibe aus. WICHTIG: Unterscheide zwischen der Innenzehn ("X") und der normalen "10".
        5. Bestimme für jeden Treffer, in welchem Ring er liegt. Treffer in der Innenzehn werden als "X" gewertet. Treffer in der Zehn, aber außerhalb der Innenzehn, werden als "10" gewertet.
        
        Gib das Ergebnis als JSON-Objekt zurück:
        {
          "groupSizeMm": number,
          "numberOfHits": number,
          "confidence": number (0-1),
          "detectedHits": [{ "x": number, "y": number, "ring": "X"|number }],
          "referenceFound": boolean,
          "rings": { "X": number, "10": number, "9": number, "8": number, ... },
          "score": number (Gesamtpunktzahl, wobei X = 10 Punkte zählt)
        }
      `;

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Fehler bei der Analyse. Bitte versuche es erneut.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#141414]/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#5A5A40]/10 rounded-xl flex items-center justify-center text-[#5A5A40]">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Trefferbild-Analyse</h2>
            <p className="text-sm text-[#141414]/40">Lade ein Foto deiner Zielscheibe hoch, um den Streukreis zu ermitteln.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Geschossdurchmesser (mm)</label>
            <input 
              type="number" 
              step="0.01"
              value={bulletDiameter}
              onChange={e => setBulletDiameter(e.target.value)}
              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
              placeholder="z.B. 7.62"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">Anzahl Schüsse</label>
            <input 
              type="number" 
              value={expectedShots}
              onChange={e => setExpectedShots(e.target.value)}
              className="w-full bg-[#F5F5F0] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
              placeholder="z.B. 5"
            />
          </div>
        </div>

        {!selectedImage ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#141414]/10 rounded-3xl cursor-pointer hover:bg-[#F5F5F0] transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-[#141414]/20 mb-4" />
              <p className="mb-2 text-sm text-[#141414]/60 font-medium">Klicken oder Bild hierher ziehen</p>
              <p className="text-xs text-[#141414]/40">JPG, PNG (max. 10MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden border border-[#141414]/10 bg-black/5 aspect-video flex items-center justify-center">
              <img src={selectedImage} alt="Target" className="max-h-full object-contain" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#5A5A40] animate-spin mb-4" />
                  <p className="text-sm font-medium text-[#5A5A40]">KI analysiert Trefferbild...</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex-1 bg-[#5A5A40] text-white py-4 rounded-2xl font-semibold hover:bg-[#4A4A35] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target size={20} />}
                Analyse starten
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                disabled={isAnalyzing}
                className="px-6 py-4 rounded-2xl border border-[#141414]/10 font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}
      </section>

      {result && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="bg-[#5A5A40] text-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Streukreis</h3>
              <div className="text-4xl font-light mb-1">{result.groupSizeMm.toFixed(1)} mm</div>
              <div className="text-xs opacity-60 uppercase tracking-wider">Extreme Spread</div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-4">Treffer</h3>
              <div className="text-4xl font-light mb-1">{result.numberOfHits} / {expectedShots}</div>
              <div className="text-xs text-[#141414]/40 uppercase tracking-wider">Identifiziert</div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-4">Ergebnis</h3>
              <div className="text-4xl font-light mb-1">{result.score || 0}</div>
              <div className="text-xs text-[#141414]/40 uppercase tracking-wider">Gesamtpunkte</div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 mb-4">Referenz</h3>
              <div className="flex items-center gap-2 text-xl font-medium">
                <span className="text-emerald-600 flex items-center gap-2">Kaliber {bulletDiameter}mm <Info size={16} /></span>
              </div>
              <div className="text-xs text-[#141414]/40 uppercase tracking-wider mt-1">Maßstab-Basis</div>
            </div>
          </motion.div>

          {result.rings && (
            <section className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                <Layers size={18} className="text-[#5A5A40]" />
                Treffer pro Ring
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(result.rings)
                  .sort((a, b) => {
                    if (a[0] === 'X') return -1;
                    if (b[0] === 'X') return 1;
                    return Number(b[0]) - Number(a[0]);
                  })
                  .map(([ring, count]) => (
                    <div key={ring} className="bg-[#F5F5F0] rounded-2xl p-4 text-center border border-[#141414]/5">
                      <div className="text-xs font-bold text-[#141414]/30 uppercase mb-1">
                        {ring === 'X' ? 'Innenzehn' : `${ring}er`}
                      </div>
                      <div className="text-2xl font-semibold text-[#5A5A40]">
                        {ring === 'X' ? 'X' : ring} × {count}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Info size={18} className="text-[#5A5A40]" />
          Hinweise zur Analyse
        </h3>
        <ul className="space-y-3 text-xs text-[#141414]/60 leading-relaxed">
          <li className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] mt-1 shrink-0" />
            Gib den exakten Geschossdurchmesser an (z.B. 7.62 für .308 Win), damit die KI die Löcher als Maßstab nutzen kann.
          </li>
          <li className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] mt-1 shrink-0" />
            Die KI unterscheidet automatisch zwischen der **Innenzehn (X)** und der normalen Zehn.
          </li>
          <li className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] mt-1 shrink-0" />
            Die KI zählt die Treffer pro Ring automatisch aus und berechnet die Gesamtpunktzahl (X zählt als 10).
          </li>
          <li className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] mt-1 shrink-0" />
            Fotografiere die Zielscheibe möglichst frontal und bei gutem Licht.
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
