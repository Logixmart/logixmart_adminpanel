import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from 'lucide-react';
import { countWords } from '../../utils/html';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxWords?: number;
  maxLength?: number;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Start writing…',
  maxWords,
  maxLength,
  className = '',
}: RichTextEditorProps) {
  const lastValidHtml = useRef(value || '');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const text = ed.getText();
      const overWordLimit = maxWords != null && countWords(text) > maxWords;
      const overCharLimit = maxLength != null && text.length > maxLength;
      if (overWordLimit || overCharLimit) {
        ed.commands.setContent(lastValidHtml.current, { emitUpdate: false });
        return;
      }
      lastValidHtml.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
      lastValidHtml.current = value || '';
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  const isEmpty = !editor.getText().trim();

  const buttonClass = (active = false) =>
    `rounded-md p-1.5 sm:p-2 transition disabled:opacity-40 disabled:pointer-events-none ${
      active
        ? 'bg-accent-primary/15 text-accent-primary'
        : 'text-text-secondary hover:bg-brand-hover hover:text-text-primary'
    }`;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-brand-border bg-brand-dark/40 ${
        disabled ? 'opacity-60' : ''
      } ${className}`}
    >
      <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 border-b border-brand-border bg-brand-card/80 p-1.5 sm:p-2">
        <button
          type="button"
          className={buttonClass(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          title="Bold"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>

        <span className="mx-0.5 sm:mx-1 h-5 border-l border-brand-border" />

        <button
          type="button"
          className={buttonClass(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          title="Heading"
        >
          <Heading2 size={16} />
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          title="Bullet list"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive('link'))}
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href as string | undefined;
            const url = window.prompt('Enter URL', previousUrl || '');

            if (url === null) return;

            if (!url.trim()) {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }

            if (!/^https?:\/\//i.test(url.trim())) {
              window.alert('Please enter a URL starting with http:// or https://');
              return;
            }

            editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .setLink({ href: url.trim() })
              .run();
          }}
          disabled={disabled}
          title="Insert link"
        >
          <LinkIcon size={16} />
        </button>

        <span className="mx-0.5 sm:mx-1 h-5 border-l border-brand-border" />

        <button
          type="button"
          className={buttonClass()}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Undo"
        >
          <Undo2 size={16} />
        </button>

        <button
          type="button"
          className={buttonClass()}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div className="relative">
        {isEmpty && (
          <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4 text-xs text-text-muted">
            {placeholder}
          </div>
        )}
        <EditorContent
          editor={editor}
          className="rich-text-content min-h-[180px] sm:min-h-[220px] p-3 sm:p-4"
        />
      </div>
    </div>
  );
}
