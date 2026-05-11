#!/usr/bin/env tsx
/**
 * Generate shadcn registry items, one per showcase, into
 * apps/www/public/r/<category>/<design>.json.
 *
 * Each item's source has its `@orbit/ui/<name>` imports rewritten to
 * `@/components/ui/<name>`, and declares `@coss/<name>` registry deps so
 * `shadcn add` pulls coss primitives into the consumer's project.
 *
 * Some `@orbit/ui` exports aren't published to the public coss registry
 * (see LOCAL_INLINES). For those, the source is recursively inlined into
 * the registry item along with any of its transitive imports inside the
 * `@orbit/ui` package.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { SOURCE_FILES } from "../apps/www/src/pages/showcase/source-files";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SHOWCASE_DIR = resolve(ROOT, "apps/www/src/pages/showcase");
const UI_PKG_DIR = resolve(ROOT, "packages/ui/src");
const OUT_DIR = resolve(ROOT, "apps/www/public/r");

// Known external npm packages that show up in showcases. Anything not in
// this set is assumed to be a workspace/coss/local import we don't need
// to surface as a npm dependency.
const TRACKED_NPM_DEPS = new Set([
  "lucide-react",
  "react-day-picker",
]);

// `@orbit/ui/<name>` exports that are NOT published to the public coss
// registry — their source is inlined into each registry item that uses
// them (along with transitive imports inside @orbit/ui). The value is
// the path inside packages/ui/src where the source lives.
const LOCAL_INLINES: Record<string, string> = {
  "auth-split-layout": "components/ui/auth-split-layout.tsx",
  "particle-field": "components/particle-field.tsx",
  "theme-provider": "components/theme-provider.tsx",
};

interface RegistryFile {
  path: string;
  content: string;
  type: "registry:component" | "registry:lib";
}

interface RegistryItem {
  $schema: string;
  name: string;
  type: "registry:component";
  title: string;
  registryDependencies?: string[];
  dependencies?: string[];
  files: RegistryFile[];
}

interface InlinedFile {
  // Consumer-relative output path used as `files[].path`.
  outputPath: string;
  type: RegistryFile["type"];
  content: string;
}

interface CrawlResult {
  showcaseFiles: { name: string; content: string }[];
  inlined: InlinedFile[];
  registryDeps: Set<string>;
  npmDeps: Set<string>;
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((s) => (s ? s[0]!.toUpperCase() + s.slice(1) : s))
    .join(" ");
}

// Map an absolute path inside packages/ui/src to the consumer's
// corresponding `@/...` alias and the registry output path. Returns
// `output: null` when the consumer is expected to already have the file
// (e.g. `lib/utils.ts` is created by `shadcn init`).
function mapLibraryPath(absPath: string): {
  alias: string;
  // null when the consumer is expected to already have the file (e.g.
  // `lib/utils` from shadcn init) or when the file is satisfied via a
  // `@coss/*` registry dep (see `cossDep` below).
  output: string | null;
  type: RegistryFile["type"];
  // When set, emit this registry dep instead of inlining the file.
  cossDep?: string;
} {
  const rel = relative(UI_PKG_DIR, absPath);

  if (rel === "lib/utils.ts") {
    return { alias: "@/lib/utils", output: null, type: "registry:lib" };
  }

  let m = rel.match(/^components\/patterns\/(.+)\.tsx$/);
  if (m) {
    return {
      alias: `@/components/patterns/${m[1]}`,
      output: `components/patterns/${m[1]}.tsx`,
      type: "registry:component",
    };
  }

  // packages/ui/src/components/ui/<x>.tsx — coss primitive (button, card,
  // etc.) unless it's one of the local-only exports listed in
  // LOCAL_INLINES (e.g. auth-split-layout). Inlined files don't go under
  // components/ui/ since that path is reserved for shadcn/coss primitives
  // in the consumer.
  m = rel.match(/^components\/ui\/([a-z0-9-]+)\.tsx$/);
  if (m) {
    const name = m[1]!;
    if (name in LOCAL_INLINES) {
      return {
        alias: `@/components/${name}`,
        output: `components/${name}.tsx`,
        type: "registry:component",
      };
    }
    return {
      alias: `@/components/ui/${name}`,
      output: null,
      type: "registry:component",
      cossDep: `@coss/${name}`,
    };
  }

  m = rel.match(/^components\/([a-z0-9-]+)\.tsx$/);
  if (m) {
    return {
      alias: `@/components/${m[1]}`,
      output: `components/${m[1]}.tsx`,
      type: "registry:component",
    };
  }

  m = rel.match(/^themes\/([a-z0-9-]+)\.ts$/);
  if (m) {
    return {
      alias: `@/lib/themes/${m[1]}`,
      output: `lib/themes/${m[1]}.ts`,
      type: "registry:lib",
    };
  }

  m = rel.match(/^hooks\/([a-z0-9-]+)\.ts$/);
  if (m) {
    return {
      alias: `@/hooks/${m[1]}`,
      output: `hooks/${m[1]}.ts`,
      type: "registry:lib",
    };
  }

  throw new Error(`unmapped library path: ${rel}`);
}

function rewriteShowcaseImports(source: string): string {
  let out = source.replace(
    /from\s+(["'])@orbit\/ui\/lib\/utils\1/g,
    "from $1@/lib/utils$1",
  );
  out = out.replace(
    /from\s+(["'])@orbit\/ui\/patterns\/([a-z0-9/-]+)\1/g,
    "from $1@/components/patterns/$2$1",
  );
  out = out.replace(
    /from\s+(["'])@orbit\/ui\/([a-z0-9-]+)\1/g,
    (_match, q: string, name: string) => {
      const dir = name in LOCAL_INLINES ? "components" : "components/ui";
      return `from ${q}@/${dir}/${name}${q}`;
    },
  );
  return out;
}

// Rewrite imports in a file being inlined from packages/ui. Returns the
// rewritten source plus the absolute paths of any further library files
// to follow, and the registry / npm deps it surfaces.
function rewriteLibraryFile(absPath: string, source: string): {
  rewritten: string;
  follow: string[];
  registryDeps: Set<string>;
  npmDeps: Set<string>;
} {
  const follow: string[] = [];
  const registryDeps = new Set<string>();
  const npmDeps = new Set<string>();

  // 1. Relative imports — resolve to an abs path, then map to alias.
  let out = source.replace(
    /from\s+(["'])(\.{1,2}\/[^"']+)\1/g,
    (_match, q: string, spec: string) => {
      const stripped = spec.replace(/\.tsx?$/, "");
      const candidates = [
        resolve(dirname(absPath), spec),
        resolve(dirname(absPath), `${stripped}.tsx`),
        resolve(dirname(absPath), `${stripped}.ts`),
      ];
      const target = candidates.find((p) => existsSync(p));
      if (!target) {
        throw new Error(
          `cannot resolve relative import "${spec}" from ${absPath}`,
        );
      }
      if (target.endsWith(".png")) {
        return `from ${q}${spec}${q}`;
      }
      const { alias, output, cossDep } = mapLibraryPath(target);
      if (cossDep) registryDeps.add(cossDep);
      if (output) follow.push(target);
      return `from ${q}${alias}${q}`;
    },
  );

  // 2. @orbit/ui/<name> imports — rewrite to consumer alias and either
  //    queue inlining (local-only) or emit a @coss/* registry dep.
  out = out.replace(
    /from\s+(["'])@orbit\/ui\/([a-z0-9/-]+)\1/g,
    (_match, q: string, name: string) => {
      if (name === "lib/utils") return `from ${q}@/lib/utils${q}`;
      if (name.startsWith("patterns/")) {
        follow.push(resolve(UI_PKG_DIR, `components/${name}.tsx`));
        return `from ${q}@/components/${name}${q}`;
      }
      const baseName = name.split("/").pop()!;
      if (LOCAL_INLINES[baseName]) {
        follow.push(resolve(UI_PKG_DIR, LOCAL_INLINES[baseName]!));
        return `from ${q}@/components/${baseName}${q}`;
      }
      registryDeps.add(`@coss/${baseName}`);
      return `from ${q}@/components/ui/${baseName}${q}`;
    },
  );

  // 3. Track known npm deps (anything not relative and not @/ or @orbit/).
  const importRe = /from\s+["']([^"']+)["']/g;
  for (const m of out.matchAll(importRe)) {
    const spec = m[1]!;
    if (TRACKED_NPM_DEPS.has(spec)) npmDeps.add(spec);
  }

  return { rewritten: out, follow, registryDeps, npmDeps };
}

async function readShowcase(filename: string): Promise<string> {
  return readFile(resolve(SHOWCASE_DIR, `${filename}.tsx`), "utf8");
}

async function crawl(rootFilename: string): Promise<CrawlResult> {
  const visitedShowcase = new Set<string>();
  const visitedLib = new Set<string>();
  const showcaseFiles: { name: string; content: string }[] = [];
  const inlinedByOutput = new Map<string, InlinedFile>();
  const registryDeps = new Set<string>();
  const npmDeps = new Set<string>();
  const showcaseQueue: string[] = [rootFilename];
  const libQueue: string[] = [];

  const drainLibQueue = async () => {
    while (libQueue.length > 0) {
      const absPath = libQueue.shift()!;
      if (visitedLib.has(absPath)) continue;
      visitedLib.add(absPath);

      const { output, type } = mapLibraryPath(absPath);
      if (!output) continue;

      const raw = await readFile(absPath, "utf8");
      const { rewritten, follow, registryDeps: rDeps, npmDeps: nDeps } =
        rewriteLibraryFile(absPath, raw);

      for (const d of rDeps) registryDeps.add(d);
      for (const d of nDeps) npmDeps.add(d);
      for (const next of follow) libQueue.push(next);

      inlinedByOutput.set(output, { outputPath: output, type, content: rewritten });
    }
  };

  while (showcaseQueue.length > 0) {
    const fname = showcaseQueue.shift()!;
    if (visitedShowcase.has(fname)) continue;
    visitedShowcase.add(fname);

    let raw: string;
    try {
      raw = await readShowcase(fname);
    } catch {
      continue;
    }

    // @orbit/ui/<name> -> queue local inline OR add @coss/* dep.
    const orbitRe = /from\s+["']@orbit\/ui\/([a-z0-9/-]+)["']/g;
    for (const m of raw.matchAll(orbitRe)) {
      const importPath = m[1]!;
      if (importPath === "lib/utils") continue;
      if (importPath.startsWith("patterns/")) {
        libQueue.push(resolve(UI_PKG_DIR, `components/${importPath}.tsx`));
        continue;
      }
      const baseName = importPath.split("/").pop()!;
      if (LOCAL_INLINES[baseName]) {
        libQueue.push(resolve(UI_PKG_DIR, LOCAL_INLINES[baseName]!));
      } else {
        registryDeps.add(`@coss/${baseName}`);
      }
    }

    // Sibling showcase imports (./foo).
    const relRe = /from\s+["']\.\/([a-z0-9_-]+)["']/g;
    for (const m of raw.matchAll(relRe)) {
      const sibling = m[1]!;
      if (!visitedShowcase.has(sibling)) showcaseQueue.push(sibling);
    }

    const importRe = /from\s+["']([^"']+)["']/g;
    for (const m of raw.matchAll(importRe)) {
      const spec = m[1]!;
      if (TRACKED_NPM_DEPS.has(spec)) npmDeps.add(spec);
    }

    showcaseFiles.push({ name: fname, content: rewriteShowcaseImports(raw) });

    await drainLibQueue();
  }

  await drainLibQueue();

  return {
    showcaseFiles,
    inlined: [...inlinedByOutput.values()],
    registryDeps,
    npmDeps,
  };
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  let count = 0;
  for (const [category, designs] of Object.entries(SOURCE_FILES)) {
    if (!designs) continue;
    const catDir = resolve(OUT_DIR, category);
    await mkdir(catDir, { recursive: true });

    for (const [designSlug, filename] of Object.entries(designs)) {
      const { showcaseFiles, inlined, registryDeps, npmDeps } =
        await crawl(filename);
      if (showcaseFiles.length === 0) {
        console.warn(`skip ${category}/${designSlug}: no source for ${filename}`);
        continue;
      }
      const item: RegistryItem = {
        $schema: "https://ui.shadcn.com/schema/registry-item.json",
        name: `${category}-${designSlug}`,
        type: "registry:component",
        title: titleCase(designSlug),
        files: [
          ...showcaseFiles.map((f) => ({
            path: `components/${f.name}.tsx`,
            content: f.content,
            type: "registry:component" as const,
          })),
          ...inlined.map((f) => ({
            path: f.outputPath,
            content: f.content,
            type: f.type,
          })),
        ],
      };
      if (registryDeps.size > 0) {
        item.registryDependencies = [...registryDeps].sort();
      }
      if (npmDeps.size > 0) {
        item.dependencies = [...npmDeps].sort();
      }
      await writeFile(
        resolve(catDir, `${designSlug}.json`),
        JSON.stringify(item, null, 2) + "\n",
      );
      count++;
    }
  }
  console.log(`wrote ${count} registry entries to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
