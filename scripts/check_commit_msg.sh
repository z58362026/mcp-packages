#!/bin/sh

# ========== 参数解析 ==========
# 获取两个参数：起始SHA和结束SHA
start_sha=$1
end_sha=$2

# ========== 颜色设置 ==========
RED='\033[0;31m'     # 红色（用于错误提示）
BLUE='\033[0;34m'    # 蓝色（用于提示）
NC='\033[0m'         # 清除颜色（No Color）

# ========== 加载提交类型规则 ==========
# 从 commitlint.config.js 文件中读取 type 枚举规则，生成形如 feat|fix|docs 的字符串
rules=$(node -e "console.log(require('./commitlint.config.js').rules['type-enum'][2].join('|'))")

# ========== 提交信息检查函数 ==========
# 功能：校验提交信息是否符合 commitlint 规范
check_commit_message() {
    commit_msg="$1"

    # 检查提交信息是否以类型开头（如 feat:、fix:），或是否是 Revert 或 Merge 类型
    if ! echo "$commit_msg" | grep -qE "^($rules)(\(.+\))?:|^Revert \"(($rules)(\(.+\))?:.+)\"$|^Merge "; then
        echo -e "${RED}Error:${NC} Commit message format is incorrect. It should start with one of '${BLUE}^($rules)(\\(.+\\))?:${NC}'." >&2
        exit 1
    fi
}

# ========== 模式 1：用于 CI 流程中检查多个提交 ==========
# 如果传入了 2 个参数（如 start_sha 和 end_sha）
# 遍历 git log 中两个 commit 之间的所有提交，逐个检查提交信息是否符合规范
if [ $# -eq 2 ]; then
    for sha in $(git rev-list $start_sha..$end_sha); do
        commit_msg=$(git show --format=%B -s $sha)
        check_commit_message "$commit_msg"
    done

# ========== 模式 2：用于本地 commit-msg 钩子 ==========
# 如果只传入一个参数（commit-msg hook 的临时文件路径），则读取该文件的内容
elif [ $# -eq 1 ]; then
    check_commit_message "$(cat $1) "
else
    # 参数不正确，提示错误
    echo -e "${RED} error: Failed to get commit message\n"
fi

# 所有提交信息校验通过时输出提示
echo -e "${BLUE}Commit message check passed.${NC}\n"
