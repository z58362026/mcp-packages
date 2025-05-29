#!/usr/bin/env node
// 导入必要的依赖包
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

import packageJson from '../package.json';

// 验证环境变量是否存在
if (!process.env.GITHUB_TOKEN) {
  console.error('错误: 未设置 GITHUB_TOKEN 环境变量');
  console.error('请设置 GITHUB_TOKEN 环境变量，该 token 需要具有 repo 和 read:user 权限');
  process.exit(1);
}

// 创建 MCP 服务器实例
const server = new Server(
  {
    name: 'github-search-mcp-server',
    version: packageJson.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义 GitHub 搜索工具的输入参数验证模式
const SearchParamsSchema = z.object({
  query: z.string().describe('搜索关键词，用于匹配 GitHub 中的内容'),
  page: z.number().optional().default(1).describe('当前页码，用于分页查询'),
  perPage: z.number().optional().default(30).describe('每页返回的搜索结果数量'),
  type: z
    .enum(['repositories', 'code', 'issues', 'users'])
    .optional()
    .describe('搜索类型，可选值为 repositories、code、issues 或 users'),
});

// 定义获取 GitHub 用户信息的输入参数验证模式
const UserInfoParamsSchema = z.object({
  username: z.string().describe('GitHub 的用户名'),
});

// 设置工具列表请求处理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'github_search',
        description: '在 GitHub 上搜索仓库、代码、Issues 或用户',
        inputSchema: zodToJsonSchema(SearchParamsSchema),
      },
      {
        name: 'get_github_user',
        description: '通过用户名查询 GitHub 用户信息',
        inputSchema: zodToJsonSchema(UserInfoParamsSchema),
      },
    ],
  };
});

// 设置工具调用请求处理器
server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    // 验证请求参数是否存在
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    // 根据工具名称处理不同的请求
    switch (request.params.name) {
      // GitHub 搜索工具处理逻辑
      case 'github_search': {
        // 解析并验证搜索参数
        const { query, page, perPage, type } = SearchParamsSchema.parse(request.params.arguments);

        // 构建 GitHub API 请求 URL
        const url = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
        // 发送请求到 GitHub API
        const res = await fetch(url, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        });

        // 检查响应状态
        if (!res.ok) {
          throw new Error(`GitHub API 错误: ${res.status} ${res.statusText}`);
        }

        // 解析响应数据
        const data = await res.json();

        // 返回格式化的响应
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      // 获取 GitHub 用户信息工具处理逻辑
      case 'get_github_user': {
        // 解析并验证用户参数
        const { username } = UserInfoParamsSchema.parse(request.params.arguments);
        // 构建用户信息 API 请求 URL
        const url = `https://api.github.com/users/${encodeURIComponent(username)}`;
        // 发送请求到 GitHub API
        const res = await fetch(url, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        });

        // 检查响应状态
        if (!res.ok) {
          throw new Error(`获取用户信息失败: ${res.status} ${res.statusText}`);
        }

        // 解析响应数据
        const data = await res.json();

        // 返回格式化的响应
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      // 处理未知工具名称
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    // 处理参数验证错误
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
});

// 启动服务器的异步函数
async function runServer() {
  // 创建标准输入输出传输层
  const transport = new StdioServerTransport();
  // 连接服务器
  await server.connect(transport);
  console.error('GitHub 搜索 MCP 服务器已在 stdio 上启动');
}

// 启动服务器并处理错误
runServer().catch(error => {
  console.error('启动服务器时出错:', error);
  process.exit(1);
});
