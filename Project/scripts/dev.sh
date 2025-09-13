#!/bin/bash

# 团队知识库 - 开发环境启动脚本
# 自动检查依赖、初始化数据库、启动开发服务器

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
    echo "🚀 团队知识库 - 开发环境启动"
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
        print_warning "Node.js版本过低，建议使用Node.js 18+，当前版本: $(node -v)"
        print_info "推荐使用 .nvmrc 中指定的版本: $(cat .nvmrc 2>/dev/null || echo '18.20.4')"
    else
        print_success "Node.js版本检查通过: $(node -v)"
    fi
}

# 检查npm依赖
check_dependencies() {
    print_info "检查项目依赖..."
    
    # 检查根目录依赖
    if [ ! -d "node_modules" ]; then
        print_info "安装根目录依赖..."
        npm install
    fi
    
    # 检查后端依赖
    if [ ! -d "backend/node_modules" ]; then
        print_info "安装后端依赖..."
        cd backend && npm install --legacy-peer-deps && cd ..
    fi
    
    # 检查前端依赖
    if [ ! -d "frontend/node_modules" ]; then
        print_info "安装前端依赖..."
        cd frontend && npm install --legacy-peer-deps && cd ..
    fi
    
    print_success "依赖检查完成"
}

# 检查数据库
check_database() {
    print_info "检查数据库状态..."
    if [ ! -f "database/knowledge_base.db" ]; then
        print_warning "数据库文件不存在，开发模式将使用内存数据"
    else
        print_success "数据库文件存在"
    fi
}

# 检查端口占用
check_ports() {
    print_info "检查端口占用情况..."
    
    # 检查3000端口（前端）
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口3000已被占用，请手动停止相关进程或更改端口"
    else
        print_success "前端端口3000可用"
    fi
    
    # 检查8000端口（后端）
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口8000已被占用，请手动停止相关进程或更改端口"
    else
        print_success "后端端口8000可用"
    fi
}

# 启动开发服务器
start_development() {
    print_info "启动开发服务器..."
    print_info "前端: http://localhost:3000"
    print_info "后端: http://localhost:8000"
    print_info "按 Ctrl+C 停止服务器"
    echo ""
    
    # 使用npm运行开发脚本
    npm run dev
}

# 主函数
main() {
    print_header
    
    # 确保在项目根目录
    if [ ! -f "package.json" ]; then
        print_error "请在项目根目录执行此脚本"
        exit 1
    fi
    
    # 执行检查和启动
    check_node_version
    check_dependencies
    check_database
    check_ports
    
    echo ""
    print_success "环境检查完成，启动开发服务器..."
    echo ""
    
    start_development
}

# 捕获中断信号
trap 'print_info "正在停止开发服务器..."; exit 0' INT

# 执行主函数
main "$@"