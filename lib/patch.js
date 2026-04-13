"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const DEFAULT_CN_SCHEMA = "spec-driven-cn";
const ROOT_DIR = path.resolve(__dirname, "..");
const PACKAGED_SCHEMA_DIR = path.join(ROOT_DIR, "schemas", DEFAULT_CN_SCHEMA);

function getGlobalDataDir() {
  if (process.env.XDG_DATA_HOME) {
    return path.join(process.env.XDG_DATA_HOME, "openspec");
  }

  if (process.platform === "win32") {
    if (process.env.LOCALAPPDATA) {
      return path.join(process.env.LOCALAPPDATA, "openspec");
    }

    return path.join(os.homedir(), "AppData", "Local", "openspec");
  }

  return path.join(os.homedir(), ".local", "share", "openspec");
}

function copyDirSync(sourceDir, targetDir) {
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, {
    recursive: true,
    force: true,
  });
}

function ensureUserSchemaInstalled() {
  const userSchemaDir = path.join(
    getGlobalDataDir(),
    "schemas",
    DEFAULT_CN_SCHEMA,
  );

  copyDirSync(PACKAGED_SCHEMA_DIR, userSchemaDir);
}

function syncProjectSchema(projectRoot) {
  const projectSchemaDir = path.join(
    projectRoot,
    "openspec",
    "schemas",
    DEFAULT_CN_SCHEMA,
  );

  copyDirSync(PACKAGED_SCHEMA_DIR, projectSchemaDir);
}

function ensureProjectConfigSchema(projectRoot, schemaName) {
  const openspecDir = path.join(projectRoot, "openspec");
  const configYamlPath = path.join(openspecDir, "config.yaml");
  const configYmlPath = path.join(openspecDir, "config.yml");
  const languageContext = [
    "context: |",
    "  语言：中文（简体）",
    "  所有产出物必须用简体中文撰写。",
    "  为兼容 OpenSpec 官方解析器，协议头与格式关键字保持英文。",
  ].join("\n");

  fs.mkdirSync(openspecDir, { recursive: true });

  const configPath = fs.existsSync(configYamlPath)
    ? configYamlPath
    : fs.existsSync(configYmlPath)
      ? configYmlPath
      : configYamlPath;

  const defaultContent = [
    `schema: ${schemaName}`,
    "",
    languageContext,
    "",
    "# Per-artifact rules (optional)",
    "# Add custom rules for specific artifacts.",
    "# Example:",
    "#   rules:",
    "#     proposal:",
    '#       - Keep proposals under 500 words',
    '#       - Always include a "Non-goals" section',
    "#     tasks:",
    "#       - Break tasks into chunks of max 2 hours",
    "",
  ].join("\n");

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, defaultContent, "utf8");
    return;
  }

  const current = fs.readFileSync(configPath, "utf8");
  let updated = current;

  if (/^schema:\s*.+$/m.test(updated)) {
    updated = updated.replace(/^schema:\s*.+$/m, `schema: ${schemaName}`);
  } else {
    updated = `schema: ${schemaName}\n\n${updated}`;
  }

  if (!/^context:\s*\|/m.test(updated)) {
    updated = `${updated.trimEnd()}\n\n${languageContext}\n`;
  }

  fs.writeFileSync(configPath, updated, "utf8");
}

function hasExplicitSchema(args) {
  return args.includes("--schema");
}

function rewriteArgs(args) {
  if (args.length === 0) {
    return args;
  }

  if (args[0] === "new" && args[1] === "change" && !hasExplicitSchema(args)) {
    return [...args, "--schema", DEFAULT_CN_SCHEMA];
  }

  if (args[0] === "templates" && !hasExplicitSchema(args)) {
    return [...args, "--schema", DEFAULT_CN_SCHEMA];
  }

  return args;
}

function detectLifecycleCommand(args) {
  if (args[0] === "init") {
    return {
      type: "init",
      targetPath: resolveOptionalPathArg(args.slice(1), {
        optionsWithValue: new Set(["--tools", "--profile"]),
      }),
    };
  }

  if (args[0] === "update") {
    return {
      type: "update",
      targetPath: resolveOptionalPathArg(args.slice(1), {
        optionsWithValue: new Set(),
      }),
    };
  }

  return null;
}

function resolveOptionalPathArg(args, options) {
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];

    if (!token.startsWith("-")) {
      return token;
    }

    if (options.optionsWithValue.has(token)) {
      i += 1;
    }
  }

  return ".";
}

module.exports = {
  DEFAULT_CN_SCHEMA,
  detectLifecycleCommand,
  ensureProjectConfigSchema,
  ensureUserSchemaInstalled,
  rewriteArgs,
  syncProjectSchema,
};
