import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotzone {
  id: string;
  start: number;
  width: number;
  labelEn: string;
  labelZh: string;
  textEn: string;
  textZh: string;
}

const HOTZONES: Hotzone[] = [
  {
    id: 'hz1',
    start: 12,
    width: 5,
    labelEn: 'Unfamiliar Word',
    labelZh: '生词',
    textEn: '"...the fiscal implications of quantitative easing are often understated..."',
    textZh: '"...量化宽松的财政影响往往被低估..."',
  },
  {
    id: 'hz2',
    start: 35,
    width: 6,
    labelEn: 'Complex Phrase',
    labelZh: '复杂短语',
    textEn: '"...what we call the paradox of thrift essentially means that individual saving can lead to collective decline..."',
    textZh: '"...我们所说的节俭悖论本质上意味着个人储蓄可能导致集体衰退..."',
  },
  {
    id: 'hz3',
    start: 58,
    width: 5,
    labelEn: 'Fast Speech',
    labelZh: '语速过快',
    textEn: '"...disproportionately-allocated-capital-expenditure across emerging-market-sovereign-debt instruments..."',
    textZh: '"...在新兴市场主权债务工具中不成比例地分配的资本支出..."',
  },
  {
    id: 'hz4',
    start: 79,
    width: 6,
    labelEn: 'Idiom / Slang',
    labelZh: '习语 / 俚语',
    textEn: '"...so basically they\'re kicking the can down the road, which is par for the course in Washington..."',
    textZh: '"...所以基本上他们是在拖延问题，这在华盛顿已经是家常便饭了..."',
  },
];

export function HotzoneVisualization() {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  return (
    <section className="relative py-24 md:py-32 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
            {'80% '}
            <span className="text-[#8a8f98]">{'/ '}</span>
            {'20%'}
          </h2>
          <p className="text-[#8a8f98] text-lg max-w-2xl mx-auto leading-relaxed">
            {'80% '}of a podcast you already understand.
            {' Simpod '}helps you capture the other
            {' 20% '}that trips you up -- without breaking your flow.
          </p>
          <p className="text-[#555] text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            {'80% '}的播客内容你已经能听懂。
            Simpod 帮你捕捉剩下{'那 20% '}让你卡壳的部分 -- 而不打断你的心流。
          </p>
        </motion.div>

        {/* Audio bar visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* The audio bar container */}
          <div
            className="relative w-full h-16 md:h-20 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Gray waveform bars background - the 80% you understand */}
            <div className="absolute inset-0 flex items-center gap-[1px] px-2">
              {Array.from({ length: 120 }).map((_, i) => {
                const h = 20 + Math.abs(Math.sin(i * 0.4) * Math.cos(i * 0.15)) * 70;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${h}%`,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    }}
                  />
                );
              })}
            </div>

            {/* Hotzone overlays - the 20% you don't understand */}
            {HOTZONES.map((zone) => (
              <motion.button
                key={zone.id}
                onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                className="absolute top-0 bottom-0 cursor-pointer group"
                style={{
                  left: `${zone.start}%`,
                  width: `${zone.width}%`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glow background */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    background: activeZone === zone.id
                      ? 'rgba(0,207,253,0.2)'
                      : 'rgba(0,207,253,0.08)',
                    boxShadow: activeZone === zone.id
                      ? '0 0 30px rgba(0,207,253,0.3)'
                      : '0 0 15px rgba(0,207,253,0.1)',
                  }}
                />

                {/* Glowing bars inside hotzone */}
                <div className="absolute inset-0 flex items-center gap-[1px] px-0.5 overflow-hidden">
                  {Array.from({ length: Math.max(3, Math.round(zone.width * 1.2)) }).map((_, i) => {
                    const h = 25 + Math.abs(Math.sin((zone.start + i) * 0.5)) * 65;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-full animate-pulse"
                        style={{
                          height: `${h}%`,
                          backgroundColor: activeZone === zone.id
                            ? 'rgba(0,207,253,0.5)'
                            : 'rgba(0,207,253,0.2)',
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '2s',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Top label on hover */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex flex-col items-center">
                  <span className="text-[10px] text-[#00cffd] font-medium tracking-wider bg-[rgba(0,207,253,0.1)] px-2 py-0.5 rounded-full">
                    {zone.labelZh}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Percentage indicator */}
          <div className="flex justify-between mt-4 px-2">
            <span className="text-xs text-[#555]">0:00</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.06)]" />
                <span className="text-xs text-[#555]">{'Understood (80%)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00cffd] opacity-50" />
                <span className="text-xs text-[#555]">{'Marked Points (20%)'}</span>
              </div>
            </div>
            <span className="text-xs text-[#555]">45:00</span>
          </div>

          {/* Expanded text panel */}
          <AnimatePresence>
            {activeZone && (
              <motion.div
                initial={{ opacity: 0, y: 15, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 overflow-hidden"
              >
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(0,207,253,0.04)',
                    border: '1px solid rgba(0,207,253,0.1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00cffd]" />
                    <span className="text-xs text-[#00cffd] font-medium tracking-wider uppercase">
                      {HOTZONES.find(z => z.id === activeZone)?.labelEn}
                    </span>
                    <span className="text-xs text-[#00cffd] opacity-60">
                      {HOTZONES.find(z => z.id === activeZone)?.labelZh}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed italic mb-2">
                    {HOTZONES.find(z => z.id === activeZone)?.textEn}
                  </p>
                  <p className="text-[#8a8f98] text-xs md:text-sm leading-relaxed">
                    {HOTZONES.find(z => z.id === activeZone)?.textZh}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
