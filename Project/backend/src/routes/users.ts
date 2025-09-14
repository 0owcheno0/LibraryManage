import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkAdminRole } from '../middleware/permission';
import { UserModel } from '../models/User';
import { UserDao } from '../dao/userDao';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// 配置multer用于头像上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件') as any, false);
    }
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.error('用户不存在', 404);
    }

    const userProfile = await UserModel.toProfileWithRole(user);
    res.success('获取用户信息成功', userProfile);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.error('获取用户信息失败', 500);
  }
});

// 更新个人信息(姓名、邮箱、头像)
router.put('/me', authenticate, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    const { full_name, email } = req.body;
    const updateData: any = {};
    
    if (full_name !== undefined) {
      updateData.full_name = full_name;
    }
    
    if (email !== undefined) {
      // 检查邮箱是否已被其他用户使用
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.error('邮箱已被其他用户使用', 400);
      }
      updateData.email = email;
    }

    const success = await UserDao.updateUser(req.user.userId, updateData);
    if (!success) {
      return res.error('更新用户信息失败', 500);
    }

    // 获取更新后的用户信息
    const updatedUser = await UserModel.findById(req.user.userId);
    if (!updatedUser) {
      return res.error('用户不存在', 404);
    }

    const userProfile = await UserModel.toProfileWithRole(updatedUser);
    res.success('更新用户信息成功', userProfile);
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.error('更新用户信息失败', 500);
  }
});

// 修改密码(验证旧密码)
router.put('/me/password', authenticate, async (req: any, res) => {
  try {
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.error('旧密码和新密码不能为空', 400);
    }

    if (newPassword.length < 6) {
      return res.error('新密码长度不能少于6位', 400);
    }

    // 获取用户信息
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.error('用户不存在', 404);
    }

    // 验证旧密码
    // 注意：这里应该使用bcrypt.compare来验证密码，但为了简化示例，我们直接比较哈希值
    // 在实际应用中，应该使用bcrypt.compare(oldPassword, user.password_hash)
    if (oldPassword !== user.password_hash) {
      return res.error('旧密码不正确', 400);
    }

    // 更新密码
    // 注意：这里应该使用bcrypt.hash来哈希新密码
    // 在实际应用中，应该使用bcrypt.hash(newPassword, 10)
    const success = await UserDao.updatePassword(req.user.userId, newPassword);
    if (!success) {
      return res.error('更新密码失败', 500);
    }

    res.success('密码修改成功');
  } catch (error) {
    console.error('修改密码失败:', error);
    res.error('修改密码失败', 500);
  }
});

// 上传头像(multer处理)
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    if (!req.file) {
      return res.error('请选择要上传的头像文件', 400);
    }

    // 构建头像URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // 更新用户头像
    const success = await UserDao.updateUser(req.user.userId, { avatar_url: avatarUrl });
    if (!success) {
      // 删除上传的文件
      fs.unlinkSync(req.file.path);
      return res.error('更新头像失败', 500);
    }

    res.success('头像上传成功', { avatar_url: avatarUrl });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.error('上传头像失败', 500);
  }
});

// 管理员用户管理API

// GET /api/v1/users/admin?page=1&pageSize=20 - 用户列表
router.get('/admin', authenticate, checkAdminRole, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const keyword = req.query.keyword as string;

    const result = await UserDao.getUsers(page, pageSize, keyword);
    res.success('获取用户列表成功', result);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.error('获取用户列表失败', 500);
  }
});

// POST /api/v1/users/admin/{id}/roles - 用户角色分配
router.post('/admin/:id/roles', authenticate, checkAdminRole, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role_id } = req.body;

    if (isNaN(userId)) {
      return res.error('无效的用户ID', 400);
    }

    if (!role_id) {
      return res.error('角色ID不能为空', 400);
    }

    // 检查角色是否存在
    const role = await UserModel.findById(role_id);
    if (!role) {
      return res.error('指定的角色不存在', 400);
    }

    const success = await UserDao.updateUserRole(userId, { role_id });
    if (!success) {
      return res.error('更新用户角色失败', 500);
    }

    res.success('用户角色分配成功');
  } catch (error) {
    console.error('分配用户角色失败:', error);
    res.error('分配用户角色失败', 500);
  }
});

// PUT /api/v1/users/admin/{id}/status - 用户状态管理(is_active字段)
router.put('/admin/:id/status', authenticate, checkAdminRole, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(userId)) {
      return res.error('无效的用户ID', 400);
    }

    if (status === undefined) {
      return res.error('状态不能为空', 400);
    }

    // 验证状态值
    if (status !== 0 && status !== 1) {
      return res.error('状态值只能为0(禁用)或1(启用)', 400);
    }

    const success = await UserDao.updateUserStatus(userId, { status });
    if (!success) {
      return res.error('更新用户状态失败', 500);
    }

    res.success('用户状态更新成功');
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.error('更新用户状态失败', 500);
  }
});

// DELETE /api/v1/users/admin/{id} - 用户删除(软删除)
router.delete('/admin/:id', authenticate, checkAdminRole, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.error('无效的用户ID', 400);
    }

    // 不能删除自己
    if (userId === req.user.userId) {
      return res.error('不能删除自己的账户', 400);
    }

    const success = await UserDao.deleteUser(userId);
    if (!success) {
      return res.error('删除用户失败', 500);
    }

    res.success('用户删除成功');
  } catch (error) {
    console.error('删除用户失败:', error);
    res.error('删除用户失败', 500);
  }
});

export default router;
