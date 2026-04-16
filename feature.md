# 项目功能列表 (Features)

本项目（alex_miaosha_mobile）是一个结构完整的移动端/后台管理综合前端项目，主要涵盖了用户权限、系统设置、财务管理、门店进销存、商品管理以及营销等核心模块。以下为具体功能模块划分及组件、API流转细节：

## 1. 基础服务与系统管理 (System & User Management)
**该模块主要提供系统底层的 RBAC（基于角色的访问控制）权限流转、组织架构管理以及用户认证等核心能力，为上层业务提供支撑。**

- **鉴权中心 (`login`)**：
  - **业务逻辑**：实现账号密码登录交互（带粒子特效），依托 Pinia 持久化 Token 和用户信息，并根据下发菜单资源动态注册路由映射拦截。
  - **代码路径**：`src/views/login/index.vue`、`src/store/modules/user/user.ts`
  - **状态字段**：`sessionTimeout` (是否过期)、`hasMenu` (路由是否初始化完成)
  - **关联表/API**：`loginApi` (`src/api/user/login.ts`)

- **角色管理 (`roleInfo`)**：
  - **业务逻辑**：在系统中创建与维护业务角色（如店长、财务、超级管理员等）。
  - **代码路径**：`src/views/user/roleInfo/`
  - **状态字段**：`0`-正常, `1`-停用
  - **关联表/API**：`src/api/user/roleInfo/`

- **权限定义 (`permissionInfo`)**：
  - **业务逻辑**：定义并细化系统内的所有资源动作标识（如按钮级、接口级菜单权限点）。
  - **代码路径**：`src/views/user/permissionInfo/`
  - **状态字段**：`type`: `0`-目录, `1`-菜单, `2`-按钮
  - **关联表/API**：`src/api/user/permissionInfo/`

- **角色权限分配 (`rolePermissionInfo`) & 角用分配 (`roleUserInfo`)**：
  - **业务逻辑**：建立 角色-权限 以及 角色-用户 之间的关联关系，使得用户真正拥有对应角色下的操作权限。
  - **代码路径**：`src/views/user/rolePermissionInfo/`, `src/views/user/roleUserInfo/`
  - **状态字段**：建立关联即存在，删除即解除
  - **关联表/API**：`src/api/user/rolePermissionInfo/`, `src/api/user/roleUserInfo/`

- **组织架构与部门管理 (`orgInfo`, `orgUserInfo`)**：
  - **业务逻辑**：以层级树状列表维护企业/多门店的机构归属结构，并对特定部门或门店进行人员绑定。
  - **代码路径**：`src/views/user/orgInfo/`, `src/views/user/orgUserInfo/`
  - **状态字段**：`status`: `0`-正常, `1`-停用
  - **关联表/API**：`src/api/user/orgInfo/`, `src/api/user/orgUserInfo/`

- **后台资源菜单管理 (`menuInfo`)**：
  - **业务逻辑**：配置管理端左侧导航栏的节点、图标、组件路径及路由重定向。
  - **代码路径**：`src/views/user/menuInfo/`
  - **状态字段**：`hidden`: `0`-显示, `1`-隐藏; `status`: `0`-正常, `1`-停用
  - **关联表/API**：`src/api/user/menuInfo/`

- **系统用户档案 (`userManager`)**：
  - **业务逻辑**：维护平台系统账号列表，执行账号的增删改查。
  - **代码路径**：`src/views/user/userManager/`
  - **状态字段**：`userStatus`: `0`-正常, `1`-冻结/封禁
  - **关联表/API**：`src/api/user/userManager/`

## 2. 财务管理 (Finance Management)
**该模块主要处理系统级别的账务流转与资金对账，支持大盘财务数据的统计和监控。**

- **财务数据看板 (`financeAnalysis`)**：
  - **业务逻辑**：展示日/月流水趋势、利润等核心宏观经营指标及图表化分析。
  - **代码路径**：`src/views/finance/financeAnalysis/`
  - **状态字段**：通常无特定状态，依附于时间筛选维度
  - **关联表/API**：`src/api/finance/` (分析聚合接口)

- **核心账目与资金流水 (`financeManager` / `accountRecordInfo`)**：
  - **业务逻辑**：追踪记录业务线各类资金流动（入账/出账）明细，并在后台提供对账比对管理窗口。
  - **代码路径**：`src/views/finance/financeManager/`, `src/views/finance/accountRecordInfo/`
  - **状态字段**：`flowType`: `1`-收入, `2`-支出; `status`: `0`-待核对, `1`-已入账
  - **关联表/API**：`src/api/finance/`



- **个人礼金业务 (`personalGift`)**：
  - **业务逻辑**：管理平台用户互相交互或平台下发的人情礼金、红包沉淀独立财务。
  - **代码路径**：`src/views/finance/personalGift/`
  - **状态字段**：`giftType`: `1`-节日红包, `2`-积分兑换等
  - **关联表/API**：`src/api/finance/`



## 4. 商品与产品体系 (Goods & Cart)
**统一的平台标准库，为 C端交易与后台进销存提供规范的 SPU 模型。**

- **商品库及参数模型 (`goods`, `pmsAttr`)**：
  - **业务逻辑**：维护平台所有的标准化 SPU/SKU 信息、主图轮播。基于 `pmsAttr` 绑定动态属性规格和筛选标签（如颜色、尺码）。
  - **代码路径**：`src/views/goods/`, `src/views/product/pmsAttr/`
  - **状态字段**：`goodsStatus`: `0`-下架草稿, `1`-上架; `attrType`: `0`-规格, `1`-参数
  - **关联表/API**：`src/api/goods/`, `src/api/product/`



## 5. 营销与促销中心 (Marketing)
**核心促销玩法支撑，依托各类优惠券驱动用户转化。**

- **核心券资产库 (`cpn-coupon-info`)**：
  - **业务逻辑**：配置营销满减、打折券等的发行总量、生效时间段以及具体的门槛和优惠额度规则。
  - **代码路径**：`src/views/cpn-coupon/cpn-coupon-info/`
  - **状态字段**：`couponStatus`: `0`-草稿未开始, `1`-发放中有效, `2`-过期失效, `3`-作废
  - **关联表/API**：`src/api/promotion/` 优惠配置相关 API

- **用户票券核销追踪 (`cpn-user-coupon-info`)**：
  - **业务逻辑**：展示发放到用户账户中的券流水记录，追踪每个实例的最终核销链路。
  - **代码路径**：`src/views/cpn-coupon/cpn-user-coupon-info/`
  - **状态字段**：`useStatus`: `0`-未使用, `1`-已使用已核销, `2`-已过期
  - **关联表/API**：`src/api/promotion/` 领用与核销相关 API

## 6. 其他基础增值服务体系
**补充配套的资金前置与全局消息/调度面板。**

- **预付充值储值模块 (`prepaidCardInfoT`)**：
  - **业务逻辑**：虚拟储值金/实体会员卡的发行记录，并管理对应资金池的充入/消耗明细、余额冻结操作。
  - **代码路径**：`src/views/selfFinance/prepaidCardInfoT/`
  - **状态字段**：`cardStatus`: `0`-未发卡, `1`-正常使用, `2`-挂失/冻结
  - **关联表/API**：储值消费相关 API

- **系统全域消息通知 (`messageManager`)**：
  - **业务逻辑**：后台给业务员/前端下发重要的数据变更公告，或触发工作流待办提醒。
  - **代码路径**：`src/views/message/`
  - **状态字段**：`readStatus`: `0`-未读, `1`-已读
  - **关联表/API**：消息下发推送相关 API

- **管理大盘看板 (`home`)**：
  - **业务逻辑**：控制台登录首屏，提供数据快照和常用业务入口导航。
  - **代码路径**：`src/views/home/index.vue`
  - **状态字段**：无特定状态字段
  - **关联表/API**：汇聚各类 DataSum API