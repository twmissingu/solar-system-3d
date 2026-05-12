# 贡献指南

感谢你对「太阳系3D探索」项目的兴趣！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

1. 确认该问题尚未被报告
2. 使用 [Issue 模板](../../issues/new) 创建新 Issue
3. 提供详细描述：
   - 复现步骤
   - 期望行为 vs 实际行为
   - 浏览器版本和操作系统
   - 控制台错误日志（如有）

### 提交功能建议

1. 先查看现有 Issue，避免重复建议
2. 清晰描述功能用途和使用场景
3. 如有UI相关的建议，可附草图或参考链接

### 代码贡献

#### 开发环境设置

```bash
git clone https://github.com/twzhan/solar-system-3d.git
cd solar-system-3d
npm install
npm run dev
```

#### 代码规范

- **语言**：所有UI文本和代码注释使用中文
- **命名**：
  - 组件文件：PascalCase（如 `MissionPanel.tsx`）
  - 数据/工具文件：camelCase（如 `celestialData.ts`）
  - Zustand状态：camelCase，布尔开关以`show`开头
- **TypeScript**：`strict: true` 已开启，避免使用 `any`
- **3D性能**：
  - 避免在多个组件中使用 `useFrame`
  - 时间相关逻辑集中到 `SolarSystem.tsx`
  - 使用 `useMemo` 缓存计算结果
- **样式**：复用已有科幻风格CSS类：
  - `.sci-panel` — 毛玻璃面板
  - `.sci-button` / `.sci-button-primary` — 按钮
  - `.sci-text-glow` — 文字发光
  - `.hud-corner` — HUD角落装饰

#### 提交 PR 流程

1. 从 `main` 分支创建新分支：`git checkout -b feature/xxx`
2. 保持提交历史清晰，每次提交只做一件事
3. 确保 `npm run build` 成功通过
4. 推送分支并创建 Pull Request
5. 在 PR 描述中关联相关 Issue（如有）

## 开发准则

### 添加新天体

参考 `src/data/celestialData.ts` 中的 `CelestialBody` 接口：

```typescript
{
  id: "custom_planet",
  name: "Custom Planet",
  nameZh: "自定义行星",
  radiusKm: 5000,
  visualRadius: 1.0,
  color: "#FF0000",
  orbit: { a: 1.5, e: 0.1, i: 5, L: 0, longPeri: 0, longNode: 0, period: 500 },
  rotationPeriod: 24,
  axialTilt: 23.5,
  description: "描述文本..."
}
```

### 添加新面板/功能

1. 在 `src/store/useStore.ts` 中添加状态：
   ```typescript
   showNewPanel: boolean;
   setShowNewPanel: (show: boolean) => void;
   ```
2. 在 `App.tsx` 中条件渲染新组件
3. 新组件使用 `.sci-panel` 等已有样式类
4. 如有必要，在 `src/data/` 中添加对应数据文件

## 社区

- 讨论请使用 [GitHub Discussions](../../discussions)
- 紧急问题可联系维护者

再次感谢你的贡献！🪐
