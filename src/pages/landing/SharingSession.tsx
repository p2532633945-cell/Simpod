import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Eye,
  Wallet,
  Clock,
  Mountain,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const devTopics = [
  {
    icon: <Sparkles size={16} />,
    label: 'Vibe Coding',
    sublabel: 'The Code Black Box',
    hint: 'AI 生成的代码是黑盒 -- 你看不到过程，只看到结果。如何信任它？如何在不逐行审查的情况下保持对产品的理解？',
    color: '#00cffd',
  },
  {
    icon: <Eye size={16} />,
    label: 'Product Awareness',
    sublabel: '产品掌控感',
    hint: '当代码不是你写的，你如何保持对自己产品的了解程度？架构认知、功能边界、技术债务 -- 哪些必须懂，哪些可以放手？',
    color: '#00cffd',
  },
  {
    icon: <Wallet size={16} />,
    label: 'Cost Control',
    sublabel: '全栈开发的成本控制',
    hint: '一个人做全栈，工具选择就是成本控制。Vercel, Supabase, Groq -- 免费层能走多远？什么时候该花钱？',
    color: '#00cffd',
  },
  {
    icon: <Clock size={16} />,
    label: 'Interval Thinking',
    sublabel: '任务间隔的利用',
    hint: '每次等 AI 生成、等部署、等构建的间隔 -- 这些碎片时间如何变成思考和规划的窗口？',
    color: '#00cffd',
  },
  {
    icon: <Mountain size={16} />,
    label: 'Difficulty Gap',
    sublabel: '设想难度 vs 实际难度',
    hint: '开始之前觉得很难的部分，做了之后发现不难；觉得简单的部分，踩了无数坑。预期与现实的错位是最好的老师。',
    color: '#00cffd',
  },
  {
    icon: <BookOpen size={16} />,
    label: 'Learn by Doing',
    sublabel: '边做边学',
    hint: '不是先学会再做，而是先做起来再学需要的。这个项目中每一个技术决策都是在实践中学会的。',
    color: '#00cffd',
  },
];

export function SharingSession() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal size={14} className="text-[#00cffd]" />
            <span className="text-xs tracking-widest uppercase text-[#555]">
              Sharing Session
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Behind the Build
          </h2>
          <p className="text-[#8a8f98] text-base max-w-lg mx-auto leading-relaxed">
            {'一个非程序员的全栈开发手记 -- 关于 Vibe Coding、成本控制、和边做边学的真实体验。'}
          </p>
        </motion.div>

        {/* Floating topic cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-12">
          {devTopics.map((topic, i) => (
            <motion.div
              key={topic.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group cursor-pointer"
            >
              <div
                className="relative rounded-xl p-4 transition-all duration-300 overflow-hidden"
                style={{
                  background:
                    hoveredIndex === i
                      ? 'rgba(0,207,253,0.04)'
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    hoveredIndex === i
                      ? 'rgba(0,207,253,0.15)'
                      : 'rgba(255,255,255,0.04)'
                  }`,
                }}
              >
                {/* Glow on hover */}
                <AnimatePresence>
                  {hoveredIndex === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 0%, rgba(0,207,253,0.06) 0%, transparent 70%)',
                      }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300"
                    style={{
                      background:
                        hoveredIndex === i
                          ? 'rgba(0,207,253,0.12)'
                          : 'rgba(255,255,255,0.04)',
                      color:
                        hoveredIndex === i ? '#00cffd' : '#555',
                    }}
                  >
                    {topic.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white/90">
                        {topic.label}
                      </span>
                      <ChevronRight
                        size={12}
                        className="text-[#555] group-hover:text-[#00cffd] transition-colors duration-300 group-hover:translate-x-0.5 transform"
                      />
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">
                      {topic.sublabel}
                    </div>

                    {/* Expanded hint */}
                    <AnimatePresence>
                      {hoveredIndex === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs text-[#8a8f98] leading-relaxed mt-2 overflow-hidden"
                        >
                          {topic.hint}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subtle floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: 'rgba(0,207,253,0.15)',
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.7,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
