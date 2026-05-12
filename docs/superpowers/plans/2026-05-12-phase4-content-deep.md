# Phase 4: 内容深度与跨学科连接 Implementation Plan

**Goal:** 解决 educator 意见 #8（跨学科连接）、#9（实践桥接）、#10（科学争议），让天文知识与孩子真实世界产生连接。

## Task 1: 跨学科连接（意见 #8）

在 InfoPanel 的 InstrumentsPanel 旁边添加"跨学科"标签页，显示该天体知识点的学科关联。

- `src/data/interdisciplinary.ts` — 天体与学科的关联数据
- 学科标签：地理、物理、历史、化学、生物
- 每个天体标注与学校课程的关联点

## Task 2: 实践桥接 — 星图方位（意见 #9）

在 InfoPanel 中添加"今晚观测"标签页：
- 基于当前日期计算行星的赤经赤纬
- 转换为方位角和高度角
- 给出肉眼可见性、最佳观测时间
- 提供观测建议

## Task 3: 科学争议与投票（意见 #10）

在 InfoPanel 中添加"科学前沿"标签页：
- 标注未解之谜和争议
- 投票功能（你认为第九行星存在吗？）
- 展示当前投票结果

## 文件清单
- `src/data/interdisciplinary.ts` (NEW)
- `src/data/controversies.ts` (NEW)
- `src/components/InterdisciplinaryPanel.tsx` (NEW)
- `src/components/ObservationGuide.tsx` (NEW)
- `src/components/ScienceFrontiers.tsx` (NEW)
- Modify `src/components/InfoPanel.tsx` — 添加跨学科/观测/前沿标签
- Modify `src/store/useStore.ts` — 投票状态
