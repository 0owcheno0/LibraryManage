import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '请输入有效的邮箱地址',
    'any.required': '邮箱是必填字段',
  }),
  username: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.min': '用户名至少需要3个字符',
      'string.max': '用户名不能超过20个字符',
      'string.pattern.base': '用户名只能包含字母、数字和下划线',
      'any.required': '用户名是必填字段',
    }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': '密码至少需要6个字符',
    'string.max': '密码不能超过100个字符',
    'any.required': '密码是必填字段',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '请输入有效的邮箱地址',
    'any.required': '邮箱是必填字段',
  }),
  password: Joi.string().required().messages({
    'any.required': '密码是必填字段',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': '刷新令牌是必填字段',
  }),
});
