/**
 * 集成测试脚本
 * 验证系统各组件集成和功能完整性
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');

// 测试配置
const config = {
  baseURL: 'http://localhost:8000',
  testUser: {
    username: 'integration_test_user',
    email: 'integration@test.com',
    password: 'IntegrationTest123!',
    fullName: '集成测试用户'
  },
  testDocument: {
    title: '集成测试文档',
    description: '用于验证系统集成功能的测试文档',
    tags: ['集成测试', '自动化']
  }
};

// 测试状态
const testState = {
  authToken: '',
  userId: null,
  documentId: null,
  tagIds: [],
  shareToken: ''
};

// 测试结果
const integrationResults = {
  auth: { passed: 0, failed: 0, tests: [] },
  documents: { passed: 0, failed: 0, tests: [] },
  search: { passed: 0, failed: 0, tests: [] },
  tags: { passed: 0, failed: 0, tests: [] },
  permissions: { passed: 0, failed: 0, tests: [] },
  sharing: { passed: 0, failed: 0, tests: [] },
  overall: { passed: 0, failed: 0, total: 0 }
};

/**
 * 测试辅助函数
 */
function logTest(category, testName, success, message = '', data = null) {
  const result = {
    name: testName,
    success,
    message,
    timestamp: new Date().toISOString(),
    data
  };
  
  integrationResults[category].tests.push(result);
  
  if (success) {
    integrationResults[category].passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    integrationResults[category].failed++;
    console.log(`  ❌ ${testName}: ${message}`);
  }
}

/**
 * HTTP请求辅助函数
 */
async function makeRequest(method, url, data = null, useAuth = true, isFile = false) {
  try {
    const headers = {};
    
    if (useAuth && testState.authToken) {
      headers.Authorization = `Bearer ${testState.authToken}`;
    }
    
    if (isFile && data instanceof FormData) {
      // FormData会自动设置正确的Content-Type
    } else if (data && !isFile) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios({
      method,
      url: `${config.baseURL}${url}`,
      data,
      headers,
      timeout: 10000
    });
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
}

/**
 * 1. 用户认证集成测试
 */
async function testAuthenticationIntegration() {
  console.log('🔐 测试用户认证集成...');

  // 1.1 用户注册
  const registerResult = await makeRequest('POST', '/api/v1/auth/register', config.testUser, false);
  logTest('auth', '用户注册', 
    registerResult.success && registerResult.status === 201,
    registerResult.success ? '' : registerResult.error
  );

  // 1.2 用户登录
  const loginResult = await makeRequest('POST', '/api/v1/auth/login', {
    username: config.testUser.username,
    password: config.testUser.password
  }, false);
  
  const loginSuccess = loginResult.success && loginResult.data?.data?.token;
  logTest('auth', '用户登录', loginSuccess, 
    loginSuccess ? '' : loginResult.error
  );
  
  if (loginSuccess) {
    testState.authToken = loginResult.data.data.token;
    testState.userId = loginResult.data.data.user.id;
  }

  // 1.3 获取用户信息
  const userInfoResult = await makeRequest('GET', '/api/v1/auth/me');
  logTest('auth', '获取用户信息',
    userInfoResult.success && userInfoResult.data?.data?.username === config.testUser.username,
    userInfoResult.success ? '' : userInfoResult.error
  );

  // 1.4 权限验证
  const protectedResult = await makeRequest('GET', '/api/v1/documents');
  logTest('auth', '权限保护接口访问',
    protectedResult.success,
    protectedResult.success ? '' : protectedResult.error
  );

  console.log('🔒 用户认证集成测试完成\n');
}

/**
 * 2. 文档管理集成测试
 */
async function testDocumentManagementIntegration() {
  console.log('📄 测试文档管理集成...');

  // 2.1 获取文档列表 (应该为空)
  const initialListResult = await makeRequest('GET', '/api/v1/documents');
  logTest('documents', '获取初始文档列表',
    initialListResult.success,
    initialListResult.success ? '' : initialListResult.error
  );

  // 2.2 上传文档
  const testFile = Buffer.from('这是一个集成测试文档的内容，用于验证文档上传功能。');
  const formData = new FormData();
  formData.append('file', testFile, 'integration-test.txt');
  formData.append('title', config.testDocument.title);
  formData.append('description', config.testDocument.description);

  const uploadResult = await makeRequest('POST', '/api/v1/documents', formData, true, true);
  const uploadSuccess = uploadResult.success && uploadResult.data?.data?.id;
  logTest('documents', '文档上传',
    uploadSuccess,
    uploadSuccess ? '' : uploadResult.error
  );

  if (uploadSuccess) {
    testState.documentId = uploadResult.data.data.id;
  }

  // 2.3 获取文档详情
  if (testState.documentId) {
    const detailResult = await makeRequest('GET', `/api/v1/documents/${testState.documentId}`);
    logTest('documents', '获取文档详情',
      detailResult.success && detailResult.data?.data?.title === config.testDocument.title,
      detailResult.success ? '' : detailResult.error
    );
  }

  // 2.4 更新文档信息
  if (testState.documentId) {
    const updateData = {
      title: config.testDocument.title + ' (已更新)',
      description: config.testDocument.description + ' - 更新测试'
    };
    
    const updateResult = await makeRequest('PUT', `/api/v1/documents/${testState.documentId}`, updateData);
    logTest('documents', '更新文档信息',
      updateResult.success,
      updateResult.success ? '' : updateResult.error
    );
  }

  // 2.5 下载文档
  if (testState.documentId) {
    const downloadResult = await makeRequest('GET', `/api/v1/documents/${testState.documentId}/download`);
    logTest('documents', '文档下载',
      downloadResult.success,
      downloadResult.success ? '' : downloadResult.error
    );
  }

  console.log('📁 文档管理集成测试完成\n');
}

/**
 * 3. 标签管理集成测试
 */
async function testTagManagementIntegration() {
  console.log('🏷️  测试标签管理集成...');

  // 3.1 创建标签
  for (const tagName of config.testDocument.tags) {
    const createResult = await makeRequest('POST', '/api/v1/tags', {
      name: tagName,
      color: '#1890ff',
      description: `${tagName}标签描述`
    });
    
    const createSuccess = createResult.success && createResult.data?.data?.id;
    logTest('tags', `创建标签: ${tagName}`,
      createSuccess,
      createSuccess ? '' : createResult.error
    );
    
    if (createSuccess) {
      testState.tagIds.push(createResult.data.data.id);
    }
  }

  // 3.2 获取标签列表
  const listResult = await makeRequest('GET', '/api/v1/tags');
  logTest('tags', '获取标签列表',
    listResult.success && Array.isArray(listResult.data?.data),
    listResult.success ? '' : listResult.error
  );

  // 3.3 关联文档和标签
  if (testState.documentId && testState.tagIds.length > 0) {
    const associateResult = await makeRequest('POST', `/api/v1/documents/${testState.documentId}/tags`, {
      tagIds: testState.tagIds
    });
    
    logTest('tags', '文档标签关联',
      associateResult.success,
      associateResult.success ? '' : associateResult.error
    );
  }

  console.log('🎯 标签管理集成测试完成\n');
}

/**
 * 4. 搜索功能集成测试
 */
async function testSearchIntegration() {
  console.log('🔍 测试搜索功能集成...');

  // 4.1 基础搜索
  const basicSearchResult = await makeRequest('GET', '/api/v1/search?q=集成测试');
  logTest('search', '基础搜索功能',
    basicSearchResult.success,
    basicSearchResult.success ? '' : basicSearchResult.error
  );

  // 4.2 标签搜索
  if (testState.tagIds.length > 0) {
    const tagSearchResult = await makeRequest('GET', `/api/v1/search?tags=${testState.tagIds[0]}`);
    logTest('search', '标签搜索功能',
      tagSearchResult.success,
      tagSearchResult.success ? '' : tagSearchResult.error
    );
  }

  // 4.3 高级搜索
  const advancedSearchResult = await makeRequest('GET', '/api/v1/search/advanced', {
    title: '集成',
    description: '测试',
    tags: testState.tagIds
  });
  logTest('search', '高级搜索功能',
    advancedSearchResult.success,
    advancedSearchResult.success ? '' : advancedSearchResult.error
  );

  // 4.4 搜索结果验证
  if (basicSearchResult.success && basicSearchResult.data?.data?.documents) {
    const hasTestDocument = basicSearchResult.data.data.documents.some(
      doc => doc.id === testState.documentId
    );
    logTest('search', '搜索结果准确性',
      hasTestDocument,
      hasTestDocument ? '' : '未找到测试文档'
    );
  }

  console.log('🎯 搜索功能集成测试完成\n');
}

/**
 * 5. 权限管理集成测试
 */
async function testPermissionIntegration() {
  console.log('🛡️  测试权限管理集成...');

  // 5.1 设置文档权限
  if (testState.documentId) {
    const permissionResult = await makeRequest('POST', '/api/v1/permissions', {
      resource_type: 'document',
      resource_id: testState.documentId,
      user_id: testState.userId,
      permission_type: 'read'
    });
    
    logTest('permissions', '设置文档权限',
      permissionResult.success,
      permissionResult.success ? '' : permissionResult.error
    );
  }

  // 5.2 获取权限列表
  const permissionListResult = await makeRequest('GET', '/api/v1/permissions');
  logTest('permissions', '获取权限列表',
    permissionListResult.success,
    permissionListResult.success ? '' : permissionListResult.error
  );

  console.log('🔐 权限管理集成测试完成\n');
}

/**
 * 6. 分享功能集成测试
 */
async function testSharingIntegration() {
  console.log('🔗 测试分享功能集成...');

  // 6.1 创建分享链接
  if (testState.documentId) {
    const shareResult = await makeRequest('POST', '/api/v1/shared', {
      resource_type: 'document',
      resource_id: testState.documentId,
      expires_in: 7 * 24 * 60 * 60 // 7天
    });
    
    const shareSuccess = shareResult.success && shareResult.data?.data?.share_token;
    logTest('sharing', '创建分享链接',
      shareSuccess,
      shareSuccess ? '' : shareResult.error
    );
    
    if (shareSuccess) {
      testState.shareToken = shareResult.data.data.share_token;
    }
  }

  // 6.2 访问分享链接
  if (testState.shareToken) {
    const accessResult = await makeRequest('GET', `/api/v1/shared/${testState.shareToken}`, null, false);
    logTest('sharing', '访问分享链接',
      accessResult.success,
      accessResult.success ? '' : accessResult.error
    );
  }

  // 6.3 获取分享列表
  const shareListResult = await makeRequest('GET', '/api/v1/shared');
  logTest('sharing', '获取分享列表',
    shareListResult.success,
    shareListResult.success ? '' : shareListResult.error
  );

  console.log('🌐 分享功能集成测试完成\n');
}

/**
 * 7. 数据一致性验证
 */
async function testDataConsistency() {
  console.log('🔄 测试数据一致性...');

  // 7.1 验证文档和标签关联
  if (testState.documentId) {
    const docResult = await makeRequest('GET', `/api/v1/documents/${testState.documentId}`);
    if (docResult.success && docResult.data?.data?.tags) {
      const hasAllTags = config.testDocument.tags.every(tagName =>
        docResult.data.data.tags.some(tag => tag.name === tagName)
      );
      
      logTest('documents', '文档标签数据一致性',
        hasAllTags,
        hasAllTags ? '' : '标签关联数据不一致'
      );
    }
  }

  // 7.2 验证搜索索引更新
  const searchResult = await makeRequest('GET', '/api/v1/search?q=' + encodeURIComponent(config.testDocument.title));
  if (searchResult.success) {
    const foundDocument = searchResult.data?.data?.documents?.find(
      doc => doc.id === testState.documentId
    );
    
    logTest('search', '搜索索引数据一致性',
      !!foundDocument,
      foundDocument ? '' : '搜索索引未及时更新'
    );
  }

  console.log('✅ 数据一致性验证完成\n');
}

/**
 * 8. 清理测试数据
 */
async function cleanupTestData() {
  console.log('🧹 清理测试数据...');

  // 8.1 删除分享链接
  if (testState.shareToken) {
    const deleteShareResult = await makeRequest('DELETE', `/api/v1/shared/${testState.shareToken}`);
    console.log(`  ${deleteShareResult.success ? '✅' : '❌'} 删除分享链接`);
  }

  // 8.2 删除文档
  if (testState.documentId) {
    const deleteDocResult = await makeRequest('DELETE', `/api/v1/documents/${testState.documentId}`);
    console.log(`  ${deleteDocResult.success ? '✅' : '❌'} 删除测试文档`);
  }

  // 8.3 删除标签
  for (const tagId of testState.tagIds) {
    const deleteTagResult = await makeRequest('DELETE', `/api/v1/tags/${tagId}`);
    console.log(`  ${deleteTagResult.success ? '✅' : '❌'} 删除测试标签`);
  }

  console.log('🗑️  测试数据清理完成\n');
}

/**
 * 生成集成测试报告
 */
function generateIntegrationReport() {
  console.log('📋 生成集成测试报告...\n');
  
  // 计算总体统计
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.keys(integrationResults).forEach(category => {
    if (category !== 'overall') {
      totalPassed += integrationResults[category].passed;
      totalFailed += integrationResults[category].failed;
    }
  });
  
  integrationResults.overall = {
    passed: totalPassed,
    failed: totalFailed,
    total: totalPassed + totalFailed
  };
  
  // 输出汇总报告
  console.log('📊 集成测试汇总报告:');
  console.log('=' .repeat(50));
  
  Object.keys(integrationResults).forEach(category => {
    if (category !== 'overall') {
      const result = integrationResults[category];
      const total = result.passed + result.failed;
      const successRate = total > 0 ? ((result.passed / total) * 100).toFixed(1) : '0.0';
      
      console.log(`${category.padEnd(15)}: ${result.passed}/${total} (${successRate}%)`);
    }
  });
  
  console.log('-'.repeat(50));
  const overallSuccessRate = integrationResults.overall.total > 0 
    ? ((integrationResults.overall.passed / integrationResults.overall.total) * 100).toFixed(1)
    : '0.0';
    
  console.log(`${'总计'.padEnd(15)}: ${integrationResults.overall.passed}/${integrationResults.overall.total} (${overallSuccessRate}%)`);
  
  // 失败测试详情
  const failedTests = [];
  Object.keys(integrationResults).forEach(category => {
    if (category !== 'overall') {
      integrationResults[category].tests.forEach(test => {
        if (!test.success) {
          failedTests.push({ category, ...test });
        }
      });
    }
  });
  
  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试:');
    failedTests.forEach(test => {
      console.log(`  - [${test.category}] ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (integrationResults.overall.failed === 0) {
    console.log('🎉 所有集成测试通过！系统集成完整性验证成功。');
  } else {
    console.log(`⚠️  发现 ${integrationResults.overall.failed} 个集成问题，需要修复。`);
  }
}

/**
 * 主测试函数
 */
async function runIntegrationTests() {
  console.log('🚀 启动系统集成测试\n');
  console.log('=' .repeat(60));
  
  try {
    await testAuthenticationIntegration();
    await testDocumentManagementIntegration();
    await testTagManagementIntegration();
    await testSearchIntegration();
    await testPermissionIntegration();
    await testSharingIntegration();
    await testDataConsistency();
    await cleanupTestData();
    
    generateIntegrationReport();
    
    // 保存测试结果
    try {
      await fs.mkdir(path.join(__dirname, '../test-results'), { recursive: true });
      await fs.writeFile(
        path.join(__dirname, '../test-results/integration-report.json'),
        JSON.stringify(integrationResults, null, 2)
      );
      console.log('\n📄 集成测试报告已保存至: test-results/integration-report.json');
    } catch (saveError) {
      console.log('\n⚠️  无法保存测试报告:', saveError.message);
    }
    
    // 根据测试结果设置退出码
    process.exit(integrationResults.overall.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ 集成测试过程中发生严重错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runIntegrationTests();
}

module.exports = {
  runIntegrationTests,
  integrationResults
};