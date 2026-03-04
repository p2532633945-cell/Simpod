import { motion } from 'framer-motion';
import { Mountain, ArrowUpRight, Route } from 'lucide-react';

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
    <div className="w-full h-40 relative flex items-end justify-center gap-1 px-4">
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

function PeaksAndValleysDiagram() {
  // Visualization: horizontal axis = different fields, vertical = development ratio
  // A few tall "peaks" (tech, finance) and many low "valleys" (other fields)
  const fields = [
    { label: 'AI', height: 92 },
    { label: '', height: 28 },
    { label: 'Fin', height: 85 },
    { label: '', height: 20 },
    { label: '', height: 35 },
    { label: 'Med', height: 70 },
    { label: '', height: 15 },
    { label: '', height: 22 },
    { label: 'Edu', height: 30 },
    { label: '', height: 18 },
    { label: '', height: 25 },
    { label: 'Lang', height: 32 },
    { label: '', height: 12 },
    { label: '', height: 20 },
    { label: 'Bio', height: 55 },
    { label: '', height: 18 },
  ];
  return (
    <div className="w-full h-40 relative px-4 pt-4 pb-6">
      <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
        {/* Threshold line at y=1.0 ratio */}
        <line x1="5" y1="10" x2="195" y2="10" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3 3" />
        <text x="196" y="12" fill="rgba(255,255,255,0.15)" fontSize="4" fontFamily="system-ui">{'Potential'}</text>

        {/* Bars for each field */}
        {fields.map((f, i) => {
          const x = 8 + i * 12;
          const barH = f.height * 0.85;
          const y = 95 - barH;
          const isPeak = f.height > 60;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width="8"
                height={barH}
                rx="1.5"
                fill={isPeak ? 'rgba(0,207,253,0.35)' : 'rgba(255,255,255,0.06)'}
              />
              {f.label && (
                <text x={x + 4} y="99" fill={isPeak ? 'rgba(0,207,253,0.5)' : 'rgba(255,255,255,0.2)'} fontSize="4" textAnchor="middle" fontFamily="system-ui">
                  {f.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Arrow from peak to valley with label */}
        <defs>
          <marker id="pv-arrow" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
            <polygon points="0 0, 5 2, 0 4" fill="rgba(0,207,253,0.6)" />
          </marker>
        </defs>
        {/* Arrow from AI peak to Lang valley */}
        <path
          d="M16 22 C 50 15, 100 40, 140 65"
          stroke="rgba(0,207,253,0.3)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3 2"
          markerEnd="url(#pv-arrow)"
        />
        <text x="70" y="35" fill="rgba(0,207,253,0.4)" fontSize="4.5" fontFamily="system-ui">{'Transfer Value'}</text>
      </svg>
    </div>
  );
}

function LastMileDiagram() {
  return (
    <div className="w-full h-40 relative flex items-center justify-center px-4">
      <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
        {/* Tech peak on left */}
        <circle cx="30" cy="25" r="18" fill="rgba(0,207,253,0.08)" stroke="rgba(0,207,253,0.2)" strokeWidth="1" />
        <text x="30" y="23" fill="rgba(0,207,253,0.5)" fontSize="5" textAnchor="middle" fontFamily="system-ui">{'Tech'}</text>
        <text x="30" y="29" fill="rgba(0,207,253,0.5)" fontSize="5" textAnchor="middle" fontFamily="system-ui">{'Peak'}</text>

        {/* User valley on right */}
        <circle cx="170" cy="70" r="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x="170" y="68" fill="rgba(255,255,255,0.3)" fontSize="5" textAnchor="middle" fontFamily="system-ui">{'User'}</text>
        <text x="170" y="74" fill="rgba(255,255,255,0.3)" fontSize="5" textAnchor="middle" fontFamily="system-ui">{'Need'}</text>

        {/* The "last mile" bridge - a person carrying value across */}
        <defs>
          <marker id="lm-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="rgba(0,207,253,0.6)" />
          </marker>
        </defs>
        <path
          d="M48 30 C 80 35, 120 55, 152 65"
          stroke="rgba(0,207,253,0.3)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 3"
          markerEnd="url(#lm-arrow)"
        />

        {/* Person icon in the middle of the bridge */}
        <circle cx="100" cy="48" r="3" fill="rgba(0,207,253,0.5)" />
        <line x1="100" y1="51" x2="100" y2="60" stroke="rgba(0,207,253,0.4)" strokeWidth="1" />
        <line x1="95" y1="55" x2="105" y2="55" stroke="rgba(0,207,253,0.4)" strokeWidth="1" />

        {/* Label */}
        <text x="100" y="72" fill="rgba(0,207,253,0.4)" fontSize="4.5" textAnchor="middle" fontFamily="system-ui">{'The Last Mile'}</text>

        {/* vs sign for what it's not */}
        <text x="100" y="90" fill="rgba(255,255,255,0.1)" fontSize="3.5" textAnchor="middle" fontFamily="system-ui">{'Not reinventing wheels -- delivering real value'}</text>
      </svg>
    </div>
  );
}

const cards: CardData[] = [
  {
    icon: <Mountain size={20} />,
    titleEn: 'Mountain Climbing Theory',
    titleZh: '登山理论',
    subtitle: 'From Advancing to Expert',
    description: '泛听中能听懂 80% 的进阶学习者，距离 Expert 只差那关键的 20%。但这 20% 如果要反复倒带去精听，就会打破心流、降低效率，甚至让泛听变成精听。Simpod 从专家视角出发，不要求你停下来逐字精听，而是在保持泛听心流的前提下，帮你精准地捕获和解析那 20%，让你高效地从进阶者走向 Expert。',
    diagram: <MountainDiagram />,
  },
  {
    icon: <ArrowUpRight size={20} />,
    titleEn: 'Peaks and Valleys',
    titleZh: '峰与谷',
    subtitle: 'Uneven Frontiers of Human Progress',
    description: '人类的天才与资本并未均匀分布在所有领域。如果把每个领域的「当前发展程度 / 可达极限」画在纵轴上，你会看到几座孤峰 -- AI、金融、医疗 -- 而大量领域远低于其潜力线。语言学习就是这样的「谷地」之一。Simpod 的使命，是将 AI 前沿的能力搬运到这片被忽视的山谷，让技术真正服务于学习者的日常需求，而非停留在实验室里自我陶醉。',
    diagram: <PeaksAndValleysDiagram />,
  },
  {
    icon: <Route size={20} />,
    titleEn: 'The Last Mile of Technology',
    titleZh: '技术的最后一公里',
    subtitle: 'From Peak to Valley',
    description: '外卖行业有一个经典命题：「最后一公里」-- 从餐厅到用户手中的那段博弈。技术领域同理。对特定领域有深刻理解和真实痛感的人，如果同时拥抱前沿技术，就能充当从「峰」到「谷」的搬运工。这不是与技术团队的正面竞争，而是错位竞争 -- 创造的是真实价值，而非技术狂热和重复造轮子。世界上或许所有人都在各自屋子里造轮子，但真正稀缺的，是把轮子装到正确的车上。',
    diagram: <LastMileDiagram />,
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
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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
