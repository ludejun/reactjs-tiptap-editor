<script setup lang="ts">
import { useData, withBase } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { computed } from 'vue';

const { frontmatter, lang } = useData();

const en = {
  how: 'How it works',
  howText:
    "Every answer is Markdown, parsed through the editor's own schema. Nothing is pasted; a table is a table.",
  ask: 'Ask',
  askText:
    'Type in the composer under the editor, click a chip (continue, summarize, outline, title, action items, grammar, translate), select text and pick Improve, or press Space on an empty line.',
  land: 'Watch it land',
  landText:
    'The model streams into a tracked span in the page. Headings, lists, tables, code and task lists take shape as real nodes while the text is still arriving.',
  keep: 'Keep, undo or refine',
  keepText:
    'The whole answer is one undo step. Keep it, put the original back, retry, or type a follow-up and the same span is rewritten with the conversation so far.',
  shotAlt: 'The editor with the AI composer open under the document',
  core: 'One core, two UIs',
  coreText1: 'Extensions, the AI engine and every block live in a framework-free core.',
  coreText2: 'is the React import,',
  coreText3: 'the Vue one — same features, same stylesheet.',
};

const zh = {
  how: '它是怎么工作的',
  howText: '每个回答都是 Markdown，经编辑器自己的 schema 解析。不是粘贴：表格就是表格。',
  ask: '提问',
  askText:
    '在编辑器下方的 AI 写作台输入，点一个快捷动作（续写、总结、提纲、标题、行动项、语法、翻译），选中文字后点“改进”，或在空行按空格。',
  land: '看它落进页面',
  landText:
    '模型流式写入页面中一段被跟踪的区域。标题、列表、表格、代码和任务列表在文字还在到达时就已成为真实节点。',
  keep: '保留、撤销或继续改',
  keepText:
    '整个回答是一步撤销。保留它、恢复原文、重试，或再输入一句追问，同一区域会带着之前的对话被重写。',
  shotAlt: '编辑器下方打开了 AI 写作台',
  core: '一个核心，两套 UI',
  coreText1: '扩展、AI 引擎和每个块都在框架无关的核心里。',
  coreText2: '是 React 的入口，',
  coreText3: '是 Vue 的入口——同样的功能，同一份样式。',
};

const t = computed(() => (lang.value.startsWith('zh') ? zh : en));
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-features-after>
      <section v-if="frontmatter.layout === 'home'" class="sw-section">
        <h2>{{ t.how }}</h2>
        <p>{{ t.howText }}</p>
        <div class="sw-steps">
          <div class="sw-step">
            <b>1</b>
            <h3>{{ t.ask }}</h3>
            <p>{{ t.askText }}</p>
          </div>
          <div class="sw-step">
            <b>2</b>
            <h3>{{ t.land }}</h3>
            <p>{{ t.landText }}</p>
          </div>
          <div class="sw-step">
            <b>3</b>
            <h3>{{ t.keep }}</h3>
            <p>{{ t.keepText }}</p>
          </div>
        </div>
        <div class="sw-shot">
          <img :src="withBase('/screenshot.png')" :alt="t.shotAlt" />
        </div>
      </section>

      <section v-if="frontmatter.layout === 'home'" class="sw-section">
        <h2>{{ t.core }}</h2>
        <p>
          {{ t.coreText1 }}
          <code>ai-sparkwrite-editor</code> {{ t.coreText2 }} <code>ai-sparkwrite-editor/vue</code>
          {{ t.coreText3 }}
        </p>
        <div class="sw-frameworks">
          <div>
            <h3>React</h3>
            <pre><code>import { RichTextKit, RichTextKitToolbar, RichTextKitMenus } from 'ai-sparkwrite-editor';

useEditor({ extensions: [RichTextKit.configure({ ai: { endpoint: '/api/ai' } })] });

&lt;RichTextProvider editor={editor}&gt;
  &lt;RichTextKitToolbar /&gt;
  &lt;EditorContent editor={editor} /&gt;
  &lt;RichTextKitMenus /&gt;
&lt;/RichTextProvider&gt;</code></pre>
          </div>
          <div>
            <h3>Vue</h3>
            <pre><code>import { RichTextKit, RichTextKitToolbar, RichTextKitMenus } from 'ai-sparkwrite-editor/vue';

useEditor({ extensions: [RichTextKit.configure({ ai: { endpoint: '/api/ai' } })] });

&lt;RichTextProvider :editor="editor"&gt;
  &lt;RichTextKitToolbar /&gt;
  &lt;EditorContent :editor="editor" /&gt;
  &lt;RichTextKitMenus /&gt;
&lt;/RichTextProvider&gt;</code></pre>
          </div>
        </div>
      </section>
    </template>
  </DefaultTheme.Layout>
</template>
