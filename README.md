# 请求库封装 - MVP版本

一个基于分层架构设计的前端请求库，提供请求重试、缓存、幂等、并发控制等功能。

## 架构设计

请求库采用三层架构设计：

1. **request-core**：核心层，定义请求接口和上层功能实现
2. **request-axios-imp**：实现层，基于axios实现请求功能
3. **request-fetch-imp**：实现层，基于原生fetch API实现请求功能
4. **request-bus**：业务层，注入请求实现并提供业务请求方法

## 功能特性

- ✅ 请求重试
- ✅ 请求缓存
- ✅ 请求幂等
- ✅ 请求并发控制
- ✅ 依赖倒置设计
- ✅ 模块化架构

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动测试服务器

```bash
npx http-server -p 3000
```

然后在浏览器中访问 `http://localhost:3000/test.html` 进行测试。

## 使用方法

### 基本使用

```javascript
// 导入请求库
import requestLibrary from 'request-library';

// 使用模块化的业务请求
const { article, user } = requestLibrary;

// 使用文章模块
article.getArticles(1, 10)
  .then(data => console.log('文章列表:', data))
  .catch(error => console.error('请求失败:', error));

// 使用用户模块
user.login({ username: 'admin', password: '123456' })
  .then(data => console.log('登录成功:', data))
  .catch(error => console.error('登录失败:', error));
```

### 按需导入

```javascript
// 只导入需要的模块
import { article } from 'request-library';

// 使用文章模块
article.getArticles(1, 10)
  .then(data => console.log('文章列表:', data))
  .catch(error => console.error('请求失败:', error));
```

### 选择底层实现

```javascript
// 导入工厂函数
import { createRequestLibrary } from 'request-library';

// 创建使用fetch实现的请求库实例
const fetchLibrary = createRequestLibrary({ implementation: 'fetch' });
const { article } = fetchLibrary;

// 使用fetch实现发送请求
article.getArticles(1, 10)
  .then(data => console.log('文章列表:', data))
  .catch(error => console.error('请求失败:', error));

// 创建使用axios实现的请求库实例
const axiosLibrary = createRequestLibrary({ implementation: 'axios' });
const { user } = axiosLibrary;

// 使用axios实现发送请求
user.login({ username: 'admin', password: '123456' })
  .then(data => console.log('登录成功:', data))
  .catch(error => console.error('登录失败:', error));
```

### 配置重试功能

```javascript
// 创建带重试配置的请求库实例
const retryLibrary = createRequestLibrary({
  implementation: 'axios',
  retry: {
    maxAttempts: 3, // 最大重试次数
    delay: 1000     // 重试延迟时间（毫秒）
  }
});

// 使用带重试功能的请求方法
retryLibrary.getArticlesWithRetry({ page: 1, size: 10 })
  .then(data => console.log('文章列表:', data))
  .catch(error => console.error('请求失败:', error));
```

## 扩展业务模块

### 创建新的业务模块

1. 在`request-bus/modules/`目录下创建新的模块目录，例如`order`

2. 创建模块入口文件`request-bus/modules/order/index.js`，包含相关的业务请求：

```javascript
/**
 * 订单模块请求方法
 * 集中管理与订单相关的所有API请求
 */
import { useRequestor } from '../../../request-core/index.js';

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 订单列表数据
 */
export const getOrders = async (params = {}) => {
  try {
    const req = useRequestor();
    const response = await req.get('/api/orders', { params });
    return response.data;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    throw error;
  }
};

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise} 创建结果
 */
export const createOrder = async (orderData) => {
  try {
    const req = useRequestor();
    const response = await req.post('/api/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('创建订单失败:', error);
    throw error;
  }
};

export default {
  getOrders,
  createOrder
};
```

3. 在`request-bus/index.js`中导出新模块：

```javascript
// 按需导出各个业务模块
export * as article from './modules/article/index.js';
export * as user from './modules/user/index.js';
export * as order from './modules/order/index.js'; // 新增订单模块
```

4. 现在可以在应用中使用新模块了：

```javascript
import { order } from 'request-library';

order.getOrders({ page: 1, size: 10 })
  .then(data => console.log('订单列表:', data))
  .catch(error => console.error('请求失败:', error));
```

## 业务模块的优势

1. **更好的代码组织**：业务请求按领域划分，提高了代码的可维护性
2. **按需导入**：用户可以只导入需要的模块，减少打包体积
3. **更容易扩展**：添加新的业务模块变得简单，只需要在`modules`目录下创建新的模块目录和文件
4. **更好的封装**：每个模块内部的实现细节对外隐藏，只暴露必要的接口
5. **统一的请求实现**：所有模块共享同一个请求实现，可以方便地切换底层HTTP客户端

## 发布npm包

### 步骤1：登录npm账号

```bash
npm login
```

### 步骤2：更新版本号

在发布新版本之前，需要更新`package.json`中的版本号：

```javascript
{
  "version": "1.0.1" // 更新版本号
}
```

### 步骤3：构建项目

```bash
npm run build
```

### 步骤4：发布包

```bash
npm publish
```

### 注意事项

1. 确保包名在npm上是唯一的
2. 更新版本号时要遵循语义化版本规范
3. 发布前要测试确保所有功能正常
4. 可以使用`npm publish --dry-run`进行模拟发布，检查发布内容

## 使用示例

### 基本请求

```javascript
import { useRequestor } from './request-core/index.js';

const req = useRequestor();

// GET请求
req.get('/api/users', {
  params: { page: 1, size: 10 }
}).then(response => {
  console.log(response.data);
});

// POST请求
req.post('/api/users', {
  name: 'test',
  email: 'test@example.com'
}).then(response => {
  console.log(response.data);
});
```

### 重试请求

```javascript
import { createRetryRequestor } from './request-core/index.js';

const req = createRetryRequestor(3); // 最多重试3次

req.get('/api/data').then(response => {
  console.log(response.data);
}).catch(error => {
  console.error('请求失败:', error);
});
```

### 缓存请求

```javascript
import { createCacheRequestor } from './request-core/index.js';

const req = createCacheRequestor({
  duration: 1000 * 60 * 10, // 缓存10分钟
  key: (config) => `${config.method}-${config.url}-${JSON.stringify(config.params)}`
});

// 第一次请求会发送网络请求并缓存结果
req.get('/api/articles', {
  params: { page: 1 }
}).then(response => {
  console.log(response.data);
});

// 第二次请求会直接使用缓存
req.get('/api/articles', {
  params: { page: 1 }
}).then(response => {
  console.log(response.data);
});
```

### 幂等请求

```javascript
import { createIdempotentRequest } from './request-core/index.js';

const req = createIdempotentRequest();

// 多次调用同一请求只会发送一次网络请求
req.post('/api/pay', {
  orderId: '123456',
  amount: 100
}).then(response => {
  console.log(response.data);
});

req.post('/api/pay', {
  orderId: '123456',
  amount: 100
}).then(response => {
  console.log(response.data); // 使用第一次请求的结果
});
```

### 并发控制

```javascript
import { createParallelRequestor } from './request-core/index.js';

const req = createParallelRequestor(4); // 最多同时执行4个请求

// 同时发送10个请求，最多4个并发执行
const requests = Array.from({ length: 10 }, (_, i) => 
  req.get(`/api/data/${i}`)
);

Promise.all(requests).then(responses => {
  console.log('所有请求完成:', responses);
});
```

## 业务层使用

```javascript
import { getArticles, publishArticle } from './request-bus/index.js';

// 获取文章列表（带缓存）
getArticles(1, 10).then(articles => {
  console.log('文章列表:', articles);
});

// 发布文章（带幂等）
publishArticle({
  title: '新文章',
  content: '文章内容'
}).then(result => {
  console.log('发布结果:', result);
});
```

## 架构优势

1. **依赖倒置**：核心层不依赖具体实现，实现层可以轻松替换
2. **功能组合**：不同功能可以组合使用，如重试+缓存+幂等
3. **模块化设计**：各层职责清晰，易于维护和扩展
4. **业务聚焦**：业务层专注于业务逻辑，不需要关心底层实现

## 扩展说明

### 切换请求实现

请求库支持两种请求实现：Axios和Fetch API。可以通过以下方式切换：

1. **在配置文件中切换**（全局切换）：

```javascript
// request-bus/config.js
export const REQUEST_IMPLEMENTATION = 'fetch'; // 切换为fetch实现
// 或 'axios' 切换为axios实现
```

2. **在运行时切换**（动态切换）：

```javascript
import { inject } from './request-core/index.js';
import { requestor as axiosRequestor } from './request-axios-imp/index.js';
import { requestor as fetchRequestor } from './request-fetch-imp/index.js';

// 切换为axios实现
inject(axiosRequestor);

// 切换为fetch实现
inject(fetchRequestor);
```

3. **在测试页面中切换**：

访问 `http://localhost:3000/test.html`，在页面中可以通过单选按钮切换请求实现。

### 添加新功能

可以在 `request-core` 中添加新的请求功能，如：

- 请求日志
- 请求拦截
- 响应转换
- 错误统一处理

## 项目结构

```
.
├── request-core/          # 核心层
│   └── index.js
├── request-axios-imp/     # axios实现层
│   └── index.js
├── request-bus/           # 业务层
│   └── index.js
├── test.html              # 测试文件
├── package.json
└── README.md
```

## 许可证

MIT
