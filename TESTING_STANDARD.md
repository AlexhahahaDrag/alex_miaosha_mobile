# 前端（移动端）测试标准

> **适用项目**：`alex_miaosha_mobile`（Vue 3.5 + Vite 8 + TypeScript 6 + Vant 4）
> **配套测试栈**：`@midscene/web` 1.7.x + `playwright` 1.60.x
> **文档版本**：v1.0
> **最后更新**：2026-05-28
> **关联文档**：后端 `TESTING_STANDARD.md`、PC 端 `TESTING_STANDARD.md`

---

## 目录

- [第一部分 · 现状诊断](#第一部分--现状诊断)
- [第二部分 · 移动端测试方法论](#第二部分--移动端测试方法论)
- [第三部分 · 移动端特有边界](#第三部分--移动端特有边界)
- [第四部分 · 标准化体系](#第四部分--标准化体系)
- [第五部分 · 30 天落地路线](#第五部分--30-天落地路线)
- [第六部分 · Anti-pattern 警示](#第六部分--anti-pattern-警示)
- [附录 A · Vant 组件 testid 约定](#附录-a--vant-组件-testid-约定)
- [附录 B · 移动端探针清单](#附录-b--移动端探针清单)

---

## 第一部分 · 现状诊断

### 1.1 已有基建（保留并发扬）

| 项 | 评价 |
|---|---|
| Midscene 在移动端 viewport（390×844）跑起来了 | ⭐⭐⭐⭐⭐ |
| `installHapticProbe` 拦截 `navigator.vibrate` 计数 | ⭐⭐⭐⭐⭐ 难得一见的移动专属探针 |
| `isMobile + hasTouch` Playwright 配置 | ⭐⭐⭐⭐ |
| `MOBILE_BASE_URL` / `MOBILE_TEST_USER` 独立环境 | ⭐⭐⭐⭐ |
| Graphify 知识图谱集成 | ⭐⭐⭐⭐ |

### 1.2 缺口（按优先级）

| # | 缺口 | 风险 | 优先级 |
|---|---|---|---|
| 1 | **gift 移动端只有 3 个 case**（PC 25+） | 移动端回归保障弱 | P0 |
| 2 | 无单元测试框架（无 vitest） | utils/dayjs、stores 等无回归 | P0 |
| 3 | 无下拉刷新 / 上拉加载 / 长按删除 / 左滑等手势测试 | 移动核心交互无 case | P1 |
| 4 | 无骨架屏时长 / 首屏 LCP 性能断言 | 移动性能问题无感知 | P1 |
| 5 | 无 viewport 矩阵（仅 390×844） | iPhone SE 320px 等小屏未覆盖 | P1 |
| 6 | 无离线 / 弱网测试 | 移动场景常见，未覆盖 | P1 |
| 7 | Haptic 探针只在 gift 用，未抽公共 | 其他模块用不上 | P2 |

---

## 第二部分 · 移动端测试方法论

### 2.1 测试金字塔（移动端版本）

```
          ╱╲
         ╱AI╲       ←  20%  Midscene：视觉、手势、Haptic、跨页面流程
        ╱────╲              移动端 AI 占比更高（手势难写、视觉密度大）
       ╱ 集成 ╲     ←  25%  Playwright：DOM 闭环（touch 事件）
      ╱────────╲
     ╱   单元   ╲   ←  55%  Vitest：纯函数、composable、Pinia
    ╱────────────╲
```

**和 PC 端的关键差异**：
- AI 占比 20%（PC 是 15%）：移动端的下拉刷新、长按、左滑、骨架屏等"行为难描述"的场景多
- 单元测试占比 55%（PC 是 60%）：移动端组件交互更密集
- **必须配置 mobile viewport + hasTouch + isMobile**

### 2.2 谁测哪一层（移动端示例）

| 测什么 | 工具 | 例子 |
|---|---|---|
| `@alex_miaosha_mobile/src/utils/dayjs` 格式化函数 | Vitest | 跨日 / 跨年 / 时区 |
| `useNavBarConfig` 等 composable | Vitest + @vue/test-utils | NavBar 配置响应式 |
| Pinia store（用户态、底部 Tab 等） | Vitest | persist 持久化 |
| Vant 组件二次封装（如 `GiftRecordCard`） | Vitest | props + emit |
| 路由守卫、登录拦截 | Playwright | 真机浏览器 |
| 下拉刷新 / 上拉加载 | Playwright + 模拟手势 | swipe down |
| Haptic 震动反馈 | Midscene + 探针 | `__giftVibrateCount` |
| 视觉合理性、骨架屏布局 | Midscene AI | "骨架屏与最终内容对齐" |
| 跨页面流程（快速记礼） | Midscene + Playwright | 弹窗 → 提交 → 列表更新 |

### 2.3 边界识别（移动端七点法）

七点法不变，但**移动端要补一类专属边界**——**手势边界**：

| 手势类型 | 必测边界 |
|---|---|
| **下拉刷新** | 下拉距离 < 阈值（不触发）、= 阈值（临界）、> 阈值（触发）、连续下拉、刷新中再下拉 |
| **上拉加载** | 距底部 0/50/100px 触发、无更多数据后不再触发、加载中不重复触发 |
| **长按** | 触发时间 < 500ms（不触发）、= 500ms（临界）、> 1s（触发） |
| **左滑/右滑** | 距离 < 30%（回弹）、= 50%（粘附）、> 70%（删除） |
| **双指缩放** | 比例 1.0 / 1.5 / 2.0 / 3.0（如有） |

### 2.4 覆盖率工具

移动端引入 vitest 配置（与 PC 类似，但要配 `jsdom` + 模拟 `navigator.vibrate` 等）：

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
        statements: 70,
      },
    },
  },
});
```

`tests/setup.ts`（移动端专属环境模拟）：

```typescript
import { vi } from 'vitest';

Object.defineProperty(navigator, 'vibrate', {
  configurable: true,
  value: vi.fn().mockReturnValue(true),
});

global.matchMedia = vi.fn().mockImplementation((q) => ({
  matches: false,
  media: q,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
```

---

## 第三部分 · 移动端特有边界

### 3.1 设备 viewport 矩阵

**最低必测**：

| 设备 | 宽度 | 高度 | 必测理由 |
|---|---|---|---|
| iPhone SE | 320 | 568 | 国内还有大量用户，最窄屏 |
| iPhone 12/13/14 | 390 | 844 | 主流 iOS |
| iPhone 14 Pro Max | 430 | 932 | 大屏 iOS |
| 小米/华为典型机型 | 360 | 800 | Android 主流 |
| iPad Mini | 768 | 1024 | 平板临界 |

实现方式：在 `scripts/midscene/run-gift-smoke.mjs` 加 viewport 数组循环：

```javascript
const viewports = [
  { name: 'iphone-se', width: 320, height: 568 },
  { name: 'iphone-13', width: 390, height: 844 },
  { name: 'android', width: 360, height: 800 },
];

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    isMobile: true,
    hasTouch: true,
  });
  // 跑同一个 case
}
```

### 3.2 网络条件矩阵

| 网络条件 | 测什么 | 工具 |
|---|---|---|
| 离线 | 提示文案、降级 UI、本地缓存命中 | `context.setOffline(true)` |
| 慢 3G | 骨架屏出现、Loading 占位 | `context.route(...)` 加延迟 |
| 普通 4G | 正常流程 | 默认 |
| Wi-Fi 5G | 性能基线 | 默认 |

### 3.3 副作用探针（移动端核心）

**已有**：`installHapticProbe` 拦截 `navigator.vibrate`。

**应该加的**：

| 探针名 | 拦截目标 | 用途 |
|---|---|---|
| `installHapticProbe` ✓ | `navigator.vibrate` | 震动反馈次数 |
| `installToastProbe` | Vant `showToast` | 提示弹出次数与内容 |
| `installDialogProbe` | Vant `showDialog` | 确认弹窗次数 |
| `installNotifyProbe` | Vant `showNotify` | 通知次数 |
| `installRouterProbe` | `router.push/replace/back` | 路由跳转链路 |
| `installLocalStorageProbe` | `localStorage.setItem` | 持久化写入次数与 key |
| `installFetchProbe` | `fetch / axios` | 接口调用次数、参数、响应耗时 |

把这些**抽成 `tests/midscene/probes/`** 公共模块，所有 case 复用。

### 3.4 性能边界

移动端必测的性能指标：

| 指标 | 阈值 | 测法 |
|---|---|---|
| 首屏 LCP | < 2.5s | `performance.getEntriesByType('largest-contentful-paint')` |
| 路由切换 | < 300ms | `performance.now()` 前后差 |
| 列表渲染 1000 条 | < 1s | mock 数据 + 计时 |
| 骨架屏总时长 | 200ms ~ 1.5s | 出现 → 消失计时 |

---

## 第四部分 · 标准化体系

### 4.1 命名约定

#### 测试文件
```
src/utils/dayjs/index.ts                          ← 源文件
src/utils/dayjs/index.spec.ts                     ← 同目录单测
tests/midscene/gift/cases/mobile-smoke.json       ← AI case 数据
tests/midscene/probes/haptic.mjs                  ← 公共探针
scripts/midscene/run-gift-smoke.mjs               ← 执行脚本
```

#### 测试 caseId

```
GIFT-MOBILE-001  ← 模块-端-编号（已有）
GIFT-MOBILE-GESTURE-001  ← 模块-端-类型-编号（手势类）
GIFT-MOBILE-PERF-001     ← 性能类
GIFT-MOBILE-OFFLINE-001  ← 离线类
GIFT-MOBILE-VIEWPORT-SE  ← 视口类，后缀机型
```

### 4.2 必测维度（移动端版本）

| 维度 | 必测项 |
|---|---|
| 工具函数 | 同 PC：七点法 + null + 边界 |
| Composable | `useNavBarConfig`、`useTabBar` 等 |
| Pinia Store | 用户态、persist、跨页面共享 |
| Vant 二次封装 | `GiftRecordCard` 等业务组件 |
| 路由 | 登录拦截、底部 Tab 切换、回退栈 |
| **手势** | 下拉刷新、上拉加载、长按删除、左滑 |
| **副作用** | Haptic、Toast、Dialog、Router、Storage |
| 视觉 | 多 viewport、骨架屏、长文本截断、暗色模式 |
| 性能 | LCP、列表渲染、路由切换 |
| 网络 | 在线/离线/慢网三态 |

### 4.3 覆盖率门槛

| 范围 | Line | Branch | 备注 |
|---|---|---|---|
| `src/utils/` | ≥ 85% | ≥ 70% | 工具必须全测 |
| `src/stores/` | ≥ 80% | ≥ 70% | |
| `src/views/finance/gift/` | ≥ 70% | ≥ 60% | |
| 其它 views | ≥ 50% | ≥ 40% | 视觉部分用 AI 兜 |

### 4.4 禁止事项

与 PC 端共同的禁止项之外，**移动端特有禁止**：

| 禁止 | 替代 |
|---|---|
| ❌ 在桌面 viewport（1400×900）跑移动 case | 必须 390×844 + isMobile + hasTouch |
| ❌ 手动写日期格式化（`new Date().toLocaleString()`） | 用 `@/utils/dayjs` 工具 |
| ❌ 移动端测试用 `page.click` 触发 touch | 用 `page.tap()` |
| ❌ 在 NavBar 配置上手写完整对象 | 用 `Pick<NavBarConfig, 'title' \| 'rightButton' \| 'leftPath'>` 模式 |
| ❌ 测试中直接 `import { ref } from 'vue'` | 项目已配 auto-import |

### 4.5 测试代码模板

#### 手势测试模板（Playwright）

```typescript
import { test, expect } from '@playwright/test';

test.describe('GIFT-MOBILE-GESTURE-PULL-REFRESH', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('should_refresh_when_pull_distance_exceeds_threshold', async ({ page }) => {
    await page.goto('/#/finance/gift/person');

    const refreshApi = page.waitForResponse(
      (r) => r.url().includes('/gift-person-info-t/business-page')
    );

    const list = page.locator('.gift-person-list');
    const box = (await list.boundingBox())!;
    await page.touchscreen.tap(box.x + box.width / 2, box.y + 50);
    await page.evaluate(({ x, y }) => {
      const target = document.elementFromPoint(x, y)!;
      target.dispatchEvent(new TouchEvent('touchstart', {
        touches: [new Touch({ identifier: 0, target, clientX: x, clientY: y })],
      }));
      target.dispatchEvent(new TouchEvent('touchmove', {
        touches: [new Touch({ identifier: 0, target, clientX: x, clientY: y + 200 })],
      }));
      target.dispatchEvent(new TouchEvent('touchend', { touches: [] }));
    }, { x: box.x + box.width / 2, y: box.y + 50 });

    await refreshApi;
    await expect(page.getByTestId('refresh-success-toast')).toBeVisible();
  });
});
```

#### Haptic 副作用测试（Midscene + 探针）

```typescript
await page.addInitScript(() => {
  window.__hapticLog = [];
  const orig = navigator.vibrate?.bind(navigator);
  Object.defineProperty(navigator, 'vibrate', {
    value: (pattern) => {
      (window as any).__hapticLog.push({ pattern, ts: Date.now() });
      return orig ? orig(pattern) : true;
    },
  });
});

await page.goto('/#/finance/gift/record');
await page.getByTestId('gift-record-fab').tap();
await page.getByTestId('quick-amount-100').tap();

const hapticLog = await page.evaluate(() => (window as any).__hapticLog);
expect(hapticLog.length).toBeGreaterThan(0);
expect(hapticLog[0].pattern).toBe(10);
```

---

## 第五部分 · 30 天落地路线

### Week 1 · 引入 Vitest + 抽公共探针
| 任务 | 投入 |
|---|---|
| 安装 vitest + @vue/test-utils + jsdom + coverage | 0.5 天 |
| `tests/midscene/probes/` 抽出 5 个公共探针 | 1 天 |
| `src/utils/dayjs/*` 写第一批单测 | 1 天 |
| `MIDSCENE_CACHE` 启用 + 关键按钮加 testid | 1 天 |

### Week 2 · 单测铺开 + 视口矩阵
| 任务 | 投入 |
|---|---|
| `src/utils/*` `src/stores/*` 全覆盖到 80% | 2 天 |
| viewport 矩阵（iPhone SE / 13 / Android） | 1.5 天 |
| 离线 / 慢网测试 2 个示范 case | 1 天 |

### Week 3 · 手势 + 性能
| 任务 | 投入 |
|---|---|
| 下拉刷新 / 上拉加载 / 长按删除 3 个手势 case | 2 天 |
| LCP / 路由切换性能基线 case | 1.5 天 |
| 大列表（1000 条 mock）虚拟滚动 case | 1 天 |

### Week 4 · CI + 与 PC 对齐
| 任务 | 投入 |
|---|---|
| gift 移动端 case 数量从 3 扩到 10+ | 2 天 |
| GitHub Actions CI 接入 | 1 天 |
| 与 PC 测试结果合并出统一覆盖率报告 | 0.5 天 |

---

## 第六部分 · Anti-pattern 警示

### 移动端 8 大反模式

1. ❌ **桌面 viewport 跑移动 case**：必须 `isMobile + hasTouch`
2. ❌ **用 click 代替 tap**：行为不同（无 touch 事件）
3. ❌ **手势用 `waitForTimeout(2000)` 模拟**：用真实 touch 事件序列
4. ❌ **断言"页面正常"**：必须具体可证伪
5. ❌ **测一次代表所有机型**：必须 viewport 矩阵
6. ❌ **不测 Haptic / Toast 等副作用**：移动核心交互
7. ❌ **不模拟离线**：移动场景常见
8. ❌ **直接连 dev 后端**：必须有 mock 模式（特别是性能/大列表测试）

---

## 附录 A · Vant 组件 testid 约定

格式同 PC 端，但需要适配 Vant 的特殊组件：

| Vant 组件 | testid 约定 |
|---|---|
| `<van-button>` | `{module}-btn-{action}`，如 `gift-btn-quick-record` |
| `<van-field>` | `{module}-input-{field}`，如 `gift-input-amount` |
| `<van-cell>` | `{module}-cell-{key}` |
| `<van-tabbar>` | `tabbar-{tabName}`，如 `tabbar-finance` |
| `<van-popup>` | `{module}-popup-{purpose}` |
| `<van-pull-refresh>` | `{module}-refresh-{listName}` |
| `<van-list>` | `{module}-list-{listName}` |
| `<van-swipe-cell>` | `{module}-swipe-{id}`（id 字符串） |

**强制**：所有 `@click` / `@tap` 的元素必须有 testid。

---

## 附录 B · 移动端探针清单

抽到 `tests/midscene/probes/` 下，每个一个 `.mjs`：

| 文件 | 拦截 | 暴露窗口属性 |
|---|---|---|
| `haptic.mjs` | `navigator.vibrate` | `__hapticLog: [{pattern, ts}]` |
| `toast.mjs` | Vant `showToast` | `__toastLog: [{message, type, ts}]` |
| `dialog.mjs` | Vant `showDialog` | `__dialogLog: [{title, message, ts}]` |
| `router.mjs` | `vue-router push/replace/back` | `__routerLog: [{action, path, ts}]` |
| `storage.mjs` | `localStorage.setItem` | `__storageLog: [{key, value, ts}]` |
| `fetch.mjs` | `window.fetch` / axios 拦截器 | `__fetchLog: [{url, method, duration, status}]` |

**用法示例**：

```javascript
import { installHapticProbe, installToastProbe } from './probes/index.mjs';

await Promise.all([
  installHapticProbe(page),
  installToastProbe(page),
]);
```

---

## 修订记录

| 版本 | 日期 | 修改人 | 内容 |
|---|---|---|---|
| v1.0 | 2026-05-28 | alex | 首版，移动端定制 |
