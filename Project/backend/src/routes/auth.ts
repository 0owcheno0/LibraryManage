import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel, CreateUserData, LoginCredentials } from '../models/User';
import { jwtUtils } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth';

const router = Router();

// 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '验证失败',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { email, username, password } = value as CreateUserData;

    if (await UserModel.emailExists(email)) {
      res.status(409).json({
        code: 409,
        message: '该邮箱已被注册',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (await UserModel.usernameExists(username)) {
      res.status(409).json({
        code: 409,
        message: '该用户名已被注册',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email,
      username,
      password: hashedPassword
    });

    const tokens = jwtUtils.generateTokens({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        user: UserModel.toProfile(user),
        ...tokens
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败，请稍后重试',
      timestamp: new Date().toISOString()
    });
  }
});

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '验证失败',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { email, password } = value as LoginCredentials;
    const user = await UserModel.findByEmail(email);

    if (!user) {
      res.status(401).json({
        code: 401,
        message: '邮箱或密码错误',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        code: 401,
        message: '邮箱或密码错误',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const tokens = jwtUtils.generateTokens({
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        user: UserModel.toProfile(user),
        ...tokens
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败，请稍后重试',
      timestamp: new Date().toISOString()
    });
  }
});

// 刷新Token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '验证失败',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { refreshToken } = value;
    const tokens = jwtUtils.refreshTokens(refreshToken);

    res.status(200).json({
      code: 200,
      message: 'Token刷新成功',
      data: tokens,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      code: 401,
      message: '刷新Token无效或已过期',
      timestamp: new Date().toISOString()
    });
  }
});

// 用户登出
router.post('/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    code: 200,
    message: '登出成功',
    timestamp: new Date().toISOString()
  });
});

// 获取用户信息
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        code: 401,
        message: '未认证用户',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        code: 404,
        message: '用户不存在',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: '获取用户信息成功',
      data: UserModel.toProfile(user),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;