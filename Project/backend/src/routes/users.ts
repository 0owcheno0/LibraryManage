import { Router } from 'express';

const router = Router();

// 获取当前用户信息
router.get('/me', (req, res) => {
  // TODO: 实现获取当前用户信息逻辑
  res.success('获取用户信息接口', { message: '待实现' });
});

// 更新用户信息
router.put('/me', (req, res) => {
  // TODO: 实现更新用户信息逻辑
  res.success('更新用户信息接口', { message: '待实现' });
});

// 修改密码
router.put('/me/password', (req, res) => {
  // TODO: 实现修改密码逻辑
  res.success('修改密码接口', { message: '待实现' });
});

// 上传头像
router.post('/me/avatar', (req, res) => {
  // TODO: 实现头像上传逻辑
  res.success('头像上传接口', { message: '待实现' });
});

export default router;
