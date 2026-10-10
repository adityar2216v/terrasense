import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu, ShieldAlert, FileText } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function TerraAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello. I am Terra AI, your environmental intelligence co-pilot. I have deep access to live telemetry, historical incident databases, and LangGraph analytical engines. How can I assist you with operational command today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI Response
    setTimeout(() => {
      let aiResponse = "I have analyzed the request across our global telemetry grids.";
      
      const lowerInput = userMsg.content.toLowerCase();
      if (lowerInput.includes('report') || lowerInput.includes('analytics')) {
        aiResponse = "I have processed the latest environmental incident reports. The overarching trend indicates a stabilization in atmospheric pollutants, but a rising concern in localized hydrological toxicity. Would you like me to generate a PDF executive summary?";
      } else if (lowerInput.includes('incident') || lowerInput.includes('map') || lowerInput.includes('critical')) {
        aiResponse = "I am tracking several CRITICAL severity incidents right now. The LangGraph engine recommends deploying drone surveillance to the top 3 affected coordinates immediately and establishing automated digital perimeters.";
      } else if (lowerInput.includes('agent') || lowerInput.includes('ai') || lowerInput.includes('langgraph')) {
        aiResponse = "Our architecture utilizes a multi-agent LangGraph coordinator. The Air, Water, and Waste intelligence cores operate asynchronously to feed deterministic risk calculations into the central engine.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto bg-brand-surface border border-white/5 rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-[#131E2F] border-b border-brand-surface flex items-center gap-4">
        <div className="p-2 bg-brand-primary/10 rounded-lg">
          <Bot size={24} className="text-brand-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">Terra AI Assistant</h2>
          <p className="text-xs text-brand-cyan flex items-center gap-1"><Cpu size={12}/> Connected to LangGraph Engine</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0a1017]"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-[#334155]' : 'bg-brand-primary/20 text-brand-primary'
            }`}>
              {msg.role === 'user' ? <User size={16} className="text-white"/> : <Bot size={16} />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-[#1E293B] text-white rounded-tr-sm' 
                : 'bg-brand-surface border border-white/5 text-gray-300 rounded-tl-sm shadow-md'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <span className="text-[10px] text-gray-500 mt-2 block">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Bot size={16} />
            </div>
            <div className="bg-brand-surface border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 w-24">
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="px-6 py-3 bg-[#0a1017] flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar border-t border-white/5">
        <button onClick={() => setInput('Generate a situation report on critical incidents.')} className="shrink-0 text-xs bg-brand-surface hover:bg-white/5 border border-white/10 text-brand-text-secondary px-3 py-1.5 rounded-full flex items-center gap-2 transition">
          <FileText size={12}/> Generate situation report
        </button>
        <button onClick={() => setInput('What is the status of the AI Agents?')} className="shrink-0 text-xs bg-brand-surface hover:bg-white/5 border border-white/10 text-brand-text-secondary px-3 py-1.5 rounded-full flex items-center gap-2 transition">
          <Cpu size={12}/> AI Agent status
        </button>
        <button onClick={() => setInput('Show me the latest critical alerts.')} className="shrink-0 text-xs bg-brand-surface hover:bg-white/5 border border-white/10 text-brand-text-secondary px-3 py-1.5 rounded-full flex items-center gap-2 transition">
          <ShieldAlert size={12}/> Critical alerts
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#131E2F] border-t border-brand-surface">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Terra AI about environmental telemetry..."
            className="w-full bg-[#0a1017] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-brand-primary text-black rounded-lg hover:bg-brand-primary/80 disabled:opacity-50 transition"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
