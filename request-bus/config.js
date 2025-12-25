/**
 * 请求配置文件
 * 用于切换不同的请求实现
 */

// 配置当前使用的请求实现
// 可选值: 'axios' 或 'fetch'
export const REQUEST_IMPLEMENTATION = 'fetch';

// 导出请求实现
// 使用静态导入避免动态导入的问题
export { requestor } from '../request-fetch-imp/index.js';

// 如果需要使用axios实现，可以直接替换上面的导入
// export { requestor } from '../request-axios-imp/index.js';
