# Folder Doodle

Folder Doodle 是一个基于 React、Vite 和 HTML Canvas 的在线 Windows 文件夹图标绘制与导出工具，帮助用户自行设计图标，并将其应用于个人电脑上的文件夹。

## 项目状态

项目已实现基础绘图、实时预览和图标导出功能，仍在持续完善中。

本项目面向希望个性化定制 Windows 文件夹外观的用户。网页负责绘制和导出图标，将图标应用到本地文件夹需要用户在 Windows 中完成相应操作。

## 主要功能

- 使用鼠标在画布上绘制图标。
- 调整画笔颜色，清空绘图内容。
- 使用半透明文件夹参考层辅助绘制。
- 在虚拟 Windows 桌面中预览图标效果。
- 导出透明背景 PNG 图片。
- 导出 256×256 ICO 文件夹图标。

## 环境要求

- Node.js 与 npm，Node.js 版本须满足项目所使用的 Vite 7 的要求。
- 支持 HTML Canvas 的现代浏览器。
- 如需按下文应用文件夹图标，需要 Windows 系统。
- 使用 Git 克隆项目时，需要预先安装 Git。

依赖版本以 package.json 和 package-lock.json 为准。

## 获取与安装

在终端中执行：

    git clone https://github.com/xfwei1141-com/folder.git
    cd folder
    npm install

Windows PowerShell 如果提示无法执行 npm.ps1，可将 npm 命令替换为 npm.cmd，例如：

    npm.cmd install

## 启动项目

在项目根目录执行：

    npm run dev

Windows PowerShell 也可以使用：

    npm.cmd run dev

打开终端输出的 Local 地址，通常为：

    http://localhost:5173/

如果端口被占用，Vite 可能使用其他端口，请以终端实际输出为准。

使用期间保持终端运行；结束后可在终端按 Ctrl+C 停止服务。

## 基本使用流程

### 绘制并导出图标

1. 启动项目，在浏览器中打开页面。
2. 选择画笔颜色，在画布上使用鼠标绘制图案。
3. 结合文件夹参考层和桌面预览检查效果。
4. 如需重新绘制，清空画布后再次操作。
5. 下载 PNG 保存图片，或下载 ICO 用于设置 Windows 文件夹图标。

### 在 Windows 中应用文件夹图标

1. 将下载的 ICO 文件保存到一个稳定的位置。
2. 右键单击需要修改图标的普通文件夹，打开“属性”。
3. 在“自定义”选项卡中选择“更改图标”。
4. 点击“浏览”，选择已保存的 ICO 文件。
5. 确认选择并应用更改；必要时刷新文件夹或桌面。

不同 Windows 版本的界面名称可能略有差异。上述步骤针对支持自定义图标的普通文件夹。

应用后不要随意移动或删除 ICO 文件，否则图标可能无法正常显示。

## 构建与本地预览

生成生产构建：

    npm run build

构建结果位于 dist 目录。

构建完成后，可执行：

    npm run preview

随后打开终端显示的地址检查构建结果。

执行 build 只会生成文件，不会自动启动网页服务；preview 用于本地检查构建结果。

## 项目结构

    folder/
    ├── src/
    │   ├── App.jsx          页面交互、绘图及导出逻辑
    │   ├── main.jsx         React 入口
    │   └── styles.css       页面样式
    ├── 图片/               页面图片和操作说明素材
    ├── docs/               项目说明与设计资料
    ├── design/             设计相关文件
    ├── index.html          页面入口
    ├── vite.config.js      Vite 配置
    ├── package.json        依赖与运行命令
    ├── package-lock.json   依赖版本锁定文件
    ├── AGENTS.md           开发协作与环境排查说明
    ├── LICENSE             MIT 许可证全文
    └── README.md           项目介绍与使用说明

## 主要第三方依赖

| 依赖 | 用途 | 官方来源 |
| --- | --- | --- |
| React、React DOM | 页面组件与渲染 | https://react.dev/ |
| Vite | 开发服务与生产构建 | https://vite.dev/ |
| @vitejs/plugin-react | Vite 的 React 支持 | https://github.com/vitejs/vite-plugin-react |
| JSZip | ZIP 文件生成 | https://stuk.github.io/jszip/ |
| @vercel/analytics | 网站访问统计集成 | https://vercel.com/docs/analytics |

第三方依赖受各自许可证约束，本项目的 MIT 许可证不会替代这些依赖的许可条件。

第三方依赖及图片素材的完整来源、授权和义务清单仍待核实补充。目前不将第三方来源审查表述为已经完成。

## 如何贡献

欢迎通过以下方式参与：

- 在 Issues 中报告问题或提出功能建议：
  https://github.com/xfwei1141-com/folder/issues
- Fork 本仓库，修改后提交 Pull Request：
  https://github.com/xfwei1141-com/folder/pulls

报告问题时，请尽量提供：

- 操作系统与浏览器版本。
- 复现问题的具体步骤。
- 预期结果与实际结果。
- 必要的截图或报错信息，注意移除个人隐私信息。

提交代码前，请执行 npm run build，并在浏览器中检查与修改相关的功能。涉及绘图或导出逻辑时，应实际检查绘制、预览和导出结果。

提交代码或素材时，请确保有权提供相关内容，并注明新增第三方内容的来源及许可条件。

## 许可证

本项目采用 MIT 许可证，完整条款见 [LICENSE](./LICENSE)。

选择 MIT 的原因是：希望降低他人使用、学习、修改和分享项目的门槛，允许商业使用及修改后的闭源再发布，同时保留必要的版权声明和许可声明。

使用者可以在 MIT 许可条件下使用、复制、修改、分发和销售软件，但必须在软件的所有副本或实质性部分中保留原版权声明和许可声明。

MIT 不要求使用者公开修改后的源代码，也不要求修改版本继续采用 MIT 许可证。

软件按现状提供，具体保证与责任限制以 LICENSE 正文为准。

本项目的授权仅涵盖作者有权授权的内容。第三方代码、依赖和素材仍受其各自许可条件约束。

Copyright (c) 2026 xfwei1141-com
