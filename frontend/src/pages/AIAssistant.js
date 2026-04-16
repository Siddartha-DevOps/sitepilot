import React, { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Loader2, Bot, Copy, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const QUICK_ACTIONS = [
  {
    label: 'Daily Report',
    type: 'daily_report',
    prompt: 'Create a daily construction report template with key placeholders.',
  },
  {
    label: 'Risk Review',
    type: 'risk',
    prompt: 'List top site risks for a mid-rise commercial project.',
  },
  {
    label: 'Safety Checklist',
    type: 'general',
    prompt: 'Provide a pre-task working-at-height safety checklist.',
  },
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}, I am SitePilot AI. Ask me about reports, risks, safety, RFIs, and planning.`,
      type: 'general',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('general');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content, type = selectedType) => {
    if (!content.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      type,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: content.trim(), type });
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: res.data?.response || 'No response received.',
          type: res.data?.type || type,
          timestamp: new Date(),
        },
      ]);
    } catch {
      toast.error('AI request failed');
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content: 'Sorry, I hit an error. Please try again.',
          type: 'error',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages((prev) => [prev[0]]);
    toast.success('Chat cleared');
  };

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="hidden lg:flex lg:w-72 border-r border-slate-200 bg-white flex-col p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">SitePilot AI</p>
            <p className="text-xs text-slate-400">Construction Assistant</p>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Actions</p>
        <div className="space-y-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              disabled={loading}
              onClick={() => sendMessage(action.prompt, action.type)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Button onClick={clearChat} variant="outline" size="sm" className="w-full text-slate-500 gap-2">
            <RefreshCw size={13} /> Clear Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">SitePilot AI Assistant</p>
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">Online</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={15} className="text-white" />
                </div>
              )}

              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <p className="text-xs text-slate-400">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        toast.success('Copied to clipboard');
                      }}
                      className="text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <Copy size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot size={15} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 size={14} className="animate-spin text-orange-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="bg-white border-t border-slate-200 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-3"
          >
            <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs text-slate-400 bg-transparent border-none outline-none pr-1"
              >
                <option value="general">General</option>
                <option value="daily_report">Report</option>
                <option value="risk">Risk</option>
                <option value="rfi">RFI</option>
                <option value="summary">Summary</option>
              </select>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SitePilot AI about construction..."
                className="border-0 shadow-none p-0 text-sm focus-visible:ring-0 flex-1"
                data-testid="ai-chat-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-xl gap-2"
              data-testid="ai-chat-send"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

