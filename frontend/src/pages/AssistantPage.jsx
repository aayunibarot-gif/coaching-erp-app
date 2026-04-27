import React, { useState } from "react";
import api from "../api/axios";
import SectionHeader from "../components/SectionHeader";

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse(""); // Clear previous response
    try {
      const { data } = await api.post("/assistant", { query });
      setResponse(data.text);
    } catch (error) {
      setResponse("Sorry, I encountered an error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <SectionHeader 
        title="ERP AI Assistant" 
        subtitle="Your personalized coach for attendance, marks, fees, and more." 
      />

      <div className="grid gap-6">
        {/* Input Card */}
        <form onSubmit={ask} className="card shadow-sm border-t-4 border-indigo-500">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-600 block">How can I help you today?</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your attendance, marks, fees, or timetable..."
                disabled={loading}
              />
              <button 
                type="submit" 
                className={`btn-primary px-8 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Thinking...
                  </>
                ) : (
                  "Ask AI"
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs text-slate-400">Try:</span>
              {["Attendance summary", "Marks in Math", "Fee status", "Next class"].map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => setQuery(hint)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-full transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Response Card */}
        {(response || loading) && (
          <div className="card animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="font-bold text-slate-800">Assistant Response</h3>
                <div className="prose prose-slate max-w-none">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      {response}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

