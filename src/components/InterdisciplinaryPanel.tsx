import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getInterdisciplinaryForBody, SubjectConnection } from '../data/interdisciplinary';
import { useStore } from '../store/useStore';

interface InterdisciplinaryPanelProps {
  bodyId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function SubjectCard({ connection }: { connection: SubjectConnection }) {
  return (
    <motion.div
      variants={cardVariants}
      className="rounded-lg border border-sci-cyan/10 overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: connection.color }}
    >
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: `${connection.color}10` }}>
        <span className="text-lg">{connection.icon}</span>
        <span className="text-sm font-bold" style={{ color: connection.color }}>
          {connection.subjectName}
        </span>
      </div>
      <ul className="px-3 py-2.5 space-y-2">
        {connection.connections.map((text, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-sci-cyan mt-0.5 text-xs">•</span>
            <span className="text-xs text-sci-white/70 leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function InterdisciplinaryPanel({ bodyId }: InterdisciplinaryPanelProps) {
  const { unlockAchievement } = useStore();
  const data = getInterdisciplinaryForBody(bodyId);

  useEffect(() => {
    unlockAchievement('interdisciplinary');
  }, [bodyId, unlockAchievement]);

  if (!data || data.subjects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-sci-white/40 italic">暂无该天体的跨学科内容。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-sci-cyan/5 border border-sci-cyan/15 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-sci-gold text-base shrink-0">💡</span>
          <p className="text-xs text-sci-white/60 leading-relaxed">
            天文学不是孤立的学科。探索天体如何与物理、化学、生物、地理和历史相互交织，你会发现一个更加精彩的宇宙。
          </p>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.subjects.map((subject) => (
          <SubjectCard key={subject.subject} connection={subject} />
        ))}
      </motion.div>
    </div>
  );
}
