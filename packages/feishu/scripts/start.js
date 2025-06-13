#!/usr/bin/env node

/**
 * 飞书文档分析系统业务流程图:
 * ```mermaid
 * flowchart TD
 *     A[用户输入] --> B{输入类型}
 *     B -->|文档URL| C[获取飞书文档内容]
 *     B -->|Wiki URL| D[获取飞书Wiki内容]
 *
 *     C --> E[知识库处理]
 *     D --> E
 *
 *     E --> F{知识库类型}
 *     F -->|本地知识库| G[读取本地文件]
 *     F -->|远程知识库| H[调用远程API]
 *
 *     G --> I[需求分析]
 *     H --> I
 *
 *     I --> J[项目规范配置]
 *     J --> K{项目类型}
 *     K -->|前端| L[前端框架配置]
 *     K -->|后端| M[后端框架配置]
 *     K -->|全栈| N[全栈配置]
 *
 *     L --> O[代码生成]
 *     M --> O
 *     N --> O
 *
 *     O --> P{输出方式}
 *     P -->|返回内容| Q[返回代码内容]
 *     P -->|写入文件| R[写入文件系统]
 *
 *     R --> S[完成]
 *     Q --> S
 * ```
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { start } from '@modelcontextprotocol/inspector';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

// Server configuration object
const serverConfig = {
  feishuAppId: process.env.FEISHU_APP_ID,
  feishuAppSecret: process.env.FEISHU_APP_SECRET,
  port: parseInt(process.env.PORT || '3000', 10),
  debug: process.env.DEBUG === 'true',
};

// Start the server
try {
  console.log('Starting Feishu MCP server...');
  console.log(`Port: ${serverConfig.port}`);
  console.log(`Debug mode: ${serverConfig.debug ? 'enabled' : 'disabled'}`);

  start(serverConfig);

  console.log('Server started successfully!');
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
