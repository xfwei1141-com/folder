# Folder Doodle 开发助手交接说明

> 新对话或新的开发助手开始工作前，请先阅读本文件。目标是避免在本地地址、Vite 启动、端口和代理问题上重复试错。

## 项目位置与环境

- 项目目录：`D:\Desktop\文件夹图标修改网站`
- 技术栈：React 19 + Vite 7 + HTML Canvas
- 系统：Windows / PowerShell
- 依赖通常已经安装，`node_modules` 存在时不要重复执行安装。
- PowerShell 的脚本策略可能拦截 `npm.ps1`，因此优先使用 `npm.cmd`。

## 最短启动流程

1. 进入项目目录。
2. 先验证项目能正常构建：

   ```powershell
   npm.cmd run build
   ```

3. 需要浏览器预览时，让用户在自己的终端运行：

   ```powershell
   npm.cmd run dev
   ```

4. 保持该终端窗口开启，使用 Vite 实际输出的 `Local` 地址。通常是：

   ```text
   http://localhost:5173/
   ```

5. 如果 5173 已被占用，Vite 可能自动改用 5174 等端口。必须使用终端实际显示的地址，不要猜测端口。

## 为什么以前会出现打不开

### `ERR_CONNECTION_REFUSED`

这表示对应端口没有开发服务监听，通常不是代码问题，也不是代理问题。先确认运行 `npm.cmd run dev` 的终端仍然开启，并且显示 `VITE ready`。

不要把一次成功构建误认为服务已经启动：`npm.cmd run build` 只生成生产文件，不会提供本地网页服务。

### Codex 启动的后台服务容易消失

Codex 工具环境启动的临时后台进程可能在命令结束后被回收，因此不要反复尝试用隐藏后台进程长期保持 Vite。最稳定的方式是让用户在可见终端中运行 `npm.cmd run dev` 并保持窗口开启。

同时，Codex 的工具沙箱、应用内浏览器与用户自己的 Chrome 有时不共享同一个本地网络或进程视图。工具访问不到 `localhost`，不一定代表用户浏览器也访问不到。以用户终端的 Vite 输出和用户浏览器结果为准。

### 页面能打开但只有空白背景

这通常表示 `index.html` 已加载，但 React 运行时报错。处理顺序：

1. 查看运行 Vite 的终端是否有错误。
2. 查看浏览器开发者工具 Console。
3. 执行 `npm.cmd run build` 检查编译错误。
4. 强制刷新页面，必要时停止服务后重新运行。

项目已经包含 `vite.config.js` 和 React 插件配置，不要删除。

## 代理说明

- 用户的系统加速器代理端口是 `10808`。
- Vite 默认端口是 `5173`，两者不是同一个端口，不会直接冲突。
- 若 Vite 已显示正常启动但浏览器仍无法访问，应在代理软件中让 `localhost`、`127.0.0.1` 和局域网地址直连或绕过代理。
- 可分别尝试 `http://localhost:5173/` 和 `http://127.0.0.1:5173/`，但仍应优先使用 Vite 的实际输出地址。

## 快速排查命令

检查 5173 是否正在监听：

```powershell
netstat -ano | Select-String ':5173'
```

如果没有输出，说明服务没有运行。不要继续排查页面代码，先启动 Vite。

停止开发服务：在运行 Vite 的终端按 `Ctrl + C`。

## 当前项目状态

已经实现：

- 透明 Canvas 绘图
- 默认黑色画笔和颜色选择器
- 线条粗细调节
- 填充模式：点击工具栏“填充”后，在 Canvas 上点击一个连通区域，会用当前画笔颜色填满该区域。
- 撤销
- 清空画布
- 独立半透明文件夹构图参考层
- 透明 PNG 下载
- 256×256、32 位 ICO 下载
- 虚拟 Windows 桌面预览
- 桌面中的所有模拟文件夹实时使用用户当前图标
- 三栏产品页面骨架：
  - 左侧：Windows 文件夹图标替换教程，占位步骤与图片占位
  - 中间：核心创作区，包含工具栏、Canvas 绘图、桌面效果预览
  - 右侧：官方收录图库，占位作品卡片、作者、下载按钮、分页
- 用户手绘图标素材已接入工具栏、教程占位、图库卡片和分页按钮。
- `DoodleAsset` 会把用户提供的黑底 JPG 素材在运行时绘制到 canvas，并自动抠掉连通边缘的黑色背景。
- 页面背景、边框和卡片已有轻微奶油纸感 / 涂鸦边框风格。
- 顶部大标题当前使用 `图片/folder-doodle-title-vertical.jpg`，通过 CSS `rotate(90deg)` 转成横向展示。之前 `-90deg` 会反，已经修正。
- 四个区域标题当前统一使用文字标题样式：
  - `如何替换？`
  - `开始涂鸦`
  - `效果预览`
  - `官方收录`

关键约束：

- 参考文件夹轮廓只存在于编辑辅助 Canvas，不能进入预览、PNG 或 ICO。
- 用户绘图数据保存在透明的上层 Canvas。
- 填充模式只操作用户绘图 Canvas，不读取或修改参考层。
- 桌面预览只复制用户绘图内容。
- PNG 和 ICO 必须保留透明通道。
- 不要无故重搭项目、替换技术栈或引入新依赖。
- 不要增加模板功能。
- 右侧暂时只保留“官方收录”，不要加“社区创作”、上传、数据库或登录系统。
- 当前阶段用户正在调整视觉细节。除非明确要求，不要改三栏布局、按钮位置、Canvas 核心逻辑或导出逻辑。
- 正文和按钮文字保持干净可读，不要整站都改成手写字体。

## 关键文件

- `src/App.jsx`：绘图、参考层、桌面预览、PNG/ICO 导出逻辑
- `src/styles.css`：现有页面和桌面预览样式
- `src/main.jsx`：React 入口
- `vite.config.js`：Vite React 配置
- `package.json`：启动与构建命令
- `图片/`：用户手绘标题和图标素材目录

## 最新视觉状态

- 主标题：
  - 当前引用：`图片/folder-doodle-title-vertical.jpg`
  - CSS 位置：`.brand-title`
  - 关键样式：`transform: translate(-50%, -50%) rotate(90deg);`
  - 如果标题方向又不对，优先检查这里，不要重写组件。
- 栏目标题：
  - 组件：`DoodleHeading`
  - 当前是文字标题，不是图片标题。
  - CSS 位置：`.doodle-heading`
  - 字体：`ZCOOL KuaiLe`，备用 `"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC"`
  - 颜色变量：`--heading-ink: #4f3838`
  - 当前字号：桌面 `33px`，移动端 `30px`
- 正文：
  - 仍使用 `"Microsoft YaHei", "PingFang SC", sans-serif`
  - 不要把正文全改成标题字体。
- 旧标题图片仍在 `图片/` 中：
  - `如何替换.jpg`
  - `开始涂鸦.jpg`
  - `效果预览.jpg`
  - `官方收录.jpg`
  - 当前代码没有继续用它们做栏目标题，但不要删除，后续可能会回退或参考。

## 最近一次验证

- 最近一次执行：

  ```powershell
  npm.cmd run build
  ```

- 构建通过。
- 这只是验证构建，不代表开发服务器正在运行。

## 2026-07-10 绘图工具最新进度

- 已新增“填充”绘图操作。
- 工具栏按钮文字为：
  - 普通状态：`填充`
  - 激活状态：`填充中`
- 入口位置：
  - `src/App.jsx`
  - `CreatorToolbar`
  - `DrawingCanvas`
  - `App` 内的 `drawingMode`
- 关键函数：
  - `hexToRgba`
  - `colorsMatch`
  - `floodFillCanvas`
- 行为：
  - 默认仍是普通画笔模式。
  - 点击“填充”后，再点击 Canvas 上某个连通区域，会用当前画笔颜色填充该区域。
  - 再次点击“填充中”会切回普通画笔模式。
  - 填充会保存撤销状态。
  - 填充后会实时更新桌面预览。
  - 填充内容会进入 PNG、ICO 和 Helper zip 中的 `icons/current.ico`。
  - 填充只操作用户绘图 Canvas，不读取、不修改参考层。
- 样式：
  - `src/styles.css` 中 `.toolbar button.is-active` 控制“填充中”按钮样式。
  - `.drawing-canvas.is-fill-mode` 控制填充模式下的光标。

## 下一步计划：右侧官方收录 UI 设计

用户准备在新对话中继续讨论右侧 `官方收录` 区域的 UI 设计。新对话优先围绕右栏设计展开，不要先改 Canvas、Helper、左侧教程或整体三栏结构。

当前右侧状态：

- 组件：
  - `GalleryPanel`
  - `GalleryCard`
- 数据：
  - `GALLERY_ITEMS` 仍是静态占位数据。
- 当前结构：
  - 标题：`官方收录`
  - 说明文案：`也想分享你的作品？这里先预留官方收录展示位。`
  - 作品卡片：图片占位、名称、作者、下载图标按钮
  - 分页：上一页、1、2、3、省略号、下一页
- 当前样式位置：
  - `.gallery-panel`
  - `.gallery-list`
  - `.gallery-card`
  - `.gallery-image`
  - `.gallery-card-meta`
  - `.gallery-pagination`
- 当前约束：
  - 右侧暂时只做 `官方收录`。
  - 不要加 `社区创作`。
  - 不要加上传、数据库、登录系统。
  - 不要寻找真实图片素材。
  - 可以先做静态 UI 设计和占位内容。
  - 保持一行三张作品卡片的基本方向，除非用户明确要求调整。

## 2026-07-10 教程图片加载修复

- 曾出现两张教程图在页面中显示破图：
  - `换一个` 的 Step 4：确认并应用
  - `批量换` 的 Step 3：选择应用范围
- 原因疑似为教程图片文件名过长且包含特殊字符 `~`，开发环境浏览器请求不稳定。
- 已保留原始中文长文件名图片，同时新增短文件名副本并改用短文件名 import：
  - `图片/系统交互图标/single-step-4.png`
  - `图片/系统交互图标/batch-step-3.png`
  - `图片/系统交互图标/refresh-step-4.png`
- 对应 import 在 `src/App.jsx` 顶部。
- 不要把这三个 import 改回带 `~` 的长中文文件名。
- 修复后执行过 `npm.cmd run build`，构建通过，打包产物中能看到上述短文件名资源。

## 新对话推荐工作顺序

1. 先读本文件、`README.md`、`src/App.jsx` 和 `src/styles.css`。
2. 理解现有 Canvas 分层后再修改，避免把参考层混入导出。
3. 只在依赖缺失时安装依赖。
4. 修改后执行 `npm.cmd run build`。
5. 需要用户查看效果时，明确让用户运行并保持 `npm.cmd run dev`，不要声称一个未验证或已经被回收的后台地址可用。

## 2026-07-10 Helper 批量应用包进度

本轮核心目标是新增“下载桌面 Helper / 下载批量应用包”，并修复 Windows 桌面文件夹图标真正应用失败的问题。不要回退这部分逻辑，也不要重构左侧教程 UI、整体三栏布局、Canvas 核心绘制逻辑或右侧图库结构。

已经完成：

- `src/App.jsx` 新增 JSZip 生成 Helper zip 的逻辑。
- `package.json` / `package-lock.json` 新增依赖：`jszip`。
- 网页端保留原有 PNG / ICO 下载，同时新增“下载批量应用包”按钮。
- Helper zip 结构为：
  - `FolderDoodle_Helper/icons/current.ico`
  - `FolderDoodle_Helper/Apply.bat`
  - `FolderDoodle_Helper/Restore.bat`
  - `FolderDoodle_Helper/使用说明.txt`
- `icons/current.ico` 使用用户当前绘制并生成的 ICO。
- `src/styles.css` 已给画布绘图区加黑色十字准星鼠标样式，解决浅色背景上看不到鼠标落点的问题。

Apply.bat 当前逻辑：

- 自动定位当前 Windows 用户桌面路径，只处理桌面范围。
- 启动后询问：
  - `1`：只应用到桌面一级文件夹
  - `2`：应用到桌面一级文件夹及其所有子文件夹
- 每个目标文件夹内复制 `.folder-doodle-icon.ico`，不直接引用 Helper 里的 `icons/current.ico`。
- 复制后的 `.folder-doodle-icon.ico` 会设置隐藏 + 系统属性。
- 如果目标文件夹原本有 `desktop.ini` 且不是 Folder Doodle 生成的，会先备份为 `desktop.ini.folderdoodle.bak`，并隐藏备份。
- 写入新的 `desktop.ini`，包含：
  - `[.ShellClassInfo]`
  - `; FolderDoodleManaged=1`
  - `IconResource=目标文件夹绝对路径\.folder-doodle-icon.ico,0`
  - `IconFile=.folder-doodle-icon.ico`
  - `IconIndex=0`
- `desktop.ini` 会设置隐藏 + 系统属性。
- 目标文件夹会执行 `attrib +r +s`，让 Windows Shell 识别 `desktop.ini`。
- 完成后尝试执行 `ie4uinit.exe -show` 刷新图标缓存，但不强制重启资源管理器。
- 执行时有详细日志：正在处理、复制 ico、隐藏 ico、写入 desktop.ini、设置 desktop.ini 属性、设置文件夹属性、刷新图标缓存、真实异常信息。

Restore.bat 当前逻辑：

- 自动定位当前 Windows 用户桌面路径，并询问恢复范围，范围选项与 Apply.bat 一致。
- 删除 `.folder-doodle-icon.ico` 前会先清除隐藏 / 系统 / 只读属性。
- 如果存在 `desktop.ini.folderdoodle.bak`，删除当前 Folder Doodle 生成的 `desktop.ini`，再恢复备份为 `desktop.ini`。
- 如果没有备份，但 `desktop.ini` 带有 `; FolderDoodleManaged=1` 标记，则删除该 `desktop.ini`。
- 如果没有备份，且 `desktop.ini` 不是 Folder Doodle 生成的，则保留用户原有配置，避免误删。
- 完成后同样尝试 `ie4uinit.exe -show` 刷新图标缓存，不强制重启 Explorer。

已经修复过的问题：

- Helper 里的 `%~dp0` 路径在 PowerShell 字符串中被错误处理，导致命令窗口报 `Illegal characters in path`。
- Apply.bat catch 原先只输出“跳过”，现在会输出文件夹路径和 `Exception.Message`。
- `Read-IniLines` 曾返回固定数组，导致 `$lines.Insert()` / `$lines.Add()` 报 `Collection was of a fixed size`；已改为始终返回 `System.Collections.Generic.List[string]`。
- 后续为了让 Windows 真正识别文件夹图标，已经改为更稳定的覆盖式 `desktop.ini` 写法，并加备份 / 恢复保护。

验证状态：

- 最近执行过 `npm.cmd run build`，构建通过。
- 已对嵌入的 Apply / Restore PowerShell 内容做过语法解析检查。
- 已用临时测试目录验证：
  - Apply 后图标文件存在，并带隐藏 + 系统属性。
  - `desktop.ini` 包含绝对路径 `IconResource`、`IconFile`、`IconIndex`，并带隐藏 + 系统属性。
  - 目标文件夹带只读 / 系统属性。
  - 原有 `desktop.ini` 会生成 `desktop.ini.folderdoodle.bak`。
  - Restore 会删除图标文件，并优先恢复备份。
  - 没有备份时，只删除带 `; FolderDoodleManaged=1` 标记的 ini，不删除用户原有 unmanaged `desktop.ini`。

继续测试重点：

- 用户需要刷新网页后重新下载新的 Helper zip；旧 zip 不会自动包含修复。
- 解压新 zip 后运行新的 `Apply.bat`，先选择 `1` 在桌面一级测试文件夹验证。
- 如果日志显示成功但桌面图标仍不变，先右键桌面刷新，再尝试手动重启 Windows 资源管理器。
- 重点观察桌面文件夹外观是否真正变化，而不是只复制了 `.folder-doodle-icon.ico`。
- 运行 `Restore.bat` 后确认默认图标恢复、`.folder-doodle-icon.ico` 删除、原有 `desktop.ini` 没有被误删。

## 2026-07-11 Git / Vercel Analytics 最新进度

本轮用户目标是把 Folder Doodle 项目接入 GitHub / Vercel，并为正式部署后的访问量统计接入 Vercel Analytics。用户也在学习 Git 命令含义，后续回答 Git 相关问题时要尽量解释命令作用，不要只给命令。

Git 当前状态：

- 当前项目目录 `D:\Desktop\文件夹图标修改网站` 已经是 Git 仓库。
- 当前分支为 `main`，远程跟踪为 `origin/main`。
- 用户已经能自行执行 `git status`、`git add .`、`git commit`、`git remote -v`、`git push` 等命令。
- 曾解释过：
  - `git init`：只在项目首次交给 Git 管理时使用，正常仓库不要反复执行。
  - `git status`：查看工作区 / 暂存区 / 分支状态，是最常用排查命令。
  - `git add .`：把当前目录下应提交的改动放入暂存区，不等于提交或上传。
  - `git commit -m "..."`：把暂存区保存成本地版本快照。
  - `git branch -M main`：把当前分支改名为 `main`。
  - `git remote add origin ...`：绑定 GitHub 远程仓库。
  - `git push -u origin main`：第一次推送并建立本地分支与远程分支的追踪关系。
  - `git fetch origin`：只获取远程最新信息，不修改工作区文件。
  - `git pull --ff-only`：只允许快进式拉取，学习阶段比直接 `git pull` 更稳。
- 用户遇到 `LF will be replaced by CRLF` 时已说明这是 Windows 换行提醒，不是失败；`warning` 不等于 `fatal`。
- 用户提到想定期复习 Git 命令；如果后续需要，可在项目内重新补一份 `Git命令复习指南.md`，围绕本项目写命令含义。

Vercel Analytics 当前状态：

- 项目确认是 React + Vite，不是 Next.js。
- 入口文件：
  - `src/main.jsx`：React 入口，渲染 `<App />`。
  - `src/App.jsx`：项目根组件，当前页面结构在这里。
- 没有 `layout.tsx`、`_app.tsx` 等 Next.js 入口。
- 已安装官方依赖：
  - `package.json` / `package-lock.json` 中包含 `@vercel/analytics`。
  - 本地 `node_modules/@vercel/analytics` 存在。
- `src/App.jsx` 已接入：
  - 顶部 import：`import { Analytics } from '@vercel/analytics/react';`
  - 根组件返回内容中渲染：`<Analytics />`
- 该组件不会显示可见 UI，不应改变现有布局、样式、Canvas、下载功能或三栏结构。
- 接入时参考的是 Vercel 官方推荐的 Web Analytics 方案：普通 React/Vite 使用 `@vercel/analytics/react`。
- 已执行过 `npm.cmd run build`，构建通过。

Vercel 后续注意事项：

- 部署到 Vercel 后，还需要在 Vercel 项目的 Analytics 页面启用 Web Analytics。
- Analytics 数据通常要等部署后的真实访问发生后，才会在 Vercel Dashboard 中出现。
- 不需要额外增加复杂埋点；当前阶段只做基础访问统计。

当前工作区提醒：

- 最近检查到 Git 工作区存在未提交改动：
  - `src/App.jsx`
  - `src/styles.css`
- `src/App.jsx` 包含 Analytics 接入。
- `src/styles.css` 的改动可能来自用户前面的视觉调整；除非明确要求，不要覆盖或回退。
- 后续提交前建议执行：
  - `git status`
  - `git diff -- src/App.jsx src/styles.css`
  - `npm.cmd run build`
- 如果只提交 Analytics，可让用户确认 `src/styles.css` 是否也要一起提交；不要擅自丢弃样式改动。
