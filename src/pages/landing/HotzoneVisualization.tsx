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
    start: 10,
    width: 6,
    labelEn: 'The Pain',
    labelZh: '痛点',
    textEn: 'You\'re enjoying the podcast, absorbing ideas, feeling the flow -- then one phrase you don\'t catch breaks everything. You rewind, miss the mark, rewind again. The insight is gone. The momentum is gone.',
    textZh: '你正在享受播客，吸收观点，感受心流 -- 然后一个没听清的短语打断了一切。你倒带，没找到，再倒带。洞察没了，动力也没了。',
  },
  {
    id: 'hz2',
    start: 32,
    width: 7,
    labelEn: 'The 80/20 Reality',
    labelZh: '80/20 现实',
    textEn: 'As an advancing learner, you understand 80% of what you hear. The other 20% -- unfamiliar idioms, fast-paced clauses, technical jargon -- are exactly the parts that would accelerate your growth. But traditional tools force you to choose: flow or precision.',
    textZh: '作为进阶学习者，你能听懂 80% 的内容。剩下那 20% -- 陌生习语、快速从句、专业术语 -- 恰恰是能加速你成长的部分。但传统工具强迫你二选一：心流还是精确。',
  },
  {
    id: 'hz3',
    start: 56,
    width: 6,
    labelEn: 'Our Answer',
    labelZh: '我们的解法',
    textEn: 'One tap. No rewinding. Simpod marks the moment, snaps back to the sentence boundary, and surfaces the transcript -- all while you keep listening. The 20% is captured; the 80% flow is unbroken.',
    textZh: '一次点击，无需倒带。Simpod 标记那个瞬间，自动回溯到句子起点，浮现转录文本 -- 而你继续听。20% 被捕获了，80% 的心流没有中断。',
  },
  {
    id: 'hz4',
    start: 78,
    width: 7,
    labelEn: 'The Double Value',
    labelZh: '双重价值',
    textEn: 'You\'re no longer choosing between learning the language and absorbing the content. Every podcast episode becomes both a listening comprehension exercise and a source of real knowledge -- without the friction of intensive listening.',
    textZh: '你不再需要在「学语言」和「听内容」之间做选择。每一期播客既是听力训练，也是真正的知识来源 -- 没有精听的摩擦。',
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
            {'80% of a podcast you already understand. Simpod helps you capture the other 20% that trips you up -- without breaking your flow.'}
          </p>
          <p className="text-[#555] text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            {'80% 的播客内容你已经能听懂。Simpod 帮你捕捉剩下那 20% 让你卡壳的部分 -- 而不打断你的心流。'}
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
                  <p className="text-white/80 text-sm md:text-base leading-relaxed mb-3">
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
