/**
 * 文章模块请求方法
 * 集中管理与文章相关的所有API请求
 */
import { createCacheRequestor, createRetryRequestor, createIdempotentRequest, useRequestor } from '../../../request-core/index.js';

/**
 * 获取文章列表
 * 使用缓存功能，避免重复请求
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @returns {Promise} 文章列表数据
 */
export const getArticles = async (page = 1, size = 10) => {
  try {
    // 在函数内部创建带缓存功能的请求器
    const req = createCacheRequestor({
      duration: 1000 * 60 * 30, // 缓存30分钟
      key: (config) => `${config.method}-${config.url}-${JSON.stringify(config.params)}`
    });
    
    const response = await req.get('/api/articles', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
};

/**
 * 发布文章
 * 使用幂等功能，确保不会重复提交
 * @param {Object} article - 文章数据
 * @returns {Promise} 发布结果
 */
export const publishArticle = async (article) => {
  try {
    // 在函数内部创建带幂等功能的请求器
    const req = createIdempotentRequest();
    
    const response = await req.post('/api/articles', article);
    return response.data;
  } catch (error) {
    console.error('发布文章失败:', error);
    throw error;
  }
};

/**
 * 获取文章详情
 * 使用重试功能，提高成功率
 * @param {string} id - 文章ID
 * @returns {Promise} 文章详情数据
 */
export const getArticleDetail = async (id) => {
  try {
    // 在函数内部创建带重试功能的请求器
    const req = createRetryRequestor(3); // 最多重试3次
    
    const response = await req.get(`/api/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    throw error;
  }
};

/**
 * 更新文章
 * @param {string} id - 文章ID
 * @param {Object} article - 文章数据
 * @returns {Promise} 更新结果
 */
export const updateArticle = async (id, article) => {
  try {
    // 在实际执行请求时获取请求器
    const req = useRequestor();
    const response = await req.put(`/api/articles/${id}`, article);
    return response.data;
  } catch (error) {
    console.error('更新文章失败:', error);
    throw error;
  }
};

/**
 * 删除文章
 * @param {string} id - 文章ID
 * @returns {Promise} 删除结果
 */
export const deleteArticle = async (id) => {
  try {
    // 在实际执行请求时获取请求器
    const req = useRequestor();
    const response = await req.delete(`/api/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除文章失败:', error);
    throw error;
  }
};

// 导出文章模块所有方法
export default {
  getArticles,
  publishArticle,
  getArticleDetail,
  updateArticle,
  deleteArticle
};
