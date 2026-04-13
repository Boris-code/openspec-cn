#!/usr/bin/env node

const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  DEFAULT_CN_SCHEMA,
  ensureUserSchemaInstalled,
  syncProjectSchema,
  ensureProjectConfigSchema,
  rewriteArgs,
  detectLifecycleCommand,
} = require("../lib/patch");

function run() {
  const originalArgs = process.argv.slice(2);

  ensureUserSchemaInstalled();

  const lifecycle = detectLifecycleCommand(originalArgs);
  const rewrittenArgs = rewriteArgs(originalArgs);

  const result = spawnSync("openspec", rewrittenArgs, {
    stdio: "inherit",
    env: {
      ...process.env,
      OPENSPEC_TELEMETRY: "0",
    },
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      console.error(
        "未找到 `openspec` 命令。请先安装官方 CLI：npm install -g @fission-ai/openspec@latest",
      );
      process.exit(1);
    }

    console.error(`执行 openspec 失败: ${result.error.message}`);
    process.exit(1);
  }

  const exitCode = typeof result.status === "number" ? result.status : 1;
  if (exitCode !== 0) {
    process.exit(exitCode);
  }

  if (lifecycle) {
    const projectRoot = path.resolve(lifecycle.targetPath);
    syncProjectSchema(projectRoot);
    ensureProjectConfigSchema(projectRoot, DEFAULT_CN_SCHEMA);

    console.log(
      `[openspec-cn] 已应用中文补丁: schema=${DEFAULT_CN_SCHEMA} (${projectRoot})`,
    );
  }
}

run();
