export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

const users: User[] = [];

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const user = users.find(u => u.email === email);
    return user || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const user = users.find(u => u.username === username);
    return user || null;
  }

  static async findById(id: string): Promise<User | null> {
    const user = users.find(u => u.id === id);
    return user || null;
  }

  static async create(userData: CreateUserData): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  }

  static async emailExists(email: string): Promise<boolean> {
    return users.some(u => u.email === email);
  }

  static async usernameExists(username: string): Promise<boolean> {
    return users.some(u => u.username === username);
  }

  static toProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
