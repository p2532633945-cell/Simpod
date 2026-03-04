import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Database, MessageCircle, ChevronRight } from 'lucide-react';

interface VisionItem {
  id: string;
  icon: React.ReactNode;
  titleEn: string;
  titleZh: string;
  description: string;
  visual: React.ReactNode;
}

function VoiceAssistantVisual() {
  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center">
      {/* Soundwave rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[rgba(0,207,253,0.15)]"
          style={{
            width: `${50 + i * 40}px`,
            height: `${50 + i * 40}px`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Center mic */}
      <motion.div
        className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(0,207,253,0.15) 0%, rgba(0,207,253,0.03) 100%)',
          border: '1px solid rgba(0,207,253,0.25)',
        }}
        animate={{ boxShadow: ['0 0 20px rgba(0,207,253,0.1)', '0 0 40px rgba(0,207,253,0.2)', '0 0 20px rgba(0,207,253,0.1)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Mic size={24} className="text-[#00cffd]" />
      </motion.div>
      {/* Speech bubble */}
      <motion.div
        className="absolute top-4 right-4 md:right-8 px-3 py-2 rounded-xl text-[11px] text-[#00cffd] max-w-[160px]"
        style={{
          background: 'rgba(0,207,253,0.06)',
          border: '1px solid rgba(0,207,253,0.1)',
        }}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: [0, 1, 1, 0], x: [10, 0, 0, -10] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
      >
        {'"Help me go back to that part about inflation"'}
      </motion.div>
      {/* Response bubble */}
      <motion.div
        className="absolute bottom-4 left-4 md:left-8 px-3 py-2 rounded-xl text-[11px] text-white/60 max-w-[180px]"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 0, 1, 1, 0], y: [10, 10, 0, 0, -5] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 0.5 }}
      >
        {'Jumping to 12:34 -- "the inflation rate..."'}
      </motion.div>
    </div>
  );
}

function DataModelVisual() {
  return (
    <div className="relative w-full h-48 flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        {/* Simulated data flow */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-8 rounded-lg relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            {/* Mark points accumulating */}
            {[15, 32, 48, 65, 80].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute top-1 bottom-1 w-1 rounded-full bg-[#00cffd]"
                style={{ left: `${pos}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.6, 0.6], scale: [0, 1, 1] }}
                transition={{ duration: 0.5, delay: i * 0.4, repeat: Infinity, repeatDelay: 4 }}
              />
            ))}
          </div>
          <ChevronRight size={14} className="text-[#00cffd] opacity-30" />
        </div>
        {/* Model output */}
        <div className="flex gap-2 mb-3">
          {['idiom', 'fast speech', 'jargon', 'slang'].map((tag, i) => (
            <motion.div
              key={tag}
              className="px-2 py-1 rounded-md text-[9px] font-medium"
              style={{
                background: 'rgba(0,207,253,0.08)',
                border: '1px solid rgba(0,207,253,0.15)',
                color: '#00cffd',
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1], y: [5, 0] }}
              transition={{ delay: 2 + i * 0.2, duration: 0.4, repeat: Infinity, repeatDelay: 5 }}
            >
              {tag}
            </motion.div>
          ))}
        </div>
        {/* Prediction bar */}
        <div className="w-full h-6 rounded-lg relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <motion.div
            className="absolute top-0 bottom-0 left-0 rounded-lg"
            style={{ background: 'linear-gradient(90deg, rgba(0,207,253,0.05), rgba(0,207,253,0.2))' }}
            animate={{ width: ['0%', '72%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] text-[#00cffd] opacity-60 font-medium">
            Predicting difficulty zones...
          </div>
        </div>
      </div>
    </div>
  );
}

function AIChatVisual() {
  return (
    <div className="relative w-full h-48 flex flex-col justify-center px-6 gap-2.5">
      {/* Chat messages */}
      {[
        { align: 'right', text: 'What did they mean by "kicking the can"?', delay: 0 },
        { align: 'left', text: '"Kicking the can down the road" means to delay or postpone dealing with a problem.', delay: 1.5 },
        { align: 'right', text: 'Can you give me more examples of this idiom?', delay: 3 },
      ].map((msg, i) => (
        <motion.div
          key={i}
          className={`flex ${msg.align === 'right' ? 'justify-end' : 'justify-start'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1], y: [10, 0] }}
          transition={{ delay: msg.delay, duration: 0.5, repeat: Infinity, repeatDelay: 6 }}
        >
          <div
            className={`max-w-[75%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${
              msg.align === 'right'
                ? 'rounded-br-md'
                : 'rounded-bl-md'
            }`}
            style={{
              background: msg.align === 'right'
                ? 'rgba(0,207,253,0.1)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${msg.align === 'right' ? 'rgba(0,207,253,0.15)' : 'rgba(255,255,255,0.06)'}`,
              color: msg.align === 'right' ? '#00cffd' : 'rgba(255,255,255,0.6)',
            }}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const visionItems: VisionItem[] = [
  {
    id: 'voice',
    icon: <Mic size={20} />,
    titleEn: 'AI Voice Assistant',
    titleZh: 'AI 语音助手',
    description: '双手忙碌时通过语音控制播客回溯。"回到刚才说 inflation 的地方"——AI 助手即时定位到你模糊记得的那个词、那句话。解放双手，让回溯像对话一样自然。',
    visual: <VoiceAssistantVisual />,
  },
  {
    id: 'data',
    icon: <Database size={20} />,
    titleEn: 'Prediction Model',
    titleZh: '难点预测模型',
    description: '收集用户的标记点数据，训练文本与"听不懂热点"的映射模型。随着数据积累，Simpod 能预测播客中哪些部分容易让人卡壳，在你收听前就标注出潜在难点——从被动标记走向主动预警。',
    visual: <DataModelVisual />,
  },
  {
    id: 'chat',
    icon: <MessageCircle size={20} />,
    titleEn: 'AI Podcast Companion',
    titleZh: 'AI 播客陪练',
    description: '听完后和 AI 聊聊这期播客——复习关键表达、练习听力难点、深入探讨话题内容。反复"榨干"播客价值，充分发挥它对语言学习的帮助能力，让一期播客的学习价值成倍放大。',
    visual: <AIChatVisual />,
  },
];

export function FutureVision() {
  const [activeItem, setActiveItem] = useState<string>('voice');

  return (
    <section className="relative py-24 md:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(0,207,253,0.15)] bg-[rgba(0,207,253,0.04)] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00cffd] animate-pulse" />
            <span className="text-[11px] text-[#00cffd] tracking-widest uppercase font-medium">Roadmap</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Future Vision
          </h2>
          <p className="text-[#8a8f98] text-lg max-w-xl mx-auto leading-relaxed">
            Simpod is just getting started. Here is where we are headed.
          </p>
          <p className="text-[#555] text-sm mt-2 max-w-lg mx-auto leading-relaxed">
            Simpod 才刚刚起步。以下是我们未来的方向。
          </p>
        </motion.div>

        {/* Tab nav + content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Tab buttons */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {visionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  activeItem === item.id
                    ? 'text-[#00cffd]'
                    : 'text-[#555] hover:text-[#8a8f98]'
                }`}
                style={{
                  background: activeItem === item.id ? 'rgba(0,207,253,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeItem === item.id ? 'rgba(0,207,253,0.2)' : 'rgba(255,255,255,0.04)'}`,
                }}
              >
                {item.icon}
                <span className="hidden md:inline">{item.titleZh}</span>
              </button>
            ))}
          </div>

          {/* Content area */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(40px)',
            }}
          >
            <AnimatePresence mode="wait">
              {visionItems.filter(item => item.id === activeItem).map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 md:grid-cols-2"
                >
                  {/* Left: Info */}
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                      style={{
                        background: 'rgba(0,207,253,0.08)',
                        border: '1px solid rgba(0,207,253,0.15)',
                        color: '#00cffd',
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {item.titleEn}
                    </h3>
                    <p className="text-sm text-white/40 mb-4">
                      {item.titleZh}
                    </p>
                    <p className="text-[#8a8f98] text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Right: Visual */}
                  <div
                    className="relative"
                    style={{
                      borderLeft: '1px solid rgba(255,255,255,0.04)',
                      background: 'rgba(0,0,0,0.2)',
                    }}
                  >
                    {item.visual}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
