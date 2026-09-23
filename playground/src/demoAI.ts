import type { AIRequest } from 'ai-sparkwrite-editor/ai';

/**
 * The playground's stand-in for a model. It reads the prompt the editor
 * built — selection, document context, instruction — and answers with a
 * plausible transformation of the *actual* text, streamed in small pieces,
 * so every AI entry point can be tried end to end without a key:
 * rewrites really rewrite, "fix grammar" really fixes the typos in the page,
 * "turn into table" really tabulates the selection. Set `VITE_AI_MODEL` (and
 * a key) to talk to a real model instead. `window.__aiGenerate` overrides it.
 */
export async function demoAIGenerate(
  request: AIRequest,
  onChunk?: (text: string) => void
): Promise<string> {
  const override = (window as unknown as { __aiGenerate?: typeof demoAIGenerate }).__aiGenerate;
  if (override) return override(request, onChunk);

  // Ghost-text autocomplete asks for a few words, not a document.
  if (/complete text inside an editor/i.test(request.systemPrompt)) {
    await sleep(150);
    return ' — and this grey continuation came from the AI; press Tab to keep it.';
  }

  const message = request.messages[request.messages.length - 1]?.content ?? '';
  const answer = compose(message, request.messages);

  for (const piece of answer.match(/[\s\S]{1,6}/g) ?? []) {
    request.signal.throwIfAborted();
    await sleep(10);
    onChunk?.(piece);
  }
  return answer;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The prompt is paragraphs: optional context blocks, then the instruction. */
function parts(message: string) {
  const blocks = message
    .trim()
    .split(/\n\n(?=Selected text:\n|Document:\n|Document so far \(Markdown\):\n|[^\n]*$)/);
  const instruction = blocks[blocks.length - 1] ?? '';
  const block = (label: string) => {
    const start = message.indexOf(`${label}\n`);
    if (start === -1) return '';
    const from = start + label.length + 1;
    const end = message.indexOf(`\n\n${instruction}`, from);
    return message.slice(from, end === -1 ? undefined : end).trim();
  };
  return {
    instruction,
    selected: block('Selected text:'),
    document: block('Document:') || block('Document so far (Markdown):'),
  };
}

function compose(message: string, history: AIRequest['messages']): string {
  const { instruction, selected, document } = parts(message);
  const previous = [...history].reverse().find((m) => m.role === 'assistant')?.content;
  const text = selected || document;
  const i = instruction.toLowerCase();

  // A follow-up to an earlier answer works on that answer.
  if (previous && !selected && !document) {
    if (/short|concise|brief/.test(i)) return shorter(previous);
    if (/long|expand|more detail/.test(i)) return longer(previous);
    if (/translat|中文|chinese/.test(i)) return translate(previous);
    if (/table/.test(i)) return toTable(previous);
    if (/list|bullet/.test(i)) return toList(previous);
    if (/title|heading/.test(i)) return `# ${firstWords(previous, 6)}`;
    return `${previous}\n\n*(revised for: “${instruction.slice(0, 60)}” — demo)*`;
  }

  if (/continue writing/.test(i)) return continuation(document);
  if (/summary of the document|summari[sz]e the selected/.test(i)) return summary(text, !!selected);
  if (/outline/.test(i)) return outline(document || selected);
  if (/title for the document/.test(i)) return `# ${firstWords(document || selected, 7)}`;
  if (/action item|task list/.test(i)) return tasks(document || selected);
  if (/correct spelling|spelling and grammar/.test(i)) return fixGrammar(text);
  if (/translate/.test(i)) return translate(text);
  if (/markdown table/.test(i)) return toTable(selected);
  if (/bullet list/.test(i)) return toList(selected);
  if (/more concise|shorter/.test(i)) return shorter(selected);
  if (/expand the selected|longer/.test(i)) return longer(selected);
  if (/plain, simple language|simplif/.test(i)) return simplify(selected);
  if (/explain/.test(i)) return explain(selected);
  if (/reads clearly|improve/.test(i)) return improve(selected);
  if (/tone/.test(i))
    return `${improve(selected)} *(${/professional|casual|confident|friendly/.exec(i)?.[0] ?? 'new'} tone — demo)*`;
  if (/formula|latex|katex/.test(i)) return 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';
  if (/mermaid|diagram|flow/.test(i))
    return 'flowchart TD\n  A[Open editor] --> B{Need help?}\n  B -- yes --> C[Ask AI]\n  B -- no --> D[Keep writing]\n  C --> D';

  // Free-form question: a rich answer that exercises every node type.
  return [
    `## ${firstWords(instruction, 6) || 'Answer'} *(demo answer)*`,
    '',
    selected
      ? `You asked about: **${firstWords(selected, 12)}**.`
      : `You asked: *${instruction.slice(0, 80)}*.`,
    '',
    '| Step | What happens |',
    '| --- | --- |',
    '| 1 | Text streams in from the provider |',
    '| 2 | Markdown is rendered through the editor schema |',
    '| 3 | Real nodes land in the document |',
    '',
    '```ts',
    "editor.commands.applyAI('## Summary…');",
    '```',
    '',
    '- [x] streaming',
    '- [ ] your API key (set `VITE_AI_MODEL` to use a real model)',
  ].join('\n');
}

// --- text transformations -------------------------------------------------

const lines = (text: string) => text.split('\n');
const isMarkup = (line: string) =>
  /^(\s*([-*+]|\d+[.)]|#{1,6}|>|\||```|- \[[ x]\])|^\s*$)/.test(line);
const sentences = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?。！？])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
const firstWords = (text: string, n: number) =>
  text
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`|>-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, n)
    .join(' ');

/** Prose lines only — headings, lists, tables and code keep their shape. */
function mapProse(text: string, fn: (prose: string) => string): string {
  let inCode = false;
  return lines(text)
    .map((line) => {
      if (line.startsWith('```')) inCode = !inCode;
      if (inCode || isMarkup(line)) return line;
      return fn(line);
    })
    .join('\n');
}

const TYPOS: [RegExp, string][] = [
  [/\bteh\b/g, 'the'],
  [/\brecieve(s|d)?\b/g, 'receive$1'],
  [/\bdefinately\b/g, 'definitely'],
  [/\boccured\b/g, 'occurred'],
  [/\bseperate\b/g, 'separate'],
  [/\balot\b/g, 'a lot'],
  [/\bi\b/g, 'I'],
  [/ {2,}/g, ' '],
  [/\s+([,.;:!?])/g, '$1'],
];

/** Two paragraphs that pick up from the document's last heading. */
function continuation(document: string): string {
  const heading = [...document.matchAll(/^#{1,6}\s+(.*)$/gm)].pop()?.[1]?.trim() || 'the document';
  const last = sentences(document.replace(/^[#|>-].*$/gm, '')).pop() ?? '';
  return [
    `Building on ${heading.toLowerCase() === 'the document' ? 'this' : `“${heading}”`}, the next step is to see the answer land while it is still being written: headings, lists and tables take shape as real blocks instead of a preview.${last ? ` It follows straight on from “${firstWords(last, 6)}…”.` : ''}`,
    '',
    'When it stops you can keep it, undo it, or ask for a change — the same span is rewritten in place, and the whole answer is one undo step.',
  ].join('\n');
}

function fixGrammar(text: string): string {
  return mapProse(text, (line) => {
    let out = line;
    for (const [pattern, replacement] of TYPOS) out = out.replace(pattern, replacement);
    out = out.replace(/(^|[.!?]\s+)([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase());
    if (/[a-z0-9)]$/i.test(out.trim()) && out.trim().length > 20) out = `${out.trimEnd()}.`;
    return out;
  });
}

function improve(text: string): string {
  return mapProse(fixGrammar(text), (line) =>
    line
      .replace(/\bvery\s+/gi, '')
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bA rich text editor\b/g, 'A rich-text editor')
      .replace(/\bstuff\b/gi, 'details')
  );
}

function shorter(text: string): string {
  return mapProse(text, (line) => sentences(line).slice(0, 1).join(' '));
}

function longer(text: string): string {
  return mapProse(text, (line) =>
    line.trim()
      ? `${line} ${firstWords(line, 4) ? `In practice, this means ${firstWords(line, 5).toLowerCase()} matters most when the reader is new to it.` : ''}`
      : line
  );
}

function simplify(text: string): string {
  return mapProse(text, (line) =>
    line
      .replace(/\butili[sz]e\b/gi, 'use')
      .replace(/\bfacilitate\b/gi, 'help')
      .replace(/\bapproximately\b/gi, 'about')
      .replace(/\bsubsequently\b/gi, 'then')
      .replace(/;\s*/g, '. ')
  );
}

function explain(text: string): string {
  const points = sentences(text).slice(0, 3);
  return [
    `In plain terms, this passage says: **${firstWords(text, 10)}…**`,
    '',
    ...points.map((s) => `- ${s}`),
  ].join('\n');
}

function summary(text: string, ofSelection: boolean): string {
  const points = sentences(text.replace(/^#+.*$/gm, '').replace(/^\|.*$/gm, ''))
    .filter((s) => s.length > 25)
    .slice(0, 4)
    .map((s) => `- ${firstWords(s, 14)}${s.split(' ').length > 14 ? '…' : ''}`);
  return ofSelection
    ? points.join('\n')
    : [
        '## Summary',
        '',
        ...(points.length ? points : ['- The document is still empty — nothing to summarise yet.']),
      ].join('\n');
}

function outline(text: string): string {
  const headings = lines(text)
    .map((line) => /^(#{1,6})\s+(.*)$/.exec(line))
    .filter((m): m is RegExpExecArray => !!m);
  if (headings.length) {
    return headings
      .map((m) => `${'  '.repeat(Math.max(0, m[1].length - 1))}- ${m[2].trim()}`)
      .join('\n');
  }
  return sentences(text)
    .slice(0, 5)
    .map((s) => `- ${firstWords(s, 8)}`)
    .join('\n');
}

function tasks(text: string): string {
  const found = sentences(text).filter((s) =>
    /\b(should|need|must|todo|try|press|select|drag|type|click)\b/i.test(s)
  );
  const items = (found.length ? found : sentences(text)).slice(0, 5);
  return ['## Action items', '', ...items.map((s) => `- [ ] ${firstWords(s, 12)}`)].join('\n');
}

function toTable(text: string): string {
  const rows = sentences(text).slice(0, 6);
  return [
    '| # | Point |',
    '| --- | --- |',
    ...rows.map((s, i) => `| ${i + 1} | ${s.replace(/\|/g, '\\|')} |`),
  ].join('\n');
}

function toList(text: string): string {
  return sentences(text)
    .slice(0, 8)
    .map((s) => `- ${s}`)
    .join('\n');
}

const GLOSSARY: [RegExp, string][] = [
  [/\bSummary\b/g, '总结'],
  [/\bAction items\b/g, '待办事项'],
  [/\bText\b/g, '文本'],
  [/\bLists?\b/g, '列表'],
  [/\bCode\b/g, '代码'],
  [/\bTables?\b/g, '表格'],
  [/\bEverything else\b/g, '其他'],
  [/\bFeature\b/g, '功能'],
  [/\bShortcut\b/g, '快捷键'],
  [/\bBold\b/g, '加粗'],
  [/\bCode block\b/g, '代码块'],
  [/\bA collapsible section\b/g, '可折叠区块'],
  [/\bSparkWrite\b/g, 'SparkWrite'],
];

/** Keeps the Markdown skeleton and renders each prose line as Chinese. */
function translate(text: string): string {
  let inCode = false;
  return lines(text)
    .map((line) => {
      if (line.startsWith('```')) inCode = !inCode;
      if (inCode || !line.trim()) return line;
      const match = /^(\s*(?:[-*+]|\d+[.)]|#{1,6}|>|- \[[ x]\])\s+)?(.*)$/.exec(line);
      const prefix = match?.[1] ?? '';
      let body = match?.[2] ?? line;
      if (body.startsWith('|')) {
        return body
          .split('|')
          .map((cell) =>
            /^\s*:?-+:?\s*$/.test(cell) || !cell.trim() ? cell : ` ${zh(cell.trim())} `
          )
          .join('|');
      }
      body = zh(body);
      return prefix + body;
    })
    .join('\n');
}

function zh(text: string): string {
  let out = text;
  for (const [pattern, replacement] of GLOSSARY) out = out.replace(pattern, replacement);
  if (out === text) return `${firstWords(text, 3)} 的中文译文（演示）`;
  return out.replace(
    /[A-Za-z][A-Za-z ,.'’-]{12,}/g,
    (english) => `${firstWords(english, 3)}（译）`
  );
}
