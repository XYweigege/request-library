/**
 * 请求库核心层
 * 提供请求接口定义和上层功能实现
 */

// 请求方法类型定义
const METHOD_TYPE = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch'
};

// 存储请求实现的实例
let requestorInstance = null;

// 全局配置对象
let globalConfig = {
  baseURL: '',
  headers: {},
  timeout: 0
};

/**
 * 设置全局请求配置
 * @param {Object} config - 全局配置对象
 * @param {string} config.baseURL - 请求基础URL
 * @param {Object} config.headers - 全局请求头
 * @param {number} config.timeout - 全局超时时间
 */
export function setGlobalConfig(config) {
  globalConfig = {
    ...globalConfig,
    ...config
  };
}

/**
 * 注入请求实现
 * @param {Object} requestor - 请求实现实例
 */
export function inject(requestor) {
  requestorInstance = requestor;
}

/**
 * 应用全局配置到请求配置
 * @param {Object} config - 原始请求配置
 * @returns {Object} 应用全局配置后的请求配置
 */
function applyGlobalConfig(config) {
  // 合并URL
  if (globalConfig.baseURL && config.url) {
    // 确保基础URL以/结尾，请求URL不以/开头
    const baseURL = globalConfig.baseURL.endsWith('/') ? globalConfig.baseURL : `${globalConfig.baseURL}/`;
    const url = config.url.startsWith('/') ? config.url.slice(1) : config.url;
    config.url = `${baseURL}${url}`;
  }
  
  // 合并请求头
  if (globalConfig.headers) {
    config.headers = {
      ...globalConfig.headers,
      ...config.headers
    };
  }
  
  // 合并超时时间
  if (globalConfig.timeout && !config.timeout) {
    config.timeout = globalConfig.timeout;
  }
  
  return config;
}

/**
 * 获取请求实现实例
 * @returns {Object} 请求实现实例
 */
export function useRequestor() {
  if (!requestorInstance) {
    throw new Error('Requestor not injected. Please call inject() first.');
  }
  
  // 创建一个代理对象，自动应用全局配置
  const proxiedRequestor = {
    ...requestorInstance,
    request: async function(config) {
      const updatedConfig = applyGlobalConfig(config);
      return requestorInstance.request.call(requestorInstance, updatedConfig);
    },
    get: async function(url, config = {}) {
      const updatedConfig = applyGlobalConfig({ method: 'get', url, ...config });
      return requestorInstance.get.call(requestorInstance, updatedConfig.url, updatedConfig);
    },
    post: async function(url, data, config = {}) {
      const updatedConfig = applyGlobalConfig({ method: 'post', url, data, ...config });
      return requestorInstance.post.call(requestorInstance, updatedConfig.url, updatedConfig.data, updatedConfig);
    },
    put: async function(url, data, config = {}) {
      const updatedConfig = applyGlobalConfig({ method: 'put', url, data, ...config });
      return requestorInstance.put.call(requestorInstance, updatedConfig.url, updatedConfig.data, updatedConfig);
    },
    delete: async function(url, config = {}) {
      const updatedConfig = applyGlobalConfig({ method: 'delete', url, ...config });
      return requestorInstance.delete.call(requestorInstance, updatedConfig.url, updatedConfig);
    }
  };
  
  return proxiedRequestor;
}

/**
 * 注册事件监听器
 * @param {Object} obj - 要添加事件功能的对象
 */
function addEventSupport(obj) {
  const eventListeners = {};
  
  obj.on = function(eventName, callback) {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(callback);
  };
  
  obj.emit = function(eventName, ...args) {
    if (eventListeners[eventName]) {
      eventListeners[eventName].forEach(callback => {
        callback(...args);
      });
    }
  };
}

/**
 * 创建可重试的请求
 * @param {number} maxCount - 最大重试次数，默认5次
 * @returns {Object} 带重试功能的请求实例
 */
export function createRetryRequestor(maxCount = 5) {
  // 返回一个代理对象，在实际请求时才获取请求器
  return {
    get: (url, config) => makeRequest({ method: 'get', url, ...config }),
    post: (url, data, config) => makeRequest({ method: 'post', url, data, ...config }),
    put: (url, data, config) => makeRequest({ method: 'put', url, data, ...config }),
    delete: (url, config) => makeRequest({ method: 'delete', url, ...config }),
    request: makeRequest
  };
  
  async function makeRequest(config) {
    const req = useRequestor();
    const originalRequest = req.request;
    
    let count = 0;
    
    while (count < maxCount) {
      try {
        return await originalRequest.call(req, config);
      } catch (error) {
        count++;
        if (count >= maxCount) {
          throw error;
        }
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * count));
      }
    }
  }
}

/**
 * 创建并发控制的请求
 * @param {number} maxParallelCount - 最大并发数，默认4个
 * @returns {Object} 带并发控制的请求实例
 */
export function createParallelRequestor(maxParallelCount = 4) {
  const queue = [];
  let runningCount = 0;
  
  // 返回一个代理对象，在实际请求时才获取请求器
  return {
    get: (url, config) => makeRequest({ method: 'get', url, ...config }),
    post: (url, data, config) => makeRequest({ method: 'post', url, data, ...config }),
    put: (url, data, config) => makeRequest({ method: 'put', url, data, ...config }),
    delete: (url, config) => makeRequest({ method: 'delete', url, ...config }),
    request: makeRequest
  };
  
  function makeRequest(config) {
    return new Promise((resolve, reject) => {
      queue.push({ config, resolve, reject });
      processQueue();
    });
  }
  
  // 处理队列
  function processQueue() {
    if (queue.length === 0 || runningCount >= maxParallelCount) {
      return;
    }
    
    runningCount++;
    const { config, resolve, reject } = queue.shift();
    
    const req = useRequestor();
    const originalRequest = req.request;
    
    originalRequest.call(req, config)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        runningCount--;
        processQueue();
      });
  }
}

/**
 * 内存缓存实现
 */
function createMemoryStore() {
  const store = new Map();
  
  return {
    has: async function(key) {
      return store.has(key);
    },
    set: async function(key, value) {
      store.set(key, value);
    },
    get: async function(key) {
      return store.get(key);
    },
    delete: async function(key) {
      store.delete(key);
    }
  };
}

/**
 * 本地存储缓存实现
 */
function createStorageStore() {
  return {
    has: async function(key) {
      return localStorage.getItem(key) !== null;
    },
    set: async function(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    get: async function(key) {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    delete: async function(key) {
      localStorage.removeItem(key);
    }
  };
}

/**
 * 获取缓存存储实例
 * @param {boolean} isPersist - 是否持久化存储
 * @returns {Object} 缓存存储实例
 */
function useCacheStore(isPersist) {
  if (!isPersist) {
    return createMemoryStore();
  } else {
    // 检查localStorage是否可用
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return createStorageStore();
    } catch (error) {
      console.warn('localStorage is not available, using memory store instead.');
      return createMemoryStore();
    }
  }
}

/**
 * 创建带缓存的请求
 * @param {Object} options - 缓存配置选项
 * @param {Function} options.key - 生成缓存键的函数
 * @param {number} options.duration - 缓存有效期（毫秒）
 * @param {Function} options.isValid - 自定义缓存是否有效
 * @param {boolean} options.persist - 是否持久化缓存
 * @returns {Object} 带缓存功能的请求实例
 */
export function createCacheRequestor(options = {}) {
  // 参数归一化
  const normalizedOptions = {
    key: options.key || ((config) => `${config.method}-${config.url}`),
    duration: options.duration || 1000 * 60 * 5, // 默认5分钟
    isValid: options.isValid || null,
    persist: options.persist || false
  };
  
  // 获取缓存存储
  const store = useCacheStore(normalizedOptions.persist);
  
  // 返回一个代理对象，在实际请求时才获取请求器
  return {
    get: (url, config) => makeRequest({ method: 'get', url, ...config }),
    post: (url, data, config) => makeRequest({ method: 'post', url, data, ...config }),
    put: (url, data, config) => makeRequest({ method: 'put', url, data, ...config }),
    delete: (url, config) => makeRequest({ method: 'delete', url, ...config }),
    request: makeRequest
  };
  
  async function makeRequest(config) {
    const key = normalizedOptions.key(config);
    const hasKey = await store.has(key);
    
    if (hasKey) {
      const cache = await store.get(key);
      const now = Date.now();
      
      // 检查缓存是否有效
      let isValid = true;
      if (normalizedOptions.isValid) {
        isValid = normalizedOptions.isValid(key, config, cache);
      } else {
        isValid = (now - cache.timestamp) < normalizedOptions.duration;
      }
      
      if (isValid) {
        return cache.data;
      }
    }
    
    // 发送请求并缓存结果
    const req = useRequestor();
    const originalRequest = req.request;
    const result = await originalRequest.call(req, config);
    
    await store.set(key, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }
}

/**
 * 创建幂等请求
 * @param {Function} genKey - 生成幂等键的函数
 * @returns {Object} 带幂等功能的请求实例
 */
export function createIdempotentRequest(genKey) {
  return createCacheRequestor({
    key: genKey || ((config) => {
      const { method, url, params, data } = config;
      const keyParts = [method, url];
      
      if (params) {
        keyParts.push(JSON.stringify(params));
      }
      
      if (data) {
        keyParts.push(JSON.stringify(data));
      }
      
      return keyParts.join('-');
    }),
    duration: 1000 * 60 * 60, // 幂等缓存默认1小时
    persist: false
  });
}

// 导出方法类型
export { METHOD_TYPE };
