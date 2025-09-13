#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动团队知识库开发环境...\n');

// 启动后端
console.log('📡 启动后端服务器...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// 延迟启动前端
setTimeout(() => {
  console.log('🎨 启动前端开发服务器...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('前端启动失败:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('后端启动失败:', err);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 关闭开发服务器...');
  backend.kill();
  process.exit(0);
});