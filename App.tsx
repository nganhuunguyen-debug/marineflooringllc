
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BIODECK_PRODUCTS, SYNDECK_PRODUCTS } from './constants';
import { CalculationResult, ChatMessage, ProjectSystem } from './types';
import { getAiAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calc' | 'ai'>('calc');
  const [system, setSystem] = useState<ProjectSystem>('biodeck');
  const [sqft, setSqft] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // AI State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I'm your Marine Flooring Assistant. Ask me anything about your BioDeck or SynDeck project." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'ai') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      const advice = await getAiAdvice(inputValue, parseFloat(sqft) || 0, system);
      setMessages(prev => [...prev, { role: 'model', content: advice || "I couldn't get a response. Please try again." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Connection error. Please check your API key settings." }]);
    } finally {
      setIsTyping(false);
    }
  };

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
        {activeTab === 'calc' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
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
                <div className="space-y-3 pb-8">
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
        ) : (
          /* AI Chat Tab - Full Height Flex Container */
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
               {messages.map((m, idx) => (
                 <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-white text-gray-800 rounded-tl-none border shadow-sm'}`}>
                     <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                   </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex justify-start">
                   <div className="bg-white text-gray-400 text-xs font-bold italic px-4 py-2 rounded-2xl border shadow-sm animate-pulse">
                     Assistant is typing...
                   </div>
                 </div>
               )}
               <div ref={chatEndRef} className="h-4" />
             </div>
             
             {/* Chat Input */}
             <div className="p-4 border-t flex gap-2 bg-white safe-area-bottom mb-20">
               <input 
                 type="text" 
                 value={inputValue} 
                 onChange={(e) => setInputValue(e.target.value)} 
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                 className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 placeholder="Ask the expert..." 
               />
               <button 
                onClick={handleSendMessage} 
                disabled={isTyping}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${isTyping ? 'bg-gray-300 text-gray-500' : 'bg-blue-700 text-white'}`}
               >
                <i className="fas fa-paper-plane"></i>
               </button>
             </div>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t h-20 flex items-center justify-around safe-area-bottom z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.08)]">
        <button 
          onClick={() => setActiveTab('calc')} 
          className={`flex flex-col items-center gap-1 flex-1 h-full justify-center transition-all ${activeTab === 'calc' ? 'text-blue-700 bg-blue-50/50' : 'text-gray-400 opacity-60'}`}
        >
          <i className="fas fa-calculator text-xl"></i>
          <span className="text-[10px] font-black uppercase tracking-tighter">Calc</span>
        </button>
        <button 
          onClick={() => setActiveTab('ai')} 
          className={`flex flex-col items-center gap-1 flex-1 h-full justify-center transition-all ${activeTab === 'ai' ? 'text-blue-700 bg-blue-50/50' : 'text-gray-400 opacity-60'}`}
        >
          <i className="fas fa-robot text-xl"></i>
          <span className="text-[10px] font-black uppercase tracking-tighter">AI Help</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
