import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

// 主函数入口
main();

/**
 * 主逻辑函数：用于将根目录的 README.md 文件复制到目标包路径
 * （用于保证各个子包中的 README 与根目录保持一致）
 */
function main() {
  // copyRootReadmeToTarget();
}

/**
 * pre-commit hook 使用的函数，
 * 如果根目录的 README.md 有改动，则复制到指定目标路径（如某个子包）
 */
function copyRootReadmeToTarget() {
  const rootReadmeMark = 'README.md'; // 根目录 README 文件名
  const rootReadmePath = resolve(process.cwd(), rootReadmeMark); // 绝对路径

  const targetFiles = ['packages/core/README.md']; // 目标路径，可以扩展多个

  // 拷贝函数：如果 root README 有变更，则执行拷贝
  const cpFile = targetPath => {
    if (hasFileChanged(rootReadmeMark)) {
      execSync(`cp ${rootReadmePath} ${targetPath}`); // 执行文件拷贝
      console.log(`Copied root README.md to ${targetPath}.`);
    }
  };

  try {
    // 将相对路径转换成绝对路径，并执行拷贝
    mapFilesToPath(targetFiles).forEach(cpFile);
  } catch (error) {
    // 如果 git diff 命令执行失败，报错并终止流程
    console.error('Error executing git diff:', error);
    process.exit(1);
  }
}

/**
 * 将文件路径数组转为绝对路径
 * @param files 相对路径数组
 * @returns {string[]} 绝对路径数组
 */
function mapFilesToPath(files) {
  return files.map(file => resolve(process.cwd(), file));
}

/**
 * 判断指定文件是否出现在 staged 的 git diff 中（即是否有改动）
 * @param path {string} 需要检查的文件路径
 * @returns {boolean} 是否有改动
 */
function hasFileChanged(path) {
  // 获取已暂存（staged）的变更文件列表
  const gitDiff = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
  // 判断目标文件是否在变更列表中
  return gitDiff.split('\n').some(file => file.trim() === path);
}
