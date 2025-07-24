# GitHub Pages 自动部署说明

## 部署分支
- **`release`** 分支：专门用于 GitHub Pages 自动部署

## 部署流程

### 自动部署
1. 当代码推送到 `release` 分支时，GitHub Actions 会自动触发部署流程
2. 自动执行以下步骤：
   - 安装依赖 (`npm ci`)
   - 构建项目 (`npm run build`)
   - 部署到 GitHub Pages

### 手动触发部署
在 GitHub 仓库的 Actions 页面可以手动触发部署工作流。

## 部署地址
项目将部署到：`https://xabsurd.github.io/absurd-depot/`

## 如何发布新版本

### 方法一：直接推送到 release 分支
```bash
# 切换到 release 分支
git checkout release

# 合并 main 分支的最新代码
git merge main

# 推送到远程仓库触发自动部署
git push origin release
```

### 方法二：从 main 分支创建新的发布
```bash
# 在 main 分支上确保代码是最新的
git checkout main
git pull origin main

# 切换到 release 分支并合并最新代码
git checkout release
git merge main

# 推送触发部署
git push origin release
```

## 配置说明

### GitHub Pages 设置
请确保在 GitHub 仓库设置中：
1. 进入 **Settings** > **Pages**
2. **Source** 选择 **GitHub Actions**

### 构建配置
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **Base URL**: `/absurd-depot/` (已在 `vite.config.ts` 中配置)

### 环境变量
- 生产环境变量在 `.env.production` 文件中配置
- 构建时会自动使用生产环境配置

## 注意事项
1. 确保 `package.json` 中有正确的 `build` 脚本
2. 路由使用 Hash 模式 (`createWebHashHistory`) 以兼容 GitHub Pages
3. 静态资源路径已配置为相对于 base URL
