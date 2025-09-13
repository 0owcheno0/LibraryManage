#!/bin/bash

# 团队知识库 - 生产环境构建脚本
# 自动检查、测试、构建和打包项目

set -e  # 遇到错误立即停止

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "🏗️  团队知识库 - 生产环境构建"
    echo "================================="
    echo -e "${NC}"
}

# 检查Node.js版本
check_node_version() {
    print_info "检查Node.js版本..."
    if ! command -v node &> /dev/null; then
        print_error "未安装Node.js，请先安装Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js版本过低，生产环境需要Node.js 18+，当前版本: $(node -v)"
        exit 1
    else
        print_success "Node.js版本检查通过: $(node -v)"
    fi
}

# 清理旧的构建文件
clean_build() {
    print_info "清理旧的构建文件..."
    
    # 清理前端构建文件
    if [ -d "frontend/dist" ]; then
        rm -rf frontend/dist
        print_info "已清理前端构建文件"
    fi
    
    # 清理后端构建文件
    if [ -d "backend/dist" ]; then
        rm -rf backend/dist
        print_info "已清理后端构建文件"
    fi
    
    print_success "构建文件清理完成"
}

# 安装依赖
install_dependencies() {
    print_info "安装生产依赖..."
    
    # 安装根目录依赖
    npm ci
    
    # 安装后端依赖
    cd backend && npm ci --legacy-peer-deps && cd ..
    
    # 安装前端依赖
    cd frontend && npm ci --legacy-peer-deps && cd ..
    
    print_success "依赖安装完成"
}

# 运行代码检查
run_lint() {
    print_info "运行代码规范检查..."
    
    if npm run lint; then
        print_success "代码规范检查通过"
    else
        print_error "代码规范检查失败，请修复后重试"
        exit 1
    fi
}

# 运行测试
run_tests() {
    print_info "运行单元测试..."
    
    if npm run test; then
        print_success "单元测试通过"
    else
        print_error "单元测试失败，请修复后重试"
        exit 1
    fi
}

# 构建项目
build_project() {
    print_info "构建生产版本..."
    
    # 构建前端
    print_info "构建前端应用..."
    cd frontend && npm run build && cd ..
    
    # 构建后端
    print_info "构建后端应用..."
    cd backend && npm run build && cd ..
    
    print_success "项目构建完成"
}

# 验证构建结果
verify_build() {
    print_info "验证构建结果..."
    
    # 检查前端构建文件
    if [ ! -d "frontend/dist" ] || [ ! -f "frontend/dist/index.html" ]; then
        print_error "前端构建失败，未找到构建文件"
        exit 1
    fi
    
    # 检查后端构建文件
    if [ ! -d "backend/dist" ] || [ ! -f "backend/dist/index.js" ]; then
        print_error "后端构建失败，未找到构建文件"
        exit 1
    fi
    
    print_success "构建结果验证通过"
}

# 生成构建报告
generate_report() {
    print_info "生成构建报告..."
    
    BUILD_TIME=$(date "+%Y-%m-%d %H:%M:%S")
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    
    # 计算构建文件大小
    FRONTEND_SIZE=$(du -sh frontend/dist 2>/dev/null | cut -f1 || echo "N/A")
    BACKEND_SIZE=$(du -sh backend/dist 2>/dev/null | cut -f1 || echo "N/A")
    
    cat > build-report.txt << EOF
# 团队知识库构建报告

## 构建信息
- 构建时间: ${BUILD_TIME}
- Node.js版本: ${NODE_VERSION}
- npm版本: ${NPM_VERSION}

## 构建结果
- 前端构建大小: ${FRONTEND_SIZE}
- 后端构建大小: ${BACKEND_SIZE}

## 构建文件
- 前端: frontend/dist/
- 后端: backend/dist/

## 部署说明
1. 上传 frontend/dist/ 到静态文件服务器
2. 上传 backend/dist/ 到Node.js服务器
3. 配置环境变量和数据库连接
4. 启动后端服务: npm start

EOF
    
    print_success "构建报告已生成: build-report.txt"
}

# 主函数
main() {
    print_header
    
    # 确保在项目根目录
    if [ ! -f "package.json" ]; then
        print_error "请在项目根目录执行此脚本"
        exit 1
    fi
    
    # 执行构建流程
    check_node_version
    clean_build
    install_dependencies
    run_lint
    run_tests
    build_project
    verify_build
    generate_report
    
    echo ""
    print_success "🎉 生产环境构建完成！"
    print_info "前端构建文件: frontend/dist/"
    print_info "后端构建文件: backend/dist/"
    print_info "构建报告: build-report.txt"
}

# 执行主函数
main "$@"