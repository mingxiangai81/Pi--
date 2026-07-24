# 玄机 · 八字命理 (Pi Bazi)

运行在 **Pi Browser** 内的高科技八字命理分析 PWA。Next.js（App Router）+ Firebase（Firestore / Auth / Cloud Functions）+ Pi Network SDK + `lunar-javascript` 排盘 + LLM 深度解读。

## 架构

```
Next.js 前端 ── Pi SDK 无感登录/支付
     │
     ├─ 排盘引擎 src/lib/bazi （纯 TS，真太阳时校正 + lunar-javascript）
     │
     └─ Firebase Cloud Functions（服务端逻辑，密钥仅存此侧）
          ├─ piAuth        Pi accessToken → Firebase 自定义令牌
          ├─ piApprove     Pi 支付服务端审批（/approve）
          ├─ piComplete    Pi 支付服务端完成（/complete）→ 解锁
          └─ generateReport 校验支付 → 调 Claude → 落库 reports
```

**分层解锁**：免费层展示四柱盘面 + 五行力量 + 大运；付费层（低门槛 Pi）解锁 AI 深度报告（喜用神、性格、事业财富感情、近三年流年）。

## 核心模块

| 路径 | 说明 |
|---|---|
| `src/lib/bazi/engine.ts` | 排盘主函数：阳历+经纬度 → `BaziChart` JSON |
| `src/lib/bazi/solarTime.ts` | 真太阳时：经度时差 + 均时差双重校正 |
| `src/lib/bazi/wuxing.ts` | 五行力量加权 + 身强身弱 + 喜用神初判 |
| `src/lib/pi/client.ts` | Pi SDK 封装：`initPi` / `piLogin` / `startReportPayment` |
| `functions/src/piPayment.ts` | Pi Platform API 双向验证 |
| `functions/src/ai/prompt.ts` | LLM System Prompt 模版 |

## 本地开发

```bash
npm install
cp .env.example .env.local   # 填入 Firebase Web 配置
npm run test                 # 排盘引擎回归测试
npm run typecheck
npm run dev                  # http://localhost:3000
```

> 排盘引擎无需任何后端即可运行；Pi 登录/支付与 AI 报告需完成下方配置并在 Pi Browser / 沙盒中联调。

## 部署配置

### 1. Firebase
- 创建项目，开启 Firestore、Authentication（自定义令牌）、Cloud Functions（Blaze 套餐）。
- 前端 `.env.local` 填 `NEXT_PUBLIC_FIREBASE_*` 与 `NEXT_PUBLIC_FUNCTIONS_BASE_URL`。
- 部署规则与函数：
  ```bash
  firebase deploy --only firestore:rules,firestore:indexes
  cd functions && npm install && cd ..
  firebase functions:secrets:set PI_API_KEY
  firebase functions:secrets:set ANTHROPIC_API_KEY
  firebase deploy --only functions
  ```

### 2. Pi 开发者门户
- 注册 App，配置托管域名，获取 **Server API Key**（填入 `PI_API_KEY` secret）。
- 开发期 `NEXT_PUBLIC_PI_SANDBOX=true`，上线改 `false`。

## 免责声明
命理分析基于传统模型，仅供自我认知与决策参考，不构成医疗、法律、金融等专业意见。
