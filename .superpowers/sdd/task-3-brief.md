### Task 3: Document constraint + graphify

**Files:**

- Modify: `DEVELOPMENT.md`锛埪? 鍏ㄥ眬 UI 鏋舵瀯闄勮繎鏂板涓€鏉★級
- Run: `npm run graphify:update`

**Interfaces:**

- Consumes: 搂4 淇瑙勫垯锛坰pec锛?
- Produces: DEVELOPMENT.md 绾︽潫鏉℃枃

- [ ] **Step 1: Add DEVELOPMENT.md note**

鍦?`## 1. 鍏ㄥ眬 UI 鏋舵瀯涓庤瑙夋爣鍑哷 鍒楄〃鏈熬杩藉姞锛?

```markdown
- **椤甸潰鏍硅妭鐐归珮搴?*锛氭寕鍦?layout `.content-container` 涓嬬殑椤甸潰鏍硅妭鐐硅嫢鍚屾椂浣跨敤 `min-height: 100%` 涓庡瀭鐩?`padding`锛屽繀椤昏缃?`box-sizing: border-box`锛岄伩鍏?content-box 涓?padding 鎶婃€婚珮搴︽拺鍑烘棤鎰忎箟 Y 杞存粴鍔ㄦ潯銆備笉瑕佹敼 layout 鐨?`overflow-y: auto` 濂戠害銆?
```

- [ ] **Step 2: Update graphify**

```bash
npm run graphify:update
```

Expected: 鍛戒护鎴愬姛閫€鍑猴紙AST-only锛夈€?

- [ ] **Step 3: Commit**

```bash
git add DEVELOPMENT.md src/graphify-out
git commit -m "docs: note min-height+padding requires border-box on page roots"
```

---


