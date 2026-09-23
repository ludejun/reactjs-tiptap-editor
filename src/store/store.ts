import { createExternalStore, useExternalStoreValue } from '@/store/externalStore';

const editableEditorStore = createExternalStore<boolean>(false);

function useEditableEditor() {
  return useExternalStoreValue(editableEditorStore);
}

function useStoreEditableEditor() {
  return editableEditorStore.set;
}

export { useStoreEditableEditor, useEditableEditor };
