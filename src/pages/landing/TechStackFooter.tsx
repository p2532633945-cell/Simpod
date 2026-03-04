import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function VercelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 76 65" fill="currentColor">
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

function GroqIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

function SupabaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 109 113" fill="none">
      <path
        d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627H99.1935C108.384 40.0627 113.498 50.7253 107.727 57.7074L63.7076 110.284Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04075L54.4849 72.2922H9.83113C0.640828 72.2922 -3.47435 61.6296 2.29735 54.6475L45.317 2.07103Z"
        fill="currentColor"
      />
    </svg>
  );
}

const techStack = [
  { name: 'Vercel', icon: <VercelIcon />, description: 'Deployment & Edge' },
  { name: 'Groq', icon: <GroqIcon />, description: 'AI Transcription' },
  { name: 'Supabase', icon: <SupabaseIcon />, description: 'Database & Auth' },
];

export function TechStackFooter() {
  return (
    <footer className="relative py-20 md:py-28 px-4">
      {/* Top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />

      <div className="max-w-4xl mx-auto">
        {/* Vibe Coding section - moved from philosophy cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(0,207,253,0.08)',
                border: '1px solid rgba(0,207,253,0.15)',
                color: '#00cffd',
              }}
            >
              <Sparkles size={16} />
            </div>
            <span className="text-sm font-semibold text-white/80">Vibe Coding</span>
            <span className="text-xs text-white/30">{'/'}</span>
            <span className="text-sm text-white/40">{'氛围编程'}</span>
          </div>
          <p className="text-xs text-[#555] max-w-md mx-auto leading-relaxed">
            {'This project was entirely directed by AI -- not line-by-line coding, but vision, iteration, and instinct. From product design to technical implementation, AI is the director, human is the decision-maker.'}
          </p>
          <p className="text-[10px] text-[#444] max-w-md mx-auto leading-relaxed mt-2">
            {'这个项目完全由 AI 主导开发。没有传统的逐行编码，只有愿景、迭代和直觉。从产品设计到技术实现，AI 是导演，人是决策者。'}
          </p>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <p className="text-xs text-[#555] tracking-widest uppercase mb-8">Built With</p>
          <div className="flex items-center justify-center gap-10 md:gap-16">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#8a8f98] group-hover:text-[#00cffd] transition-colors duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {tech.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white/80">{tech.name}</div>
                  <div className="text-[10px] text-[#555] mt-0.5">{tech.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center pt-10"
        >
          <div
            className="w-full h-px mb-10"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.04), transparent)',
            }}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-bold tracking-tighter text-white">
              Simpod
            </div>
            <p className="text-xs text-[#555] max-w-sm leading-relaxed text-center">
              {'Protect your flow. An AI-powered podcast player built for language learners who want to enjoy extensive listening without being interrupted by the 20% they don\'t understand.'}
            </p>
            <div className="flex items-center gap-6 mt-4">
              <a
                href="/app"
                className="text-xs text-[#8a8f98] hover:text-[#00cffd] transition-colors"
              >
                Try Simpod
              </a>
              <span className="text-[#333]">&#183;</span>
              <a
                href="#"
                className="text-xs text-[#8a8f98] hover:text-[#00cffd] transition-colors"
              >
                GitHub
              </a>
              <span className="text-[#333]">&#183;</span>
              <a
                href="#"
                className="text-xs text-[#8a8f98] hover:text-[#00cffd] transition-colors"
              >
                About
              </a>
            </div>
            <p className="text-[10px] text-[#333] mt-6 tracking-wider">
              Vibe-coded with intention. 2026.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
