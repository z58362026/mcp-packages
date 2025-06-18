#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import fs from 'fs/promises';
import path from 'path';

import packageJson from '../package.json';

if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
  console.error('错误: 未设置飞书应用凭证');
  console.error('请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量');
  process.exit(1);
}

const server = new Server(
  {
    name: 'feishu-doc-analysis-mcp-server',
    version: packageJson.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义获取飞书文档内容的输入参数
const DocContentParamsSchema = z.object({
  docToken: z.string().optional().describe('飞书文档的 token'),
  docUrl: z.string().optional().describe('飞书文档的完整 URL'),
});

// 定义获取飞书知识空间文档的输入参数
const WikiSpaceParamsSchema = z.object({
  nodeToken: z.string().optional().describe('知识空间节点的 token'),
  wikiUrl: z.string().optional().describe('飞书知识空间的完整 URL'),
});

// 定义生成代码的输入参数
const GenerateCodeParamsSchema = z.object({
  content: z.string().describe('文档内容'),
  framework: z.string().default('React').describe('使用的框架，如 React、Vue 等'),
  outputPath: z.string().optional().describe('代码输出路径'),
});

// 定义分析文档的输入参数
const AnalyzeDocParamsSchema = z.object({
  docToken: z.string().optional().describe('飞书文档的 token'),
  docUrl: z.string().optional().describe('飞书文档的完整 URL'),
  wikiUrl: z.string().optional().describe('飞书 Wiki 的完整 URL'),
  knowledgeBase: z
    .object({
      type: z
        .enum(['local', 'remote'])
        .default('remote')
        .describe('知识库类型：local（本地）或 remote（远程）'),
      path: z.string().optional().describe('本地知识库路径，当 type 为 local 时必填'),
      url: z.string().optional().describe('远程知识库 URL，当 type 为 remote 时必填'),
      analysisEndpoint: z
        .string()
        .optional()
        .describe('远程知识库分析接口，当 type 为 remote 时可选'),
    })
    .default({
      type: 'remote',
      url: 'https://example.com/knowledge-base.json',
    })
    .describe('知识库配置'),
  projectSpec: z
    .object({
      type: z.enum(['frontend', 'backend', 'fullstack']).default('frontend').describe('项目类型'),
      framework: z.string().default('Vue').describe('使用的框架，如 React、Vue、Express 等'),
      structure: z
        .object({
          src: z.string().optional().describe('源代码目录结构'),
          test: z.string().optional().describe('测试目录结构'),
          docs: z.string().optional().describe('文档目录结构'),
        })
        .default({
          src: 'src',
          test: 'test',
          docs: 'docs',
        })
        .optional()
        .describe('项目目录结构配置'),
      conventions: z
        .array(z.string())
        .default(['使用 TypeScript', '使用函数组件和 Hooks', '使用 ESLint 和 Prettier'])
        .optional()
        .describe('项目规范，如命名规范、代码风格等'),
    })
    .default({
      type: 'frontend',
      framework: 'React',
      structure: {
        src: 'src',
        test: 'test',
        docs: 'docs',
      },
      conventions: ['使用 TypeScript', '使用函数组件和 Hooks', '使用 ESLint 和 Prettier'],
    })
    .describe('项目规范配置'),
  outputPath: z.string().optional().describe('代码输出路径，不指定则返回代码内容'),
});

// 定义工具列表及输入参数
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_feishu_doc',
        description: '获取飞书文档内容',
        inputSchema: zodToJsonSchema(DocContentParamsSchema),
      },
      {
        name: 'get_wiki_space_doc',
        description: '获取飞书知识空间文档内容',
        inputSchema: zodToJsonSchema(WikiSpaceParamsSchema),
      },
      {
        name: 'generate_code',
        description: '根据文档内容生成代码',
        inputSchema: zodToJsonSchema(GenerateCodeParamsSchema),
      },
      {
        name: 'analyze_doc',
        description: '分析飞书文档并生成代码',
        inputSchema: zodToJsonSchema(AnalyzeDocParamsSchema),
      },
    ],
  };
});

// 获取飞书访问令牌
async function getFeishuAccessToken() {
  const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`获取飞书访问令牌失败: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.tenant_access_token;
}

// 从 URL 中提取文档 token
function extractDocTokenFromUrl(url: string): string {
  const match = url.match(/\/docx\/([^/]+)/);
  if (!match) {
    throw new Error('无效的飞书文档 URL');
  }
  return match[1];
}

// 从 URL 中提取知识空间节点 token
function extractWikiNodeTokenFromUrl(url: string): string {
  const match = url.match(/\/wiki\/([^/]+)/);
  if (!match) {
    throw new Error('无效的飞书知识空间 URL');
  }
  return match[1];
}

// 获取文档内容
async function getDocContent(docToken: string, accessToken: string) {
  const url = `https://open.feishu.cn/open-apis/docx/v1/documents/${docToken}/raw_content`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`获取文档内容失败: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data.content;
}

// 获取知识空间节点信息
async function getWikiSpaceNode(nodeToken: string, accessToken: string) {
  const url = `https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${nodeToken}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`获取知识空间节点信息失败: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data.node;
}

// 预设的前端知识库配置
const PRESET_FRONTEND_CONFIGS = {
  vue: {
    standards: {
      naming: {
        components: 'PascalCase',
        composables: 'useCamelCase',
        constants: 'UPPER_CASE',
        files: 'kebab-case',
      },
      structure: {
        components: 'src/components',
        services: 'src/services',
        utils: 'src/utils',
        types: 'src/types',
        styles: 'src/styles',
        assets: 'src/assets',
        pages: 'src/pages',
        api: 'src/api',
        configs: 'src/configs',
      },
      conventions: [
        // '使用 TypeScript',
        '使用 选项式 API',
        '使用 ESLint 和 Prettier',
        '使用 Less',
        '使用 Vuex 进行状态管理',
        '使用 Vue Router 进行路由管理',
      ],
    },
    templates: {
      component: {
        path: 'templates/vue/component.vue',
        content: `<template>
  <div class="component">
    <!-- 组件模板 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style lang="scss" scoped>
.component {
  // 组件样式
}
</style>`,
      },
    },
  },
};

// 根据用户对话调整配置
function adjustConfigByConversation(
  baseConfig: (typeof PRESET_FRONTEND_CONFIGS)[keyof typeof PRESET_FRONTEND_CONFIGS],
  conversation: string
) {
  const config = { ...baseConfig };

  // 根据对话内容调整命名规范
  if (conversation.includes('使用下划线命名')) {
    config.standards.naming.components = 'snake_case';
    config.standards.naming.files = 'snake_case';
  }

  // 根据对话内容调整目录结构
  if (conversation.includes('使用 features 目录')) {
    // 使用 Record 类型来允许动态添加属性
    const newStructure = { ...config.standards.structure } as Record<string, string>;
    newStructure.features = 'src/features';
    config.standards.structure = newStructure as typeof config.standards.structure;
  }

  // 根据对话内容调整代码规范
  if (conversation.includes('使用 Redux')) {
    config.standards.conventions.push('使用 Redux 进行状态管理');
  }

  // 根据对话内容调整模板
  if (conversation.includes('使用 CSS-in-JS')) {
    config.standards.conventions = config.standards.conventions.map(conv =>
      conv.includes('CSS Modules') ? '使用 styled-components 或 emotion' : conv
    );
  }

  return config;
}

// 加载知识库内容
async function loadKnowledgeBase(config: {
  type: 'local' | 'remote';
  path?: string;
  url?: string;
  analysisEndpoint?: string;
  projectSpec?: {
    type: 'frontend' | 'backend' | 'fullstack';
    framework: string;
    structure?: {
      src?: string;
      test?: string;
      docs?: string;
    };
    conventions?: string[];
  };
  conversation?: string;
}) {
  if (config.type === 'local') {
    if (!config.path) {
      throw new Error('本地知识库路径未指定');
    }
    const content = await fs.readFile(config.path, 'utf-8');
    return JSON.parse(content);
  } else {
    if (!config.url) {
      throw new Error('远程知识库 URL 未指定');
    }

    // 如果提供了分析接口，直接获取分析结果
    if (config.analysisEndpoint) {
      const res = await fetch(config.analysisEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          knowledgeBaseUrl: config.url,
          projectSpec: config.projectSpec,
          conversation: config.conversation,
        }),
      });

      if (!res.ok) {
        throw new Error(`获取远程知识库分析结果失败: ${res.status} ${res.statusText}`);
      }

      return res.json();
    }

    // 如果是前端项目，使用预设配置
    if (config.projectSpec?.type === 'frontend' && config.projectSpec?.framework) {
      const framework = config.projectSpec.framework.toLowerCase();
      const baseConfig = PRESET_FRONTEND_CONFIGS[framework as keyof typeof PRESET_FRONTEND_CONFIGS];

      if (baseConfig) {
        return adjustConfigByConversation(baseConfig, config.conversation || '');
      }
    }

    // 否则获取知识库内容
    const res = await fetch(config.url);
    if (!res.ok) {
      throw new Error(`获取远程知识库失败: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }
}

// 分析文档并生成代码
async function analyzeDocAndGenerateCode(
  docContent: string,
  knowledgeBase: any,
  projectSpec: {
    type: 'frontend' | 'backend' | 'fullstack';
    framework: string;
    structure?: {
      src?: string;
      test?: string;
      docs?: string;
    };
    conventions?: string[];
  },
  outputPath?: string
) {
  const structure = {
    src: {
      components: {},
      services: {},
      utils: {},
      types: {},
      hooks: {},
    },
    test: {
      unit: {},
      integration: {},
    },
    docs: {
      api: {},
      guides: {},
    },
  };

  // 生成分析报告
  const analysisReport = {
    projectInfo: {
      type: projectSpec.type,
      framework: projectSpec.framework,
      structure: projectSpec.structure,
      conventions: projectSpec.conventions,
    },
    documentAnalysis: {
      content: docContent,
      summary: '文档内容分析摘要',
      keyPoints: ['关键点1', '关键点2', '关键点3'],
    },
    knowledgeBase: {
      content: knowledgeBase,
      standards: knowledgeBase.standards || {},
      templates: knowledgeBase.templates || {},
    },
    generatedStructure: structure,
    recommendations: [
      '建议使用 TypeScript 进行类型安全开发',
      '建议使用 ESLint 和 Prettier 进行代码规范',
      '建议使用 React Query 进行数据获取',
    ],
  };

  // 如果指定了输出路径，将分析报告写入文件
  if (outputPath) {
    const reportPath = `${outputPath}/analysis-report.json`;
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(analysisReport, null, 2), 'utf-8');
  }

  return {
    analysis: analysisReport,
    structure: structure,
    message: '分析完成，请将 analysis-report.json 文件内容提供给 Cursor 进行代码生成',
  };
}

// 生成代码（简化版本，仅用于测试）
async function generateCode(content: string, framework: string, outputPath?: string) {
  // 生成简单的代码模板
  const codeTemplate = `
// 根据文档内容生成的 ${framework} 代码模板
// 请将以下分析内容提供给 Cursor 进行代码生成：

/*
分析内容：
${content}

框架：${framework}

请根据以上分析内容生成相应的代码。
*/
`;

  // 如果指定了输出路径，将代码模板写入文件
  if (outputPath) {
    await fs.writeFile(outputPath, codeTemplate, 'utf-8');
  }

  return codeTemplate;
}

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    switch (request.params.name) {
      // 获取飞书文档内容
      case 'get_feishu_doc': {
        const { docToken, docUrl } = DocContentParamsSchema.parse(request.params.arguments);
        const accessToken = await getFeishuAccessToken();

        let token = docToken;
        if (docUrl) {
          token = extractDocTokenFromUrl(docUrl);
        }

        if (!token) {
          throw new Error('必须提供 docToken 或 docUrl');
        }

        const content = await getDocContent(token, accessToken);
        return {
          content: [{ type: 'text', text: JSON.stringify(content, null, 2) }],
        };
      }

      // 获取飞书知识空间文档内容
      case 'get_wiki_space_doc': {
        const { nodeToken, wikiUrl } = WikiSpaceParamsSchema.parse(request.params.arguments);
        const accessToken = await getFeishuAccessToken();

        let token = nodeToken;
        if (wikiUrl) {
          token = extractWikiNodeTokenFromUrl(wikiUrl);
        }

        if (!token) {
          throw new Error('必须提供 nodeToken 或 wikiUrl');
        }

        // 获取节点信息
        const nodeInfo = await getWikiSpaceNode(token, accessToken);

        // 如果节点类型是文档，获取文档内容
        if (nodeInfo.obj_type === 'docx' && nodeInfo.obj_token) {
          const content = await getDocContent(nodeInfo.obj_token, accessToken);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    nodeInfo,
                    content,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        throw new Error('节点不是文档类型或未绑定文档');
      }

      // 生成代码
      case 'generate_code': {
        const { content, framework, outputPath } = GenerateCodeParamsSchema.parse(
          request.params.arguments
        );
        const generatedCode = await generateCode(content, framework, outputPath);
        return {
          content: [{ type: 'text', text: generatedCode }],
        };
      }

      // 分析文档并生成代码
      case 'analyze_doc': {
        const { docToken, docUrl, wikiUrl, knowledgeBase, projectSpec, outputPath } =
          AnalyzeDocParamsSchema.parse(request.params.arguments);

        // 获取文档内容
        const accessToken = await getFeishuAccessToken();
        let docContent: any;

        if (docToken || docUrl) {
          const token = docToken || (docUrl ? extractDocTokenFromUrl(docUrl) : '');
          docContent = await getDocContent(token, accessToken);
        } else if (wikiUrl) {
          const nodeToken = extractWikiNodeTokenFromUrl(wikiUrl);
          const nodeInfo = await getWikiSpaceNode(nodeToken, accessToken);
          if (nodeInfo.obj_type === 'docx' && nodeInfo.obj_token) {
            docContent = await getDocContent(nodeInfo.obj_token, accessToken);
          } else {
            throw new Error('Wiki 页面未绑定文档或类型不支持');
          }
        } else {
          throw new Error('必须提供文档或 Wiki 的访问信息');
        }

        // 确保 projectSpec 包含必需的字段
        if (!projectSpec.type || !projectSpec.framework) {
          throw new Error('项目规范必须包含 type 和 framework 字段');
        }

        // 确保 knowledgeBase 包含必需的字段
        if (!knowledgeBase.type) {
          throw new Error('知识库配置必须包含 type 字段');
        }

        // 加载知识库
        const kbContent = await loadKnowledgeBase({
          type: knowledgeBase.type,
          path: knowledgeBase.path,
          url: knowledgeBase.url,
          analysisEndpoint: knowledgeBase.analysisEndpoint,
          projectSpec: {
            type: projectSpec.type,
            framework: projectSpec.framework,
            structure: projectSpec.structure,
            conventions: projectSpec.conventions,
          },
        });

        // 分析文档并生成代码
        const result = await analyzeDocAndGenerateCode(
          docContent,
          kbContent,
          {
            type: projectSpec.type,
            framework: projectSpec.framework,
            structure: projectSpec.structure,
            conventions: projectSpec.conventions,
          },
          outputPath
        );

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('飞书文档分析 MCP 服务器已在 stdio 上启动');
}

runServer().catch(error => {
  console.error('启动服务器时出错:', error);
  process.exit(1);
});
