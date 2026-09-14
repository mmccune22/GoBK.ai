import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const browserBundleOptions = {
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2022'],
  // Preserve dependency string contents while avoiding literal multiline strings
  // in the generated single-file HTML and its whitespace checks.
  supported: { 'template-literal': false },
  minify: true,
  sourcemap: false,
  legalComments: 'inline',
  define: {
    'process.env.LANGSMITH_TRACING': '"false"',
    'process.env.LANGCHAIN_TRACING': '"false"',
    'process.env.LANGCHAIN_TRACING_V2': '"false"',
    'process.env.LANGCHAIN_VERBOSE': '"false"',
    'process.env.LANGSMITH_API_KEY': '""',
    'process.env.LANGCHAIN_API_KEY': '""',
    'process.env': '{}',
  },
};

const upstreamLicenses = {
  '@cfworker/json-schema@4.1.1': {
    file: 'src/checkup-lab/licenses/cfworker-json-schema-4.1.1.LICENSE.txt',
    source: 'https://raw.githubusercontent.com/cfworker/cfworker/5409fdc2bd144f68e8b28c61c71fcb16600000a6/LICENSE.md',
  },
  'langsmith@0.10.3': {
    file: 'src/checkup-lab/licenses/langsmith-0.10.3.LICENSE.txt',
    source: 'https://raw.githubusercontent.com/langchain-ai/langsmith-sdk/v0.10.3/LICENSE',
  },
  'js-tiktoken@1.0.21': {
    file: 'src/checkup-lab/licenses/js-tiktoken-1.0.21.LICENSE.txt',
    source: 'https://raw.githubusercontent.com/dqbd/tiktoken/4c8b748e07992c00386f3180af5c574b27b65139/LICENSE',
  },
};
async function packageFor(input) {
  let directory = path.dirname(path.resolve(input));
  while (directory !== path.dirname(directory)) {
    try {
      const info = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8'));
      if (info.name && info.version) return { directory, info };
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    directory = path.dirname(directory);
  }
  throw new Error(`Cannot identify bundled dependency: ${input}`);
}
/** Full notices accompany the exact packages whose code survives tree shaking. */
export async function thirdPartyNotice(metafile) {
  const inputs = new Set(Object.values(metafile.outputs).flatMap(output => Object.entries(output.inputs).filter(([, info]) => info.bytesInOutput > 0).map(([input]) => input)));
  const packages = new Map();
  for (const input of [...inputs].sort()) {
    if (!input.replaceAll('\\', '/').includes('node_modules/')) continue;
    const pkg = await packageFor(input);
    packages.set(`${pkg.info.name}@${pkg.info.version}`, pkg);
  }
  const parts = ['GoBK Checkup interactive workflow bundle — third-party notices', 'These full upstream copyright and license notices accompany the bundled dependencies.'];
  for (const [id, { directory, info }] of [...packages.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const files = (await fs.readdir(directory)).filter(name => /^(licen[cs]e|notice)([._-].*)?$/i.test(name)).sort();
    let documents = await Promise.all(files.map(async name => `${name}:\n${await fs.readFile(path.join(directory, name), 'utf8')}`));
    let source = 'License supplied in the installed npm package.';
    if (!documents.length) {
      const upstream = upstreamLicenses[id];
      if (!upstream) throw new Error(`A full upstream license is required for bundled dependency ${id}.`);
      documents = [await fs.readFile(upstream.file, 'utf8')];
      source = `Verified upstream license: ${upstream.source}`;
    }
    parts.push(`\n${'='.repeat(72)}\n${id}\nDeclared license: ${info.license}\n${source}\n\n${documents.join('\n\n')}`);
  }
  const text = `${parts.join('\n\n').replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trimEnd()}\n`;
  if (text.includes('*/')) throw new Error('A license contains a block-comment terminator; preserve it using a different embedding strategy.');
  return { text, packageIds: [...packages.keys()].sort() };
}
export async function buildLab() {
  const result = await build({ ...browserBundleOptions, entryPoints: ['src/checkup-lab/app.ts'], outfile: 'public/checkup-workflow-lab.js', write: false, metafile: true });
  const notice = await thirdPartyNotice(result.metafile);
  await fs.writeFile('public/checkup-workflow-lab.LICENSE.txt', notice.text, 'utf8');
  await fs.writeFile('public/checkup-workflow-lab.js', `/*!\n${notice.text}*/\n${result.outputFiles[0].text}`, 'utf8');
  console.log(`Built the self-contained real LangGraph workflow lab browser bundle with full notices for ${notice.packageIds.length} dependencies.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildLab();
