// ImagePlugin.js
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createImageNode } from './ImageNode';
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical';

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND');

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const selection = $getSelection();
        const imageNode = $createImageNode(payload.src, payload.alt);
        if ($isRangeSelection(selection)) {
          selection.insertNodes([imageNode]);
        } else {
          // If no selection (e.g., editor not focused), append to end so it shows immediately
          editor.update(() => {
            const root = $getRoot();
            root.append(imageNode);
          });
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}