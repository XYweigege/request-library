/**
 * 基于axios的请求实现
 */

import axios from 'axios';

// 创建axios实例
const axiosInstance = axios.create({
  timeout: 10000, // 默认超时时间10秒
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求实现实例
 */
export const requestor = {
  /**
   * 通用请求方法
   * @param {Object} config - 请求配置
   * @returns {Promise} 请求结果
   */
  request: function(config) {
    return axiosInstance(config);
  },
  
  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  get: function(url, options = {}) {
    return this.request({
      method: 'get',
      url,
      ...options
    });
  },
  
  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  post: function(url, data = {}, options = {}) {
    return this.request({
      method: 'post',
      url,
      data,
      ...options
    });
  },
  
  /**
   * PUT请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  put: function(url, data = {}, options = {}) {
    return this.request({
      method: 'put',
      url,
      data,
      ...options
    });
  },
  
  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  delete: function(url, options = {}) {
    return this.request({
      method: 'delete',
      url,
      ...options
    });
  },
  
  /**
   * PATCH请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  patch: function(url, data = {}, options = {}) {
    return this.request({
      method: 'patch',
      url,
      data,
      ...options
    });
  }
};
