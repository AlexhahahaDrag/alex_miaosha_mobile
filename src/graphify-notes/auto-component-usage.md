# Auto Component Usage

This file is generated for graphify and human inspection.

Why it exists:
- This project uses `unplugin-vue-components` in `vite.config.ts`.
- Many Vue SFCs use shared components via template tags without explicit `import` statements.
- AST-only graph extraction can miss these view-to-component relationships.

## CommonList
- component: `src/views/components/CommonList.vue`
- template tag: `<common-list>`
- referenced by 4 file(s)
- consumer: `src/views/finance/financeManager/index.vue`
- consumer: `src/views/finance/shopFinance/index.vue`
- consumer: `src/views/finance/shopOrder/index.vue`
- consumer: `src/views/finance/shopStock/index.vue`

## CommonPullRefresh
- component: `src/views/components/CommonPullRefresh.vue`
- template tag: `<common-pull-refresh>`
- referenced by 20 file(s)
- consumer: `src/views/cpn-coupon/cpn-coupon-info/index.vue`
- consumer: `src/views/cpn-coupon/cpn-user-coupon-info/index.vue`
- consumer: `src/views/finance/accountRecordInfo/index.vue`
- consumer: `src/views/finance/financeManager/index.vue`
- consumer: `src/views/finance/personalGift/index.vue`
- consumer: `src/views/finance/shopFinance/index.vue`
- consumer: `src/views/finance/shopOrder/index.vue`
- consumer: `src/views/finance/shopProduct/index.vue`
- consumer: `src/views/finance/shopStock/index.vue`
- consumer: `src/views/finance/shopStockBatch/index.vue`
- consumer: `src/views/message/index.vue`
- consumer: `src/views/product/pmsAttr/index.vue`
- consumer: `src/views/selfFinance/prepaidCardInfoT/consume-water-info/index.vue`
- consumer: `src/views/user/menuInfo/index.vue`
- consumer: `src/views/user/orgInfo/index.vue`
- consumer: `src/views/user/orgUserInfo/index.vue`
- consumer: `src/views/user/permissionInfo/index.vue`
- consumer: `src/views/user/roleInfo/index.vue`
- consumer: `src/views/user/rolePermissionInfo/index.vue`
- consumer: `src/views/user/roleUserInfo/index.vue`

