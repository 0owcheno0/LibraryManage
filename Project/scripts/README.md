# 启动脚本说明

## 可用脚本

### 🚀 `smart-dev.sh` - 智能开发脚本（推荐）
- 自动端口检测
- 自动打开浏览器
- 服务健康检查
- 美化终端输出

```bash
# 基本启动
./scripts/smart-dev.sh

# 禁用自动浏览器
./scripts/smart-dev.sh --no-browser

# 调试模式
./scripts/smart-dev.sh --debug
```

### 📜 `dev.sh` - 原始开发脚本
基础版本，包含基本的服务启动功能。

```bash
./scripts/dev.sh
```

## 快速启动

在项目根目录运行：
```bash
./start.sh
```

或使用npm：
```bash
npm run dev:smart
```

## 特性对比

| 特性 | smart-dev.sh | dev.sh |
|------|-------------|--------|
| 智能端口检测 | ✅ | ❌ |
| 自动打开浏览器 | ✅ | ✅ |
| 服务健康检查 | ✅ | ✅ |
| 美化输出 | ✅ | ✅ |
| 错误恢复 | ✅ | ❌ |
| 命令行参数 | ✅ | ❌ |
| 环境变量配置 | ✅ | ❌ |