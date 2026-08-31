# Bayesian EMS Academy — Complete Edition

這是整合並補強後的「零公式 Step-by-Step」版本，設計給 EMT、護理師、臨床教師與 EMS 研究初學者。

## 本版整合重點

### 從 Claude 版本吸收
- 先以臨床情境建立 Bayes 直覺
- 使用 natural frequencies（1000 人）而非先丟公式
- 互動式事前機率 / 敏感度 / 特異度計算器
- 學習進度
- 情境式測驗
- RWD / mobile sidebar
- HTML / CSS / JS 分離

### 從原 Bayesian EMS Step-by-Step 版本保留並加深
- 臨床 Bayes → Research Bayesian 的橋樑章
- Prior / Likelihood / Posterior
- p=.09 與 posterior probability 不是互換的詳細說明
- 可互動的 research posterior 教學器
- credible interval 與實務重要門檻
- MCMC / Chain / R-hat / ESS / PPC
- Outcome → Bayesian model 選擇器
- HBM × TTM 安全搬運案例
- 前後測 / repeated measures
- EMS multilevel 結構
- R / brms 程式逐行翻譯
- Final quiz + searchable glossary

## 重要教學原則
- 主線不放數學公式。
- 診斷工具數字型案例均標示為「教學假設」，不冒充特定裝置或量表的正式效能。
- Research posterior calculator 是常態近似的概念示範，不可取代正式 Bayesian model。

## GitHub Pages
1. 建立 GitHub repository。
2. 將 `index.html`、`styles.css`、`script.js` 上傳到 repository root。
3. Settings → Pages。
4. 選擇 Deploy from a branch。
5. Branch 選 `main`，folder 選 `/ (root)`。
6. Save。

不需要 build tool，也沒有外部 JavaScript 依賴。
