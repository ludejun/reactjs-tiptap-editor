/**
 * Vue node views for the block extensions. Each file exports the extension
 * with its Vue node view (`<Name>` = `<Name>Core.extend({ addNodeView })`) and
 * the component itself (`<Name>NodeView`). They render the same DOM and
 * classes as the React node views, so the shared stylesheet applies unchanged.
 */
export * from './Attachment';
export * from './Callout';
export * from './CodeBlock';
export * from './Iframe';
export * from './Image';
export * from './ImageGif';
export * from './Katex';
export * from './Mermaid';
export * from './TableOfContents';
export { useImageResize, selectNode, RESIZE_DIRECTIONS } from './resize';
export type { ImageResizeOptions } from './resize';
