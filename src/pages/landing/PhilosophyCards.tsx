import { motion } from 'framer-motion';
import { Mountain, ArrowUpRight, Sparkles } from 'lucide-react';

interface CardData {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  diagram: React.ReactNode;
}

function MountainDiagram() {
  return (
    <div className="w-full h-32 relative flex items-end justify-center gap-1 px-4">
      {/* Mountain silhouette using bars */}
      {Array.from({ length: 20 }).map((_, i) => {
        const peak = 10;
        const dist = Math.abs(i - peak);
        const h = Math.max(10, 100 - dist * dist * 0.8);
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-500"
            style={{
              height: `${h}%`,
              background: i <= 5
                ? 'rgba(0,207,253,0.3)'
                : i >= 15
                  ? 'rgba(0,207,253,0.15)'
                  : `rgba(0,207,253,${0.08 + (h / 100) * 0.2})`,
            }}
          />
        );
      })}
      {/* Labels */}
      <div className="absolute bottom-0 left-4 text-[9px] text-[#00cffd] opacity-60 font-medium">BEGINNER</div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] text-[#00cffd] font-medium">EXPERT</div>
      <div className="absolute bottom-0 right-4 text-[9px] text-[#555] opacity-60 font-medium">MASTERY</div>
    </div>
  );
}

function FrontAdvantageDiagram() {
  return (
    <div className="w-full h-32 relative flex items-center justify-center px-6">
      {/* Two curves showing tech peaks reaching user valleys */}
      <svg viewBox="0 0 200 80" className="w-full h-full" fill="none">
        {/* Tech peak line */}
        <path
          d="M10 60 Q 50 10, 100 35 Q 150 60, 190 20"
          stroke="rgba(0,207,253,0.4)"
          strokeWidth="2"
          fill="none"
        />
        {/* User valley line */}
        <path
          d="M10 65 Q 50 50, 100 55 Q 150 60, 190 45"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        {/* Arrow connecting */}
        <path
          d="M140 28 L140 52"
          stroke="rgba(0,207,253,0.6)"
          strokeWidth="1"
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="rgba(0,207,253,0.6)" />
          </marker>
        </defs>
        {/* Labels */}
        <text x="170" y="16" fill="rgba(0,207,253,0.5)" fontSize="6" fontFamily="system-ui">Tech</text>
        <text x="170" y="50" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="system-ui">User</text>
      </svg>
    </div>
  );
}

function VibeCodeDiagram() {
  return (
    <div className="w-full h-32 flex flex-col items-center justify-center gap-2 px-6">
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
      <div className="mt-1 text-[9px] text-[#00cffd] opacity-50 tracking-wider uppercase">
        {'>'} AI Director Output
      </div>
    </div>
  );
}

const cards: CardData[] = [
  {
    icon: <Mountain size={20} />,
    title: 'Mountain Climbing Theory',
    subtitle: 'Expert insights for beginner pains',
    description: 'The biggest breakthroughs in learning happen when expert-level insights are delivered at the exact moment of beginner-level struggle. Simpod bridges that gap.',
    diagram: <MountainDiagram />,
  },
  {
    icon: <ArrowUpRight size={20} />,
    title: 'Front Advantage',
    subtitle: 'Bringing tech peaks to user valleys',
    description: 'Technology should meet you where you are, not where engineers think you should be. Simpod brings cutting-edge AI to the simplest possible interaction: one tap.',
    diagram: <FrontAdvantageDiagram />,
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Vibe Coding',
    subtitle: 'Built by an AI Director, not a coder',
    description: 'This entire project was directed through AI-first development. No traditional coding. Just vision, iteration, and the belief that the best products are vibed into existence.',
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
              key={card.title}
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

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-[#00cffd] tracking-wider uppercase mb-4 font-medium">
                  {card.subtitle}
                </p>

                {/* Description */}
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
