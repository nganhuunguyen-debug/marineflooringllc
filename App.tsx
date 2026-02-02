
import React, { useState, useMemo } from 'react';
import { BIODECK_PRODUCTS, SYNDECK_PRODUCTS, ARKANSAS_PRODUCTS } from './constants';
import { ProjectSystem } from './types';

interface EGSCompartment {
  id: string;
  length: string;
  width: string;
}

const App: React.FC = () => {
  const [system, setSystem] = useState<ProjectSystem>('biodeck');
  const [sqft, setSqft] = useState<string>('');
  const [egsWaste, setEgsWaste] = useState<boolean>(true);
  
  // EGS specific state: multiple compartments
  const [egsCompartments, setEgsCompartments] = useState<EGSCompartment[]>([
    { id: '1', length: '', width: '' }
  ]);

  const tabs = [
    { id: 'biodeck', label: 'BioDeck' },
    { id: 'syndeck', label: 'SynDeck' },
    { id: 'arkansas', label: '686 Arkansas' },
    { id: 'egs', label: 'EGS' },
  ];

  const addEGSCompartment = () => {
    setEgsCompartments([
      ...egsCompartments,
      { id: Date.now().toString(), length: '', width: '' }
    ]);
  };

  const removeEGSCompartment = (id: string) => {
    if (egsCompartments.length > 1) {
      setEgsCompartments(egsCompartments.filter(c => c.id !== id));
    } else {
      setEgsCompartments([{ id: '1', length: '', width: '' }]);
    }
  };

  const updateEGSCompartment = (id: string, field: 'length' | 'width', value: string) => {
    setEgsCompartments(egsCompartments.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const currentProducts = useMemo(() => {
    switch (system) {
      case 'biodeck': return BIODECK_PRODUCTS;
      case 'syndeck': return SYNDECK_PRODUCTS;
      case 'arkansas': return ARKANSAS_PRODUCTS;
      default: return [];
    }
  }, [system]);

  const results = useMemo(() => {
    if (system === 'egs') return [];
    const numValue = parseFloat(sqft);
    if (!isNaN(numValue) && numValue > 0) {
      return currentProducts.map(product => ({
        productId: product.id,
        units: Math.ceil(numValue / product.sqftPerUnit),
        exactValue: numValue / product.sqftPerUnit
      }));
    }
    return [];
  }, [sqft, currentProducts, system]);

  const egsCalculations = useMemo(() => {
    if (system !== 'egs') return null;
    
    return egsCompartments.map(comp => {
      const l = parseFloat(comp.length);
      const w = parseFloat(comp.width);
      if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return null;

      const rollWidth = 3;
      
      // FWD-to-AFFF Calculation: Width / 3 = number of strips
      const strips = Math.ceil(w / rollWidth);
      // Add 10% waste to length if enabled
      const stripLength = egsWaste ? l * 1.1 : l;

      return {
        id: comp.id,
        area: (l * w).toFixed(1),
        strips: strips,
        length: stripLength.toFixed(1)
      };
    });
  }, [system, egsCompartments, egsWaste]);

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-gray-50 overflow-hidden shadow-2xl border-x border-gray-200 relative">
      {/* Sticky Top Section */}
      <div className="bg-blue-700 shadow-lg z-30 shrink-0">
        {/* Header */}
        <header className="text-white p-3 pt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-ship text-lg"></i>
            <h1 className="text-sm font-black tracking-tight uppercase">Marine Flooring LLC</h1>
          </div>
          <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Calculator v2.6</div>
        </header>

        {/* Tab Navigation */}
        <div className="px-4 pb-2">
          <div className="flex bg-blue-800/50 rounded-xl backdrop-blur-sm overflow-x-auto no-scrollbar p-1 gap-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setSystem(tab.id as ProjectSystem)}
                className={`whitespace-nowrap px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex-shrink-0 flex-1 text-center ${system === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-blue-600/30'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section - SQFT for non-EGS */}
        {system !== 'egs' && (
          <div className="px-4 pb-4">
            <div className="bg-white rounded-2xl p-3 shadow-inner flex items-center gap-3 relative border-2 border-blue-400">
              <div className="shrink-0 flex flex-col items-center justify-center px-2 border-r border-gray-100">
                <span className="text-[9px] font-black text-blue-700 uppercase leading-none">Total</span>
                <span className="text-[9px] font-black text-gray-400 uppercase leading-none mt-0.5">Area</span>
              </div>
              <div className="flex-1 relative flex items-center">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full text-3xl font-black focus:outline-none bg-transparent text-gray-800 pr-8"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                />
                {sqft && (
                  <button onClick={() => setSqft('')} className="absolute right-0 p-2 text-gray-300 hover:text-gray-500">
                    <i className="fas fa-times-circle text-lg"></i>
                  </button>
                )}
              </div>
              <div className="shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-md">
                SQ FT
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto bg-gray-50 px-4 pt-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          {system === 'egs' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">EGS Breakdown</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase tracking-tighter ${egsWaste ? 'text-orange-500' : 'text-gray-300'}`}>+10% Waste</span>
                    <button 
                      onClick={() => setEgsWaste(!egsWaste)}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${egsWaste ? 'bg-orange-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${egsWaste ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={addEGSCompartment}
                  className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Add Line
                </button>
              </div>

              <div className="space-y-4">
                {egsCompartments.map((comp, index) => (
                  <div key={comp.id} className="bg-white p-4 rounded-3xl android-shadow border-2 border-transparent hover:border-blue-100 transition-colors animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                        Room #{index + 1}
                      </span>
                      {egsCompartments.length > 1 && (
                        <button 
                          onClick={() => removeEGSCompartment(comp.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Length (FT)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-lg font-black focus:ring-2 focus:ring-blue-400 outline-none"
                          value={comp.length}
                          onChange={(e) => updateEGSCompartment(comp.id, 'length', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Width (FT)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-lg font-black focus:ring-2 focus:ring-blue-400 outline-none"
                          value={comp.width}
                          onChange={(e) => updateEGSCompartment(comp.id, 'width', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Result for this compartment */}
                    {egsCalculations && egsCalculations[index] && (
                      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                        <div className={`inline-block px-6 py-3 rounded-2xl border transition-colors ${egsWaste ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                          <span className={`text-3xl font-black ${egsWaste ? 'text-orange-600' : 'text-blue-700'}`}>
                            {egsCalculations[index]?.strips}
                          </span>
                          <span className={`text-xs font-black uppercase ml-2 tracking-wide ${egsWaste ? 'text-orange-400' : 'text-blue-400'}`}>
                            rolls of {egsCalculations[index]?.length} ft long
                          </span>
                          {egsWaste && (
                            <div className="text-[8px] font-black text-orange-400 uppercase tracking-tighter mt-1">Includes 10% Waste</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200">
                <p className="text-[9px] font-black text-gray-400 uppercase text-center leading-relaxed">
                  Lonmat rolls are 3ft wide.<br/>
                  Total Area: {egsCalculations?.reduce((acc, curr) => acc + (curr ? parseFloat(curr.area) : 0), 0).toFixed(1)} SQ FT
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {system.replace('-', ' ')} Material List
                </h2>
                {sqft && (
                  <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                    {sqft} sqft
                  </span>
                )}
              </div>

              {results.length > 0 ? (
                <div className="space-y-3 pb-20">
                  {results.map((res) => {
                    const product = currentProducts.find(p => p.id === res.productId);
                    if (!product) return null;
                    
                    return (
                      <div key={product.id} className="bg-white p-4 rounded-2xl flex items-center justify-between android-shadow border-l-4 border-blue-500 animate-slide-up">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${product.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                            <i className={`fas ${['Box', 'Unit'].includes(product.unitLabel) ? 'fa-box' : product.unitLabel === 'Bucket' ? 'fa-fill-drip' : 'fa-shopping-bag'} text-sm`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-gray-800 text-[13px] leading-tight uppercase break-words">{product.name}</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Rate: 1 per {product.sqftPerUnit} ft²</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-3xl font-black text-blue-700 leading-none">{res.units}</div>
                          <div className="text-[9px] font-black text-gray-400 uppercase mt-0.5">{product.unitLabel}s</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-keyboard text-2xl text-blue-300"></i>
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ready for calculation</p>
                  <p className="text-[10px] text-gray-300 font-bold uppercase mt-1 px-10 leading-relaxed">
                    Enter total square feet above to see material breakdown
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-gray-100 p-3 shrink-0 hidden sm:block">
        <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
          Marine Flooring LLC &copy; 2024
        </p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
