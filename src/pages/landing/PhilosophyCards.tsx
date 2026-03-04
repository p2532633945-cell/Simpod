import { motion } from 'framer-motion';
import { Mountain, ArrowUpRight, Sparkles } from 'lucide-react';

interface CardData {
  icon: React.ReactNode;
  titleEn: string;
  titleZh: string;
  subtitle: string;
  description: string;
  diagram: React.ReactNode;
}

function MountainDiagram() {
  return (
    <div className="w-full h-36 relative flex items-end justify-center gap-1 px-4">
      {/* Mountain silhouette using bars */}
      {Array.from({ length: 24 }).map((_, i) => {
        const peak = 12;
        const dist = Math.abs(i - peak);
        const h = Math.max(10, 100 - dist * dist * 0.6);
        const isAdvanced = i >= 6 && i <= 12;
        const isExpert = i >= 13 && i <= 18;
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-500"
            style={{
              height: `${h}%`,
              background: isAdvanced
                ? 'rgba(0,207,253,0.35)'
                : isExpert
                  ? 'rgba(0,207,253,0.5)'
                  : i <= 5
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,207,253,0.12)',
            }}
          />
        );
      })}
      {/* Labels */}
      <div className="absolute bottom-0 left-3 text-[9px] text-[#555] opacity-70 font-medium">BEGINNER</div>
      <div className="absolute bottom-0 left-1/2 -translate-x-[120%] text-[9px] text-[#00cffd] opacity-80 font-medium">ADVANCING</div>
      <div className="absolute top-0 left-1/2 translate-x-[10%] text-[9px] text-[#00cffd] font-medium">EXPERT</div>
      {/* Arrow showing the bridge */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 100">
        <defs>
          <marker id="mt-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="rgba(0,207,253,0.7)" />
          </marker>
        </defs>
        <path
          d="M85 75 C 100 40, 120 25, 140 20"
          stroke="rgba(0,207,253,0.4)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 3"
          markerEnd="url(#mt-arrow)"
        />
        <text x="90" y="62" fill="rgba(0,207,253,0.5)" fontSize="5" fontFamily="system-ui">Simpod</text>
      </svg>
    </div>
  );
}

function FrontAdvantageDiagram() {
  return (
    <div className="w-full h-36 relative flex items-center justify-center px-6">
      <svg viewBox="0 0 200 90" className="w-full h-full" fill="none">
        {/* Expert tool line (top) */}
        <path
          d="M10 20 Q 50 15, 100 18 Q 150 21, 190 15"
          stroke="rgba(0,207,253,0.5)"
          strokeWidth="2"
          fill="none"
        />
        {/* Advancing learner line (bottom, rising) */}
        <path
          d="M10 70 Q 50 65, 100 55 Q 150 45, 190 30"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        {/* Arrows showing tool bringing expert level down */}
        {[60, 110, 155].map((x, i) => (
          <g key={i}>
            <line
              x1={x} y1={18 + i} x2={x} y2={62 - i * 7}
              stroke="rgba(0,207,253,0.3)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle cx={x} cy={62 - i * 7} r="2" fill="rgba(0,207,253,0.5)" />
            <circle cx={x} cy={18 + i} r="2" fill="rgba(0,207,253,0.3)" />
          </g>
        ))}
        <text x="10" y="14" fill="rgba(0,207,253,0.5)" fontSize="6" fontFamily="system-ui">Expert Tools</text>
        <text x="10" y="82" fill="rgba(255,255,255,0.25)" fontSize="6" fontFamily="system-ui">Advancing Learner</text>
        <text x="145" y="82" fill="rgba(0,207,253,0.3)" fontSize="5" fontFamily="system-ui">Gap Closing</text>
      </svg>
    </div>
  );
}

function VibeCodeDiagram() {
  return (
    <div className="w-full h-36 flex flex-col items-center justify-center gap-2 px-6">
      {/* Code-like blocks representing AI direction */}
      <div className="w-full flex items-center gap-2">
        <div className="w-16 h-2 rounded-full bg-[rgba(0,207,253,0.25)]" />
        <div className="w-8 h-2 rounded-full bg-[rgba(255,255,255,0.06)]" />
        <div className="w-20 h-2 rounded-full bg-[rgba(0,207,253,0.15)]" />
      </div>
      <div className="w-full flex items-center gap-2 pl-4">
        <div className="w-12 h-2 rounded-full bg-[rgba(0,207,253,0.2)]" />
        <div className="w-24 h-2 rounded-full bg-[rgba(255,255,255,0.04)]" />
      </div>
      <div className="w-full flex items-center gap-2 pl-4">
        <div className="w-20 h-2 rounded-full bg-[rgba(0,207,253,0.12)]" />
        <div className="w-10 h-2 rounded-full bg-[rgba(255,255,255,0.06)]" />
        <div className="w-6 h-2 rounded-full bg-[rgba(0,207,253,0.3)]" />
      </div>
      <div className="w-full flex items-center gap-2">
        <div className="w-10 h-2 rounded-full bg-[rgba(255,255,255,0.04)]" />
        <div className="w-14 h-2 rounded-full bg-[rgba(0,207,253,0.18)]" />
      </div>
      <div className="mt-2 text-[9px] text-[#00cffd] opacity-50 tracking-wider uppercase">
        {'>'} AI Director Output
      </div>
    </div>
  );
}

const cards: CardData[] = [
  {
    icon: <Mountain size={20} />,
    titleEn: 'Mountain Climbing Theory',
    titleZh: '登山理论',
    subtitle: 'From Advancing to Expert',
    description: '泛听中能听懂 80% 的进阶学习者，距离 Expert 只差那关键的 20%。Simpod 从专家的视角出发，提供精准的工具来弥合这段距离——让你不再被陌生表达打断，也不需要精听全篇，而是在流畅的泛听中高效进阶。',
    diagram: <MountainDiagram />,
  },
  {
    icon: <ArrowUpRight size={20} />,
    titleEn: 'Front Advantage',
    titleZh: '前沿优势',
    subtitle: 'Expert Tools for Advancing Learners',
    description: '技术应该去找到你所在的位置，而不是强迫你适应技术。Simpod 把 AI 前沿的能力带到最简单的交互中——一次点击就能捕获、解析你没听懂的内容，让进阶者同时享受播客本身的价值和语言学习的价值，而非只能在精听中挣扎。',
    diagram: <FrontAdvantageDiagram />,
  },
  {
    icon: <Sparkles size={20} />,
    titleEn: 'Vibe Coding',
    titleZh: '氛围编程',
    subtitle: 'Directed by AI, Not by Code',
    description: '这个项目完全由 AI 主导开发。没有传统的逐行编码，只有愿景、迭代和一个信念：最好的产品不是写出来的，是用直觉和氛围「感应」出来的。从产品设计到技术实现，AI 是导演，人是决策者。',
    diagram: <VibeCodeDiagram />,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function PhilosophyCards() {
  return (
    <section className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            The Philosophy
          </h2>
          <p className="text-[#8a8f98] text-lg max-w-lg mx-auto leading-relaxed">
            Three principles that shaped how Simpod thinks about learning.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map((card) => (
            <motion.div
              key={card.titleEn}
              variants={cardVariants}
              className="group relative rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(40px)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(0,207,253,0.06) 0%, transparent 60%)',
                }}
              />

              <div className="relative p-6 md:p-8 flex flex-col h-full">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(0,207,253,0.08)',
                    border: '1px solid rgba(0,207,253,0.15)',
                    color: '#00cffd',
                  }}
                >
                  {card.icon}
                </div>

                {/* Bilingual Title */}
                <h3 className="text-xl font-bold text-white mb-0.5">
                  {card.titleEn}
                </h3>
                <p className="text-sm text-white/50 mb-1">
                  {card.titleZh}
                </p>
                <p className="text-xs text-[#00cffd] tracking-wider uppercase mb-4 font-medium">
                  {card.subtitle}
                </p>

                {/* Description in Chinese */}
                <p className="text-[#8a8f98] text-sm leading-relaxed mb-6 flex-1">
                  {card.description}
                </p>

                {/* Diagram area */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  {card.diagram}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
