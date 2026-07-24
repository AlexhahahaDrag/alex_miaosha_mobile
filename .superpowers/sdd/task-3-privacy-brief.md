### Task 3: Docs + graphify

**Files:**

- Modify: `feature.md`锛堝湪绀煎皻寰€鏉?浜插弸鐩稿叧灏忚妭琛?1鈥? 鍙ワ細璇︽儏榛樿鑴辨晱鎵嬫満鍙枫€佹敮鎸佹樉闅?鎷ㄥ彿/澶嶅埗銆佸娉ㄦ姌鍙犮€佹椂闂存牸寮忓寲锛?
- Run graphify

**Interfaces:**

- Consumes: Task 1鈥? 琛屼负
- Produces: 鏂囨。涓庡浘璋卞悓姝?

- [ ] **Step 1: Update feature.md**

鍦?gift person 娈佃惤杩藉姞锛?

```markdown
- 鑱旂郴浜鸿鎯咃紙profile锛夛細澶撮儴灞曠ず鍏崇郴涓庤劚鏁忔墜鏈哄彿锛堥粯璁ら殣钘忎腑闂村洓浣嶏紝鍙樉闅愶級锛涙敮鎸佹嫧鍙蜂笌澶嶅埗锛涘熀鏈俊鎭粎淇濈暀澶囨敞锛堣秴 60 瀛楁姌鍙狅級锛涘線鏉ュ巻鍙叉椂闂存牸寮忎负 `YYYY-MM-DD HH:mm`銆?
```

- [ ] **Step 2: graphify**

```bash
# Prefer Python with graphify module if PATH python lacks it:
# "C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe" -m graphify update src
npm run graphify:update
```

鑻ュけ璐ワ紝鐢?Python 3.14 鏄惧紡璋冪敤鍚庡啀 `npm run graphify:augment`锛屾彁浜?`src/graphify-out` 鍙樻洿銆?

- [ ] **Step 3: Commit**

```bash
git add feature.md src/graphify-out
git commit -m "docs(gift): note person detail privacy UX and update graphify"
```

---


