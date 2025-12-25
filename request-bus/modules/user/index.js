/**
 * 用户模块请求方法
 * 集中管理与用户相关的所有API请求
 */
import { useRequestor } from '../../../request-core/index.js';

/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @returns {Promise} 用户信息数据
 */
export const getUserInfo = async (userId) => {
  try {
    const req = useRequestor();
    const response = await req.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

/**
 * 登录
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码
 * @returns {Promise} 登录结果
 */
export const login = async (credentials) => {
  try {
    const req = useRequestor();
    const response = await req.post('/api/login', credentials);
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 注册
 * @param {Object} userData - 用户注册数据
 * @returns {Promise} 注册结果
 */
export const register = async (userData) => {
  try {
    const req = useRequestor();
    const response = await req.post('/api/register', userData);
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 更新用户信息
 * @param {string} userId - 用户ID
 * @param {Object} userData - 用户信息
 * @returns {Promise} 更新结果
 */
export const updateUserInfo = async (userId, userData) => {
  try {
    const req = useRequestor();
    const response = await req.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
};

// 导出用户模块所有方法
export default {
  getUserInfo,
  login,
  register,
  updateUserInfo
};
