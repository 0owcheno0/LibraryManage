#!/usr/bin/env node

console.log('🔍 检查前后端框架搭建情况...\n');

const fs = require('fs');
const path = require('path');

// 检查文件是否存在
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

// 检查目录是否存在
function checkDir(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  console.log(`${exists ? '✅' : '❌'} ${description}: ${dirPath}`);
  return exists;
}

console.log('📦 后端框架文件检查:');
const backendFiles = [
  ['backend/src/app.ts', 'Express应用配置'],
  ['backend/src/index.ts', '服务器启动文件'],
  ['backend/src/middleware/responseHandler.ts', '响应处理中间件'],
  ['backend/src/middleware/errorHandler.ts', '错误处理中间件'],
  ['backend/src/routes/auth.ts', '认证路由'],
  ['backend/src/routes/documents.ts', '文档路由'],
  ['backend/src/routes/tags.ts', '标签路由'],
  ['backend/src/routes/users.ts', '用户路由'],
  ['backend/src/routes/search.ts', '搜索路由'],
  ['backend/.env.development', '开发环境配置'],
  ['backend/package.json', '后端依赖配置'],
];

let backendSuccess = 0;
backendFiles.forEach(([file, desc]) => {
  if (checkFile(file, desc)) backendSuccess++;
});

console.log('\n🎨 前端框架文件检查:');
const frontendFiles = [
  ['frontend/src/main.tsx', 'React应用入口'],
  ['frontend/src/App.tsx', '主应用组件'],
  ['frontend/src/contexts/AuthContext.tsx', '认证上下文'],
  ['frontend/src/components/common/PrivateRoute.tsx', '私有路由组件'],
  ['frontend/src/components/layout/MainLayout.tsx', '主布局组件'],
  ['frontend/src/pages/auth/LoginPage.tsx', '登录页面'],
  ['frontend/src/pages/auth/RegisterPage.tsx', '注册页面'],
  ['frontend/src/pages/DashboardPage.tsx', '仪表盘页面'],
  ['frontend/src/pages/documents/DocumentListPage.tsx', '文档列表页面'],
  ['frontend/src/styles/index.css', '全局样式'],
  ['frontend/package.json', '前端依赖配置'],
];

let frontendSuccess = 0;
frontendFiles.forEach(([file, desc]) => {
  if (checkFile(file, desc)) frontendSuccess++;
});

console.log('\n📁 目录结构检查:');
const directories = [
  ['backend/src/controllers', '后端控制器目录'],
  ['backend/src/services', '后端服务目录'],
  ['backend/src/models', '后端模型目录'],
  ['backend/uploads', '文件上传目录'],
  ['frontend/src/components/common', '前端通用组件目录'],
  ['frontend/src/services/api', '前端API服务目录'],
  ['frontend/src/hooks', '前端自定义Hook目录'],
  ['frontend/src/types', '前端类型定义目录'],
];

let dirSuccess = 0;
directories.forEach(([dir, desc]) => {
  if (checkDir(dir, desc)) dirSuccess++;
});

console.log('\n📊 框架搭建总结:');
console.log(`后端框架完成度: ${backendSuccess}/${backendFiles.length} (${Math.round(backendSuccess/backendFiles.length*100)}%)`);
console.log(`前端框架完成度: ${frontendSuccess}/${frontendFiles.length} (${Math.round(frontendSuccess/frontendFiles.length*100)}%)`);
console.log(`目录结构完成度: ${dirSuccess}/${directories.length} (${Math.round(dirSuccess/directories.length*100)}%)`);

const totalFiles = backendFiles.length + frontendFiles.length + directories.length;
const totalSuccess = backendSuccess + frontendSuccess + dirSuccess;
const completionRate = Math.round(totalSuccess/totalFiles*100);

console.log(`\n🎯 总体完成度: ${totalSuccess}/${totalFiles} (${completionRate}%)`);

if (completionRate >= 90) {
  console.log('\n🎉 框架搭建完成！可以开始业务逻辑开发。');
} else if (completionRate >= 70) {
  console.log('\n⚠️ 框架基本搭建完成，但有部分文件缺失。');
} else {
  console.log('\n❌ 框架搭建不完整，需要继续完善。');
}

console.log('\n📝 下一步建议:');
console.log('1. 解决依赖安装问题');
console.log('2. 配置开发环境启动脚本');
console.log('3. 实现JWT认证逻辑');
console.log('4. 连接SQLite数据库');
console.log('5. 实现文档上传功能');