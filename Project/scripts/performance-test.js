/**
 * 性能测试脚本
 * 测试系统各项性能指标
 */

const { performance } = require('perf_hooks');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
  baseURL: 'http://localhost:8000',
  databasePath: './database/knowledge_base.db',
  testDataSize: {
    small: 100,
    medium: 1000,
    large: 10000
  },
  performanceTargets: {
    apiResponse: 1000, // API响应时间目标: 1秒
    pageLoad: 3000,    // 页面加载时间目标: 3秒
    searchResponse: 1000, // 搜索响应时间目标: 1秒
    dbQuery: 100       // 数据库查询时间目标: 100ms
  }
};

// 性能测试结果
const testResults = {
  database: {
    queries: [],
    indexEfficiency: []
  },
  api: {
    endpoints: [],
    concurrent: []
  },
  frontend: {
    loadTime: [],
    renderTime: []
  },
  overall: {
    summary: {},
    recommendations: []
  }
};

/**
 * 数据库性能测试
 */
async function testDatabasePerformance() {
  console.log('🔍 开始数据库性能测试...');
  
  const db = new sqlite3.Database(config.databasePath);
  
  // 测试各种查询性能
  const queries = [
    {
      name: '简单文档查询',
      sql: 'SELECT * FROM documents WHERE status = ? LIMIT 20',
      params: ['active']
    },
    {
      name: '复杂连接查询',
      sql: `
        SELECT d.*, u.username, GROUP_CONCAT(t.name) as tags
        FROM documents d
        LEFT JOIN users u ON d.upload_user_id = u.id
        LEFT JOIN document_tags dt ON d.id = dt.document_id
        LEFT JOIN tags t ON dt.tag_id = t.id
        WHERE d.status = ?
        GROUP BY d.id
        ORDER BY d.created_at DESC
        LIMIT 20
      `,
      params: ['active']
    },
    {
      name: '全文搜索查询',
      sql: `
        SELECT * FROM documents_fts 
        WHERE documents_fts MATCH ?
        LIMIT 20
      `,
      params: ['测试']
    },
    {
      name: '统计查询',
      sql: `
        SELECT COUNT(*) as total_docs,
               AVG(file_size) as avg_size,
               COUNT(DISTINCT upload_user_id) as unique_users
        FROM documents 
        WHERE status = ?
      `,
      params: ['active']
    }
  ];

  for (const query of queries) {
    const startTime = performance.now();
    
    try {
      await new Promise((resolve, reject) => {
        db.all(query.sql, query.params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      testResults.database.queries.push({
        name: query.name,
        duration: duration,
        success: true,
        meetTarget: duration < config.performanceTargets.dbQuery
      });
      
      console.log(`  ✅ ${query.name}: ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      testResults.database.queries.push({
        name: query.name,
        duration: null,
        success: false,
        error: error.message
      });
      
      console.log(`  ❌ ${query.name}: 失败 - ${error.message}`);
    }
  }
  
  db.close();
  console.log('📊 数据库性能测试完成\n');
}

/**
 * API性能测试
 */
async function testAPIPerformance() {
  console.log('🚀 开始API性能测试...');
  
  // 测试用户认证
  let authToken = '';
  try {
    const loginResponse = await axios.post(`${config.baseURL}/api/v1/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.data.token;
  } catch (error) {
    console.log('  ⚠️ 无法获取认证令牌，跳过需要认证的测试');
  }

  const apiEndpoints = [
    {
      name: '获取文档列表',
      method: 'GET',
      url: '/api/v1/documents',
      requireAuth: true
    },
    {
      name: '搜索文档',
      method: 'GET',
      url: '/api/v1/search?q=测试',
      requireAuth: true
    },
    {
      name: '获取标签列表',
      method: 'GET',
      url: '/api/v1/tags',
      requireAuth: true
    },
    {
      name: '用户信息',
      method: 'GET',
      url: '/api/v1/auth/me',
      requireAuth: true
    }
  ];

  for (const endpoint of apiEndpoints) {
    if (endpoint.requireAuth && !authToken) {
      console.log(`  ⏭️  跳过 ${endpoint.name} (需要认证)`);
      continue;
    }

    const startTime = performance.now();
    
    try {
      const headers = endpoint.requireAuth ? {
        'Authorization': `Bearer ${authToken}`
      } : {};
      
      await axios({
        method: endpoint.method,
        url: `${config.baseURL}${endpoint.url}`,
        headers
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      testResults.api.endpoints.push({
        name: endpoint.name,
        duration: duration,
        success: true,
        meetTarget: duration < config.performanceTargets.apiResponse
      });
      
      console.log(`  ✅ ${endpoint.name}: ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      testResults.api.endpoints.push({
        name: endpoint.name,
        duration: null,
        success: false,
        error: error.message
      });
      
      console.log(`  ❌ ${endpoint.name}: 失败 - ${error.message}`);
    }
  }
  
  console.log('🌐 API性能测试完成\n');
}

/**
 * 并发性能测试
 */
async function testConcurrentPerformance() {
  console.log('⚡ 开始并发性能测试...');
  
  const concurrentLevels = [1, 5, 10, 20];
  
  for (const concurrency of concurrentLevels) {
    console.log(`  测试并发数: ${concurrency}`);
    
    const promises = [];
    const startTime = performance.now();
    
    for (let i = 0; i < concurrency; i++) {
      promises.push(
        axios.get(`${config.baseURL}/api/v1/search?q=test${i}`)
          .catch(error => ({ error: error.message }))
      );
    }
    
    try {
      const results = await Promise.all(promises);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const successCount = results.filter(r => !r.error).length;
      
      testResults.api.concurrent.push({
        concurrency,
        totalDuration,
        averageDuration: totalDuration / concurrency,
        successCount,
        successRate: (successCount / concurrency) * 100
      });
      
      console.log(`    总耗时: ${totalDuration.toFixed(2)}ms`);
      console.log(`    平均耗时: ${(totalDuration / concurrency).toFixed(2)}ms`);
      console.log(`    成功率: ${((successCount / concurrency) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.log(`    ❌ 并发测试失败: ${error.message}`);
    }
  }
  
  console.log('🔥 并发性能测试完成\n');
}

/**
 * 内存和CPU使用情况测试
 */
async function testResourceUsage() {
  console.log('💾 开始资源使用情况测试...');
  
  const initialMemory = process.memoryUsage();
  console.log(`  初始内存使用: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  // 模拟高负载操作
  const testOperations = [
    () => performLargeDataProcessing(),
    () => performFileOperations(),
    () => performConcurrentRequests()
  ];
  
  for (const operation of testOperations) {
    const beforeMemory = process.memoryUsage();
    const startTime = performance.now();
    
    try {
      await operation();
      
      const afterMemory = process.memoryUsage();
      const endTime = performance.now();
      
      console.log(`    操作耗时: ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`    内存变化: ${((afterMemory.heapUsed - beforeMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
      
    } catch (error) {
      console.log(`    ❌ 资源测试失败: ${error.message}`);
    }
    
    // 强制垃圾回收 (如果可用)
    if (global.gc) {
      global.gc();
    }
  }
  
  console.log('📈 资源使用情况测试完成\n');
}

/**
 * 辅助函数：大数据处理
 */
async function performLargeDataProcessing() {
  const data = new Array(10000).fill(0).map((_, i) => ({
    id: i,
    title: `Document ${i}`,
    content: `Content for document ${i}`.repeat(100)
  }));
  
  // 模拟数据处理
  const processed = data.map(item => ({
    ...item,
    processed: true,
    timestamp: Date.now()
  }));
  
  return processed.length;
}

/**
 * 辅助函数：文件操作
 */
async function performFileOperations() {
  const tempDir = path.join(__dirname, '../temp-test');
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    // 创建多个临时文件
    const files = [];
    for (let i = 0; i < 100; i++) {
      const fileName = `test-file-${i}.txt`;
      const filePath = path.join(tempDir, fileName);
      await fs.writeFile(filePath, `Test content ${i}`.repeat(1000));
      files.push(filePath);
    }
    
    // 读取文件
    const contents = await Promise.all(
      files.map(file => fs.readFile(file, 'utf8'))
    );
    
    // 清理临时文件
    await Promise.all(files.map(file => fs.unlink(file)));
    await fs.rmdir(tempDir);
    
    return contents.length;
  } catch (error) {
    console.log(`    文件操作错误: ${error.message}`);
    throw error;
  }
}

/**
 * 辅助函数：并发请求
 */
async function performConcurrentRequests() {
  const requests = [];
  
  for (let i = 0; i < 50; i++) {
    requests.push(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(`Request ${i} completed`);
        }, Math.random() * 100);
      })
    );
  }
  
  const results = await Promise.all(requests);
  return results.length;
}

/**
 * 生成性能报告
 */
function generateReport() {
  console.log('📋 生成性能测试报告...\n');
  
  // 数据库性能分析
  const dbQueries = testResults.database.queries;
  const dbSuccess = dbQueries.filter(q => q.success).length;
  const dbAvgDuration = dbQueries
    .filter(q => q.success)
    .reduce((sum, q) => sum + q.duration, 0) / dbSuccess;
  
  console.log('📊 数据库性能汇总:');
  console.log(`  成功查询: ${dbSuccess}/${dbQueries.length}`);
  console.log(`  平均查询时间: ${dbAvgDuration?.toFixed(2)}ms`);
  console.log(`  性能达标率: ${dbQueries.filter(q => q.meetTarget).length}/${dbQueries.length}`);
  
  // API性能分析
  const apiEndpoints = testResults.api.endpoints;
  const apiSuccess = apiEndpoints.filter(e => e.success).length;
  const apiAvgDuration = apiEndpoints
    .filter(e => e.success)
    .reduce((sum, e) => sum + e.duration, 0) / apiSuccess;
  
  console.log('\n🚀 API性能汇总:');
  console.log(`  成功请求: ${apiSuccess}/${apiEndpoints.length}`);
  console.log(`  平均响应时间: ${apiAvgDuration?.toFixed(2)}ms`);
  console.log(`  性能达标率: ${apiEndpoints.filter(e => e.meetTarget).length}/${apiEndpoints.length}`);
  
  // 并发性能分析
  if (testResults.api.concurrent.length > 0) {
    console.log('\n⚡ 并发性能汇总:');
    testResults.api.concurrent.forEach(result => {
      console.log(`  并发${result.concurrency}: 平均${result.averageDuration.toFixed(2)}ms, 成功率${result.successRate.toFixed(1)}%`);
    });
  }
  
  // 性能建议
  console.log('\n💡 性能优化建议:');
  
  const slowQueries = dbQueries.filter(q => q.success && q.duration > config.performanceTargets.dbQuery);
  if (slowQueries.length > 0) {
    console.log(`  - 优化以下慢查询: ${slowQueries.map(q => q.name).join(', ')}`);
  }
  
  const slowApis = apiEndpoints.filter(e => e.success && e.duration > config.performanceTargets.apiResponse);
  if (slowApis.length > 0) {
    console.log(`  - 优化以下慢接口: ${slowApis.map(e => e.name).join(', ')}`);
  }
  
  const lowConcurrency = testResults.api.concurrent.filter(r => r.successRate < 95);
  if (lowConcurrency.length > 0) {
    console.log(`  - 提高并发处理能力，当前在高并发下成功率偏低`);
  }
  
  console.log(`  - 建议启用gzip压缩减少传输时间`);
  console.log(`  - 考虑使用Redis缓存频繁查询的数据`);
  console.log(`  - 定期清理和优化数据库索引`);
}

/**
 * 主测试函数
 */
async function runPerformanceTests() {
  console.log('🚀 启动系统集成测试和性能优化验证\n');
  console.log('=' .repeat(60));
  
  try {
    await testDatabasePerformance();
    await testAPIPerformance();
    await testConcurrentPerformance();
    await testResourceUsage();
    
    generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有性能测试完成!');
    
    // 保存测试结果
    await fs.writeFile(
      path.join(__dirname, '../test-results/performance-report.json'),
      JSON.stringify(testResults, null, 2)
    );
    
    console.log('📄 测试报告已保存至: test-results/performance-report.json');
    
  } catch (error) {
    console.error('❌ 性能测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runPerformanceTests();
}

module.exports = {
  runPerformanceTests,
  testResults
};