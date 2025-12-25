/**
 * 请求库使用示例
 * 展示如何使用简化的API发送请求
 */

import initRequest, { setGlobalConfig } from './index.js';

// 示例1：基本使用
console.log('=== 示例1：基本使用 ===');
const request = initRequest({
  baseURL: 'https://api.example.com'
});

// 使用文章模块发送请求
request.article.getArticles(1, 10)
  .then(articles => {
    console.log('获取文章列表成功:', articles);
  })
  .catch(error => {
    console.error('获取文章列表失败:', error.message);
  });

// 示例2：带认证信息的使用
console.log('\n=== 示例2：带认证信息的使用 ===');
const authRequest = initRequest({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer your-auth-token',
    'Content-Type': 'application/json'
  }
});

// 发布新文章
const newArticle = {
  title: '测试文章',
  content: '文章内容'
};

authRequest.article.publishArticle(newArticle)
  .then(result => {
    console.log('发布文章成功:', result);
  })
  .catch(error => {
    console.error('发布文章失败:', error.message);
  });

// 示例3：动态更新全局配置
console.log('\n=== 示例3：动态更新全局配置 ===');
const dynamicRequest = initRequest({
  baseURL: 'https://api.example.com'
});

// 初始请求
console.log('使用初始配置发送请求');
dynamicRequest.article.getArticleDetail('123')
  .then(article => {
    console.log('获取文章详情成功:', article);
  })
  .catch(error => {
    console.error('获取文章详情失败:', error.message);
  });

// 更新全局配置
console.log('更新全局配置');
setGlobalConfig({
  headers: {
    'Authorization': 'Bearer new-auth-token'
  }
});

// 使用更新后的配置发送请求
console.log('使用更新后的配置发送请求');
dynamicRequest.article.getArticleDetail('456')
  .then(article => {
    console.log('获取文章详情成功:', article);
  })
  .catch(error => {
    console.error('获取文章详情失败:', error.message);
  });

// 示例4：错误处理
console.log('\n=== 示例4：错误处理 ===');
const errorRequest = initRequest({
  baseURL: 'https://invalid-api.example.com'
});

// 发送请求并处理错误
errorRequest.article.getArticles(1, 10)
  .then(articles => {
    console.log('获取文章列表成功:', articles);
  })
  .catch(error => {
    console.error('获取文章列表失败，已捕获错误:', error.message);
    console.log('显示友好提示给用户');
  });
