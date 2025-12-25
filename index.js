/**
 * 请求库主入口文件
 * 提供统一的API接口，支持配置选择底层实现
 */

import { inject, createRetryRequestor, useRequestor, setGlobalConfig } from './request-core/index.js';
import { requestor as fetchRequestor } from './request-fetch-imp/index.js';
import * as businessModules from './request-bus/index.js';

/**
 * 初始化请求库
 * 这是用户唯一需要调用的方法，用于配置请求库
 * @param {Object} config - 配置选项
 * @param {string} config.baseURL - API基础URL
 * @param {Object} config.headers - 全局请求头
 * @param {number} config.timeout - 全局超时时间
 * @returns {Object} 配置好的请求库实例，包含所有业务模块
 */
export function initRequest(config = {}) {
  // 提取全局配置
  const { baseURL, headers, timeout } = config;
  
  // 设置全局配置
  setGlobalConfig({ baseURL, headers, timeout });
  
  // 注入fetch请求实现
  inject(fetchRequestor.requestor);
  
  // 返回包含所有业务模块的请求库实例
  return {
    ...businessModules
  };
}

// 默认导出初始化方法
export default initRequest;

// 导出全局配置函数（可选，用于后续修改配置）
export { setGlobalConfig };
