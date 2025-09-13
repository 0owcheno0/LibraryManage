import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { App } from 'antd';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  isLoading: false,
  isAuthenticated: authService.isAuthenticated(),
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
  case 'AUTH_START':
    return {
      ...state,
      isLoading: true,
    };
  case 'AUTH_SUCCESS':
    return {
      ...state,
      isLoading: false,
      isAuthenticated: true,
      user: action.payload.user,
      token: action.payload.token,
    };
  case 'AUTH_FAILURE':
    return {
      ...state,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
    };
  case 'LOGOUT':
    return {
      ...state,
      isAuthenticated: false,
      user: null,
      token: null,
    };
  case 'UPDATE_USER':
    return {
      ...state,
      user: action.payload,
    };
  default:
    return state;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { message } = App.useApp();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = authService.getStoredUser();

      // 如果没有token，直接结束初始化
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE' });
        return;
      }

      if (storedUser) {
        try {
          // 如果有存储的用户信息，尝试验证token
          const user = await authService.getUserInfo();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token无效，清除存储的信息
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } else {
        try {
          // 没有存储的用户信息，但有token，尝试获取用户信息
          const user = await authService.getUserInfo();
          localStorage.setItem('user', JSON.stringify(user));
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          console.error('Get user info failed:', error);
          // Token无效，清除存储的token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch({ type: 'AUTH_FAILURE' });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login(credentials);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: accessToken },
      });

      message.success(response.message || '登录成功');
      return true;
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      const errorMessage = error.response?.data?.message || '登录失败';
      message.error(errorMessage);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.register(userData);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: accessToken },
      });

      message.success(response.message || '注册成功');
      return true;
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      const errorMessage = error.response?.data?.message || '注册失败';
      message.error(errorMessage);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      message.info('已退出登录');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
      message.info('已退出登录');
    }
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const refreshUserInfo = async (): Promise<void> => {
    try {
      const user = await authService.getUserInfo();
      updateUser(user);
    } catch (error) {
      console.error('Refresh user info failed:', error);
      dispatch({ type: 'AUTH_FAILURE' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateUser,
        refreshUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
