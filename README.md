# openspec-cn

`openspec-cn` 是一个独立的 OpenSpec 中文补丁包装层，不修改上游 `@fission-ai/openspec` 源码。

它做三件事：

1. 提供独立命令 `openspec-cn`
2. 安装并维护一个额外 schema：`spec-driven-cn`
3. 在 `init` / `update` 后把项目默认 schema 切到中文补丁 schema

这让你可以继续单独升级官方 OpenSpec，而不需要 fork 官方仓库。

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

这些标题如果翻译成中文，会直接影响 `validate`、`archive`、`sync-specs` 等官方能力。

因此本补丁采用“协议头保留英文，正文与说明中文化”的策略。

## 安装

先安装官方 OpenSpec：

```bash
npm install -g @fission-ai/openspec@latest
```

再安装当前补丁包：

```bash
npm install -g /path/to/openspec-cn
```

## 使用

初始化项目：

```bash
openspec-cn init
```

初始化后会自动：

- 安装用户级中文 schema
- 把项目级 schema 同步到 `openspec/schemas/spec-driven-cn`
- 把 `openspec/config.yaml` 的默认 schema 设为 `spec-driven-cn`

创建新变更：

```bash
openspec-cn new change add-login
```

如果你没有显式传 `--schema`，包装层会自动补上：

```bash
--schema spec-driven-cn
```

查看模板：

```bash
openspec-cn templates
```

## 与官方同步更新

官方升级：

```bash
npm install -g @fission-ai/openspec@latest
```

中文补丁升级：

```bash
npm install -g openspec-cn@latest
```

然后在项目里执行：

```bash
openspec-cn update
```

这会重新同步项目里的中文 schema，并保持默认 schema 指向 `spec-driven-cn`。
