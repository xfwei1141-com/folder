# GitHub 推送网络与认证问题说明

适用项目：梦魇0 / Nightmare0  
适用场景：Windows CMD / PowerShell 下使用 Git 将本地项目推送到 GitHub 仓库。

---

## 一、当前仓库状态

本项目已经完成本地 Git 初始化，并已成功推送到 GitHub。

当前本地项目路径示例：

```text
D:\OneDrive\Documents\游戏\梦魇0
```

当前远程仓库地址示例：

```text
https://github.com/xfwei1141-com/Nightmare0.git
```

以后正常开发时，不需要重新执行：

```bash
git init
```

也不要重新绑定远程仓库，除非仓库地址发生变化。

---

## 二、正常提交与推送流程

每次修改文件后，按下面顺序操作即可：

```bash
git status
git add .
git commit -m "说明本次修改内容"
git push
```

例如：

```bash
git status
git add .
git commit -m "docs: update project status"
git push
```

如果 `git status` 显示：

```text
nothing to commit, working tree clean
```

说明当前没有需要提交的修改。

---

## 三、本项目曾遇到的特殊问题

第一次推送时出现过如下报错：

```text
fatal: unable to access 'https://github.com/xfwei1141-com/Nightmare0.git/':
Failed to connect to github.com:443
```

或者：

```text
Failed to connect to github.com:443 over proxy 127.0.0.1
```

这类问题不是仓库坏了，也不是提交失败，而是 Git 连接 GitHub 时网络路线不一致。

当时的情况是：

1. 浏览器、curl、Git 的网络路线不完全一致。
2. 加速器 / 代理软件影响了 Git 访问 GitHub。
3. Git 一度尝试走 `127.0.0.1` 代理，但端口不正确或代理服务没有正确响应。
4. GitHub 认证页面显示 `Authentication Succeeded` 后，需要回到 CMD 等待，不要立刻反复输入命令。

---

## 四、判断问题在哪里

### 1. 检查本地仓库是否正常

```bash
git status
```

如果显示：

```text
On branch main
nothing to commit, working tree clean
```

说明本地仓库没有问题。

### 2. 检查远程仓库地址

```bash
git remote -v
```

应当能看到类似：

```text
origin  https://github.com/xfwei1141-com/Nightmare0.git (fetch)
origin  https://github.com/xfwei1141-com/Nightmare0.git (push)
```

### 3. 检查命令行是否能访问 GitHub

```bash
curl -I https://github.com
```

如果返回：

```text
HTTP/1.1 200 OK
```

说明命令行可以访问 GitHub。

如果 `curl` 能访问 GitHub，但 `git push` 失败，通常是 Git 自己的代理配置或认证状态有问题。

---

## 五、代理 / 加速器处理方法

### 情况 A：不开加速器也能访问 GitHub

优先清掉 Git 代理：

```bash
git config --global --unset-all http.proxy
git config --global --unset-all https.proxy
git config --local --unset-all http.proxy
git config --local --unset-all https.proxy
```

如果某一行提示没有该配置，可以忽略。

同时清掉当前 CMD 窗口里的代理环境变量：

```cmd
set HTTP_PROXY=
set HTTPS_PROXY=
set http_proxy=
set https_proxy=
set ALL_PROXY=
set all_proxy=
```

然后测试：

```bash
git ls-remote origin
```

如果没有报错，再执行：

```bash
git push
```

---

### 情况 B：必须开加速器才能访问 GitHub

先查看加速器界面里的本地代理端口。

本项目首次配置时看到的端口是：

```text
mixed:10808
```

所以当时可使用：

```bash
git config --global http.proxy http://127.0.0.1:10808
git config --global https.proxy http://127.0.0.1:10808
```

当前 CMD 窗口也可以临时设置：

```cmd
set HTTP_PROXY=http://127.0.0.1:10808
set HTTPS_PROXY=http://127.0.0.1:10808
set ALL_PROXY=http://127.0.0.1:10808
```

然后测试：

```bash
git ls-remote origin
```

再推送：

```bash
git push
```

注意：不同电脑、不同代理软件的端口可能不一样。不要死记 `10808`，要以自己代理软件显示的本地端口为准。

---

## 六、GitHub 认证说明

使用 HTTPS 推送私有仓库时，GitHub 可能会弹出浏览器认证页面。

如果浏览器显示：

```text
Authentication Succeeded
```

说明认证已经成功。

此时应该：

1. 关闭浏览器认证页。
2. 回到 CMD / PowerShell。
3. 等待几秒钟。
4. 不要立刻反复执行同一个命令。

正常情况下，Git Credential Manager 会记住登录状态，以后不会每次都要求认证。

如果仍然反复要求认证，可以执行：

```bash
git config --global credential.helper manager
```

然后重新执行：

```bash
git push
```

如果仍旧不行，可以在 Windows 中打开：

```text
凭据管理器 → Windows 凭据
```

删除与 GitHub 相关的旧凭据，例如：

```text
git:https://github.com
github.com
GitHub
```

然后重新 push，让 GitHub 重新认证一次。

---

## 七、常见报错解释

| 报错 / 现象 | 含义 | 处理方式 |
|---|---|---|
| `Failed to connect to github.com:443` | Git 连不上 GitHub | 检查网络、代理、加速器 |
| `over proxy 127.0.0.1` | Git 正在走本机代理 | 检查代理端口是否正确，或清除代理 |
| `Authentication Succeeded` | GitHub 认证成功 | 关闭网页，回 CMD 等待 |
| `nothing to commit, working tree clean` | 本地没有未提交修改 | 可以直接 push 或继续开发 |
| `Repository not found` | 仓库地址错误或没有权限 | 检查 GitHub 仓库名、账号、权限 |
| `branch 'main' set up to track 'origin/main'` | 推送成功并建立追踪关系 | 以后直接 `git push` 即可 |

---

## 八、不要做的事

遇到网络或认证问题时，不要随便执行：

```bash
git init
```

不要随便删除 `.git` 文件夹。

不要反复新建 GitHub 仓库。

不要把 `Library/`、`Temp/`、`Logs/` 等 Unity 缓存目录提交到仓库。

不要把账号密码、Token、私人密钥写进项目文件。

---

## 九、推荐排查顺序

如果以后再次推送失败，按这个顺序检查：

```bash
git status
git remote -v
curl -I https://github.com
git ls-remote origin
git push
```

如果报代理问题，再根据是否使用加速器选择：

1. 清掉 Git 代理；或
2. 设置为当前加速器显示的正确本地端口。

---

## 十、一句话总结

本项目的 Git 仓库已经初始化并成功推送。以后正常开发只需要 `git add`、`git commit`、`git push`。如果推送卡住，优先检查代理和 GitHub 认证，不要重新初始化仓库。
