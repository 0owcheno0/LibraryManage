#!/bin/bash

# 开发环境启动脚本
set -e

echo "🚀 启动开发环境..."

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装根目录依赖..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend && npm install && cd ..
fi

# 初始化数据库（如果不存在）
if [ ! -f "database/knowledge_base.db" ]; then
    echo "🗄️ 初始化数据库..."
    npm run db:init
    npm run db:seed
fi

# 启动开发服务器
echo "🔥 启动开发服务器..."
echo "前端: http://localhost:3000"
echo "后端: http://localhost:8000"
echo ""
npm run dev