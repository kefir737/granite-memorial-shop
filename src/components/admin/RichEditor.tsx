import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef } from 'react';
import Icon from '@/components/ui/icon';
import { compressImage } from '@/lib/compress';

const UPLOAD_URL = '/upload-image';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder = 'Введите текст...' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const uploadImage = async (file: File) => {
    try {
      const compressed = await compressImage(file, 1600);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const b64 = e.target?.result as string;
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: b64, fileName: compressed.name, contentType: compressed.type }),
        });
        const data = await res.json();
        if (data.ok) editor.chain().focus().setImage({ src: data.url }).run();
      };
      reader.readAsDataURL(compressed);
    } catch (e) { console.error('upload error', e); }
  };

  const btn = (active: boolean, onClick: () => void, icon: string, title: string) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-foreground text-white' : 'text-muted-foreground hover:text-foreground hover:bg-stone-100'}`}
    >
      <Icon name={icon} size={14} />
    </button>
  );

  return (
    <div className="border border-border">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-stone-50">
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold', 'Жирный')}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic', 'Курсив')}
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading2', 'Заголовок H2')}
        {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Heading3', 'Заголовок H3')}
        <div className="w-px h-4 bg-border mx-1" />
        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'List', 'Список')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'ListOrdered', 'Нумерованный список')}
        {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Quote', 'Цитата')}
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          title="Вставить изображение"
          onClick={() => fileRef.current?.click()}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-stone-100 transition-colors"
        >
          <Icon name="Image" size={14} />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        {btn(false, () => editor.chain().focus().undo().run(), 'Undo', 'Отменить')}
        {btn(false, () => editor.chain().focus().redo().run(), 'Redo', 'Повторить')}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded"
      />

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
    </div>
  );
}