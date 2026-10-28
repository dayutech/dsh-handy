# dsh-handy · 便捷使用

给 DeepSeek Harness 补上一些「本该有」的小操作。所有数据只留在本机浏览器，不写入会话日志，也不会进入模型上下文。

## 功能

| 功能 | 入口 | 说明 |
| --- | --- | --- |
| 指定轮次分叉 | 对话框输入 `/fork` | 弹出当前会话的用户轮次；选一轮后从该轮之后创建分支，并自动打开新分支 |
| 文件标签快速关闭 | 右键文件标签（或标签菜单） | 关闭当前、关闭左侧所有、关闭右侧所有、关闭所有 |
| 会话组 | 工作区行 `…` →「新增会话组」；会话组行 `…`；会话行菜单「加入会话组…」 | 在工作区下显示逻辑子文件夹；组内可添加会话、新建会话；支持最多 3 级嵌套；组与会话均限定在同一工作区；可把会话卡片拖到会话组上移动 |
| 会话高亮 | 会话行右侧星标，或会话行菜单「标记为重要」 | 重要会话在左侧列表中带彩色渐变底和左侧色条，方便扫视 |
| 工作区会话树 | 会话顶部「对话 / 轨迹 / 会话树」中的「会话树」 | 展示当前工作区的全部会话及父子分叉关系；点击节点打开会话；不再占用左侧栏面板 |

## 安装

从 npm 安装：

```powershell
dsh plugin --profile desktop add dsh-handy
```

从本地目录安装：

```powershell
dsh plugin --profile desktop add D:\WorkDirQiax\DSH-Custom-Plugins\dsh-handy
```

如果使用 CLI profile，把 `desktop` 换成实际 profile 名。安装后重启对应的 Harness 进程并刷新页面。

也可以在 `~/.dsh/profiles/<profile>/package.json` 中把本包加入依赖，并确保 `dsh.profile.bundles` 包含 `dsh-handy`。

## 使用提示

- `/fork` 的选项来自当前会话已加载的历史窗口；完整轮次从该轮回复之后分叉，进行中的轮次从当前进度分叉（宿主会为未闭合的工具调用补上安全收尾）。
- 「会话树」读取当前工作区内的全部会话，按 `parentSessionId` 还原父子分叉；点击卡片打开对应会话。
- 会话组是工作区下的逻辑文件夹，不是真实系统目录；会话组最多嵌套 3 级，且组和会话必须属于同一个工作区。
- 把任意会话卡片拖到会话组行上即可移动；不同工作区之间会拒绝并提示。
- 侧边栏星标与会话组存放在 `localStorage` 的 `dsh.handy.v1` 键中；同一浏览器不同标签页会自动同步。
- 左侧栏不再有「便捷使用」面板；会话树已合并为会话顶部标签页。
- 0.2.x 的旧版「全局编组」数据不再兼容；升级后请按工作区重新创建会话组。

## 开发与发布

浏览器端按功能拆分在 `src/`，`lib/client.js` 是由 `scripts/build.mjs` 生成的 DSH Module Loader 单文件产物；不要直接编辑生成文件。

| 模块 | 职责 |
| --- | --- |
| `src/runtime.js` | React、DSH UI 原语、全局 UI 引用 |
| `src/i18n.js` | 中英文案与格式化 |
| `src/state.js` | 本地持久化状态与订阅 store |
| `src/session.js` | 会话摘要、轮次与分叉解析 |
| `src/overlays.js` | 弹窗、菜单与拖拽传输 |
| `src/actions.js` | 分叉、会话组、高亮等操作 |
| `src/highlight.js` | 会话高亮与跨窗口同步 |
| `src/file-tabs.js` | 文件标签批量关闭 |
| `src/groups.js` | 工作区会话组与侧栏渲染层 |
| `src/tree.js` | 会话顶部「会话树」标签页 |
| `src/plugin.js` | DSH 插槽、命令与生命周期接线 |

```powershell
npm install
npm run build
npm run check
npm run pack:dry
```

`npm pack`/`npm publish` 会通过 `prepack` 自动重新构建 `lib/`。发布前可先执行 `npm pack --dry-run` 检查包内容。

卸载：

```powershell
dsh plugin --profile desktop remove dsh-handy
```

仓库：<https://github.com/dayutech/dsh-handy>
