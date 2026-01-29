import React, { useState, useMemo } from 'react';
import { BIODECK_PRODUCTS, SYNDECK_PRODUCTS } from './constants';
import { ProjectSystem } from './types';

const App: React.FC = () => {
  const [system, setSystem] = useState<ProjectSystem>('biodeck');
  const [sqft, setSqft] = useState<string>('');
  
  const currentProducts = system === 'biodeck' ? BIODECK_PRODUCTS : SYNDECK_PRODUCTS;

  const results = useMemo(() => {
    const numValue = parseFloat(sqft);
    if (!isNaN(numValue) && numValue > 0) {
      return currentProducts.map(product => ({
        productId: product.id,
        units: Math.ceil(numValue / product.sqftPerUnit),
        exactValue: numValue / product.sqftPerUnit
      }));
    }
    return [];
  }, [sqft, system, currentProducts]);

  const clearInput = () => setSqft('');

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
          <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Calculator v1.2</div>
        </header>

        {/* System Toggle - Integrated */}
        <div className="px-4 pb-2">
          <div className="flex p-1 bg-blue-800/50 rounded-xl backdrop-blur-sm">
            <button 
              onClick={() => setSystem('biodeck')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${system === 'biodeck' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-blue-600/30'}`}
            >
              BioDeck
            </button>
            <button 
              onClick={() => setSystem('syndeck')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${system === 'syndeck' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-blue-600/30'}`}
            >
              SynDeck
            </button>
          </div>
        </div>

        {/* Compact Input Bar */}
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
                <button 
                  onClick={clearInput}
                  className="absolute right-0 p-2 text-gray-300 hover:text-gray-500"
                >
                  <i className="fas fa-times-circle text-lg"></i>
                </button>
              )}
            </div>
            <div className="shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-md">
              SQ FT
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto bg-gray-50 px-4 pt-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {system} Materials Required
            </h2>
            {results.length > 0 && (
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
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${product.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                        <i className={`fas ${product.unitLabel === 'Box' ? 'fa-box' : 'fa-shopping-bag'} text-sm`}></i>
                      </div>
                      <div className="max-w-[150px]">
                        <h3 className="font-black text-gray-800 text-[13px] leading-tight uppercase truncate">{product.name}</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Rate: 1 per {product.sqftPerUnit} ft²</p>
                      </div>
                    </div>
                    <div className="text-right">
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
                Enter area above to see material breakdown
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding - Hidden when keyboard is very tall, but good for context */}
      <footer className="bg-white border-t border-gray-100 p-3 shrink-0 hidden sm:block">
        <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
          Marine Flooring LLC &copy; 2024
        </p>
      </footer>
    </div>
  );
};

export default App;
