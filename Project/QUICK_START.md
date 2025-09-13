# 智能开发环境启动指南

## 🚀 快速开始

### 方式一：使用智能启动脚本（推荐）
```bash
# 在项目根目录执行
./start.sh

# 或者直接使用
./scripts/smart-dev.sh
```

### 方式二：使用npm命令
```bash
npm run dev:smart
```

### 方式三：使用原始脚本
```bash
npm run dev
```

## ✨ 智能启动脚本特性

### 🔧 智能功能
- **智能端口检测**：自动检测可用端口，避免冲突
- **自动浏览器打开**：服务启动后自动打开调试页面
- **服务健康检查**：等待服务完全启动后再打开浏览器
- **美化终端输出**：清晰的彩色输出和进度提示
- **错误自动恢复**：智能处理常见启动问题

### 📋 启动检查项
- ✅ Node.js版本检查（推荐18+）
- ✅ 项目依赖完整性检查
- ✅ 必要文件存在性检查
- ✅ 端口可用性检查
- ✅ 环境配置检查

### 🌐 自动打开的调试链接
1. **后端API健康检查**：`http://localhost:8000/api/v1/health`
2. **前端应用**：`http://localhost:3000`

## ⚙️ 配置选项

### 命令行参数
```bash
# 禁用自动打开浏览器
./start.sh --no-browser

# 启用调试模式
./start.sh --debug

# 显示帮助信息
./start.sh --help
```

### 环境变量
```bash
# 禁用自动打开浏览器
AUTO_OPEN_BROWSER=false ./start.sh

# 调整浏览器打开延迟（秒）
BROWSER_DELAY=5 ./start.sh

# 调整健康检查超时（秒）
HEALTH_CHECK_TIMEOUT=120 ./start.sh

# 启用调试模式
DEBUG=true ./start.sh
```

## 🔧 服务信息

启动成功后，你将看到：

```
📊 服务信息
─────────────────────────────────────────────────────────
   🌐 前端应用   : http://localhost:3000
   ⚡ 后端API    : http://localhost:8000
   💚 健康检查   : http://localhost:8000/api/v1/health
   🔧 开发工具   : React DevTools, Redux DevTools
   📝 日志查看   : 终端输出 + 浏览器控制台
─────────────────────────────────────────────────────────
```

## 🛠️ 故障排除

### 端口冲突
- 脚本会自动检测并使用可用端口
- 如果默认端口被占用，会自动使用下一个可用端口

### 依赖问题
```bash
# 重新安装所有依赖
npm run install:all

# 清理并重新安装
npm run clean
npm run setup
```

### 服务启动失败
1. 检查Node.js版本（需要18+）
2. 检查网络连接
3. 查看终端错误信息
4. 使用调试模式：`./start.sh --debug`

### 浏览器未自动打开
```bash
# 手动访问服务
open http://localhost:3000  # 前端
open http://localhost:8000/api/v1/health  # 后端健康检查
```

## 🎯 开发建议

### 开发工作流
1. 运行 `./start.sh` 启动开发环境
2. 前端和后端都支持热重载
3. 修改代码后会自动刷新浏览器
4. 使用浏览器开发者工具进行调试
5. 按 `Ctrl+C` 停止所有服务

### 代码质量检查
```bash
# 运行代码检查
npm run code:check

# 自动修复代码格式
npm run code:fix
```

### 测试
```bash
# 运行所有测试
npm test

# 运行覆盖率测试
npm run test:coverage
```

## 📁 文件说明

### 启动脚本
- `start.sh` - 快速启动入口
- `scripts/smart-dev.sh` - 智能开发脚本（主要功能）
- `scripts/dev.sh` - 原始开发脚本

### 配置文件
- `package.json` - 项目配置和npm脚本
- `backend/.env.development` - 后端开发环境配置
- `.eslintrc.cjs` - 代码质量配置
- `.prettierrc.cjs` - 代码格式配置

## 🆘 获取帮助

如果遇到问题：
1. 查看终端错误信息
2. 使用 `./start.sh --debug` 获取详细日志
3. 检查浏览器控制台错误
4. 重启开发服务器：`Ctrl+C` 然后重新运行

---

🌟 **提示**：首次启动可能需要较长时间来安装依赖，请耐心等待。