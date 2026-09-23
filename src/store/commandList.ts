import { type CommandList } from '@/extensions/SlashCommand/types';
import { createExternalStore, useExternalStoreValue } from '@/store/externalStore';

const commandListStore = createExternalStore<CommandList[]>([]);

export function useSignalCommandList() {
  const commandList = useExternalStoreValue(commandListStore);

  return [commandList, commandListStore.set] as const;
}
