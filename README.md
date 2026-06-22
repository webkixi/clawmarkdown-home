# ClawMarkDown 官网

ClawMarkDown（爪爪记）产品官网，纯静态站点，支持 Vercel / Cloudflare Pages / Netlify / GitHub Pages 部署。

## 文件结构

```
home/
├── index.html       # 官网主页（单页应用）
├── policy.html      # 隐私政策页面
├── styles.css       # 样式（含明暗主题 + 全响应式 + 政策页）
├── script.js        # 交互（导航、FAQ、滚动动画、主题跟随、动态版本号）
├── vercel.json      # Vercel 部署配置（缓存与安全头）
├── netlify.toml    # Netlify 部署配置（路由重定向 + 安全头 + 缓存）
├── README.md        # 本文件
└── icons/           # 图标资源
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 本地预览

无需任何构建步骤，直接用浏览器打开 `index.html` 即可，或启动一个静态服务器：

```bash
# 方式一：Python
python3 -m http.server 3000

# 方式二：Node（如已安装 npx）
npx serve .
```

然后访问 http://localhost:3000 。

## 动态版本号

官网会自动从远程拉取插件和技能的最新版本号并显示在 Hero 徽章和页脚。拉取策略：

1. **CloudBase 云函数**（上海节点，国内首选）— `clawmarkdown-xxx.ap-shanghai.app.tcloudbase.com/versions`
2. **Cloudflare KV Worker**（海外备选）— `kv-manager.yyralf.workers.dev/versions`
3. 以上都不可达时，回退到硬编码默认值（`插件 v1.0.1 · 技能 v2.2.0`）

> 注意：CloudBase 云函数需要配置 CORS 才能被浏览器跨域访问。`bak/versions-service/index.js` 已包含 CORS 配置，部署该云函数后即可正常拉取。

---

## 部署方式对比

### Vercel vs Cloudflare Pages vs Netlify vs GitHub Pages — 国内访问情况

| 平台 | 默认域名国内可达性 | 自定义域名（未备案） | 自定义域名（已备案+国内CDN） | 推荐场景 |
|---|---|---|---|---|
| **Vercel** | `vercel.app` 自 2021 年起被 DNS 污染，国内基本无法直接访问 | 可达但不稳定，仍可能被干扰 | 稳定 | 海外用户为主 |
| **Cloudflare Pages** | `pages.dev` 间歇性不可访问，2024 年起波动加剧 | 可达但延迟高，无国内节点 | 稳定 | 海外用户为主 |
| **Netlify** | `netlify.app` 国内可访问，但速度较慢，偶有波动 | 可达，稳定性优于 Vercel | 稳定 | 海外用户为主 |
| **GitHub Pages** | `github.io` 国内可访问但速度慢，偶尔被干扰 | 同左 | 稳定 | 备选方案 |
| **CloudBase 静态托管** | — | — | 国内原生加速，上海/广州节点 | **国内用户首选** |

**结论**：Vercel 和 Cloudflare Pages 的默认域名在国内都存在访问障碍（DNS 污染/间歇性不可达）。如果主要面向国内用户：

- 最佳方案：使用 **CloudBase 静态网站托管**（腾讯云，国内 CDN 加速）
- 次选方案：Vercel/Cloudflare Pages + 已备案的自定义域名 + 国内 CDN
- 如果面向海外用户或仅作展示用途，Vercel 和 Cloudflare Pages 均可

> **Vercel vs Cloudflare Pages 国内访问对比**：两者默认域名在国内都无法稳定访问。相对而言，Cloudflare Pages 的 `pages.dev` 比 Vercel 的 `vercel.app` 稍好一些（偶尔能打开），但都不适合作为国内用户的主要访问入口。绑定自定义域名后，两者都能通过海外 CDN 节点访问，但延迟较高且无国内加速节点。

---

## 部署到 Vercel

### 方式一：通过 Vercel 控制台

1. 将 `home/` 目录上传到 GitHub 仓库。
2. 登录 https://vercel.com ，点击「Add New...」→「Project」。
3. 导入对应的 GitHub 仓库。
4. **关键**：在「Root Directory」设置中，选择 `bak/home`（如果放在子目录）。
   - Framework Preset 保持 `Other`。
   - Build Command 留空（纯静态，无需构建）。
   - Output Directory 留空。
5. 点击「Deploy」。

### 方式二：通过 Vercel CLI

```bash
npm i -g vercel
cd bak/home
vercel          # 预览部署
vercel --prod   # 生产部署
```

---

## 部署到 Cloudflare Pages

### 方式一：Git 集成（推荐）

1. 将 `home/` 目录内容推送到 GitHub 仓库。
2. 登录 https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git。
3. 选择对应仓库，配置构建：
   - **Production branch**: `main`
   - **Build command**: 留空（纯静态）
   - **Build output directory**: `bak/home`（如果放在子目录）或 `/`（根目录）
4. 点击「Save and Deploy」，等待 1-2 分钟获得 `https://xxx.pages.dev` 地址。

### 方式二：Direct Upload（直接上传）

1. 登录 Cloudflare Dashboard → Workers & Pages → Create → Pages → Upload assets。
2. 设置项目名称，点击「Create project」。
3. 将 `bak/home` 目录下的所有文件拖入上传区域（或将整个目录压缩后上传）。
4. 点击「Deploy site」。

### 方式三：Wrangler CLI

```bash
# 安装 Wrangler
npm i -g wrangler

# 登录 Cloudflare
wrangler login

# 在 bak/home 目录下部署
cd bak/home
wrangler pages deploy . --project-name=clawmarkdown
```

首次部署会自动创建项目，后续更新重新执行即可。

### Cloudflare Pages 自定义域名

1. 在 Pages 项目设置中进入「Custom domains」。
2. 添加你的域名（域名需已在 Cloudflare DNS 管理）。
3. Cloudflare 会自动配置 CNAME 和 HTTPS 证书。

---

## 部署到 Netlify

### 方式一：通过 Netlify 控制台（推荐）

1. 将 `home/` 目录内容上传到 GitHub / GitLab 仓库。
2. 登录 https://app.netlify.com → 「Add new site」→「Import an existing project」。
3. 选择 Git 提供商，授权后选择对应仓库。
4. 配置构建选项：
   - **Base directory**: 留空（或 `bak/home`，取决于仓库结构）
   - **Build command**: 留空（纯静态，无需构建）
   - **Publish directory**: `.`（或 `bak/home`）
5. 点击「Deploy」，等待 1-2 分钟获得 `https://xxx.netlify.app` 地址。

### 方式二：Direct Upload（直接拖拽上传）

1. 登录 Netlify → 「Add new site」→「Deploy manually」。
2. 将 `bak/home` 目录下的所有文件直接拖入上传区域。
3. 无需配置，立即获得部署地址。

### 方式三：Netlify CLI

```bash
# 安装 CLI
npm i -g netlify-cli

# 登录
netlify login

# 在 bak/home 目录下部署
cd bak/home
netlify deploy --prod --dir=.
```

### Netlify 配置文件说明

项目根目录的 `netlify.toml` 已包含以下配置：

- **`[[redirects]]`**：SPA 路由回退（当前为单页，如后续加多页可生效）
- **`[[headers]]`**：全局安全响应头（`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`）
- **`[[headers]]`**：`/icons/*` 资源设置 1 年长缓存（`Cache-Control: immutable`）

### Netlify 自定义域名

1. 在项目设置中进入「Domain management」→「Add a domain」。
2. 按提示添加 DNS 记录（ANAME 或 CNAME）。
3. Netlify 自动签发 Let's Encrypt HTTPS 证书。

---

## 部署到 GitHub Pages（备选）

1. 将 `home/` 目录内容推送到 GitHub 仓库的 `main` 分支。
2. 进入仓库 Settings → Pages。
3. Source 选择 `Deploy from a branch`，选择 `main` 分支，文件夹选 `/`（根目录）或 `/docs`。
4. 保存后等待 1-2 分钟，访问 `https://<用户名>.github.io/<仓库名>/` 即可。

> 注意：资源路径已使用相对引用（`icons/`、`styles.css`、`script.js`），放在子路径下也能正常工作。

---

## 自定义域名

### Vercel
1. 在 Vercel 项目设置中进入「Domains」。
2. 添加域名，按提示添加 CNAME 或 A 记录。
3. Vercel 自动签发 HTTPS 证书。

### Cloudflare Pages
1. 在 Pages 项目设置中进入「Custom domains」。
2. 添加域名（需在 Cloudflare DNS 管理）。
3. 自动配置 CNAME 和 HTTPS。

---

## 内容修改指引

| 想修改的内容 | 对应文件 / 位置 |
|---|---|
| 产品名称、标语 | `index.html` 中 `.nav-brand`、`.hero-title`、`.footer-name` |
| Chrome 商店链接 | 全文搜索 `chromewebstore.google.com` 替换为新链接 |
| 主题色 | `styles.css` 顶部 `:root` 中的 `--primary` 等变量 |
| 功能卡片 | `index.html` 中 `.feature-grid` 区块 |
| FAQ 问答 | `index.html` 中 `.faq-list` 区块 |
| 隐私政策内容 | `policy.html` 中 `.policy-content` 区块 |
| 版本号默认值 | `script.js` 中 `DEFAULT_PLUGIN_VER` / `DEFAULT_SKILL_VER` |
| 版本号 API 地址 | `script.js` 中 `VERSION_SOURCES` 数组 |
| 图标 | 替换 `icons/` 下的 png 文件 |

## 技术特性

- 纯静态 HTML/CSS/JS，零依赖、零构建
- 内置明暗主题，跟随系统并支持本地记忆
- 全响应式布局，适配手机/平板/桌面
- 滚动入场动画、FAQ 手风琴、平滑锚点导航
- 动态版本号：自动从 CloudBase / Cloudflare KV 拉取最新版本
- 独立隐私政策页面（`policy.html`），复用官网样式
- SEO 友好：meta 描述、Open Graph、语义化标签
- Vercel 配置含安全响应头与静态资源长缓存
- 兼容 Vercel / Cloudflare Pages / Netlify / GitHub Pages 四大平台

---

© 2025 ClawMarkDown. 用你的本地龙虾，创作属于你的图文。
