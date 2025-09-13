import { app, PORT } from './app';
import { getDatabaseConnection } from './database/connection';

async function startServer() {
  try {
    // 初始化数据库连接
    console.log('🗄️ 正在初始化数据库连接...');
    const dbConnection = getDatabaseConnection();
    
    // 执行数据库健康检查
    const healthCheck = dbConnection.healthCheck();
    console.log(`✅ 数据库状态: ${healthCheck.message}`);
    
    if (healthCheck.details?.statistics) {
      console.log('📊 数据库统计:', healthCheck.details.statistics);
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
🚀 服务器启动成功!
📡 端口: ${PORT}
🌍 环境: ${process.env.NODE_ENV || 'development'}
📋 API文档: http://localhost:${PORT}/api/v1/health
🗃️ 数据库: SQLite (${dbConnection.isConnected() ? '已连接' : '连接失败'})
⏰ 启动时间: ${new Date().toLocaleString()}
      `);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', error => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

startServer();
