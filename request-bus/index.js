/**
 * 请求业务总线层
 * 负责注入请求实现并提供模块化的业务请求方法
 */
import { inject } from '../request-core/index.js';
import { requestor } from './config.js';

// 注入请求实现
inject(requestor);

// 按需导出各个业务模块
export * as article from './modules/article/index.js';
export * as user from './modules/user/index.js';

// 导出核心功能
export { inject } from '../request-core/index.js';

// 如果需要保持向后兼容，可以选择导出常用方法（可选）
// import * as articleApi from './modules/article/index.js';
// export const { getArticles, publishArticle, getArticleDetail, updateArticle, deleteArticle } = articleApi;
