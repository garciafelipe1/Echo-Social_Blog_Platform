import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Toolbar from './tiptap/Toolbar';

export interface TipTapEditorProps {
  data: string;
  setData: (value: string) => void;
  maxTextLength: number;
}

function TiptapEditor({ data, setData, maxTextLength }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: localStorage.getItem('tiptap-content') || data || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `focus:outline-none focus:ring-transparent py-2 px-1 w-full prose`,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const updatedContent = currentEditor.getHTML();
      const plainText = currentEditor.getText();

      if (maxTextLength && plainText.length > maxTextLength) {
        const truncatedText = plainText.slice(0, maxTextLength);
        currentEditor.commands.setContent(truncatedText);
        setData(currentEditor.getHTML());
      } else {
        setData(updatedContent);
        localStorage.setItem('tiptap-content', updatedContent); // Guardar en localStorage
      }
    },
  });

  useEffect(() => {
    if (editor && data && localStorage.getItem('tiptap-content') !== data) {
      editor.commands.setContent(data);
      localStorage.removeItem('tiptap-content'); // Limpiar localStorage si los datos externos cambian
    }
  }, [data, editor]);

  useEffect(() => {
    if (editor && data === '') {
      editor.commands.clearContent();
    }
  }, [data, editor]);
  return (
    <div className="w-full">
      <Toolbar editor={editor} maxTextLength={maxTextLength} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default TiptapEditor;
