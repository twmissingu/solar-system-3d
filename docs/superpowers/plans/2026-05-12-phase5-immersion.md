# Phase 5: 终极科幻沉浸 Implementation Plan

**Goal:** 解决 educator 意见 #16-20，完成全部20条建议的最后5条。

## Task 1: 科幻HUD界面（意见 #16）
- `src/components/HUDOverlay.tsx` — 全局HUD覆盖层
  - 扫描线效果（CSS animation horizontal lines）
  - 角落装饰框（fighter jet HUD style）
  - 数据流背景文字（random sci-fi numbers fading）
  - 选择天体时的镜头畸变提示
  - 十字准星中心点

## Task 2: 叙事任务系统（意见 #17）
- `src/data/narrativeMissions.ts` — 故事线数据
  - Mission 1: "海王星的异常信号" — 探索海王星→发现磁场异常→解释冰巨星内部
  - Mission 2: "拯救地球" — 小行星撞击预警→计算霍曼转移→拦截任务
  - Mission 3: "寻找新家园" — 在宜居带寻找行星→调整轨道参数→评估宜居性
- `src/components/NarrativePanel.tsx` — 叙事面板，剧情对话框风格

## Task 3: 声音设计（意见 #18）
- `src/utils/audio.ts` — Web Audio API封装
  - UI音效（hover/click反馈，低频短促音）
  - 行星环境音（根据选中行星播放不同频率drone）
  - 背景音乐（简单oscillator生成的ambient drone，根据所在行星变化）
- `src/components/AudioController.tsx` — 音频控制器（mute/unmute按钮）

## Task 4: 社交分享（意见 #19）
- `src/components/SharePanel.tsx` — 探索报告生成
  - 生成canvas截图（CSS背景+文字排版）
  - 报告包含：探索成就、发现的天体、学习知识数
  - 可下载为PNG图片
  - 文案模板："我在太阳系探索了X颗行星，获得了Y个徽章..."

## Task 5: 失败教育（意见 #20）
- `src/components/BlackHoleSimulator.tsx` — 黑洞体验
  - 2D SVG: 飞船靠近黑洞，参数：距离滑块
  - 实时显示潮汐力（ feet vs head gravity difference）
 - 临界点：进入事件视界
  - 失败画面："你的飞船被潮汐力撕碎了"
  - 教育信息："科学家认为任何物质都无法逃脱黑洞视界"
  - "点击重试，调整安全距离"
  - 成就解锁："黑洞幸存者"（成功逃离）

## 修改文件
- `src/components/Controls.tsx` — 添加叙事/音频/分享/黑洞入口
- `src/store/useStore.ts` — 相应状态
- `src/App.tsx` — 注册HUD等全局组件
- `src/styles/index.css` — HUD动画keyframes
