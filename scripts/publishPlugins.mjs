import fs from "fs";
import path from "path";
import spawn from "cross-spawn";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import chalk from "chalk";
import { intro, confirm, select, multiselect } from "@clack/prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 插件目录
const pluginsDir = path.resolve(__dirname, "../packages/@plugin");

/**
 * 检查当前包是否有更新：
 * - 读取 package.json 中的 name 和 version，
 * - 使用 npm view 获取线上最新版本，
 * - 如果线上版本存在且和本地版本相同，则认为没有更新。
 * 如果执行 npm view 出错（例如包未发布过），则返回 true 表示需要发布。
 */
function hasUpdate(packagePath) {
  const packageJsonPath = path.resolve(packagePath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const localVersion = pkg.version;
  const packageName = pkg.name;
  try {
    const remoteVersion = execSync(`npm view ${packageName} version`, {
      stdio: "pipe",
    })
      .toString()
      .trim();
    // 如果线上版本与本地版本一致，则没有更新
    return localVersion !== remoteVersion;
  } catch (error) {
    // 出错可能表示包未发布过，此时视为有更新，需要发布
    return true;
  }
}

function consumePackageJson(packagePath) {
  const changesetDir = path.resolve(packagePath, ".changeset");
  if (fs.existsSync(changesetDir)) {
    try {
      console.log(
        chalk.blue(`检测到 ${path.basename(packagePath)} 存在 .changeset 目录，正在消费...`),
      );
      execSync("npx changeset version", { cwd: packagePath, stdio: "inherit" });
    } catch (err) {
      console.error(chalk.red(`消费失败：${err.message}`));
      process.exit(1);
    }
  }
}

/**
 * 发布单个插件。
 * @param {string} packagePath 插件路径
 * @param {Object} options 选项 { beta: boolean, checkUpdate: boolean }
 */
async function publishPackage(packagePath, options = { beta: false, checkUpdate: true }) {
  // 若需要检查更新，则先判断插件是否有更新
  consumePackageJson(packagePath);
  if (options.checkUpdate) {
    if (!hasUpdate(packagePath)) {
      const answer = await confirm({
        message: `插件 ${path.basename(packagePath)} 没有更新，是否仍然发布？`,
        initialValue: false,
      });
      if (!answer) {
        console.log(chalk.yellow(`跳过发布插件 ${path.basename(packagePath)}。`));
        return;
      }
    }
  }
  return new Promise((resolve, reject) => {
    const tagArgs = options.beta ? ["--tag", "beta"] : [];
    console.log(chalk.blue(`正在发布 ${path.basename(packagePath)}...`));
    const proc = spawn("npm", ["publish", "--access", "public", ...tagArgs], {
      cwd: packagePath,
      stdio: "inherit",
    });
    proc.on("close", (code) => {
      if (code === 0) {
        console.log(chalk.blue(`插件 ${path.basename(packagePath)} 发布成功。`));
        resolve();
      } else {
        reject(new Error(`插件 ${path.basename(packagePath)} 发布失败，退出码：${code}`));
      }
    });
  });
}

/**
 * 交互式发布所有插件
 */
async function publishAllPluginsInteractive() {
  intro(chalk.green("欢迎使用插件发布工具"));

  // 选择是否批量发布所有插件
  const publishAll = await confirm({
    message: "是否批量发布所有插件？",
    initialValue: true,
  });

  // 获取插件目录下所有目录
  const items = fs.readdirSync(pluginsDir, { withFileTypes: true });
  const allPluginDirs = items
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => ({
      value: path.resolve(pluginsDir, dirent.name),
      label: dirent.name,
    }));

  let pluginsToPublish = [];
  if (publishAll) {
    pluginsToPublish = allPluginDirs.map((item) => item.value);
  } else {
    // 通过多选让用户选择需要发布的插件
    pluginsToPublish = await multiselect({
      message: "请选择要发布的插件：",
      options: allPluginDirs,
      required: true,
    });
  }

  // 询问是否检查插件是否有更新
  const checkUpdate = await confirm({
    message: "是否检查插件是否有更新？（无更新则默认跳过发布）",
    initialValue: true,
  });

  // 询问是否以 beta 版形式发布
  const publishBeta = await confirm({
    message: "是否以 beta 版形式发布？",
    initialValue: false,
  });

  // 遍历所有选中的插件目录
  for (const packagePath of pluginsToPublish) {
    // 判断目录下是否存在 package.json
    if (fs.existsSync(path.resolve(packagePath, "package.json"))) {
      try {
        await publishPackage(packagePath, { beta: publishBeta, checkUpdate });
      } catch (error) {
        console.error(chalk.red(`发布失败：${error.message}`));
      }
    } else {
      console.warn(chalk.yellow(`目录 ${packagePath} 不是有效的 npm 包。`));
    }
  }

  console.log(chalk.green("所有插件处理完成。"));
}

publishAllPluginsInteractive();
