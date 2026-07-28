# 移动端礼金子模块底栏导航设计

日期：2026-07-28  
项目：`alex_miaosha_mobile`  
方案：复用 `useTabBar`（与财务信息 `financeManager` 同模式，方案 1）

## 1. 背景

进入「亲友管理」等礼金页面时，底部仍显示全局 Tab（首页 / 消息 / 我的），与礼金业务无关，跨模块跳转不便。

礼金侧已有四主页：`person`（亲友）、`event`（事由）、`record`（礼金记录/记账）、`analysis`（分析），以及详情页 `giftPersonDetail` / `giftEventDetail`。财务模块已通过 `useTabBar` 在模块内替换底栏，可直接复用。

## 2. 已锁定决策

| 项             | 选择                                                           |
| -------------- | -------------------------------------------------------------- |
| 底栏范围       | 仅四主页显示；详情页隐藏（选项 A）                             |
| 「记账」映射   | 现有 `gift/record`（礼金记录）                                 |
| 实现路径       | 复用 `useTabBar` + 公共 `GIFT_TAB_BAR` 配置（方案 1）          |
| Tab 文案（短） | 亲友 / 事由 / 记账 / 分析                                      |
| 顶栏标题       | 可保留全称（亲友管理、事由管理、礼金记录、统计报表等）         |
| 权限           | Tab 四项始终展示；无权限仍走页面内 toast/空态，不在 tab 层隐藏 |
| dashboard      | 不进底栏                                                       |

## 3. 目标

- 四主页底栏统一为：亲友、事由、记账、分析；`route` 模式切换并高亮当前项
- 进入详情底栏消失；返回主页后礼金底栏恢复
- 离开礼金进入其他模块时，由目标页自己的 `useTabBar` / 全局配置接管
- 配置集中、可单测；补 `data-testid`；同步 DEVELOPMENT / graphify

## 4. 非目标

- 改后端 / 菜单权限模型
- PC 端底栏
- 重构 `gift/dashboard`
- 新建独立记账页或自定义 `GiftTabBar` 组件
- 全局首页 Tab 改造
- Emoji

## 5. 架构

```
四主页 (person / event / record / analysis)
  └─ useTabBar({ visible: true, data: GIFT_TAB_BAR })

详情页 (giftPersonDetail / giftEventDetail)
  └─ useTabBar({ visible: false })

记账页快速记礼 popup
  └─ 不改动 tabbar（仍属 record 主页）
```

`tab-bar/index.vue` 按 `name` 解析路由 `path`；`GIFT_TAB_BAR` 中的 `name` 必须与动态菜单注册的 route name 一致（落地时校验，缺则补菜单/SQL，不硬编码错误 name）。

## 6. Tab 配置（契约）

建议在 `src/views/finance/gift/config.ts` 导出：

```ts
export const GIFT_TAB_BAR = [
	{ name: 'giftPerson', title: '亲友', icon: '/* 落地选定 */' },
	{ name: 'giftEvent', title: '事由', icon: '/* 落地选定 */' },
	{ name: 'giftRecord', title: '记账', icon: '/* 落地选定 */' },
	{ name: 'giftAnalysis', title: '分析', icon: '/* 落地选定 */' },
] as const;
```

说明：

- `name` 以运行时 `router.getRoutes()` / 菜单为准；上表为预期约定名，实现前必须核对并写死实际值
- Icon 优先复用已有资源（如 `gift`、`user-circle`、`financeAnalysis`、`van-*`）；缺则补 `src/assets/icons`
- `data-testid`：`gift-tabbar`；单项 `gift-tab-person` / `gift-tab-event` / `gift-tab-record` / `gift-tab-analysis`（若改 tab-bar 组件需兼容其他模块，优先在 gift 侧可测入口挂 testid，避免破坏财务底栏）

## 7. 交互与边界

| 场景         | 行为                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| 四主页互切   | `van-tabbar` `route` 跳转；高亮当前 name                               |
| 进详情       | 底栏 `visible: false`                                                  |
| 详情返回     | `leftPath` 回对应主页；主页 `onMounted` / `onActivated` 重新挂礼金 Tab |
| 快速记礼弹层 | 底栏保持礼金四 Tab                                                     |
| 离开礼金     | 目标页接管底栏                                                         |
| 列表高度     | layout `with-tabbar` padding；页面内 `calc` 高度复核扣减约 50px        |

## 8. 落地文件

| 文件                                     | 改动                                              |
| ---------------------------------------- | ------------------------------------------------- |
| `src/views/finance/gift/config.ts`       | `GIFT_TAB_BAR` + 必要 name 常量                   |
| `src/views/finance/gift/config.spec.ts`  | 锁四项 title/name 契约                            |
| `gift/person/index.vue`                  | `useTabBar` + 高度                                |
| `gift/event/index.vue`                   | 同上                                              |
| `gift/record/index.vue`                  | 同上                                              |
| `gift/analysis/index.vue`                | 同上                                              |
| `gift/person/giftPersonDetail/index.vue` | `useTabBar({ visible: false })`                   |
| `gift/event/giftEventDetail/index.vue`   | 同上                                              |
| Icon / 菜单                              | 按需补齐                                          |
| `DEVELOPMENT.md` 或 `.cursorrules`       | 礼金子模块底栏约定一句                            |
| graphify                                 | `npm run graphify:update` / `graphify update src` |

## 9. 验收

1. 亲友主页底栏为：亲友 / 事由 / 记账 / 分析
2. 四 Tab 切换内容与高亮正确
3. 进详情无礼金底栏；返回主页恢复
4. 离开礼金后底栏被目标模块接管
5. lint / 相关单测通过

## 10. 测试要点

- 单元：`GIFT_TAB_BAR` 长度 4、title 顺序、name 非空
- 手测 / Midscene：四 Tab 切换；详情隐藏；禁止中文精确匹配 DOM
- 回归：财务模块底栏（`financeManager`）不被破坏
