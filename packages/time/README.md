# 时间处理工具

这是一个基于 Model Context Protocol (MCP) 的时间处理工具，提供时间获取和时区转换功能。

## 功能特性

- 获取当前时间（支持时区）
- 时区之间的时间转换

## 环境要求

- Node.js >= 18

## 安装

```bash
pnpm add @mcp/time
```

## 配置

可选：设置默认时区环境变量：

```bash
export LOCAL_TIMEZONE=Asia/Shanghai
```

## 使用方法

### 1. 获取当前时间 (get_current_time)

获取指定时区的当前时间：

```typescript
// 示例请求
{
  "name": "get_current_time",
  "arguments": {
    "timezone": "Asia/Shanghai"  // 可选，默认使用 LOCAL_TIMEZONE 或 Asia/Shanghai
  }
}
```

参数说明：

- `timezone`: 时区名称（可选）
  - 支持的时区格式：如 "Asia/Shanghai", "America/New_York", "UTC" 等
  - 如果不提供，将使用环境变量 LOCAL_TIMEZONE 或默认值 "Asia/Shanghai"

### 2. 时区转换 (convert_time)

在不同时区之间转换时间：

```typescript
// 示例请求
{
  "name": "convert_time",
  "arguments": {
    "source_timezone": "Asia/Shanghai",
    "time": "14:30",           // 24小时制，格式：HH:MM
    "target_timezone": "UTC"
  }
}
```

参数说明：

- `source_timezone`: 源时区
- `time`: 要转换的时间（24小时制，格式：HH:MM）
- `target_timezone`: 目标时区

## 响应格式

所有响应都遵循 MCP 协议格式：

```typescript
{
  "content": [
    {
      "type": "text",
      "text": "JSON 格式的响应数据"
    }
  ]
}
```

### 响应示例

1. 获取当前时间：

```json
{
  "currentTime": "2024-03-14 14:30:00"
}
```

2. 时区转换：

```json
{
  "convertedTime": "2024-03-14T06:30:00Z"
}
```

## 错误处理

工具会处理以下错误情况：

- 无效的时区名称
- 无效的时间格式
- 参数验证错误

错误响应示例：

```json
{
  "error": "Invalid time format, expected HH:MM"
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式
pnpm dev
```

## 许可证

MIT
