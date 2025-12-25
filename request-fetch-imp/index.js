/**
 * 基于Fetch API的请求实现
 */

/**
 * 请求实现实例
 */
export const requestor = {
  /**
   * 通用请求方法
   * @param {Object} config - 请求配置
   * @returns {Promise} 请求结果
   */
  request: async function(config) {
    const {
      url,
      method = 'get',
      headers = {},
      params = {},
      data = null,
      timeout = 10000
    } = config;

    // 构建完整URL，包含查询参数
    let fullUrl = url;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    // 构建fetch请求选项
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'same-origin' // 保持同源凭证
    };

    // 添加请求体
    if (data && (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD')) {
      fetchOptions.body = JSON.stringify(data);
    }

    // 处理超时
    const controller = new AbortController();
    const signal = controller.signal;
    fetchOptions.signal = signal;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 模拟axios的响应结构
      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: config,
        request: response
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
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
