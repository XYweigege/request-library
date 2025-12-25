# 请求库使用文档

## 概述

本请求库采用三层设计架构，提供了统一、高效、可扩展的HTTP请求解决方案：

1. **核心层**：提供基础功能和API定义，包括全局配置、重试、缓存、并发控制等
2. **实现层**：提供具体的请求实现（目前支持fetch）
3. **业务层**：基于核心层和实现层，提供模块化的业务请求方法

## 快速开始

### 1. 初始化请求库

用户只需要调用一个方法即可初始化并配置请求库：

```javascript
// 导入初始化方法
import initRequest from './index.js';

// 初始化请求库并配置全局参数
const request = initRequest({
  baseURL: 'https://api.example.com',  // API基础URL
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'  // 认证Token
  },
  timeout: 10000  // 超时时间10秒
});
```

### 2. 发送请求

初始化后，即可使用返回的请求库实例发送各种业务请求：

```javascript
// 发送GET请求获取文章列表
// 实际请求URL: https://api.example.com/api/articles?page=1&size=10
const articles = await request.article.getArticles(1, 10);
console.log(articles);

// 发送POST请求发布文章
const newArticle = {
  title: '新文章',
  content: '文章内容'
};
// 实际请求URL: https://api.example.com/api/articles
const result = await request.article.publishArticle(newArticle);
console.log(result);
```

### 3. 动态更新全局配置

如果需要在初始化后更新全局配置，可以使用单独导出的 `setGlobalConfig` 函数：

```javascript
import initRequest, { setGlobalConfig } from './index.js';

// 初始化请求库
const request = initRequest({
  baseURL: 'https://api.example.com'
});

// 后续动态更新配置
setGlobalConfig({
  headers: {
    'Authorization': 'Bearer new-token'  // 更新认证Token
  }
});

// 新的请求会使用更新后的配置
const articles = await request.article.getArticles(1, 10);
```

## 功能特性

请求库内置了多种高级功能，这些功能已在业务模块方法内部实现，用户无需额外配置即可享受：

### 1. 重试机制

部分业务方法（如获取文章详情）内置了重试功能，提高请求成功率：

```javascript
import initRequest from './index.js';

const request = initRequest({ baseURL: 'https://api.example.com' });

// getArticleDetail方法内部已集成重试功能（最多3次）
// 请求失败时会自动重试，无需用户处理
const article = await request.article.getArticleDetail('123');
```

### 2. 缓存功能

查询类业务方法（如获取文章列表）内置了缓存功能，避免重复请求：

```javascript
import initRequest from './index.js';

const request = initRequest({ baseURL: 'https://api.example.com' });

// getArticles方法内部已集成缓存功能（30分钟）
// 第一次请求会缓存结果，后续请求直接返回缓存数据
const articles1 = await request.article.getArticles(1, 10);
const articles2 = await request.article.getArticles(1, 10);  // 直接返回缓存数据
```

### 3. 幂等请求

提交类业务方法（如发布文章）内置了幂等功能，确保不会重复提交：

```javascript
import initRequest from './index.js';

const request = initRequest({ baseURL: 'https://api.example.com' });

// publishArticle方法内部已集成幂等功能
// 确保相同内容的请求不会被重复提交
const newArticle = {
  title: '新文章',
  content: '文章内容'
};

// 多次调用相同的请求只会实际发送一次
const result1 = await request.article.publishArticle(newArticle);
const result2 = await request.article.publishArticle(newArticle);  // 使用幂等缓存
```

## 业务模块

### 文章模块 (article)

#### 方法列表

1. **getArticles(page, size)**
   - 描述：获取文章列表
   - 参数：
     - page: 页码（默认1）
     - size: 每页数量（默认10）
   - 返回值：文章列表数据
   - 特性：使用缓存功能（30分钟）

2. **publishArticle(article)**
   - 描述：发布文章
   - 参数：
     - article: 文章数据对象
   - 返回值：发布结果
   - 特性：使用幂等功能

3. **getArticleDetail(id)**
   - 描述：获取文章详情
   - 参数：
     - id: 文章ID
   - 返回值：文章详情数据
   - 特性：使用重试功能（最多3次）

4. **updateArticle(id, article)**
   - 描述：更新文章
   - 参数：
     - id: 文章ID
     - article: 文章数据对象
   - 返回值：更新结果

5. **deleteArticle(id)**
   - 描述：删除文章
   - 参数：
     - id: 文章ID
   - 返回值：删除结果

### 用户模块 (user)

（待实现）

## 最佳实践

### 1. 在应用入口统一初始化

建议在应用入口文件中统一初始化请求库：

```javascript
// app.js
import initRequest from './index.js';

// 初始化请求库并配置全局参数
const request = initRequest({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// 将请求库实例挂载到全局对象，方便在其他模块使用
window.request = request;

// 或者使用模块导出方式供其他模块导入
// export default request;

// 应用启动逻辑
// ...
```

### 2. 模块化使用

在业务组件中直接使用初始化好的请求库实例：

```javascript
// ArticleList.js
// 假设已经在入口文件初始化并挂载到全局
const { article } = window.request;

async function loadArticles() {
  try {
    const articles = await article.getArticles(1, 10);
    renderArticles(articles);
  } catch (error) {
    console.error('加载文章失败:', error);
    showErrorMessage('加载失败，请稍后重试');
  }
}
```

### 3. 动态更新认证信息

当用户登录或登出时，动态更新全局请求头中的认证信息：

```javascript
import { setGlobalConfig } from './index.js';

// 用户登录成功后更新认证Token
function handleLoginSuccess(token) {
  setGlobalConfig({
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

// 用户登出后清除认证Token
function handleLogout() {
  setGlobalConfig({
    headers: {
      'Authorization': ''
    }
  });
}

### 3. 错误处理

```javascript
import { article } from './index.js';

try {
  const articles = await article.getArticles(1, 10);
  console.log(articles);
} catch (error) {
  console.error('获取文章列表失败:', error);
  // 处理错误，如显示错误提示、重试等
  showErrorMessage('获取文章列表失败，请稍后重试');
}
```

## API参考

### 1. `initRequest(config)`

初始化请求库（用户唯一需要调用的核心方法）

**参数：**
- `config`: 全局配置对象
  - `baseURL`: API基础URL
  - `headers`: 全局请求头
  - `timeout`: 全局超时时间（毫秒）

**返回值：**
配置好的请求库实例，包含所有业务模块：
- `article`: 文章模块，提供与文章相关的API请求方法
- `user`: 用户模块，提供与用户相关的API请求方法

### 2. `setGlobalConfig(config)`

动态更新全局请求配置（可选使用）

**参数：**
- `config`: 全局配置对象（同`initRequest`的config参数）

**返回值：**
无

## 浏览器兼容性

本请求库使用了现代JavaScript特性（如ES6模块、async/await、fetch），需要在支持这些特性的现代浏览器中使用：

- Chrome 61+
- Firefox 60+
- Safari 11.1+
- Edge 79+

## 开发说明

### 添加新的业务模块

1. 在`request-bus/modules/`目录下创建新的模块文件夹
2. 在模块文件夹中创建`index.js`文件，定义该模块的请求方法
3. 在`request-bus/index.js`中导出新模块

### 自定义请求实现

（待实现）

## 常见问题

### 1. 如何处理跨域请求？

请求库默认使用fetch实现，跨域请求需要服务器端配置CORS头。如果需要更灵活的跨域处理，可以考虑使用代理或配置fetch的credentials选项。

### 2. 如何取消请求？

目前版本暂不支持请求取消功能，后续版本将添加此功能。

### 3. 如何添加自定义拦截器？

目前版本暂不支持拦截器功能，后续版本将添加此功能。

## 版本历史

### v1.0.0
- 初始版本
- 支持fetch请求实现
- 支持全局配置
- 支持重试、缓存、并发控制、幂等请求
- 提供文章模块API

---

**注意：** 本请求库目前为本地项目文件，暂未发布为npm包。