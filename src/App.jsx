import JSZip from 'jszip';
import React, { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import brandTitle from '../图片/folder-doodle-title-vertical.jpg';
import paletteIcon from '../图片/调色盘.jpg';
import thicknessIcon from '../图片/粗和细的线.jpg';
import undoIcon from '../图片/撤回.jpg';
import eraserIcon from '../图片/橡皮.jpg';
import downloadIcon from '../图片/下载.jpg';
import galleryIcon from '../图片/九宫格.jpg';
import avatarIcon from '../图片/人像.jpg';
import nextIcon from '../图片/向右指的箭头.jpg';
import singleStep1Image from '../图片/系统交互图标/换一个的第一步.png';
import singleStep2Image from '../图片/系统交互图标/换一个的第二步：找到目标文件夹并右键找到属性.png';
import singleStep3Image from '../图片/系统交互图标/换一个的第三步：浏览并选中刚刚保存的ico文件.png';
import singleStep4Image from '../图片/系统交互图标/single-step-4.png';
import batchStep1Image from '../图片/系统交互图标/批量换第一步：下载Helper.zip安装包并解压缩.png';
import batchStep2Image from '../图片/系统交互图标/批量换第二步：双击apply.png';
import batchStep3Image from '../图片/系统交互图标/batch-step-3.png';
import refreshStep1Image from '../图片/系统交互图标/换新图标的第一步：下载新图标的ico.png';
import refreshStep2Image from '../图片/系统交互图标/换新图标的第二步：替换ico文件.png';
import refreshStep3Image from '../图片/系统交互图标/换新图标的重要第三步：重命名为 current！！！.png';
import refreshStep4Image from '../图片/系统交互图标/refresh-step-4.png';
import cursorStep1Image from '../图片/鼠标区/cursor-step-1.png';
import cursorStep2Image from '../图片/鼠标区/cursor-step-2.png';
import cursorStep3Image from '../图片/鼠标区/cursor-step-3.png';
import cursorStep4Image from '../图片/鼠标区/cursor-step-4.png';

const CANVAS_SIZE = 256;
const CURSOR_HOTSPOT = 24;
const HELPER_FOLDER_NAME = 'FolderDoodle_Helper';
const CANVAS_TYPES = [
  {
    id: 'folder',
    label: '文件夹图标',
  },
  {
    id: 'cursor',
    label: '鼠标指针',
  },
];
const DESKTOP_FOLDER_NAMES = ['项目文件夹', '游戏文件夹', '学习文件夹', '图片文件夹'];
const folderContributionImageModules = import.meta.glob(
  '../图片/网友贡献图片/*.{png,jpg,jpeg,webp}',
  { eager: true, import: 'default' },
);
const cursorContributionImageModules = import.meta.glob(
  '../图片/鼠标官方展示/*.{png,jpg,jpeg,webp}',
  { eager: true, import: 'default' },
);
const TUTORIAL_TABS = [
  {
    id: 'single',
    label: '换一个',
    steps: [
      {
        label: 'Step 1',
        title: '下载 ICO',
        description: '下载刚刚画好的 ICO 图标。',
        image: singleStep1Image,
      },
      {
        label: 'Step 2',
        title: '打开文件夹属性',
        description: '右键想换装的文件夹，打开“属性”。',
        image: singleStep2Image,
      },
      {
        label: 'Step 3',
        title: '选择 ICO',
        description: '进入“自定义”，浏览并选中刚下载的 ICO。',
        image: singleStep3Image,
      },
      {
        label: 'Step 4',
        title: '确认并应用',
        description: '点击“应用”和“确定”，完成替换。',
        image: singleStep4Image,
      },
    ],
  },
  {
    id: 'batch',
    label: '批量换',
    tip: '小提示：图标批量替换后，Windows 可能不会立刻刷新显示。如果没有马上变样子，可以耐心等几分钟，再刷新桌面几次。它不是失败了，只是系统反应有点慢～',
    steps: [
      {
        label: 'Step 1',
        title: '下载并解压 Helper',
        description: '下载 Helper.zip，并把压缩包完整解压。',
        image: batchStep1Image,
      },
      {
        label: 'Step 2',
        title: '双击 Apply',
        description: '打开 Helper 文件夹，双击 Apply。',
        image: batchStep2Image,
      },
      {
        label: 'Step 3',
        title: '选择应用范围',
        description: '输入 1 或 2 并回车，完成后刷新桌面。',
        image: batchStep3Image,
      },
    ],
  },
  {
    id: 'refresh',
    label: '换新图标',
    tip: '小提示：图标批量替换后，Windows 可能不会立刻刷新显示。如果没有马上变样子，可以耐心等几分钟，再刷新桌面几次。它不是失败了，只是系统反应有点慢～',
    steps: [
      {
        label: 'Step 1',
        title: '下载新的 ICO',
        description: '重新绘制并下载新的 ICO 图标。',
        image: refreshStep1Image,
      },
      {
        label: 'Step 2',
        title: '替换 ICO 文件',
        description: '打开 Helper 的 icons 文件夹，放入新 ICO。',
        image: refreshStep2Image,
      },
      {
        label: 'Step 3',
        title: '重命名为 current',
        description: '把新图标重命名为 current，不用加.ico。',
        image: refreshStep3Image,
      },
      {
        label: 'Step 4',
        title: '重新应用',
        description: '双击 Apply，按批量换流程完成并刷新桌面。',
        image: refreshStep4Image,
      },
    ],
  },
];

const CURSOR_TUTORIAL_TABS = [
  {
    id: 'cursor',
    label: '鼠标指针',
    tip: '小提示：这里不会自动修改系统鼠标。下载的是 .cur 指针文件，你可以在 Windows 设置里手动选择，想恢复时也可以换回系统默认方案。',
    steps: [
      {
        label: 'Step 1',
        title: '下载 CUR',
        description: '切到“鼠标指针”画布，画好后点击“下载 CUR”，把指针文件保存到电脑里。',
        image: cursorStep1Image,
      },
      {
        label: 'Step 2',
        title: '进入鼠标设置',
        description: '打开 Windows 设置，进入“蓝牙和设备”，再点击“鼠标”。',
        image: cursorStep2Image,
      },
      {
        label: 'Step 3',
        title: '打开其他鼠标设置',
        description: '在鼠标页面里找到“其他鼠标设置”，打开传统鼠标属性窗口。',
        image: cursorStep3Image,
      },
      {
        label: 'Step 4',
        title: '选择本地 CUR',
        description: '切到“指针”标签，选择要替换的状态，点击“浏览”并选中刚下载的 .cur 文件，最后应用。',
        image: cursorStep4Image,
      },
    ],
  },
];

const TUTORIAL_GROUPS = [
  {
    id: 'folder',
    label: '换文件夹',
    tabs: TUTORIAL_TABS,
  },
  {
    id: 'cursor',
    label: '换鼠标样子',
    tabs: CURSOR_TUTORIAL_TABS,
  },
];
const GALLERY_GROUPS = [
  {
    id: 'folder',
    label: '文件夹',
  },
  {
    id: 'cursor',
    label: '鼠标',
  },
];
const GALLERY_PAGE_SIZE = 8;

const getContributionBaseName = (path) =>
  decodeURIComponent(path.split('/').pop().replace(/\.[^.]+$/, ''));

const getContributionMeta = (path) => {
  const baseName = getContributionBaseName(path);
  const [rawAuthor, rawName] = baseName.split('+');
  const author = rawAuthor?.trim() || '无';
  const name = rawName?.trim() || `${author}投稿作品`;

  return { author, name, baseName };
};

const createGalleryItems = (imageModules, fileExtension) =>
  Object.entries(imageModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, 'zh-Hans-CN'))
    .map(([path, imageUrl]) => {
      const { author, name, baseName } = getContributionMeta(path);

      return {
        id: path,
        name,
        author,
        imageUrl,
        filename: `${baseName}.${fileExtension}`,
        isPlaceholder: false,
      };
    });

const FOLDER_GALLERY_ITEMS = createGalleryItems(folderContributionImageModules, 'ico');
const CURSOR_GALLERY_ITEMS = createGalleryItems(cursorContributionImageModules, 'cur');

const GALLERY_ITEMS_BY_TYPE = {
  folder: FOLDER_GALLERY_ITEMS,
  cursor: CURSOR_GALLERY_ITEMS,
};

const GALLERY_EMPTY_NOTES = {
  folder: '也想分享你的作品？小红书@“2016763850”账号的帖子吧！',
  cursor: '鼠标展示区已经分出来啦。这里会只收录鼠标指针作品，不会混用文件夹图标。',
};

const GALLERY_PLACEHOLDER_TEXT = {
  folder: '文件夹作品待收录',
  cursor: '鼠标作品待收录',
};

const applyBatContent = String.raw`@echo off
chcp 65001 >nul
set "SCRIPT=%TEMP%\FolderDoodle_Apply_%RANDOM%.ps1"
set "BAT_FILE=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$content = Get-Content -LiteralPath $env:BAT_FILE -Raw -Encoding UTF8; $script = ($content -split '# POWERSHELL_SCRIPT_START\r?\n', 2)[1]; Set-Content -LiteralPath $env:SCRIPT -Value $script -Encoding UTF8"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%" -HelperDir "%~dp0."
set "FD_EXIT=%ERRORLEVEL%"
del "%SCRIPT%" >nul 2>nul
pause
exit /b %FD_EXIT%
# POWERSHELL_SCRIPT_START
param([string]$HelperDir)

$ErrorActionPreference = 'Stop'
$iconFilePattern = '.folder-doodle-icon*.ico'
$markerLine = '; FolderDoodleManaged=1'
$previousPrefix = '; FolderDoodlePreviousIconResource='

function Get-DesktopPath {
  $desktop = [Environment]::GetFolderPath('Desktop')
  if ([string]::IsNullOrWhiteSpace($desktop) -or -not (Test-Path -LiteralPath $desktop)) {
    throw '无法定位当前用户桌面路径。'
  }
  return $desktop
}

function Test-IsInHelperFolder([string]$Path) {
  $fullPath = (Resolve-Path -LiteralPath $Path).Path.TrimEnd('\')
  return $fullPath.Equals($script:helperRoot, [StringComparison]::OrdinalIgnoreCase) -or
    $fullPath.StartsWith($script:helperRoot + '\', [StringComparison]::OrdinalIgnoreCase)
}

function Get-TargetFolders([string]$DesktopPath, [string]$Mode) {
  $targets = New-Object System.Collections.Generic.List[string]
  $topFolders = Get-ChildItem -LiteralPath $DesktopPath -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) }

  foreach ($folder in $topFolders) {
    if (Test-IsInHelperFolder $folder.FullName) {
      continue
    }

    [void]$targets.Add($folder.FullName)

    if ($Mode -eq '2') {
      Get-ChildItem -LiteralPath $folder.FullName -Directory -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) } |
        ForEach-Object {
          if (-not (Test-IsInHelperFolder $_.FullName)) {
            [void]$targets.Add($_.FullName)
          }
        }
    }
  }

  return $targets
}

function Read-IniLines([string]$IniPath) {
  $lines = New-Object System.Collections.Generic.List[string]
  if (Test-Path -LiteralPath $IniPath) {
    $content = Get-Content -LiteralPath $IniPath
    foreach ($line in @($content)) {
      [void]$lines.Add([string]$line)
    }
  }
  Write-Output -NoEnumerate $lines
}

function Get-ShellSectionBounds([System.Collections.Generic.List[string]]$Lines) {
  $start = -1
  for ($i = 0; $i -lt $Lines.Count; $i += 1) {
    if ($Lines[$i] -eq '[.ShellClassInfo]') {
      $start = $i
      break
    }
  }

  if ($start -lt 0) {
    return @{ Start = -1; End = -1 }
  }

  $end = $Lines.Count
  for ($i = $start + 1; $i -lt $Lines.Count; $i += 1) {
    if ($Lines[$i] -match '^\[') {
      $end = $i
      break
    }
  }

  return @{ Start = $start; End = $end }
}

function Ensure-ShellSection([System.Collections.Generic.List[string]]$Lines) {
  $bounds = Get-ShellSectionBounds $Lines
  if ($bounds.Start -ge 0) {
    return $bounds
  }

  if ($Lines.Count -gt 0 -and $Lines[$Lines.Count - 1].Trim() -ne '') {
    [void]$Lines.Add('')
  }
  [void]$Lines.Add('[.ShellClassInfo]')
  return @{ Start = $Lines.Count - 1; End = $Lines.Count }
}

function Find-InSection([System.Collections.Generic.List[string]]$Lines, $Bounds, [scriptblock]$Predicate) {
  for ($i = $Bounds.Start + 1; $i -lt $Bounds.End; $i += 1) {
    if (& $Predicate $Lines[$i]) {
      return $i
    }
  }
  return -1
}

function Invoke-AttribChecked([string[]]$Arguments, [string]$StepName) {
  & attrib @Arguments 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -ne 0) {
    throw "$StepName 失败，attrib 退出码：$LASTEXITCODE"
  }
}

function Get-IconSource([string]$HelperRoot) {
  $iconsDir = Join-Path $HelperRoot 'icons'
  if (-not (Test-Path -LiteralPath $iconsDir)) {
    throw ('没有找到 ico 图标文件。' + [Environment]::NewLine + '请先把从网页下载的 ico 文件放进 icons 文件夹。')
  }

  $icons = @(Get-ChildItem -LiteralPath $iconsDir -Filter '*.ico' -File -Force -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending)

  if ($icons.Count -eq 0) {
    throw ('没有找到 ico 图标文件。' + [Environment]::NewLine + '请先把从网页下载的 ico 文件放进 icons 文件夹。')
  }

  return $icons[0].FullName
}

function Remove-OldFolderDoodleIcons([string]$FolderPath) {
  $oldIcons = @(Get-ChildItem -LiteralPath $FolderPath -Filter $script:iconFilePattern -File -Force -ErrorAction SilentlyContinue)
  if ($oldIcons.Count -eq 0) {
    Write-Host '删除旧图标文件：未找到旧图标，无需删除'
    return
  }

  Write-Host "删除旧图标文件：发现 $($oldIcons.Count) 个"
  foreach ($oldIcon in $oldIcons) {
    Write-Host "删除旧图标文件：$($oldIcon.FullName)"
    try {
      Invoke-AttribChecked @('-h', '-s', $oldIcon.FullName) '取消旧图标隐藏/系统属性'
      Remove-Item -LiteralPath $oldIcon.FullName -Force
      Write-Host '删除旧图标文件：成功'
    } catch {
      Write-Host "删除旧图标文件：失败，$($_.Exception.Message)"
      throw
    }
  }
}

function Apply-FolderDoodleIcon([string]$FolderPath, [string]$IconSource, [string]$NewIconFileName) {
  Write-Host ''
  Write-Host "正在处理：$FolderPath"
  Write-Host "当前使用图标：$IconSource"
  Write-Host "生成的新目标图标文件名：$NewIconFileName"

  Remove-OldFolderDoodleIcons $FolderPath

  $targetIconPath = Join-Path $FolderPath $NewIconFileName
  Write-Host "复制新图标：$targetIconPath"
  try {
    Copy-Item -LiteralPath $IconSource -Destination $targetIconPath -Force
    if (-not (Test-Path -LiteralPath $targetIconPath)) {
      throw '复制后未找到目标 ico 文件。'
    }
    Write-Host '复制新图标：成功'
  } catch {
    Write-Host "复制新图标：失败，$($_.Exception.Message)"
    throw
  }

  Write-Host '新图标属性：隐藏 + 系统'
  try {
    Invoke-AttribChecked @('+h', '+s', $targetIconPath) '设置 ico 隐藏/系统属性'
    Write-Host '新图标属性：成功'
  } catch {
    Write-Host "新图标属性：失败，$($_.Exception.Message)"
    throw
  }

  $iniPath = Join-Path $FolderPath 'desktop.ini'
  $backupPath = Join-Path $FolderPath 'desktop.ini.folderdoodle.bak'
  if (Test-Path -LiteralPath $iniPath) {
    Write-Host '备份 desktop.ini：检查已有配置'
    try {
      Invoke-AttribChecked @('-h', '-s', $iniPath) '取消 desktop.ini 隐藏/系统属性'
      $existingIni = Get-Content -LiteralPath $iniPath -Raw -ErrorAction SilentlyContinue
      $isFolderDoodleIni = $existingIni -and $existingIni.Contains($script:markerLine)
      if (-not $isFolderDoodleIni -and -not (Test-Path -LiteralPath $backupPath)) {
        Copy-Item -LiteralPath $iniPath -Destination $backupPath -Force
        Invoke-AttribChecked @('+h', '+s', $backupPath) '设置 desktop.ini 备份隐藏/系统属性'
        Write-Host '备份 desktop.ini：成功'
      } elseif ($isFolderDoodleIni) {
        Write-Host '备份 desktop.ini：当前配置由 Folder Doodle 管理，无需重复备份'
      } else {
        Write-Host '备份 desktop.ini：备份已存在，保留原备份'
      }
    } catch {
      Write-Host "备份 desktop.ini：失败，$($_.Exception.Message)"
      throw
    }
  }

  Write-Host "写入 desktop.ini：$iniPath"
  try {
    $iniContent = @(
      '[.ShellClassInfo]'
      $script:markerLine
      "IconResource=$targetIconPath,0"
      "IconFile=$NewIconFileName"
      'IconIndex=0'
    )
    Set-Content -LiteralPath $iniPath -Value $iniContent -Encoding Unicode -Force
    if (-not (Test-Path -LiteralPath $iniPath)) {
      throw '写入后未找到 desktop.ini。'
    }
    Write-Host '写入 desktop.ini：成功'
  } catch {
    Write-Host "写入 desktop.ini：失败，$($_.Exception.Message)"
    throw
  }

  Write-Host 'desktop.ini 属性：隐藏 + 系统'
  try {
    Invoke-AttribChecked @('+h', '+s', $iniPath) '设置 desktop.ini 隐藏/系统属性'
    Write-Host 'desktop.ini 属性：成功'
  } catch {
    Write-Host "desktop.ini 属性：失败，$($_.Exception.Message)"
    throw
  }

  Write-Host '文件夹属性：只读 + 系统'
  try {
    Invoke-AttribChecked @('+r', '+s', $FolderPath) '设置目标文件夹只读/系统属性'
    Write-Host '文件夹属性：成功'
  } catch {
    Write-Host "文件夹属性：失败，$($_.Exception.Message)"
    throw
  }
}

function Refresh-IconCache {
  Write-Host ''
  Write-Host '刷新图标缓存：正在尝试 ie4uinit.exe -show'
  try {
    $ie4uinit = Get-Command 'ie4uinit.exe' -ErrorAction SilentlyContinue
    if ($null -eq $ie4uinit) {
      Write-Host '刷新图标缓存：系统中未找到 ie4uinit.exe，请手动刷新桌面'
      return
    }
    & $ie4uinit.Path -show 2>&1 | ForEach-Object { Write-Host $_ }
    Write-Host '刷新图标缓存：已尝试完成'
  } catch {
    Write-Host "刷新图标缓存：尝试失败，$($_.Exception.Message)"
  }
}

try {
  $helperRoot = (Resolve-Path -LiteralPath $HelperDir).Path.TrimEnd('\')
  $desktopPath = Get-DesktopPath
  $iconSource = Get-IconSource $helperRoot
  $newIconFileName = ".folder-doodle-icon-$(Get-Date -Format 'yyyyMMdd-HHmmss-fff').ico"
  $relativeIconSource = $iconSource
  if ($iconSource.StartsWith($helperRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
    $relativeIconSource = $iconSource.Substring($helperRoot.Length + 1)
  }

  Write-Host ''
  Write-Host '当前使用图标：'
  Write-Host $relativeIconSource
  Write-Host "本次生成的新目标图标文件名：$newIconFileName"

  Write-Host ''
  Write-Host '请选择应用范围：'
  Write-Host '1. 只应用到桌面上的一级文件夹'
  Write-Host '2. 应用到桌面上的一级文件夹及其内部所有子文件夹'
  $mode = Read-Host '请输入 1 或 2'

  if ($mode -ne '1' -and $mode -ne '2') {
    Write-Host '输入无效，已取消。'
    exit 1
  }

  $targets = Get-TargetFolders $desktopPath $mode
  $successCount = 0
  $failedCount = 0

  foreach ($target in $targets) {
    try {
      Apply-FolderDoodleIcon $target $iconSource $newIconFileName
      $successCount += 1
    } catch {
      $failedCount += 1
      Write-Host "跳过：$target"
      Write-Host "失败原因：$($_.Exception.Message)"
    }
  }

  Write-Host ''
  Write-Host "已完成：$successCount 个文件夹。"
  if ($failedCount -gt 0) {
    Write-Host "有 $failedCount 个文件夹未能处理，通常是权限或路径占用导致。"
  }
  Refresh-IconCache
  Write-Host '已完成批量应用。'
  Write-Host '如果桌面文件夹没有立刻全部变成新图标，请不要着急。'
  Write-Host 'Windows 图标刷新有时需要一点时间。'
  Write-Host '可以等待几分钟后，右键桌面刷新几次。'
  Write-Host '也可以先去忙别的事情，稍后再回来查看。'
  Write-Host '如果仍未变化，可以尝试重启 Windows 资源管理器。'
} catch {
  Write-Host ''
  Write-Host "执行失败：$($_.Exception.Message)"
  exit 1
}
`;

const restoreBatContent = String.raw`@echo off
chcp 65001 >nul
set "SCRIPT=%TEMP%\FolderDoodle_Restore_%RANDOM%.ps1"
set "BAT_FILE=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$content = Get-Content -LiteralPath $env:BAT_FILE -Raw -Encoding UTF8; $script = ($content -split '# POWERSHELL_SCRIPT_START\r?\n', 2)[1]; Set-Content -LiteralPath $env:SCRIPT -Value $script -Encoding UTF8"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%" -HelperDir "%~dp0."
set "FD_EXIT=%ERRORLEVEL%"
del "%SCRIPT%" >nul 2>nul
pause
exit /b %FD_EXIT%
# POWERSHELL_SCRIPT_START
param([string]$HelperDir)

$ErrorActionPreference = 'Stop'
$iconFilePattern = '.folder-doodle-icon*.ico'
$markerLine = '; FolderDoodleManaged=1'
$previousPrefix = '; FolderDoodlePreviousIconResource='

function Get-DesktopPath {
  $desktop = [Environment]::GetFolderPath('Desktop')
  if ([string]::IsNullOrWhiteSpace($desktop) -or -not (Test-Path -LiteralPath $desktop)) {
    throw '无法定位当前用户桌面路径。'
  }
  return $desktop
}

function Test-IsInHelperFolder([string]$Path) {
  $fullPath = (Resolve-Path -LiteralPath $Path).Path.TrimEnd('\')
  return $fullPath.Equals($script:helperRoot, [StringComparison]::OrdinalIgnoreCase) -or
    $fullPath.StartsWith($script:helperRoot + '\', [StringComparison]::OrdinalIgnoreCase)
}

function Get-TargetFolders([string]$DesktopPath, [string]$Mode) {
  $targets = New-Object System.Collections.Generic.List[string]
  $topFolders = Get-ChildItem -LiteralPath $DesktopPath -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) }

  foreach ($folder in $topFolders) {
    if (Test-IsInHelperFolder $folder.FullName) {
      continue
    }

    [void]$targets.Add($folder.FullName)

    if ($Mode -eq '2') {
      Get-ChildItem -LiteralPath $folder.FullName -Directory -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) } |
        ForEach-Object {
          if (-not (Test-IsInHelperFolder $_.FullName)) {
            [void]$targets.Add($_.FullName)
          }
        }
    }
  }

  return $targets
}

function Read-IniLines([string]$IniPath) {
  $lines = New-Object System.Collections.Generic.List[string]
  if (Test-Path -LiteralPath $IniPath) {
    $content = Get-Content -LiteralPath $IniPath
    foreach ($line in @($content)) {
      [void]$lines.Add([string]$line)
    }
  }
  Write-Output -NoEnumerate $lines
}

function Get-ShellSectionBounds([System.Collections.Generic.List[string]]$Lines) {
  $start = -1
  for ($i = 0; $i -lt $Lines.Count; $i += 1) {
    if ($Lines[$i] -eq '[.ShellClassInfo]') {
      $start = $i
      break
    }
  }

  if ($start -lt 0) {
    return @{ Start = -1; End = -1 }
  }

  $end = $Lines.Count
  for ($i = $start + 1; $i -lt $Lines.Count; $i += 1) {
    if ($Lines[$i] -match '^\[') {
      $end = $i
      break
    }
  }

  return @{ Start = $start; End = $end }
}

function Ensure-ShellSection([System.Collections.Generic.List[string]]$Lines) {
  $bounds = Get-ShellSectionBounds $Lines
  if ($bounds.Start -ge 0) {
    return $bounds
  }

  if ($Lines.Count -gt 0 -and $Lines[$Lines.Count - 1].Trim() -ne '') {
    [void]$Lines.Add('')
  }
  [void]$Lines.Add('[.ShellClassInfo]')
  return @{ Start = $Lines.Count - 1; End = $Lines.Count }
}

function Find-InSection([System.Collections.Generic.List[string]]$Lines, $Bounds, [scriptblock]$Predicate) {
  if ($Bounds.Start -lt 0) {
    return -1
  }

  for ($i = $Bounds.Start + 1; $i -lt $Bounds.End; $i += 1) {
    if (& $Predicate $Lines[$i]) {
      return $i
    }
  }
  return -1
}

function Test-HasMeaningfulIniContent([System.Collections.Generic.List[string]]$Lines) {
  foreach ($line in $Lines) {
    $trimmed = $line.Trim()
    if ($trimmed -eq '' -or $trimmed.StartsWith(';') -or $trimmed -match '^\[.*\]$') {
      continue
    }
    return $true
  }
  return $false
}

function Remove-FolderDoodleIconFiles([string]$FolderPath) {
  $icons = @(Get-ChildItem -LiteralPath $FolderPath -Filter $script:iconFilePattern -File -Force -ErrorAction SilentlyContinue)
  if ($icons.Count -eq 0) {
    Write-Host '删除 Folder Doodle 图标：未找到，无需删除'
    return
  }

  Write-Host "删除 Folder Doodle 图标：发现 $($icons.Count) 个"
  foreach ($icon in $icons) {
    Write-Host "删除 Folder Doodle 图标：$($icon.FullName)"
    & attrib -h -s $icon.FullName 2>$null
    Remove-Item -LiteralPath $icon.FullName -Force
  }
  Write-Host '删除 Folder Doodle 图标：成功'
}

function Restore-FolderDoodleIcon([string]$FolderPath) {
  Write-Host ''
  Write-Host "正在恢复：$FolderPath"

  Remove-FolderDoodleIconFiles $FolderPath

  $iniPath = Join-Path $FolderPath 'desktop.ini'
  $backupPath = Join-Path $FolderPath 'desktop.ini.folderdoodle.bak'

  if (Test-Path -LiteralPath $backupPath) {
    Write-Host '恢复 desktop.ini：找到原配置备份'
    if (Test-Path -LiteralPath $iniPath) {
      & attrib -h -s $iniPath 2>$null
      Remove-Item -LiteralPath $iniPath -Force
    }
    & attrib -h -s $backupPath 2>$null
    Move-Item -LiteralPath $backupPath -Destination $iniPath -Force
    & attrib +h +s $iniPath 2>$null
    & attrib -s +r $FolderPath 2>$null
    Write-Host '恢复 desktop.ini：原配置已恢复'
    return
  }

  if (-not (Test-Path -LiteralPath $iniPath)) {
    Write-Host '恢复 desktop.ini：没有配置文件，无需处理'
    & attrib -r -s $FolderPath 2>$null
    return
  }

  & attrib -h -s $iniPath 2>$null
  $iniContent = Get-Content -LiteralPath $iniPath -Raw -ErrorAction SilentlyContinue
  if ($iniContent -and $iniContent.Contains($script:markerLine)) {
    Remove-Item -LiteralPath $iniPath -Force
    & attrib -r -s $FolderPath 2>$null
    Write-Host '恢复 desktop.ini：已删除 Folder Doodle 配置'
    return
  }

  & attrib +h +s $iniPath 2>$null
  Write-Host '恢复 desktop.ini：不是 Folder Doodle 配置，已保留'
}

function Refresh-IconCache {
  Write-Host ''
  Write-Host '刷新图标缓存：正在尝试 ie4uinit.exe -show'
  try {
    $ie4uinit = Get-Command 'ie4uinit.exe' -ErrorAction SilentlyContinue
    if ($null -eq $ie4uinit) {
      Write-Host '刷新图标缓存：系统中未找到 ie4uinit.exe，请手动刷新桌面'
      return
    }
    & $ie4uinit.Path -show 2>&1 | ForEach-Object { Write-Host $_ }
    Write-Host '刷新图标缓存：已尝试完成'
  } catch {
    Write-Host "刷新图标缓存：尝试失败，$($_.Exception.Message)"
  }
}

try {
  $helperRoot = (Resolve-Path -LiteralPath $HelperDir).Path.TrimEnd('\')
  $desktopPath = Get-DesktopPath

  Write-Host ''
  Write-Host '请选择恢复范围：'
  Write-Host '1. 只恢复桌面上的一级文件夹'
  Write-Host '2. 恢复桌面上的一级文件夹及其内部所有子文件夹'
  $mode = Read-Host '请输入 1 或 2'

  if ($mode -ne '1' -and $mode -ne '2') {
    Write-Host '输入无效，已取消。'
    exit 1
  }

  $targets = Get-TargetFolders $desktopPath $mode
  $successCount = 0
  $failedCount = 0

  foreach ($target in $targets) {
    try {
      Restore-FolderDoodleIcon $target
      $successCount += 1
    } catch {
      $failedCount += 1
      Write-Host "跳过：$target"
      Write-Host "失败原因：$($_.Exception.Message)"
    }
  }

  Write-Host ''
  Write-Host "已完成恢复：$successCount 个文件夹。"
  if ($failedCount -gt 0) {
    Write-Host "有 $failedCount 个文件夹未能处理，通常是权限或路径占用导致。"
  }
  Refresh-IconCache
  Write-Host '已恢复默认文件夹图标，请刷新桌面。'
  Write-Host '如果图标没有立即变化：'
  Write-Host '1. 右键桌面刷新'
  Write-Host '2. 或重启 Windows 资源管理器'
} catch {
  Write-Host ''
  Write-Host "执行失败：$($_.Exception.Message)"
  exit 1
}
`;

const helperReadmeContent = `Folder Doodle Helper 使用说明

一、第一次使用
1. 解压 FolderDoodle_Helper.zip。
2. 打开解压后的 FolderDoodle_Helper 文件夹。
3. 双击 Apply.bat。
4. 按提示选择应用范围。
5. 完成后刷新桌面。

二、恢复默认
1. 双击 Restore.bat。
2. 按提示选择恢复范围。
3. 完成后刷新桌面。

三、已经下载过 Helper，想换新图标
1. 在网页上重新绘制新图标。
2. 点击“下载 ICO”。
3. 打开 FolderDoodle_Helper/icons 文件夹。
4. 把新下载的 ico 文件放进去。
5. 双击 Apply.bat。
6. Helper 会自动使用 icons 文件夹中最新的 ico 文件。

常见情况：
如果运行 Apply.bat 后，文件夹图标没有马上变化，这是正常现象。
Windows 可能需要一点时间刷新图标缓存。
请等待几分钟，并尝试右键桌面刷新。
如果还是没有变化，可以重启 Windows 资源管理器。`;

const toWindowsText = (text) => text.trim().replace(/\r?\n/g, '\r\n');

function DoodleAsset({ src, alt = '', className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = new Image();

    image.onload = () => {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      const pixelCount = canvas.width * canvas.height;
      const visited = new Uint8Array(pixelCount);
      const queue = new Int32Array(pixelCount);
      let queueStart = 0;
      let queueEnd = 0;
      const background = [data[0], data[1], data[2]];

      const isBackground = (pixelIndex) => {
        const offset = pixelIndex * 4;
        const red = data[offset] - background[0];
        const green = data[offset + 1] - background[1];
        const blue = data[offset + 2] - background[2];
        return red * red + green * green + blue * blue < 10000;
      };

      const addPixel = (pixelIndex) => {
        if (
          pixelIndex < 0 ||
          pixelIndex >= pixelCount ||
          visited[pixelIndex] ||
          !isBackground(pixelIndex)
        ) {
          return;
        }

        visited[pixelIndex] = 1;
        queue[queueEnd] = pixelIndex;
        queueEnd += 1;
      };

      for (let x = 0; x < canvas.width; x += 1) {
        addPixel(x);
        addPixel((canvas.height - 1) * canvas.width + x);
      }

      for (let y = 0; y < canvas.height; y += 1) {
        addPixel(y * canvas.width);
        addPixel(y * canvas.width + canvas.width - 1);
      }

      while (queueStart < queueEnd) {
        const pixelIndex = queue[queueStart];
        const x = pixelIndex % canvas.width;
        queueStart += 1;

        if (x > 0) addPixel(pixelIndex - 1);
        if (x < canvas.width - 1) addPixel(pixelIndex + 1);
        addPixel(pixelIndex - canvas.width);
        addPixel(pixelIndex + canvas.width);
      }

      for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
        if (visited[pixelIndex]) {
          data[pixelIndex * 4 + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
    };

    image.src = src;
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={`doodle-asset ${className}`.trim()}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : 'true'}
    />
  );
}

function DoodleHeading({ alt, className = '' }) {
  return (
    <h2 className={`doodle-heading ${className}`.trim()}>{alt}</h2>
  );
}

function ToolIcon({ src, alt = '' }) {
  return <DoodleAsset src={src} alt={alt} className="tool-icon" />;
}

const traceFolderShape = (context) => {
  context.beginPath();
  context.moveTo(28, 72);
  context.lineTo(28, 56);
  context.quadraticCurveTo(28, 48, 36, 48);
  context.lineTo(94, 48);
  context.lineTo(118, 70);
  context.lineTo(220, 70);
  context.quadraticCurveTo(228, 70, 228, 78);
  context.lineTo(228, 200);
  context.quadraticCurveTo(228, 208, 220, 208);
  context.lineTo(36, 208);
  context.quadraticCurveTo(28, 208, 28, 200);
  context.closePath();
};

const drawCursorHotspotGuide = (context) => {
  context.save();
  context.strokeStyle = 'rgba(120, 71, 80, 0.24)';
  context.fillStyle = 'rgba(120, 71, 80, 0.28)';
  context.lineWidth = 2;
  context.setLineDash([5, 6]);
  context.beginPath();
  context.moveTo(CURSOR_HOTSPOT, 0);
  context.lineTo(CURSOR_HOTSPOT, CANVAS_SIZE);
  context.moveTo(0, CURSOR_HOTSPOT);
  context.lineTo(CANVAS_SIZE, CURSOR_HOTSPOT);
  context.stroke();
  context.setLineDash([]);
  context.beginPath();
  context.arc(CURSOR_HOTSPOT, CURSOR_HOTSPOT, 5, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  context.lineWidth = 2;
  context.stroke();
  context.restore();
};

const canvasToPngBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('无法生成 PNG 图片'));
      }
    }, 'image/png');
  });

const createIcoBlob = async (canvas) => {
  const pngBlob = await canvasToPngBlob(canvas);
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const headerSize = 22;
  const icoBuffer = new ArrayBuffer(headerSize + pngBytes.length);
  const view = new DataView(icoBuffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  view.setUint8(6, 0);
  view.setUint8(7, 0);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, pngBytes.length, true);
  view.setUint32(18, headerSize, true);
  new Uint8Array(icoBuffer, headerSize).set(pngBytes);

  return new Blob([icoBuffer], { type: 'image/x-icon' });
};

const createCursorBlob = async (
  canvas,
  hotspotX = CURSOR_HOTSPOT,
  hotspotY = CURSOR_HOTSPOT,
) => {
  const pngBlob = await canvasToPngBlob(canvas);
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const headerSize = 22;
  const cursorBuffer = new ArrayBuffer(headerSize + pngBytes.length);
  const view = new DataView(cursorBuffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 2, true);
  view.setUint16(4, 1, true);
  view.setUint8(6, 0);
  view.setUint8(7, 0);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, hotspotX, true);
  view.setUint16(12, hotspotY, true);
  view.setUint32(14, pngBytes.length, true);
  view.setUint32(18, headerSize, true);
  new Uint8Array(cursorBuffer, headerSize).set(pngBytes);

  return new Blob([cursorBuffer], { type: 'image/x-icon' });
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片加载失败，无法生成 ICO'));
    image.src = src;
  });

const removeConnectedEdgeBackground = (canvas) => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const pixelCount = canvas.width * canvas.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let queueStart = 0;
  let queueEnd = 0;
  const background = [data[0], data[1], data[2]];

  const isBackground = (pixelIndex) => {
    const offset = pixelIndex * 4;
    const red = data[offset] - background[0];
    const green = data[offset + 1] - background[1];
    const blue = data[offset + 2] - background[2];

    return red * red + green * green + blue * blue < 10000;
  };

  const addPixel = (pixelIndex) => {
    if (
      pixelIndex < 0 ||
      pixelIndex >= pixelCount ||
      visited[pixelIndex] ||
      !isBackground(pixelIndex)
    ) {
      return;
    }

    visited[pixelIndex] = 1;
    queue[queueEnd] = pixelIndex;
    queueEnd += 1;
  };

  for (let x = 0; x < canvas.width; x += 1) {
    addPixel(x);
    addPixel((canvas.height - 1) * canvas.width + x);
  }

  for (let y = 0; y < canvas.height; y += 1) {
    addPixel(y * canvas.width);
    addPixel(y * canvas.width + canvas.width - 1);
  }

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart];
    const x = pixelIndex % canvas.width;

    queueStart += 1;

    if (x > 0) addPixel(pixelIndex - 1);
    if (x < canvas.width - 1) addPixel(pixelIndex + 1);
    addPixel(pixelIndex - canvas.width);
    addPixel(pixelIndex + canvas.width);
  }

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (visited[pixelIndex]) {
      data[pixelIndex * 4 + 3] = 0;
    }
  }

  context.putImageData(imageData, 0, 0);
};

const createGalleryIcoBlob = async (imageUrl) => {
  const image = await loadImage(imageUrl);
  const sourceCanvas = document.createElement('canvas');
  const sourceContext = sourceCanvas.getContext('2d');

  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  sourceContext.drawImage(image, 0, 0);
  removeConnectedEdgeBackground(sourceCanvas);

  const iconCanvas = document.createElement('canvas');
  const iconContext = iconCanvas.getContext('2d');
  const scale = Math.min(
    CANVAS_SIZE / sourceCanvas.width,
    CANVAS_SIZE / sourceCanvas.height,
  );
  const width = sourceCanvas.width * scale;
  const height = sourceCanvas.height * scale;
  const x = (CANVAS_SIZE - width) / 2;
  const y = (CANVAS_SIZE - height) / 2;

  iconCanvas.width = CANVAS_SIZE;
  iconCanvas.height = CANVAS_SIZE;
  iconContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  iconContext.imageSmoothingEnabled = true;
  iconContext.imageSmoothingQuality = 'high';
  iconContext.drawImage(sourceCanvas, x, y, width, height);

  return createIcoBlob(iconCanvas);
};

const createGalleryCursorBlob = async (imageUrl) => {
  const image = await loadImage(imageUrl);
  const sourceCanvas = document.createElement('canvas');
  const sourceContext = sourceCanvas.getContext('2d');

  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  sourceContext.drawImage(image, 0, 0);
  removeConnectedEdgeBackground(sourceCanvas);

  const cursorCanvas = document.createElement('canvas');
  const cursorContext = cursorCanvas.getContext('2d');
  const scale = Math.min(
    CANVAS_SIZE / sourceCanvas.width,
    CANVAS_SIZE / sourceCanvas.height,
  );
  const width = sourceCanvas.width * scale;
  const height = sourceCanvas.height * scale;
  const x = (CANVAS_SIZE - width) / 2;
  const y = (CANVAS_SIZE - height) / 2;

  cursorCanvas.width = CANVAS_SIZE;
  cursorCanvas.height = CANVAS_SIZE;
  cursorContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  cursorContext.imageSmoothingEnabled = true;
  cursorContext.imageSmoothingQuality = 'high';
  cursorContext.drawImage(sourceCanvas, x, y, width, height);

  return createCursorBlob(cursorCanvas);
};

const hexToRgba = (hexColor) => {
  const normalizedColor = hexColor.replace('#', '');
  const red = Number.parseInt(normalizedColor.slice(0, 2), 16);
  const green = Number.parseInt(normalizedColor.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedColor.slice(4, 6), 16);

  return [red, green, blue, 255];
};

const colorsMatch = (data, offset, targetColor) => {
  const tolerance = 8;

  return (
    Math.abs(data[offset] - targetColor[0]) <= tolerance &&
    Math.abs(data[offset + 1] - targetColor[1]) <= tolerance &&
    Math.abs(data[offset + 2] - targetColor[2]) <= tolerance &&
    Math.abs(data[offset + 3] - targetColor[3]) <= tolerance
  );
};

const floodFillCanvas = (canvas, point, fillColor) => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const x = Math.floor(point.x);
  const y = Math.floor(point.y);

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return false;
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const startPixel = y * canvas.width + x;
  const startOffset = startPixel * 4;
  const targetColor = [
    data[startOffset],
    data[startOffset + 1],
    data[startOffset + 2],
    data[startOffset + 3],
  ];

  if (
    targetColor[0] === fillColor[0] &&
    targetColor[1] === fillColor[1] &&
    targetColor[2] === fillColor[2] &&
    targetColor[3] === fillColor[3]
  ) {
    return false;
  }

  const pixelCount = canvas.width * canvas.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let queueStart = 0;
  let queueEnd = 0;

  queue[queueEnd] = startPixel;
  queueEnd += 1;
  visited[startPixel] = 1;

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart];
    const pixelX = pixelIndex % canvas.width;
    const offset = pixelIndex * 4;

    queueStart += 1;

    if (!colorsMatch(data, offset, targetColor)) {
      continue;
    }

    data[offset] = fillColor[0];
    data[offset + 1] = fillColor[1];
    data[offset + 2] = fillColor[2];
    data[offset + 3] = fillColor[3];

    const neighbors = [
      pixelX > 0 ? pixelIndex - 1 : -1,
      pixelX < canvas.width - 1 ? pixelIndex + 1 : -1,
      pixelIndex - canvas.width,
      pixelIndex + canvas.width,
    ];

    neighbors.forEach((neighborIndex) => {
      if (
        neighborIndex >= 0 &&
        neighborIndex < pixelCount &&
        !visited[neighborIndex]
      ) {
        visited[neighborIndex] = 1;
        queue[queueEnd] = neighborIndex;
        queueEnd += 1;
      }
    });
  }

  context.putImageData(imageData, 0, 0);
  return true;
};

const downloadBlob = (blob, fileName) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = fileName;
  link.href = objectUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

function TutorialPanel() {
  const [activeGroupId, setActiveGroupId] = useState(TUTORIAL_GROUPS[0].id);
  const [activeTabId, setActiveTabId] = useState(TUTORIAL_GROUPS[0].tabs[0].id);
  const activeGroup =
    TUTORIAL_GROUPS.find((group) => group.id === activeGroupId) ?? TUTORIAL_GROUPS[0];
  const activeTab =
    activeGroup.tabs.find((tab) => tab.id === activeTabId) ?? activeGroup.tabs[0];

  return (
    <section className="panel tutorial-panel" aria-labelledby="tutorial-title">
      <DoodleHeading alt="如何使用？" />
      <span id="tutorial-title" className="sr-only">如何使用？</span>

      <div className="use-tabs" role="tablist" aria-label="用途分类">
        {TUTORIAL_GROUPS.map((group) => {
          const isActive = group.id === activeGroup.id;

          return (
            <button
              type="button"
              className={`use-tab ${isActive ? 'is-active' : ''}`.trim()}
              role="tab"
              aria-selected={isActive}
              key={group.id}
              onClick={() => {
                setActiveGroupId(group.id);
                setActiveTabId(group.tabs[0].id);
              }}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      <aside className="tutorial-browser-note">
        因为浏览器安全限制，我们无法让网页“一点就直接修改本地系统”；但我们已经尽可能帮你打包好了脚本，也制作好了清楚的手动教程，跟着步骤来就行。
      </aside>

      <div className="tutorial-tabs" role="tablist" aria-label="教程分类">
        {activeGroup.tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              type="button"
              className={`tutorial-tab ${isActive ? 'is-active' : ''}`.trim()}
              role="tab"
              id={`tutorial-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls="tutorial-steps-panel"
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="tutorial-steps"
        role="tabpanel"
        id="tutorial-steps-panel"
        aria-labelledby={`tutorial-tab-${activeTab.id}`}
      >
        {activeTab.steps.map((step) => (
          <article className="tutorial-step" key={`${activeTab.id}-${step.label}`}>
            <h3>
              <span className="tutorial-step-label">{step.label}</span>
              <span className="tutorial-step-title">{step.title}</span>
            </h3>
            {step.image ? (
              <div className="tutorial-image-frame">
                <img
                  className="tutorial-image"
                  src={step.image}
                  alt={`${step.label}：${step.title}`}
                  loading="lazy"
                />
              </div>
            ) : null}
            <p>{step.description}</p>
          </article>
        ))}
        {activeTab.tip ? (
          <aside className="tutorial-tip">
            <strong>小提示：</strong>
            <span>{activeTab.tip.replace(/^小提示：/, '')}</span>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function CreatorToolbar({
  activeCanvasType,
  brushColor,
  brushSize,
  canUndo,
  drawingMode,
  onBrushColorChange,
  onBrushSizeChange,
  onClearCanvas,
  onDownloadCursor,
  onDownloadHelper,
  onDownloadIco,
  onDownloadPng,
  onDrawingModeChange,
  onUndo,
}) {
  return (
    <section className="toolbar" aria-label="绘图工具">
      <label className="tool-control">
        <ToolIcon src={paletteIcon} />
        <span>画笔颜色</span>
        <input
          type="color"
          value={brushColor}
          onChange={onBrushColorChange}
        />
      </label>

      <label className="tool-control tool-control-wide">
        <ToolIcon src={thicknessIcon} />
        <span>线条粗细</span>
        <input
          type="range"
          min="4"
          max="28"
          value={brushSize}
          onChange={onBrushSizeChange}
        />
        <span>{brushSize}px</span>
      </label>

      <button
        type="button"
        className={`mode-button ${drawingMode === 'fill' ? 'is-active' : ''}`.trim()}
        onClick={() => onDrawingModeChange(drawingMode === 'fill' ? 'draw' : 'fill')}
        aria-pressed={drawingMode === 'fill'}
      >
        <ToolIcon src={paletteIcon} />
        <span>{drawingMode === 'fill' ? '填充中' : '填充'}</span>
      </button>

      <button type="button" onClick={onUndo} disabled={!canUndo}>
        <ToolIcon src={undoIcon} />
        <span>撤销</span>
      </button>

      <button type="button" onClick={onClearCanvas}>
        <ToolIcon src={eraserIcon} />
        <span>清空画布</span>
      </button>

      {activeCanvasType === 'folder' ? (
        <>
          <button type="button" onClick={onDownloadIco}>
            <ToolIcon src={downloadIcon} />
            <span>下载 ICO</span>
          </button>

          <button type="button" onClick={onDownloadHelper}>
            <ToolIcon src={downloadIcon} />
            <span>下载批量应用包</span>
          </button>
        </>
      ) : (
        <button type="button" onClick={onDownloadCursor}>
          <ToolIcon src={downloadIcon} />
          <span>下载 CUR</span>
        </button>
      )}

      <button type="button" onClick={onDownloadPng}>
        <ToolIcon src={downloadIcon} />
        <span>下载 PNG</span>
      </button>
    </section>
  );
}

function DrawingCanvas({
  activeCanvasType,
  canvasRef,
  drawingMode,
  guideCanvasRef,
  onDraw,
  onStartDrawing,
  onStopDrawing,
}) {
  return (
    <section className="canvas-area" aria-label="绘图区域">
      <div className="canvas-stack">
        <canvas
          ref={guideCanvasRef}
          className="guide-canvas"
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          aria-hidden="true"
        />
        <canvas
          ref={canvasRef}
          className={`drawing-canvas ${drawingMode === 'fill' ? 'is-fill-mode' : ''} ${
            activeCanvasType === 'cursor' ? 'is-cursor-canvas' : ''
          }`.trim()}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={onStartDrawing}
          onMouseMove={onDraw}
          onMouseUp={onStopDrawing}
          onMouseLeave={onStopDrawing}
          aria-label={activeCanvasType === 'cursor' ? '鼠标指针绘图区域' : '文件夹图标绘图区域'}
        />
      </div>
    </section>
  );
}

function DesktopPreview({ activeCanvasType, previewCanvasRefs }) {
  return (
    <section className="preview-area" aria-labelledby="preview-title">
      <DoodleHeading
        alt={activeCanvasType === 'cursor' ? '鼠标预览' : '效果预览'}
        className="preview-heading"
      />
      <span id="preview-title" className="sr-only">
        {activeCanvasType === 'cursor' ? '鼠标预览' : '效果预览'}
      </span>
      {activeCanvasType === 'cursor' ? (
        <div className="cursor-preview" aria-label="模拟鼠标指针效果">
          <div className="cursor-preview-window">
            <div className="cursor-preview-bar" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="cursor-preview-content">
              <button type="button">按钮</button>
              <span>文字链接</span>
              <div className="cursor-preview-pointer">
                <canvas
                  ref={(element) => {
                    previewCanvasRefs.current[0] = element;
                  }}
                  className="cursor-preview-canvas"
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  aria-label="当前鼠标指针预览"
                />
                <span className="cursor-hotspot-preview" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="desktop-preview" aria-label="模拟 Windows 桌面效果">
          <div className="desktop-wallpaper-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="desktop-icons">
            {DESKTOP_FOLDER_NAMES.map((folderName, index) => (
              <div className="desktop-item" key={folderName}>
                <canvas
                  ref={(element) => {
                    previewCanvasRefs.current[index] = element;
                  }}
                  className="preview-canvas"
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  aria-label={`使用用户图标的${folderName}`}
                />
                <span className="desktop-item-label">{folderName}</span>
              </div>
            ))}
          </div>

          <div className="desktop-taskbar" aria-hidden="true">
            <span className="desktop-start-icon">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="desktop-clock">10:30</span>
          </div>
        </div>
      )}
    </section>
  );
}

function CreatorPanel({
  activeCanvasType,
  brushColor,
  brushSize,
  canUndo,
  canvasRef,
  drawingMode,
  guideCanvasRef,
  previewCanvasRefs,
  onBrushColorChange,
  onBrushSizeChange,
  onCanvasTypeChange,
  onClearCanvas,
  onDownloadCursor,
  onDownloadHelper,
  onDownloadIco,
  onDownloadPng,
  onDrawingModeChange,
  onDraw,
  onStartDrawing,
  onStopDrawing,
  onUndo,
}) {
  return (
    <section className="panel creator-panel" aria-labelledby="creator-title">
      <DoodleHeading alt="开始涂鸦" className="creator-heading" />
      <span id="creator-title" className="sr-only">开始涂鸦</span>

      <div className="use-tabs creator-use-tabs" role="tablist" aria-label="画布用途">
        {CANVAS_TYPES.map((canvasType) => {
          const isActive = canvasType.id === activeCanvasType;

          return (
            <button
              type="button"
              className={`use-tab ${isActive ? 'is-active' : ''}`.trim()}
              role="tab"
              aria-selected={isActive}
              key={canvasType.id}
              onClick={() => onCanvasTypeChange(canvasType.id)}
            >
              {canvasType.label}
            </button>
          );
        })}
      </div>

      <CreatorToolbar
        activeCanvasType={activeCanvasType}
        brushColor={brushColor}
        brushSize={brushSize}
        canUndo={canUndo}
        drawingMode={drawingMode}
        onBrushColorChange={onBrushColorChange}
        onBrushSizeChange={onBrushSizeChange}
        onClearCanvas={onClearCanvas}
        onDownloadCursor={onDownloadCursor}
        onDownloadHelper={onDownloadHelper}
        onDownloadIco={onDownloadIco}
        onDownloadPng={onDownloadPng}
        onDrawingModeChange={onDrawingModeChange}
        onUndo={onUndo}
      />

      <DrawingCanvas
        activeCanvasType={activeCanvasType}
        canvasRef={canvasRef}
        drawingMode={drawingMode}
        guideCanvasRef={guideCanvasRef}
        onDraw={onDraw}
        onStartDrawing={onStartDrawing}
        onStopDrawing={onStopDrawing}
      />

      <DesktopPreview activeCanvasType={activeCanvasType} previewCanvasRefs={previewCanvasRefs} />
    </section>
  );
}

function GalleryDownloadLink({ item, variant }) {
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (item.isPlaceholder) {
      return;
    }

    let isMounted = true;
    let objectUrl = '';

    setDownloadUrl('');
    const createBlob = variant === 'cursor' ? createGalleryCursorBlob : createGalleryIcoBlob;

    createBlob(item.imageUrl).then((downloadBlob) => {
      if (!isMounted) {
        return;
      }

      objectUrl = URL.createObjectURL(downloadBlob);
      setDownloadUrl(objectUrl);
    });

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [item, variant]);

  if (!downloadUrl) {
    return (
      <button
        type="button"
        className="gallery-download-link"
        aria-label={`下载${item.name}`}
        disabled
      >
        <ToolIcon src={downloadIcon} />
      </button>
    );
  }

  return (
    <a
      className="gallery-download-link"
      href={downloadUrl}
      download={item.filename}
      aria-label={`下载${item.name}`}
    >
      <ToolIcon src={downloadIcon} />
    </a>
  );
}

function GalleryCard({ item, variant }) {
  return (
    <article className={`gallery-card ${variant === 'cursor' ? 'is-cursor-card' : ''}`.trim()}>
      <div className="gallery-image">
        <DoodleAsset src={item.imageUrl} alt={item.name} className="gallery-artwork-image" />
      </div>
      <div className="gallery-card-meta">
        <div>
          <h3>{item.name}</h3>
          <p>
            <DoodleAsset src={avatarIcon} alt="" className="author-icon" />
            <span>{item.author}</span>
          </p>
        </div>
        <GalleryDownloadLink item={item} variant={variant} />
      </div>
    </article>
  );
}

function GalleryPanel() {
  const [activeGalleryType, setActiveGalleryType] = useState(GALLERY_GROUPS[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const activeGalleryGroup =
    GALLERY_GROUPS.find((group) => group.id === activeGalleryType) ?? GALLERY_GROUPS[0];
  const activeGalleryItems = GALLERY_ITEMS_BY_TYPE[activeGalleryGroup.id] ?? [];
  const totalPages = Math.max(1, Math.ceil(activeGalleryItems.length / GALLERY_PAGE_SIZE));
  const paddedItemCount = totalPages * GALLERY_PAGE_SIZE;
  const paddedItems = [
    ...activeGalleryItems,
    ...Array.from({ length: paddedItemCount - activeGalleryItems.length }, (_, index) => ({
      id: `${activeGalleryGroup.id}-placeholder-${index}`,
      name: GALLERY_PLACEHOLDER_TEXT[activeGalleryGroup.id],
      author: 'Folder Doodle',
      imageUrl: galleryIcon,
      filename: '',
      isPlaceholder: true,
    })),
  ];
  const pageStart = (currentPage - 1) * GALLERY_PAGE_SIZE;
  const visibleItems = paddedItems.slice(pageStart, pageStart + GALLERY_PAGE_SIZE);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <section className="panel gallery-panel" aria-labelledby="gallery-title">
      <DoodleHeading alt="官方收录" className="gallery-heading" />
      <span id="gallery-title" className="sr-only">官方收录</span>

      <div className="use-tabs" role="tablist" aria-label="图库分类">
        {GALLERY_GROUPS.map((group) => {
          const isActive = group.id === activeGalleryGroup.id;

          return (
            <button
              type="button"
              className={`use-tab ${isActive ? 'is-active' : ''}`.trim()}
              role="tab"
              aria-selected={isActive}
              key={group.id}
              onClick={() => {
                setActiveGalleryType(group.id);
                setCurrentPage(1);
              }}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      <p className="panel-note">
        {GALLERY_EMPTY_NOTES[activeGalleryGroup.id]}
      </p>

      <div className="gallery-list">
        {visibleItems.map((item) => (
          <GalleryCard item={item} variant={activeGalleryGroup.id} key={item.id} />
        ))}
      </div>

      <nav className="gallery-pagination" aria-label="图库分页">
        <button
          type="button"
          className="page-arrow previous-page"
          aria-label="上一页"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={!canGoPrevious}
        >
          <ToolIcon src={nextIcon} />
        </button>
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <button
              type="button"
              aria-current={isCurrentPage ? 'page' : undefined}
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          type="button"
          className="page-arrow"
          aria-label="下一页"
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={!canGoNext}
        >
          <ToolIcon src={nextIcon} />
        </button>
      </nav>
    </section>
  );
}

function App() {
  const guideCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRefs = useRef([]);
  const isDrawingRef = useRef(false);
  const canvasSnapshotsRef = useRef({
    folder: null,
    cursor: null,
  });
  const undoStacksRef = useRef({
    folder: [],
    cursor: [],
  });
  const activeCanvasTypeRef = useRef('folder');
  const [activeCanvasType, setActiveCanvasType] = useState('folder');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(12);
  const [canUndo, setCanUndo] = useState(false);
  const [drawingMode, setDrawingMode] = useState('draw');

  const getActiveUndoStack = () => undoStacksRef.current[activeCanvasTypeRef.current];

  const syncCanUndo = () => {
    setCanUndo(getActiveUndoStack().length > 0);
  };

  const storeCanvasSnapshot = (canvasType = activeCanvasTypeRef.current) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    canvasSnapshotsRef.current[canvasType] = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
  };

  const loadCanvasSnapshot = (canvasType) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (canvasSnapshotsRef.current[canvasType]) {
      context.putImageData(canvasSnapshotsRef.current[canvasType], 0, 0);
    }

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushSize;
  };

  const drawGuide = (canvasType) => {
    const guideCanvas = guideCanvasRef.current;

    if (!guideCanvas) {
      return;
    }

    const guideContext = guideCanvas.getContext('2d');

    guideContext.clearRect(0, 0, guideCanvas.width, guideCanvas.height);

    if (canvasType === 'cursor') {
      drawCursorHotspotGuide(guideContext);
      return;
    }

    guideContext.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    guideContext.lineWidth = 6;
    guideContext.lineJoin = 'round';
    traceFolderShape(guideContext);
    guideContext.stroke();
  };

  useEffect(() => {
    drawGuide(activeCanvasTypeRef.current);
    loadCanvasSnapshot(activeCanvasTypeRef.current);
    updatePreview();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.getContext('2d').lineWidth = brushSize;
  }, [brushSize]);

  const updatePreview = () => {
    const canvas = canvasRef.current;
    const previewCanvases = previewCanvasRefs.current.filter(Boolean);

    if (!canvas || previewCanvases.length === 0) {
      return;
    }

    previewCanvases.forEach((previewCanvas) => {
      const context = previewCanvas.getContext('2d');
      context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      context.drawImage(canvas, 0, 0);
    });
  };

  useEffect(() => {
    updatePreview();
  }, [activeCanvasType]);

  const changeCanvasType = (nextCanvasType) => {
    if (nextCanvasType === activeCanvasTypeRef.current) {
      return;
    }

    storeCanvasSnapshot(activeCanvasTypeRef.current);
    activeCanvasTypeRef.current = nextCanvasType;
    setActiveCanvasType(nextCanvasType);
    setDrawingMode('draw');
    drawGuide(nextCanvasType);
    loadCanvasSnapshot(nextCanvasType);
    setCanUndo(undoStacksRef.current[nextCanvasType].length > 0);
    window.requestAnimationFrame(updatePreview);
  };

  const saveUndoState = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    const activeUndoStack = getActiveUndoStack();
    undoStacksRef.current[activeCanvasTypeRef.current] = [
      ...activeUndoStack,
      context.getImageData(0, 0, canvas.width, canvas.height),
    ].slice(-20);
    setCanUndo(true);
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = getCanvasPoint(event);

    if (drawingMode === 'fill') {
      saveUndoState();
      floodFillCanvas(canvas, point, hexToRgba(brushColor));
      updatePreview();
      return;
    }

    saveUndoState();
    isDrawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!isDrawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = getCanvasPoint(event);

    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineTo(point.x, point.y);
    context.stroke();
    updatePreview();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const undoCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const activeUndoStack = getActiveUndoStack();
    const previousState = activeUndoStack.pop();

    if (!previousState) {
      return;
    }

    context.putImageData(previousState, 0, 0);
    syncCanUndo();
    updatePreview();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    saveUndoState();
    context.clearRect(0, 0, canvas.width, canvas.height);
    updatePreview();
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');

    link.download = 'folder-doodle.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadIco = async () => {
    const canvas = canvasRef.current;
    const icoBlob = await createIcoBlob(canvas);

    downloadBlob(icoBlob, 'folder-icon.ico');
  };

  const downloadCursor = async () => {
    const canvas = canvasRef.current;
    const cursorBlob = await createCursorBlob(canvas);

    downloadBlob(cursorBlob, 'folder-doodle-cursor.cur');
  };

  const downloadHelper = async () => {
    const canvas = canvasRef.current;
    const icoBlob = await createIcoBlob(canvas);
    const zip = new JSZip();
    const helperFolder = zip.folder(HELPER_FOLDER_NAME);

    helperFolder.file('icons/current.ico', icoBlob);
    helperFolder.file('Apply.bat', toWindowsText(applyBatContent));
    helperFolder.file('Restore.bat', toWindowsText(restoreBatContent));
    helperFolder.file('使用说明.txt', toWindowsText(helperReadmeContent));

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    downloadBlob(zipBlob, 'FolderDoodle_Helper.zip');
  };

  return (
    <main className="app">
      <header className="app-header">
        <h1>
          <DoodleAsset src={brandTitle} alt="Folder Doodle" className="brand-title" />
        </h1>
        <p>绘制 → 生成 → 预览整个桌面效果 → 下载使用。</p>
      </header>

      <div className="page-layout">
        <TutorialPanel />
        <CreatorPanel
          activeCanvasType={activeCanvasType}
          brushColor={brushColor}
          brushSize={brushSize}
          canUndo={canUndo}
          canvasRef={canvasRef}
          drawingMode={drawingMode}
          guideCanvasRef={guideCanvasRef}
          previewCanvasRefs={previewCanvasRefs}
          onBrushColorChange={(event) => setBrushColor(event.target.value)}
          onBrushSizeChange={(event) => setBrushSize(Number(event.target.value))}
          onCanvasTypeChange={changeCanvasType}
          onClearCanvas={clearCanvas}
          onDownloadCursor={downloadCursor}
          onDownloadHelper={downloadHelper}
          onDownloadIco={downloadIco}
          onDownloadPng={downloadPng}
          onDrawingModeChange={setDrawingMode}
          onDraw={draw}
          onStartDrawing={startDrawing}
          onStopDrawing={stopDrawing}
          onUndo={undoCanvas}
        />
        <GalleryPanel />
      </div>
      <Analytics />
    </main>
  );
}

export default App;
