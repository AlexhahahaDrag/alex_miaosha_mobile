### Task 1: Fix giftPersonDetail (primary bug)

**Files:**

- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue` (`.gift-person-detail` style block)
- Test: manual DevTools on 鏂板鑱旂郴浜?

**Interfaces:**

- Consumes: none
- Produces: `.gift-person-detail` uses `box-sizing: border-box`

- [ ] **Step 1: Apply border-box on page root**

灏嗭細

```less
.gift-person-detail {
	min-height: 100%;
	padding: 16px;
	background: #f8fbff;
}
```

鏀逛负锛?

```less
.gift-person-detail {
	box-sizing: border-box;
	min-height: 100%;
	padding: 16px;
	background: #f8fbff;
}
```

- [ ] **Step 2: Manual verify short form**

1. 鎵撳紑銆屾柊澧炶仈绯讳汉銆嶏紙鏃?`id` query锛夈€?
2. DevTools 閫変腑 `.content-container`銆?
3. Console锛歚$0.scrollHeight <= $0.clientHeight` 搴斾负 `true`锛堟棤 Y 婊氬姩鏉★級銆?

Expected: 鏃犵┖婊氾紱鑳屾櫙浠嶉摵婊″唴瀹瑰尯銆?

- [ ] **Step 3: Manual verify long content still scrolls**

1. 澶囨敞杈撳叆澶氳锛屾垨鎵撳紑鏈夊鏉″線鏉ュ巻鍙茬殑鑱旂郴浜鸿鎯呫€?
2. `.content-container` 鍦ㄥ唴瀹硅秴鍑烘椂鍙粴鍔ㄣ€?

Expected: 闀垮唴瀹逛粛鍙粴銆?

- [ ] **Step 4: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue
git commit -m "fix(gift): prevent empty Y-scroll on person detail form"
```

---


