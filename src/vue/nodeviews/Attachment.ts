/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { Trash2 } from 'lucide-vue-next';
import { defineComponent, h, onMounted, ref } from 'vue';

import { AttachmentCore } from '@/extensions/Attachment/Attachment';
import { getFileTypeIconMarkup } from '@/extensions/Attachment/fileIcon';
import { extractFileExtension, extractFilename, normalizeFileSize } from '@/utils/file';

import { useLocale } from '../context';
import { RichTextToolbarButton } from '../ui';

import styles from '@/extensions/Attachment/components/NodeViewAttachment/index.module.scss';

/**
 * Same DOM and classes as the React `NodeViewAttachment`: a prompt that opens
 * the file picker until the upload finishes, then the file card with its type
 * icon, name, size and a delete button.
 */
export const AttachmentNodeView = defineComponent({
  name: 'AttachmentNodeView',
  props: nodeViewProps,
  setup(props) {
    const { t } = useLocale();
    const loading = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);

    const selectFile = () => {
      if (!props.editor.isEditable || props.node.attrs.url) return;

      fileInput.value?.click();
    };

    const handleFile = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) return;

      const fileInfo = {
        fileName: extractFilename(file.name),
        fileSize: file.size,
        fileType: file.type,
        fileExt: extractFileExtension(file.name),
      };
      const upload = props.extension.options.upload as
        | ((file: File) => Promise<string>)
        | undefined;

      loading.value = true;

      try {
        if (!upload) throw new Error('Attachment upload function is not configured');

        const url = await upload(file);
        props.updateAttributes({ ...fileInfo, url });
      } catch (error) {
        props.updateAttributes({
          error: `File upload fail: ${error instanceof Error && error.message}`,
        });
        input.value = '';
      } finally {
        loading.value = false;
      }
    };

    // A freshly inserted attachment opens the picker straight away, once.
    onMounted(() => {
      const { url, hasTrigger } = props.node.attrs;

      if (!url && !hasTrigger) {
        selectFile();
        props.updateAttributes({ hasTrigger: true });
      }
    });

    return () => {
      const { fileName, fileSize, fileExt, fileType, url, error } = props.node.attrs;
      const isEditable = props.editor.isEditable;

      if (isEditable && !url) {
        return h(NodeViewWrapper, null, () => [
          h('div', { class: [styles.wrap, 'render-wrapper'] }, [
            h('p', { style: { cursor: 'pointer' }, onClick: selectFile }, [
              h(
                'span',
                loading.value
                  ? t('editor.attachment.uploading')
                  : t('editor.attachment.please_upload')
              ),
            ]),
            h('input', { ref: fileInput, hidden: true, type: 'file', onChange: handleFile }),
          ]),
        ]);
      }

      if (url) {
        return h(NodeViewWrapper, null, () => [
          h('div', { class: [styles.wrap, 'render-wrapper'], onClick: selectFile }, [
            h('div', { class: 'richtext-flex richtext-items-center richtext-gap-[4px]' }, [
              // Our own static SVG strings, the same ones `renderHTML` emits.
              h('span', { innerHTML: getFileTypeIconMarkup(fileType) }),
              h('span', `${fileName}.${fileExt}`),
              h('span', `(${normalizeFileSize(fileSize)})`),
            ]),
            isEditable
              ? h(RichTextToolbarButton, {
                  icon: Trash2,
                  tooltip: t('editor.delete'),
                  onClick: () => props.deleteNode(),
                })
              : null,
          ]),
        ]);
      }

      if (error !== 'null') {
        return h(NodeViewWrapper, null, () => [
          h('div', { class: [styles.wrap, 'render-wrapper'], onClick: selectFile }, [
            h('p', error),
          ]),
        ]);
      }

      return h(NodeViewWrapper, null);
    };
  },
});

/** `AttachmentCore` with the Vue node view: file picker, upload state, file card. */
export const Attachment = /* @__PURE__ */ AttachmentCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(AttachmentNodeView);
  },
});
