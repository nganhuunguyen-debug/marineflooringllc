import React, { useState, useMemo } from 'react';
import { BIODECK_PRODUCTS, SYNDECK_PRODUCTS } from './constants';
import { ProjectSystem } from './types';

const App: React.FC = () => {
  const [system, setSystem] = useState<ProjectSystem>('biodeck');
  const [sqft, setSqft] = useState<string>('');
  
  const currentProducts = system === 'biodeck' ? BIODECK_PRODUCTS : SYNDECK_PRODUCTS;

  // Calculate results during render to avoid state sync lag/errors
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

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 overflow-hidden shadow-2xl border-x border-gray-200 relative">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 pt-8 shadow-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <i className="fas fa-ship text-xl"></i>
          <h1 className="text-xl font-black tracking-tight uppercase">Marine Flooring LLC</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-8">
          {/* System Toggle */}
          <div className="flex p-1 bg-gray-200 rounded-2xl android-shadow shrink-0">
            <button 
              onClick={() => setSystem('biodeck')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${system === 'biodeck' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              BioDeck
            </button>
            <button 
              onClick={() => setSystem('syndeck')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${system === 'syndeck' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              SynDeck
            </button>
          </div>

          {/* Input Section */}
          <section className="bg-white rounded-3xl p-6 android-shadow border border-gray-100 shrink-0">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Enter Total Area</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                className="w-full text-center text-7xl font-black border-b-8 border-blue-500 focus:outline-none py-4 bg-transparent text-gray-800"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
              />
              <div className="text-center mt-2 text-gray-400 font-black text-sm uppercase tracking-widest">Square Feet</div>
            </div>
          </section>

          {/* Results List */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{system.toUpperCase()} Requirements</h2>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((res) => {
                  const product = currentProducts.find(p => p.id === res.productId);
                  if (!product) return null; // Safety check
                  
                  return (
                    <div key={product.id} className="bg-white p-5 rounded-3xl flex items-center justify-between android-shadow border-l-8 border-blue-500">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${product.color} flex items-center justify-center text-white shadow-md`}>
                          <i className={`fas ${product.unitLabel === 'Box' ? 'fa-box' : 'fa-shopping-bag'} text-xl`}></i>
                        </div>
                        <div className="max-w-[140px]">
                          <h3 className="font-black text-gray-800 text-sm leading-tight uppercase tracking-tighter truncate">{product.name}</h3>
                          <p className="text-[10px] text-gray-400 font-black uppercase">1 / {product.sqftPerUnit} SQFT</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-blue-700 leading-none">{res.units}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase mt-1">{product.unitLabel}s</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-gray-100/50 rounded-3xl border-2 border-dashed border-gray-200">
                <i className="fas fa-arrow-up text-4xl mb-4 text-blue-300 animate-bounce"></i>
                <p className="text-sm font-black text-gray-400 uppercase">Input SQ FT Above</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
