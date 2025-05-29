// #!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

import packageJson from '../package.json';

// 扩展 dayjs 以支持 UTC 和时区
dayjs.extend(utc);
dayjs.extend(timezone);

// 创建 MCP 服务器实例
const server = new McpServer({
  name: 'mcp-server-time',
  version: packageJson.version,
});
// 获取当前时间的工具
server.tool(
  'get_current_time', // 工具名称
  '获取当前时间', // 工具描述
  {
    // 工具参数
    timezone: z.string().optional(),
  },
  // 工具实现
  async ({ timezone }) => {
    // 获取当前时间
    const tz = timezone || process.env.LOCAL_TIMEZONE || 'Asia/Shanghai';
    // 格式化当前时间
    const currentTime = dayjs().tz(tz).format('YYYY-MM-DD HH:mm:ss');

    // 返回数据 - 下边的格式是固定的
    return {
      content: [{ type: 'text', text: JSON.stringify({ currentTime }, null, 2) }],
    };
  }
);
// 时间转换工具
server.tool(
  'convert_time', // 工具名称
  '在时区之间转换时间', // 工具描述
  {
    // 工具参数
    source_timezone: z.string(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format, expected HH:MM'),
    target_timezone: z.string(),
  },
  // 工具实现
  async ({ source_timezone, time, target_timezone }) => {
    const sourceTime = dayjs.tz(`${dayjs().format('YYYY-MM-DD')} ${time}`, source_timezone);
    const convertedTime = sourceTime.clone().tz(target_timezone).format();
    return {
      content: [{ type: 'text', text: JSON.stringify({ convertedTime }, null, 2) }],
    };
  }
);
// 启动服务器
async function runServer() {
  // 这两行代码应该算是固定写法
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('获取当前时间和时区转换的 MCP 服务器已在 stdio 上启动');
}

runServer().catch(error => {
  console.error('启动服务器时出错:', error);
  process.exit(1);
});
