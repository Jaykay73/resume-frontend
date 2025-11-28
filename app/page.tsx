"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, ArrowRight, Loader2, Award, ChevronDown } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";

// --- CONFIGURATION ---
const API_URL = "https://jaykay73-resume-optimizer-api.hf.space"; 

// --- TYPEWRITER COMPONENT ---
const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i === text.length) clearInterval(timer);
      }, 15); // Typing speed
      return () => clearInterval(timer);
    }, delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

// --- NUMBER COUNTER COMPONENT ---
const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  
  // For scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!file || !jd) {
      setError("Please provide both a resume and job description.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("jd_text", jd);

    try {
      const res = await axios.post(`${API_URL}/optimize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setResult(res.data);
      
      // Trigger confetti if score is good
      if (res.data.analysis.score > 75) {
        setTimeout(() => {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }, 500);
      }

      // Scroll to results after a slight delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);

    } catch (err) {
      console.error(err);
      setError("Connection failed. Please check your backend URL and ensure the Space is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-purple-500/30 font-sans pb-20">
      
      {/* 1. HERO SECTION (Story Flow) */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-medium mb-8 uppercase tracking-widest backdrop-blur-md">
            <Sparkles size={12} /> AI Career Architect
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Optimize your resume <br/> for the <span className="text-white">perfect role.</span>
          </h1>
          
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop guessing. Our AI analyzes your resume against the job description, 
            calculates your match score, and rewrites your bullet points to get you hired.
          </p>

          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-neutral-600 flex justify-center"
          >
            <ChevronDown size={32} />
          </motion.div>
        </motion.div>
      </section>

      {/* 2. INPUT SECTION */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Job Description */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group bg-neutral-900/50 border border-white/10 rounded-3xl p-8 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all duration-500 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 text-neutral-300 mb-6">
              <div className="p-3 bg-white/5 rounded-xl"><FileText size={20} /></div>
              <h3 className="text-lg font-semibold">1. Paste Job Description</h3>
            </div>
            <textarea
              className="w-full h-64 bg-transparent resize-none focus:outline-none text-neutral-300 placeholder:text-neutral-700 leading-relaxed font-light"
              placeholder="Paste the full job requirements here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </motion.div>

          {/* Resume Upload & Action */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <div className="flex-1 bg-neutral-900/50 border border-white/10 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-all cursor-pointer relative group backdrop-blur-sm">
              <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <Upload size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{file ? file.name : "2. Upload Resume"}</h3>
              <p className="text-sm text-neutral-500">PDF, DOCX, or TXT</p>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                loading 
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" 
                  : "bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              }`}
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Analyzing Match...</>
              ) : (
                <>Generate Report <ArrowRight size={20} /></>
              )}
            </button>
            
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-900/20 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 3. RESULTS REVEAL SECTION */}
      <div ref={resultsRef}>
        <AnimatePresence>
          {result && (
            <motion.section 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-w-6xl mx-auto px-6"
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-16" />
              
              {/* SCORE HEADER */}
              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                   <h2 className="text-4xl font-bold mb-6">Analysis Results</h2>
                   <p className="text-neutral-400 text-lg leading-relaxed">
                     We compared your profile against the requirements. 
                     <br/>Here is how you stack up.
                   </p>
                </div>
                
                <div className="relative bg-neutral-900/80 border border-white/10 rounded-3xl p-8 flex items-center justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 pointer-events-none">
                    <Award size={200} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-2">Match Score</div>
                    <div className="text-7xl font-bold tracking-tighter text-white">
                      <AnimatedNumber value={result.analysis.score} />%
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full ${result.analysis.score > 70 ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]'}`} />
                </div>
              </div>

              {/* SKILLS GRID */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                     <AlertCircle className="text-red-400" size={20} />
                     <h3 className="text-xl font-semibold">Missing Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.missing_skills.length > 0 ? (
                      result.analysis.missing_skills.map((skill: string) => (
                        <span key={skill} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-500">No missing skills detected!</span>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm"
                >
                   <div className="flex items-center gap-2 mb-6">
                     <CheckCircle className="text-green-400" size={20} />
                     <h3 className="text-xl font-semibold">Matched Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.common_skills.map((skill: string) => (
                        <span key={skill} className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-300 rounded-full text-sm">
                          {skill}
                        </span>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* AI ADVICE */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 rounded-3xl p-10 backdrop-blur-md">
                 <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="text-purple-400" size={24} />
                    <h3 className="text-2xl font-bold">AI recommended bullet points to add to your resume</h3>
                 </div>

                 <div className="space-y-6">
                    {/* Safe Parsing of Bullets */}
                    {(() => {
                        const suggestions = result.ai_suggestions || {};
                        const bullets = suggestions.suggested_bullets || suggestions.bullets || [];
                        
                        return bullets.map((bullet: string, i: number) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.5 + (i * 0.2) }}
                             className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                           >
                              <div className="mt-1 min-w-[24px] h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                                {i + 1}
                              </div>
                              <p className="text-neutral-300 leading-relaxed text-lg font-light">
                                <TypewriterText text={bullet} delay={0.5 + (i * 1)} />
                              </p>
                           </motion.div>
                        ));
                    })()}
                 </div>

                 <div className="mt-10 pt-8 border-t border-white/5">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Start your Cover Letter like this</h4>
                    <p className="text-neutral-400 italic text-lg leading-relaxed font-serif">
                       "{result.ai_suggestions?.cover_letter_intro || "No draft available."}"
                    </p>
                 </div>
              </div>

            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}