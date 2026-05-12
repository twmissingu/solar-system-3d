import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { achievements, getAchievementById } from '../data/achievements';
import { playUISound } from '../utils/audio';

const spaceQuotes = [
  '宇宙不仅比我们想象的更奇特，它比我们能够想象的更奇特。—— J.B.S. 霍尔丹',
  '我们是宇宙认识自己的一种方式。—— 卡尔·萨根',
  '在宇宙的尺度上，我们渺小如尘埃；但在思想的尺度上，我们无限辽阔。',
  '探索未知的勇气，是人类最珍贵的品质。',
  '每一颗星星都是一盏灯，照亮我们前行的路。',
  '宇宙没有义务让我们理解它。—— 尼尔·德格拉斯·泰森',
];

export default function SharePanel() {
  const { showSharePanel, setShowSharePanel, exploredBodies, unlockedAchievements, completedMissions } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const favoritePlanet = exploredBodies.length > 0 ? exploredBodies[exploredBodies.length - 1] : 'earth';
  const planetNames: Record<string, string> = {
    sun: '太阳', mercury: '水星', venus: '金星', earth: '地球',
    mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星',
    neptune: '海王星', pluto: '冥王星', moon: '月球',
  };

  const quote = spaceQuotes[Math.floor(Math.random() * spaceQuotes.length)];

  const unlockedData = unlockedAchievements
    .map((id) => getAchievementById(id))
    .filter(Boolean);

  const handleGenerate = useCallback(() => {
    playUISound('click');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0A1628');
    gradient.addColorStop(1, '#050B14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 1.5;
      ctx.fillStyle = `rgba(174, 214, 241, ${Math.random() * 0.5 + 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Corner accents
    const cornerSize = 30;
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(20, 20 + cornerSize);
    ctx.lineTo(20, 20);
    ctx.lineTo(20 + cornerSize, 20);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 20 - cornerSize, 20);
    ctx.lineTo(width - 20, 20);
    ctx.lineTo(width - 20, 20 + cornerSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(20, height - 20 - cornerSize);
    ctx.lineTo(20, height - 20);
    ctx.lineTo(20 + cornerSize, height - 20);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 20 - cornerSize, height - 20);
    ctx.lineTo(width - 20, height - 20);
    ctx.lineTo(width - 20, height - 20 - cornerSize);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#4ECDC4';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('太阳系探索报告', width / 2, 90);

    // Date
    const dateStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillStyle = 'rgba(232, 244, 253, 0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText(dateStr, width / 2, 120);

    // Divider
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 140);
    ctx.lineTo(width - 60, 140);
    ctx.stroke();

    // Stats
    let y = 185;
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#E8F4FD';
    ctx.fillText('探索统计', 60, y);

    y += 35;
    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(232, 244, 253, 0.85)';
    ctx.fillText(`• 探索了 ${exploredBodies.length} 颗天体`, 60, y);
    y += 30;
    ctx.fillText(`• 解锁了 ${unlockedAchievements.length} 个徽章`, 60, y);
    y += 30;
    ctx.fillText(`• 完成了 ${completedMissions.length} 个任务`, 60, y);

    // Favorite planet
    y += 40;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#E8F4FD';
    ctx.fillText('最近探索', 60, y);
    y += 35;
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#FDB813';
    ctx.fillText(`🪐 ${planetNames[favoritePlanet] || favoritePlanet}`, 60, y);

    // Achievements
    if (unlockedData.length > 0) {
      y += 50;
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#E8F4FD';
      ctx.fillText('已解锁徽章', 60, y);

      y += 40;
      const itemsPerRow = 5;
      const itemSize = 50;
      const gap = 15;
      const startX = (width - (itemsPerRow * itemSize + (itemsPerRow - 1) * gap)) / 2;

      unlockedData.slice(0, 10).forEach((ach, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const x = startX + col * (itemSize + gap);
        const itemY = y + row * (itemSize + gap);

        // Badge bg
        ctx.fillStyle = 'rgba(78, 205, 196, 0.15)';
        ctx.beginPath();
        ctx.arc(x + itemSize / 2, itemY + itemSize / 2, itemSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(78, 205, 196, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Emoji
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#E8F4FD';
        ctx.fillText(ach!.icon, x + itemSize / 2, itemY + itemSize / 2);

        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
      });

      y += Math.ceil(Math.min(unlockedData.length, 10) / itemsPerRow) * (itemSize + gap) + 20;
    } else {
      y += 50;
    }

    // Quote
    y = Math.max(y, 500);
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(width - 60, y);
    ctx.stroke();

    y += 30;
    ctx.textAlign = 'center';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillStyle = 'rgba(232, 244, 253, 0.7)';

    // Wrap quote text
    const maxWidth = width - 120;
    const words = quote.split('');
    let line = '';
    const lines: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line.length > 0) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    lines.forEach((l) => {
      ctx.fillText(l, width / 2, y);
      y += 24;
    });

    // Footer
    ctx.fillStyle = 'rgba(232, 244, 253, 0.4)';
    ctx.font = '14px sans-serif';
    ctx.fillText('Solar System 3D · 太阳系3D探索', width / 2, height - 50);

    setGenerated(true);
  }, [exploredBodies.length, unlockedAchievements.length, completedMissions.length, favoritePlanet, quote, unlockedData]);

  const handleDownload = useCallback(() => {
    playUISound('click');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `太阳系探索报告_${new Date().toLocaleDateString('zh-CN')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const handleCopyText = useCallback(() => {
    playUISound('click');
    const text = `太阳系探索报告\n日期：${new Date().toLocaleDateString('zh-CN')}\n\n探索了 ${exploredBodies.length} 颗天体\n解锁了 ${unlockedAchievements.length} 个徽章\n完成了 ${completedMissions.length} 个任务\n\n最近探索：${planetNames[favoritePlanet] || favoritePlanet}\n\n${quote}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [exploredBodies.length, unlockedAchievements.length, completedMissions.length, favoritePlanet, quote]);

  const handleClose = useCallback(() => {
    playUISound('click');
    setShowSharePanel(false);
    setGenerated(false);
  }, [setShowSharePanel]);

  if (!showSharePanel) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5, 11, 20, 0.85)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="w-full max-w-lg mx-4"
      >
        <div className="sci-panel sci-corner p-4 sm:p-6 relative">
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-sci-white/40 hover:text-sci-white transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>

          <h2
            className="text-xl sm:text-2xl font-bold text-sci-cyan sci-text-glow tracking-wider mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            📸 探索报告
          </h2>

          {/* Canvas preview */}
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              className="rounded border border-sci-cyan/20"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {!generated && (
            <div className="text-center text-sm text-sci-white/50 mb-4">
              点击"生成报告"创建你的探索报告
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!generated ? (
              <button onClick={handleGenerate} className="sci-button-primary px-5 py-2 text-sm">
                生成报告
              </button>
            ) : (
              <>
                <button onClick={handleDownload} className="sci-button-primary px-5 py-2 text-sm">
                  下载图片
                </button>
                <button onClick={handleCopyText} className="sci-button px-5 py-2 text-sm">
                  {copied ? '已复制 ✓' : '复制文本'}
                </button>
                <button onClick={handleGenerate} className="sci-button px-5 py-2 text-sm">
                  重新生成
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
