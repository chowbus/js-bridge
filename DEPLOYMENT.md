# 🚀 部署指南

本文档说明如何将 js-bridge 部署到 CDN 和 GitHub Pages。

## 📋 部署前准备

1. **确保代码已提交到 GitHub**
   ```bash
   git add .
   git commit -m "feat: initial release"
   git push origin main
   ```

2. **创建版本标签** (推荐)
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## 🌐 方式一：jsDelivr CDN (自动，推荐)

### 特点
- ✅ 无需任何配置
- ✅ 代码推送后自动可用
- ✅ 全球 CDN 加速
- ✅ 永久缓存

### 使用方法

代码推送到 GitHub 后，**立即**可以通过以下地址访问：

```html
<!-- 最新版本 (开发环境) -->
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js"></script>

<!-- 指定版本 (生产环境推荐) -->
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@1.0.0/dist/native-bridge.min.js"></script>

<!-- 指定分支 -->
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@main/dist/native-bridge.min.js"></script>
```

### 验证部署

访问以下 URL 查看文件：
```
https://cdn.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js
```

### 清除缓存

如果更新后 CDN 没有生效，可以手动清除缓存：
```
https://purge.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js
```

## 📄 方式二：GitHub Pages (需要配置)

### 1. 启用 GitHub Pages

在 GitHub 仓库设置中：
1. 进入 **Settings** → **Pages**
2. **Source** 选择 "GitHub Actions"

### 2. 推送代码触发部署

项目已配置 GitHub Actions，推送到 main/master 分支后会自动部署：

```bash
git add .
git commit -m "deploy: update files"
git push origin main
```

### 3. 访问地址

部署完成后，可以通过以下地址访问：

```html
<!-- CDN 文件 -->
<script src="https://chowbus.github.io/js-bridge/dist/native-bridge.min.js"></script>

<!-- 测试页面 -->
https://chowbus.github.io/js-bridge/
https://chowbus.github.io/js-bridge/test-complex.html
```

### 4. 查看部署状态

在仓库的 **Actions** 标签页查看构建和部署状态。

## 📦 方式三：发布到 npm (可选)

### 1. 登录 npm

```bash
npm login
```

### 2. 发布包

```bash
# 首次发布
npm publish --access public

# 后续更新
npm version patch  # 或 minor, major
npm publish
```

### 3. 使用 npm CDN

发布后可以通过以下 CDN 访问：

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@chowbus/native-bridge@latest/dist/native-bridge.min.js"></script>

<!-- unpkg -->
<script src="https://unpkg.com/@chowbus/native-bridge@latest/dist/native-bridge.min.js"></script>
```

## 🔄 更新流程

### 发布新版本

```bash
# 1. 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
# 或
npm version minor  # 1.0.0 -> 1.1.0
# 或
npm version major  # 1.0.0 -> 2.0.0

# 2. 构建
npm run build

# 3. 提交并推送
git push origin main --tags

# 4. (可选) 发布到 npm
npm publish
```

### 更新 CDN

- **jsDelivr**: 推送后自动更新 (可能有几分钟延迟)
- **GitHub Pages**: GitHub Actions 自动部署 (约 1-2 分钟)
- **npm CDN**: 发布到 npm 后自动更新

## 📊 各方式对比

| 特性 | jsDelivr | GitHub Pages | npm CDN |
|------|----------|--------------|---------|
| 配置难度 | ⭐ 最简单 | ⭐⭐ 需配置 | ⭐⭐⭐ 需发布 |
| 更新速度 | 🚀 即时 | 🚀 1-2分钟 | 🚀 即时 |
| 全球加速 | ✅ | ⚠️ 一般 | ✅ |
| 版本管理 | ✅ | ✅ | ✅ |
| 自定义域名 | ❌ | ✅ | ❌ |
| 推荐场景 | 开发+生产 | 演示+文档 | 正式发布 |

## ✅ 推荐方案

### 开发阶段
使用 **jsDelivr** + `@latest` 标签：
```html
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js"></script>
```

### 生产环境
使用 **jsDelivr** + 指定版本：
```html
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@1.0.0/dist/native-bridge.min.js"></script>
```

### 演示和文档
使用 **GitHub Pages**：
```
https://chowbus.github.io/js-bridge/
```

## 🧪 验证部署

### 测试 CDN 是否可用

```javascript
// 在浏览器控制台执行
fetch('https://cdn.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js')
  .then(r => r.text())
  .then(code => console.log('✅ CDN 可用, 文件大小:', code.length))
  .catch(e => console.error('❌ CDN 不可用:', e));
```

### 测试加载是否成功

打开 `test-cdn.html` 或创建简单的 HTML：

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js"></script>
</head>
<body>
  <script>
    if (typeof NativeBridge !== 'undefined') {
      console.log('✅ NativeBridge 加载成功');
      console.log('平台:', NativeBridge.getPlatform());
    } else {
      console.error('❌ NativeBridge 加载失败');
    }
  </script>
</body>
</html>
```

## 📝 常见问题

### Q: jsDelivr 更新需要多久？
A: 通常在推送到 GitHub 后 1-5 分钟内生效。

### Q: 如何强制更新 CDN 缓存？
A: 访问清除缓存 URL：
```
https://purge.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js
```

### Q: 生产环境应该用哪个版本？
A: 推荐使用指定版本号，而不是 `@latest`，确保稳定性：
```html
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@1.0.0/dist/native-bridge.min.js"></script>
```

### Q: GitHub Pages 部署失败怎么办？
A: 
1. 检查仓库 Actions 标签页的错误日志
2. 确保已启用 GitHub Pages (Settings → Pages → Source: GitHub Actions)
3. 检查 `.github/workflows/deploy.yml` 配置

### Q: 如何查看所有可用版本？
A: 
- GitHub Releases: https://github.com/chowbus/js-bridge/releases
- npm: https://www.npmjs.com/package/@chowbus/native-bridge
- jsDelivr: https://cdn.jsdelivr.net/gh/chowbus/js-bridge/

## 🔗 相关链接

- [jsDelivr 文档](https://www.jsdelivr.com/documentation)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

