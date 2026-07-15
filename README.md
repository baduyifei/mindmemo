# MindMemo

[![Version](https://img.shields.io/badge/version-v1.1.0-2563eb)](https://github.com/baduyifei/mindmemo/releases)
[![Upstream](https://img.shields.io/badge/upstream-Memos%20v0.21.0-52525b)](https://github.com/usememos/memos/tree/v0.21.0)
[![License](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

MindMemo 是一个面向个人知识记录的轻量、自托管备忘录应用。项目基于开源项目 [Memos](https://github.com/usememos/memos) v0.21.0，并针对个人使用场景增加了月历热力图、日期筛选和稳定性修复。

> 当前 MindMemo 版本：`v1.1.0`<br>
> 上游基础版本：`Memos v0.21.0`

## MindMemo 的主要改动

- 在主页右侧搜索栏与统计信息之间增加月历热力图。
- 热力图只统计当前登录用户创建的备忘录。
- 每周从星期一开始，并用灰色显示月历首尾的相邻月份日期。
- 支持通过左右箭头切换月份。
- 点击日期后筛选当天的备忘录，再次点击或点击“清除”即可取消筛选。
- 使用跨月份一致的固定颜色档位：
  - `0` 条：无高亮
  - `1` 条：浅色
  - `2–3` 条：较浅
  - `4–6` 条：较深
  - `7` 条及以上：最深
- 日期文字只使用浅黑色和白色，视觉差异主要由背景色表达。
- 统计信息中的 `Days` 按实际有备忘录的日期计数。
- 修复并发读取数据库时删除备忘录可能误报失败的问题；物理压缩改为离线维护。

## 快速开始（macOS + Docker Desktop）

### 1. 克隆并构建镜像

```bash
git clone https://github.com/baduyifei/mindmemo.git
cd mindmemo
docker build -t mindmemo:1.1.0 .
```

### 2. 创建数据目录并启动

```bash
mkdir -p "$HOME/.mindmemo"

docker run -d \
  --name mindmemo \
  --restart unless-stopped \
  -p 52301:5230 \
  -v "$HOME/.mindmemo:/var/opt/memos" \
  mindmemo:1.1.0
```

浏览器打开：<http://localhost:52301/>

### 3. 常用管理命令

```bash
# 查看运行状态
docker ps --filter name=mindmemo

# 查看日志
docker logs -f mindmemo

# 停止或重新启动
docker stop mindmemo
docker start mindmemo
```

## 使用 Docker Compose

在项目外新建一个部署目录，并保存以下 `compose.yaml`：

```yaml
services:
  mindmemo:
    image: mindmemo:1.1.0
    container_name: mindmemo
    environment:
      - TZ=Asia/Shanghai
    ports:
      - "52302:5230"
    volumes:
      - ./data:/var/opt/memos
    restart: always
```

然后运行：

```bash
docker compose up -d
```

`./data` 是本机数据目录，容器内的 `/var/opt/memos` 是 Memos v0.21.0 的兼容数据目录。不要把真实数据库、附件或备份提交到 Git 仓库。

## 数据备份

升级或更换镜像前，先停止容器并复制整个数据目录：

```bash
docker stop mindmemo
cp -a "$HOME/.mindmemo" "$HOME/.mindmemo-backup-$(date +%Y%m%d-%H%M%S)"
docker start mindmemo
```

备份应至少包含 SQLite 数据库和资源文件。恢复前请停止容器，并保留一份当前数据副本。

## 本地开发与验证

主要技术栈：Go 1.22、React 18、TypeScript、Vite、Tailwind CSS、SQLite。

前端验证：

```bash
cd web
corepack enable
corepack prepare pnpm@8.15.9 --activate
pnpm install --frozen-lockfile
pnpm type-check
pnpm lint
pnpm build
```

后端验证：

```bash
go test ./...
```

完整生产镜像验证：

```bash
docker build -t mindmemo:dev .
```

## 版本迭代约定

MindMemo 使用独立于上游 Memos 的[语义化版本](https://semver.org/lang/zh-CN/)：

仓库根目录的 [`VERSION`](VERSION) 是 MindMemo 版本号的唯一来源。Docker 和本地构建脚本会在编译时自动读取并注入该版本；发布新版本时只需先修改这个文件，不要在界面或后端源码中重复填写版本号。

- `PATCH`：问题修复，例如 `v0.1.1`
- `MINOR`：向后兼容的新功能，例如 `v0.2.0`
- `MAJOR`：包含不兼容改动的大版本，例如 `v1.0.0`

建议工作流：

1. `main` 始终保留可部署版本。
2. 新功能使用 `feature/功能名` 分支，修复使用 `fix/问题名` 分支。
3. 合并前运行前端、后端和 Docker 构建验证。
4. 在 [CHANGELOG.md](CHANGELOG.md) 中记录用户可感知的变化。
5. 发布时创建 `vX.Y.Z` Git 标签，并使用同一版本号标记 Docker 镜像。

## 同步上游 Memos

仓库保留两个远程地址：

- `origin`：<https://github.com/baduyifei/mindmemo>
- `upstream`：<https://github.com/usememos/memos>

同步前应先备份数据，并在独立分支中处理兼容性：

```bash
git fetch upstream --tags
git switch -c chore/sync-upstream
```

MindMemo 当前基于较早的 Memos v0.21.0。升级上游版本时，必须重点检查数据库迁移、API、前端组件和 Docker 数据目录，不建议直接替换正在使用的镜像。

## 兼容性说明

项目显示名称已经统一为 `MindMemo`。为了兼容上游源码、已有数据库和部署方式，部分内部技术标识仍保留 `memos`，例如 Go 模块路径、可执行文件名、`MEMOS_*` 环境变量以及容器内数据目录 `/var/opt/memos`。这些保留项不影响 MindMemo 的产品名称。

## 开源许可与致谢

MindMemo 基于 Memos v0.21.0 修改，继续遵循 [MIT License](LICENSE)。感谢 Memos 项目及其贡献者提供的开源基础。

- MindMemo 仓库：<https://github.com/baduyifei/mindmemo>
- Memos 上游仓库：<https://github.com/usememos/memos>
