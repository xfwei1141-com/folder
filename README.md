# Folder Doodle

> **开发助手或新对话请先阅读：[AGENTS.md](./AGENTS.md)**  
> 其中记录了 Windows 本地启动、5173 端口、代理 10808、后台服务回收和最短排查流程。

Folder Doodle 是一个在线绘制和导出 Windows 文件夹图标的 React + Vite 项目。

## 当前功能

- 鼠标拖动 Canvas 绘图
- 透明背景和默认黑色画笔
- 修改画笔颜色
- 清空用户绘图
- 独立半透明文件夹参考层
- 虚拟 Windows 桌面实时预览
- 下载透明 PNG
- 下载 256×256 ICO

## 项目结构

```text
Folder-Doodle
├── AGENTS.md           新对话与开发助手交接说明
├── docs/               项目构想文档
├── src/
│   ├── App.jsx         绘图、预览和导出逻辑
│   ├── main.jsx        React 入口
│   └── styles.css      页面与桌面预览样式
├── index.html          页面入口
├── vite.config.js      Vite React 配置
├── package.json        依赖与运行命令
└── README.md
```

## 本地运行

Windows PowerShell 中优先使用：

```powershell
npm.cmd run dev
```

保持终端窗口开启，并打开 Vite 显示的 `Local` 地址，通常为 `http://localhost:5173/`。

验证生产构建：

```powershell
npm.cmd run build
```

更完整的连接与故障排查说明见 [AGENTS.md](./AGENTS.md)。
