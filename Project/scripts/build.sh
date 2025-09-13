#!/bin/bash

# 构建脚本
set -e

echo "🚀 开始构建项目..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装根目录依赖..."
npm install

echo "📦 安装前端依赖..."
cd frontend && npm install
cd ..

echo "📦 安装后端依赖..."
cd backend && npm install
cd ..

# 构建项目
echo "🔨 构建前端..."
npm run build:frontend

echo "🔨 构建后端..."
npm run build:backend

# 运行测试
echo "🧪 运行测试..."
npm run test

echo "✅ 构建完成!"