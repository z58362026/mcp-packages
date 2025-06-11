#!/usr/bin/env node

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
