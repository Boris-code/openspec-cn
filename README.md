# openspec-cn

`openspec-cn` 是 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 的中文补丁包装层项目，用来在不修改上游源码的前提下，为 OpenSpec 提供更适合中文团队使用的文档生成体验。

- 原项目地址：https://github.com/Fission-AI/OpenSpec
- 本项目地址：https://github.com/Boris-code/openspec-cn

## 项目用途

官方 OpenSpec 已经支持通过 `openspec/config.yaml` 的 `context` 提示 AI 用中文写内容，但这类方式本质上是“提示词约束”，不是“中文 schema 补丁”。

`openspec-cn` 的目标是：

- 提供独立命令 `openspec-cn`
- 为 OpenSpec 增加独立中文 schema：`spec-driven-cn`
- 在 `init` / `update` 后自动把项目默认 schema 切到中文补丁 schema
- 保持你可以继续独立升级官方 `@fission-ai/openspec`，不需要 fork 上游仓库

适合以下场景：

- 团队主要使用中文沟通，希望 proposal / specs / design / tasks 默认用中文编写
- 不想改官方 OpenSpec 源码，避免后续同步上游时产生冲突
- 希望把中文能力做成可复用、可安装、可升级的补丁层，而不是每个项目都手工改配置

## 项目优势

相比直接修改官方仓库或手动调整每个项目配置，`openspec-cn` 的优势是：

- 无侵入：不修改官方 `@fission-ai/openspec` 包内容
- 易升级：官方 OpenSpec 更新后，仍可单独升级，不影响本项目结构
- 可复用：多个项目都可以直接使用 `openspec-cn init`
- 默认中文：不仅补充中文上下文，也把 schema 模板与 artifact 说明做了中文化
- 兼容官方解析：保留 OpenSpec 必须识别的英文协议头，避免破坏 `validate`、`archive`、`sync-specs` 等能力

## 设计原则

- 不改官方包内容
- 不覆盖官方内置 `spec-driven`
- 新增独立 schema：`spec-driven-cn`
- 兼容性优先，保留 OpenSpec 解析依赖的英文协议头

## 为什么不是“全中文标题”

OpenSpec 当前对部分 Markdown 头部有硬编码解析，例如：

- `## Why`
- `## What Changes`
- `## Purpose`
- `## Requirements`
- `## ADDED Requirements`
- `### Requirement:`
- `#### Scenario:`

这些标题如果直接翻译成中文，会影响官方的 `validate`、`archive`、`sync-specs` 等能力。

因此，`openspec-cn` 采用的是“协议头保留英文，正文与说明中文化”的策略：

- 保留 OpenSpec 依赖的英文格式头
- 让模板注释、artifact instruction、正文内容默认转为中文
- 通过项目配置持续声明“所有产出物用简体中文编写”

## 安装

### 1. 安装官方 OpenSpec

```bash
npm install -g @fission-ai/openspec@latest
```

### 2. 安装 `openspec-cn`

如果你直接从 GitHub 安装：

```bash
npm install -g git+https://github.com/Boris-code/openspec-cn.git
```

如果你已经把仓库 clone 到本地，也可以在项目目录安装：

```bash
npm install -g .
```

## 使用方法

### 快速开始

在一个新项目或已有项目目录中执行：

```bash
openspec-cn init
```

然后创建一个新变更：

```bash
openspec-cn new change add-login
```

查看当前变更状态：

```bash
openspec-cn status --change add-login
```

查看 proposal 的生成指令与模板：

```bash
openspec-cn instructions proposal --change add-login
```

这时后续由 AI 或你手工创建的 proposal / specs / design / tasks，都将默认按中文补丁 schema 来组织。

### 初始化项目

```bash
openspec-cn init
```

执行后会自动完成这些事情：

- 安装用户级中文 schema `spec-driven-cn`
- 将项目级 schema 同步到 `openspec/schemas/spec-driven-cn`
- 把 `openspec/config.yaml` 的默认 schema 改为 `spec-driven-cn`
- 写入中文上下文，要求所有产出物默认使用简体中文

如果你要初始化指定目录，也可以这样：

```bash
openspec-cn init ./my-project
```

### 已有 OpenSpec 项目切换为中文

如果你的项目已经在使用官方 OpenSpec，不需要重新初始化，直接在项目根目录执行：

```bash
openspec-cn update
```

这会自动完成：

- 同步中文 schema 到 `openspec/schemas/spec-driven-cn`
- 将 `openspec/config.yaml` 的默认 schema 切换为 `spec-driven-cn`
- 写入中文 `context`，让后续产出默认使用简体中文

执行完成后，建议检查：

- `openspec/config.yaml` 中是否为 `schema: spec-driven-cn`
- 项目下是否存在 `openspec/schemas/spec-driven-cn/`

之后新建变更时，直接使用：

```bash
openspec-cn new change your-change-name
```

### 创建新变更

```bash
openspec-cn new change add-login
```

如果你没有显式传 `--schema`，包装层会自动补上：

```bash
--schema spec-driven-cn
```

### 查看变更状态

```bash
openspec-cn status --change add-login
```

### 查看 artifact 指令

查看 proposal 指令：

```bash
openspec-cn instructions proposal --change add-login
```

查看 tasks 指令：

```bash
openspec-cn instructions tasks --change add-login
```

查看 apply 指令：

```bash
openspec-cn instructions apply --change add-login
```

### 查看当前模板解析结果

```bash
openspec-cn templates
```

如需 JSON 输出：

```bash
openspec-cn templates --json
```

### 查看可用 schema

```bash
openspec-cn schemas
```

你会看到官方 schema 和本项目提供的 `spec-driven-cn`。

### 继续使用官方命令能力

`openspec-cn` 本质上是对 `openspec` 的包装，因此大部分官方命令都可以直接透传使用，例如：

```bash
openspec-cn list
openspec-cn show add-login
openspec-cn validate --changes
openspec-cn archive add-login
```

只是在以下场景会额外应用中文补丁逻辑：

- `openspec-cn init`
- `openspec-cn update`
- `openspec-cn new change <name>`
- `openspec-cn templates`

### 更新项目补丁

```bash
openspec-cn update
```

这会重新同步项目中的中文 schema，并继续保持默认 schema 指向 `spec-driven-cn`。

## 与官方 OpenSpec 的关系

`openspec-cn` 不是 OpenSpec 的 fork，也不是替代品，而是一个独立补丁层：

- `openspec` 负责官方能力与上游更新
- `openspec-cn` 负责中文 schema、中文配置补丁和中文命令入口

因此推荐的升级方式是分别升级：

升级官方 OpenSpec：

```bash
npm install -g @fission-ai/openspec@latest
```

升级中文补丁：

```bash
npm install -g git+https://github.com/Boris-code/openspec-cn.git
```

然后在项目中执行：

```bash
openspec-cn update
```

## 常用命令

```bash
openspec-cn init
openspec-cn init ./my-project
openspec-cn new change add-login
openspec-cn status --change add-login
openspec-cn instructions proposal --change add-login
openspec-cn instructions specs --change add-login
openspec-cn instructions design --change add-login
openspec-cn instructions tasks --change add-login
openspec-cn templates --json
openspec-cn schemas
openspec-cn update
```

## 适合谁使用

- 中文开发团队
- 需要用 OpenSpec 管理 proposal / specs / design / tasks 的项目
- 想保留官方升级路径，又希望默认输出中文文档的用户

## 说明

如果你只是希望“偶尔生成中文内容”，官方的多语言支持已经足够，通常只需修改 `openspec/config.yaml`。

如果你希望：

- 命令入口就是中文补丁版本
- schema 与模板层面默认中文化
- 可以跨项目复用
- 不手工维护每个项目配置

那么 `openspec-cn` 更适合。
