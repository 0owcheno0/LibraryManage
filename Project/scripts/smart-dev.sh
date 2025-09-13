#!/bin/bash

# 团队知识库 - 智能开发环境启动脚本
# 增强版：智能端口检测、自动打开浏览器、服务健康检查、美化输出

set -e  # 遇到错误立即停止

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# 服务配置
DEFAULT_FRONTEND_PORT=3000
DEFAULT_BACKEND_PORT=8000
FRONTEND_PORT=$DEFAULT_FRONTEND_PORT
BACKEND_PORT=$DEFAULT_BACKEND_PORT
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
BACKEND_URL="http://localhost:${BACKEND_PORT}"
API_HEALTH_URL="${BACKEND_URL}/api/v1/health"

# 配置选项
AUTO_OPEN_BROWSER=${AUTO_OPEN_BROWSER:-true}
BROWSER_DELAY=${BROWSER_DELAY:-2}
MAX_PORT_ATTEMPTS=10
HEALTH_CHECK_TIMEOUT=60

# 打印函数
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

print_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${GRAY}🔍 DEBUG: $1${NC}"
    fi
}

print_header() {
    clear
    echo -e "${CYAN}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 团队知识库 - 智能开发环境 v2.0"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
}

print_footer() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}🎉 开发环境已准备就绪！按 ${RED}Ctrl+C${WHITE} 停止所有服务${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

# 智能端口检测
find_available_port() {
    local base_port=$1
    local port=$base_port
    local attempts=0
    
    while [ $attempts -lt $MAX_PORT_ATTEMPTS ]; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo $port
            return 0
        fi
        port=$((port + 1))
        attempts=$((attempts + 1))
    done
    
    print_error "无法找到可用端口（从 $base_port 开始尝试了 $MAX_PORT_ATTEMPTS 次）"
    return 1
}

# 智能端口配置
configure_ports() {
    print_info "配置服务端口..."
    
    # 检测前端端口
    FRONTEND_PORT=$(find_available_port $DEFAULT_FRONTEND_PORT)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    # 检测后端端口
    BACKEND_PORT=$(find_available_port $DEFAULT_BACKEND_PORT)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    # 更新URL
    FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
    BACKEND_URL="http://localhost:${BACKEND_PORT}"
    API_HEALTH_URL="${BACKEND_URL}/api/v1/health"
    
    if [ $FRONTEND_PORT -ne $DEFAULT_FRONTEND_PORT ]; then
        print_warning "前端端口已调整为: $FRONTEND_PORT"
    else
        print_success "前端端口: $FRONTEND_PORT"
    fi
    
    if [ $BACKEND_PORT -ne $DEFAULT_BACKEND_PORT ]; then
        print_warning "后端端口已调整为: $BACKEND_PORT"
    else
        print_success "后端端口: $BACKEND_PORT"
    fi
}

# 自动打开浏览器（增强版）
open_browser() {
    local url=$1
    local description=${2:-"页面"}
    local os=$(detect_os)
    
    if [[ "$AUTO_OPEN_BROWSER" != "true" ]]; then
        print_info "自动打开浏览器已禁用，请手动访问: $url"
        return
    fi
    
    print_info "正在打开${description}: $url"
    
    case $os in
        "macos")
            open "$url" 2>/dev/null &
            ;;
        "linux")
            (xdg-open "$url" 2>/dev/null || \
             gnome-open "$url" 2>/dev/null || \
             kde-open "$url" 2>/dev/null) &
            ;;
        "windows")
            start "$url" 2>/dev/null &
            ;;
        *)
            print_warning "未能自动打开浏览器，请手动访问: $url"
            return 1
            ;;
    esac
    
    print_success "${description}已在浏览器中打开"
}

# 增强版服务等待
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=${HEALTH_CHECK_TIMEOUT:-60}
    local attempt=1
    
    print_info "等待${service_name}服务启动..."
    
    local dots=""
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "\r${GREEN}✅ ${service_name}服务已启动: $url${NC}"
            return 0
        fi
        
        # 动态点点点效果
        local dots_count=$((attempt % 4))
        local dots=$(printf "%*s" $dots_count | tr ' ' '.')
        printf "\r${BLUE}⏳ 等待${service_name}服务启动${dots}${NC} (${attempt}/${max_attempts})"
        
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo ""
    print_warning "${service_name}服务启动超时，请检查: $url"
    return 1
}

# 检查Node.js版本
check_node_version() {
    print_info "检查Node.js环境..."
    if ! command -v node &> /dev/null; then
        print_error "未安装Node.js，请先安装Node.js 18+"
        return 1
    fi
    
    local node_version=$(node -v)
    local major_version=$(echo $node_version | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$major_version" -lt 18 ]; then
        print_warning "Node.js版本过低，建议使用18+，当前: $node_version"
        if [ -f ".nvmrc" ]; then
            local recommended_version=$(cat .nvmrc)
            print_info "推荐版本: $recommended_version"
        fi
    else
        print_success "Node.js版本: $node_version ✓"
    fi
    
    # 检查npm
    if command -v npm &> /dev/null; then
        print_success "npm版本: $(npm -v) ✓"
    else
        print_error "npm未安装"
        return 1
    fi
}

# 检查项目依赖
check_dependencies() {
    print_info "检查项目依赖..."
    local needs_install=false
    
    # 检查根目录
    if [ ! -d "node_modules" ]; then
        print_warning "根目录依赖缺失"
        needs_install=true
    fi
    
    # 检查后端
    if [ ! -d "backend/node_modules" ]; then
        print_warning "后端依赖缺失"
        needs_install=true
    fi
    
    # 检查前端
    if [ ! -d "frontend/node_modules" ]; then
        print_warning "前端依赖缺失"
        needs_install=true
    fi
    
    if [ "$needs_install" = true ]; then
        print_info "正在安装缺失的依赖..."
        npm run install:all || {
            print_error "依赖安装失败"
            return 1
        }
    fi
    
    print_success "依赖检查完成 ✓"
}

# 项目健康检查
health_check() {
    print_info "执行项目健康检查..."
    
    # 检查必要文件
    local required_files=("package.json" "frontend/package.json" "backend/package.json")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "缺少必要文件: $file"
            return 1
        fi
    done
    
    # 检查环境配置
    if [ ! -f "backend/.env.development" ]; then
        print_warning "后端开发环境配置文件不存在"
    fi
    
    print_success "项目健康检查通过 ✓"
}

# 显示服务信息
show_service_info() {
    echo ""
    echo -e "${CYAN}📊 服务信息${NC}"
    echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"
    echo -e "   🌐 前端应用   : ${GREEN}${FRONTEND_URL}${NC}"
    echo -e "   ⚡ 后端API    : ${GREEN}${BACKEND_URL}${NC}" 
    echo -e "   💚 健康检查   : ${GREEN}${API_HEALTH_URL}${NC}"
    echo -e "   🔧 开发工具   : React DevTools, Redux DevTools"
    echo -e "   📝 日志查看   : 终端输出 + 浏览器控制台"
    echo -e "${CYAN}─────────────────────────────────────────────────────────${NC}"
}

# 启动开发服务器
start_development() {
    print_info "启动开发服务器..."
    
    # 设置环境变量
    export FRONTEND_PORT
    export BACKEND_PORT
    
    # 启动服务
    npm run dev &
    local server_pid=$!
    
    # 等待服务启动
    sleep 3
    
    # 等待后端服务
    if wait_for_service "$API_HEALTH_URL" "后端API"; then
        sleep $BROWSER_DELAY
        
        # 自动打开调试页面
        print_highlight "正在自动打开调试页面..."
        
        open_browser "$API_HEALTH_URL" "后端API健康检查"
        sleep 1
        open_browser "$FRONTEND_URL" "前端应用"
        
        show_service_info
        print_footer
        
    else
        print_error "后端服务启动失败，请检查日志"
        kill $server_pid 2>/dev/null || true
        return 1
    fi
    
    # 等待主进程
    wait $server_pid
}

# 清理函数
cleanup() {
    print_info "正在停止开发服务器..."
    
    # 停止所有相关进程
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "tsx watch" 2>/dev/null || true
    
    print_success "开发服务器已停止"
    exit 0
}

# 主函数
main() {
    print_header
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        print_error "请在项目根目录执行此脚本"
        exit 1
    fi
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-browser)
                AUTO_OPEN_BROWSER=false
                print_info "已禁用自动打开浏览器"
                shift
                ;;
            --debug)
                DEBUG=true
                print_info "已启用调试模式"
                shift
                ;;
            --help|-h)
                echo "用法: $0 [选项]"
                echo "选项:"
                echo "  --no-browser  禁用自动打开浏览器"
                echo "  --debug       启用调试模式"
                echo "  --help, -h    显示此帮助信息"
                exit 0
                ;;
            *)
                print_warning "未知参数: $1"
                shift
                ;;
        esac
    done
    
    # 执行检查
    check_node_version || exit 1
    health_check || exit 1
    configure_ports || exit 1
    check_dependencies || exit 1
    
    echo ""
    print_success "环境检查完成，正在启动开发服务器..."
    echo ""
    
    # 启动服务
    start_development
}

# 设置信号处理
trap cleanup INT TERM

# 执行主函数
main "$@"