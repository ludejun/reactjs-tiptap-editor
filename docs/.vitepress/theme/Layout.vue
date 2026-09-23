<script setup lang="ts">
import { useData, withBase } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

const { frontmatter } = useData();
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-features-after>
      <section v-if="frontmatter.layout === 'home'" class="sw-section">
        <h2>How it works</h2>
        <p>
          Every answer is Markdown, parsed through the editor's own schema. Nothing is pasted; a
          table is a table.
        </p>
        <div class="sw-steps">
          <div class="sw-step">
            <b>1</b>
            <h3>Ask</h3>
            <p>
              Type in the composer under the editor, click a chip (continue, summarize, outline,
              title, action items, grammar, translate), select text and pick Improve, or press Space
              on an empty line.
            </p>
          </div>
          <div class="sw-step">
            <b>2</b>
            <h3>Watch it land</h3>
            <p>
              The model streams into a tracked span in the page. Headings, lists, tables, code and
              task lists take shape as real nodes while the text is still arriving.
            </p>
          </div>
          <div class="sw-step">
            <b>3</b>
            <h3>Keep, undo or refine</h3>
            <p>
              The whole answer is one undo step. Keep it, put the original back, retry, or type a
              follow-up and the same span is rewritten with the conversation so far.
            </p>
          </div>
        </div>
        <div class="sw-shot">
          <img
            :src="withBase('/screenshot.png')"
            alt="The editor with the AI composer open under the document"
          />
        </div>
      </section>

      <section v-if="frontmatter.layout === 'home'" class="sw-section">
        <h2>One core, two UIs</h2>
        <p>
          Extensions, the AI engine and every block live in a framework-free core.
          <code>ai-sparkwrite-editor/&lt;feature&gt;</code> adds the React control,
          <code>ai-sparkwrite-editor/vue</code> the Vue one, on the same stylesheet.
        </p>
        <div class="sw-frameworks">
          <div>
            <h3>React</h3>
            <pre><code>import { AI, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/ai';
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';

&lt;RichTextProvider editor={editor}&gt;
  &lt;RichTextToolbar&gt;&lt;RichTextAI /&gt;&lt;RichTextBold /&gt;&lt;/RichTextToolbar&gt;
  &lt;EditorContent editor={editor} /&gt;
  &lt;RichTextAIComposer /&gt;
&lt;/RichTextProvider&gt;</code></pre>
          </div>
          <div>
            <h3>Vue</h3>
            <pre><code>import { Bold } from 'ai-sparkwrite-editor/core';
import { AI, RichTextAI, RichTextAIComposer, RichTextBold } from 'ai-sparkwrite-editor/vue';

&lt;RichTextProvider :editor="editor"&gt;
  &lt;RichTextToolbar&gt;&lt;RichTextAI /&gt;&lt;RichTextBold /&gt;&lt;/RichTextToolbar&gt;
  &lt;EditorContent :editor="editor" /&gt;
  &lt;RichTextAIComposer /&gt;
&lt;/RichTextProvider&gt;</code></pre>
          </div>
        </div>
      </section>
    </template>
  </DefaultTheme.Layout>
</template>
