#!/bin/bash

# 团队知识库 - 开发环境启动脚本
# 自动检查依赖、初始化数据库、启动开发服务器、打开调试链接

set -e  # 遇到错误立即停止

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 服务地址变量
FRONTEND_PORT=3000
BACKEND_PORT=8000
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
BACKEND_URL="http://localhost:${BACKEND_PORT}"
API_HEALTH_URL="${BACKEND_URL}/api/v1/health"

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

print_highlight() {
    echo -e "${MAGENTA}🌟 $1${NC}"
}

print_header() {
    echo -e "${CYAN}"
    echo "🚀 团队知识库 - 智能开发环境"
    echo "====================================="
    echo -e "${NC}"
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# 自动打开浏览器
open_browser() {
    local url=$1
    local os=$(detect_os)
    
    case $os in
        "macos")
            open "$url" 2>/dev/null &
            ;;
        "linux")
            xdg-open "$url" 2>/dev/null || \
            gnome-open "$url" 2>/dev/null || \
            kde-open "$url" 2>/dev/null &
            ;;
        "windows")
            start "$url" 2>/dev/null &
            ;;
        *)
            print_warning "未能自动打开浏览器，请手动访问: $url"
            ;;
    esac
}

# 等待服务启动
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_info "等待${service_name}服务启动..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "${service_name}服务已启动: $url"
            return 0
        fi
        
        if [ $((attempt % 5)) -eq 0 ]; then
            print_info "等待${service_name}服务启动... ($attempt/$max_attempts)"
        fi
        
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_warning "${service_name}服务启动超时，请手动检查: $url"
    return 1
}

# 检测实际运行端口
detect_actual_ports() {
    print_info "检测实际运行端口..."
    
    # 检测前端端口
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
            FRONTEND_PORT=3001
            FRONTEND_URL="http://localhost:3001"
            print_info "前端运行在备用端口: 3001"
        fi
    fi
    
    # 检测后端端口
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
            BACKEND_PORT=8001
            BACKEND_URL="http://localhost:8001"
            API_HEALTH_URL="${BACKEND_URL}/api/v1/health"
            print_info "后端运行在备用端口: 8001"
        fi
    fi
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
    print_info "前端: ${FRONTEND_URL}"
    print_info "后端: ${BACKEND_URL}"
    print_info "按 Ctrl+C 停止服务器"
    echo ""
    
    # 在后台启动服务
    npm run dev &
    SERVER_PID=$!
    
    # 等待服务启动
    sleep 3
    
    # 检测实际端口
    detect_actual_ports
    
    # 等待后端服务启动
    if wait_for_service "$API_HEALTH_URL" "后端"; then
        print_highlight "正在自动打开调试页面..."
        
        # 自动打开后端API文档
        open_browser "$API_HEALTH_URL"
        sleep 1
        
        # 自动打开前端应用
        open_browser "$FRONTEND_URL"
        
        echo ""
        print_success "🎉 开发环境启动完成！"
        echo -e "${CYAN}📱 访问链接:${NC}"
        echo -e "   🌐 前端应用: ${CYAN}${FRONTEND_URL}${NC}"
        echo -e "   ⚡ 后端API: ${CYAN}${BACKEND_URL}${NC}"
        echo -e "   💚 健康检查: ${CYAN}${API_HEALTH_URL}${NC}"
        echo ""
        print_info "浏览器已自动打开调试页面"
        print_warning "按 Ctrl+C 停止所有服务"
        echo ""
    else
        print_error "后端服务启动失败"
    fi
    
    # 等待主进程
    wait $SERVER_PID
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