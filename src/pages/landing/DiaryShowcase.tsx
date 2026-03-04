import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

interface DiaryCard {
  date: string;
  title: string;
  content: string;
  keyPoints: string[];
}

const diaryCards: DiaryCard[] = [
  {
    date: '2025-12-24',
    title: 'AI 时代的产品架构',
    content:
      '以 Obsidian 为例子，对于产品的设计和架构由人来搭建（其实这个本身是沿用已久的模式，需求、审美、维护、交互、功效控制，确实是人来比较合理），而企业方提供大量的类似 plugin 的插件、模块，采用统一语言写，最好能统一变量或者至少不相互冲突，AI 的作用则是理解这个有限库中的内容，以方便在知道用户需求后以局部的块的方式有的放矢、有依据地提供解决方案，并且协助用户完成拼装和功能的添加。\n\n用一个简明生动的例子来说，我们考虑的未来程序构架是一个利用 AI 大大降低使用门槛和学习门槛的开发平台，开发工作由企业方完成并提供选择 AI 的检索库中，AI 负责的是链接从用户需求到模组被正确地修改、安装、删除的过程。就好像乐高积木一样，我们提供了一个主题，您可以在空间中按照自己的想法组装不一样的程序，而组装这个过程完全不需要您的努力，AI 会考虑您的方案并在有限的积木块中探索实现的方案，程序定制化不再是少数玩家的专利。',
    keyPoints: [
      '人负责架构设计，AI 负责模块拼装',
      '乐高积木模型：有限模块 + 无限组合',
      '降低定制化门槛，程序定制不再是少数玩家专利',
    ],
  },
  {
    date: '2026-01-01',
    title: '技术平权与聚合平台',
    content:
      '当生产进入大爆炸时期之后市场是如何变化的，最后的赢家是谁，这一阶段就像"飞入寻常百姓家"的商品平权，而在 AI 时代则是类似技术平权或者资源平权。\n\n每一个产品变成一个独立的自己封装好的远程黑盒，提供 API，一站式集成式地解决所有问题。有效时间流向哪里，价值就流向了哪里，如果全世界的人都在做 AI 工具，而单个商品的获利能力被稀释，就需要一个聚合平台产生足够大的引力来集成。\n\n我始终觉得会关注技术和使用、探索技术的是少数人，所以即使将来技术平权了，要想从更广大的市场上赚钱，还是需要把封装和使用做得更简单更集成。如果我们能为本来要被淘汰的这些人提供帮助，就会获得他们巨大的回报。那些所谓的跟上时代的技术者们在开发、使用底层大模型并生成好的工具的时候，其实就是在宏观尺度上充当了 human assistance，我们如果能把这些节点链接起来，就是很好地利用了这些本来被稀释了的价值。',
    keyPoints: [
      '技术平权 = 商品平权的 AI 时代版本',
      '聚合平台：将稀释的价值重新聚合',
      '技术探索者是少数，服务大众才是市场',
      '链接节点 = 利用被稀释的 human assistance 价值',
    ],
  },
  {
    date: '2026-01-05',
    title: 'Prompt 复用与交互革新',
    content:
      '交互形式的优化，有点类似大模型发展方向往预测形式的转型，但是在当前的语言概率大模型的框架上也还有可以改进的空间，就是专门在 prompt 上面下功夫。\n\n从提供产品的角度来看，交互方式明明可以改成用户输入一个简单指令，AI 提供各种选项卡片和可选内容，包括可以给出总的方案设计和结果预测，甚至成功率预测，输出篇幅等等，来在不浪费或者少浪费 token 的基础上实现更丝滑的交互。\n\n采用这个逻辑可以大大降低 AI 高效使用的门槛，让很多想象力和语言组织能力不足的用户也能获得更好的交互体验，也就是 chatbot 本身还能再创新。同时可以提高 prompt 的复用率，如果能实现这个功能，甚至有可能干倒大厂的 chatbot，本来就是同一个 API。建构时代拼的是产品和服务，和外卖拼的是最后 10 米是一个逻辑。',
    keyPoints: [
      'Chatbot 交互本身还有巨大创新空间',
      'Prompt 复用 = 避免每个人重复造轮子',
      '降低 AI 使用门槛 > 提升 AI 能力本身',
      '同一个 API，拼的是产品和服务',
    ],
  },
  {
    date: '2026-01-09',
    title: '抓住本质，不被表象迷惑',
    content:
      '不管是当年泡沫高涨的时候还是现在发展成熟的时候，都还有很多人根本不了解这两个板块技术、能力、机制的边界和效能，所以其实完全不必全盘地了解一个新时代的所有复杂概念，应该学会抓更本质的东西。\n\n以后 AI 时代也绝不会是人人手机上都有一堆厉害的 AI 应用，最后留在大众那里的，似乎是最自然、最低成本、最 no friction、一站式解决所有东西的。工业时代留在人们这里的是手机和各种产品，而不是机器；互联网时代留在用户端的是搜索引擎和社交软件，而不是一堆厉害的功能、协议和技术文档。\n\n卖可以复用的服务，而不是点对点的定制化。应该去想某 AI 的功能是否产生了一个可复用的服务，而我可以帮别人节省获得这个服务所需要的成本，当好一个 waiter。很多产出本来就不应该每个人都重新来一遍。本来我们说 AI 赋能的是个性化，但我反而发现"共性化"可能是另一个努力的方向。\n\n太阳底下没有新鲜事。每一个风口中人们大都有类似的不同角色。我想研究本质，抓住本质，才不会被任何一个时代淘汰。"人类从历史中唯一学到的教训就是人类从来不从历史中吸取教训" -- 而我可以，这就是专属于我的秘密武器。',
    keyPoints: [
      '每个时代留下的是最自然、最低摩擦的产品',
      '共性化 > 个性化：可复用的服务才是方向',
      '当好一个 waiter，而不是造轮子',
      '"人类不从历史中吸取教训" -- 而我可以',
    ],
  },
];

export function DiaryShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCardPulled, setIsCardPulled] = useState(false);
  const card = diaryCards[activeIndex];

  const goTo = (index: number) => {
    setIsCardPulled(false);
    setTimeout(() => {
      setActiveIndex(index);
    }, 200);
  };

  const goPrev = () => goTo((activeIndex - 1 + diaryCards.length) % diaryCards.length);
  const goNext = () => goTo((activeIndex + 1) % diaryCards.length);

  return (
    <section className="relative py-24 md:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText size={14} className="text-[#00cffd]" />
            <span className="text-xs tracking-widest uppercase text-[#555]">
              Obsidian Archives
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {'Thinking in Public'}
          </h2>
          <p className="text-[#8a8f98] text-base max-w-lg mx-auto leading-relaxed">
            {'从日记中提取的关于 AI 时代的思考碎片。点击卡片抽出档案。'}
          </p>
        </motion.div>

        {/* Card indicator dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {diaryCards.map((c, i) => (
            <button
              key={c.date}
              onClick={() => goTo(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300"
              style={{
                background:
                  i === activeIndex
                    ? 'rgba(0,207,253,0.1)'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${
                  i === activeIndex
                    ? 'rgba(0,207,253,0.2)'
                    : 'rgba(255,255,255,0.05)'
                }`,
              }}
            >
              <Calendar
                size={10}
                style={{
                  color: i === activeIndex ? '#00cffd' : '#555',
                }}
              />
              <span
                className="text-[10px] font-mono"
                style={{
                  color: i === activeIndex ? '#00cffd' : '#555',
                }}
              >
                {c.date}
              </span>
            </button>
          ))}
        </div>

        {/* Main card area */}
        <div className="relative">
          {/* Stacked cards behind */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[2, 1].map((offset) => {
              const stackIdx =
                (activeIndex + offset) % diaryCards.length;
              return (
                <div
                  key={stackIdx}
                  className="absolute rounded-2xl"
                  style={{
                    width: `calc(100% - ${offset * 24}px)`,
                    height: '100%',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    transform: `translateY(${offset * 6}px)`,
                    opacity: 0.4 - offset * 0.15,
                  }}
                />
              );
            })}
          </div>

          {/* Active card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                }}
                onClick={() => setIsCardPulled(!isCardPulled)}
              >
                {/* Card header */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(0,207,253,0.02)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#00cffd' }}
                    />
                    <span className="text-xs font-mono text-[#8a8f98]">
                      diary / {card.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#555] tracking-wider uppercase">
                      {isCardPulled
                        ? 'click to collapse'
                        : 'click to expand'}
                    </span>
                    <motion.div
                      animate={{ rotate: isCardPulled ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={12} className="text-[#555]" />
                    </motion.div>
                  </div>
                </div>

                {/* Title bar */}
                <div className="px-6 py-4">
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {card.title}
                  </h3>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isCardPulled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col lg:flex-row gap-0">
                        {/* Full text */}
                        <div
                          className="flex-1 px-6 py-5"
                          style={{
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <div className="text-xs text-[#555] uppercase tracking-widest mb-3">
                            Original Text
                          </div>
                          <div className="text-sm text-[#c0c0c5] leading-[1.8] whitespace-pre-line">
                            {card.content}
                          </div>
                        </div>

                        {/* Key points sidebar */}
                        <div
                          className="lg:w-72 shrink-0 px-6 py-5"
                          style={{
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                            borderLeft:
                              'lg:1px solid rgba(255,255,255,0.04)',
                            background: 'rgba(0,207,253,0.015)',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb
                              size={12}
                              className="text-[#00cffd]"
                            />
                            <span className="text-xs text-[#555] uppercase tracking-widest">
                              Key Insights
                            </span>
                          </div>
                          <div className="flex flex-col gap-3">
                            {card.keyPoints.map((point, pi) => (
                              <motion.div
                                key={pi}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.15 + pi * 0.1,
                                }}
                                className="flex items-start gap-2"
                              >
                                <div
                                  className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                                  style={{
                                    background: '#00cffd',
                                  }}
                                />
                                <span className="text-xs text-[#8a8f98] leading-relaxed">
                                  {point}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={goPrev}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#8a8f98',
              }}
              aria-label="Previous card"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono text-[#555]">
              {activeIndex + 1} / {diaryCards.length}
            </span>
            <button
              onClick={goNext}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#8a8f98',
              }}
              aria-label="Next card"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
