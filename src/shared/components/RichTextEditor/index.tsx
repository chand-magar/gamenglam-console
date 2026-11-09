import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect } from 'react';
import './RichTextEditor.css';

interface Props {
  value:      string;
  onChange:   (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  error?:     boolean;
}

type ToolbarBtn = {
  title:   string;
  icon:    string;
  action:  () => void;
  active?: boolean;
};

export const RichTextEditor = ({ value, onChange, placeholder, minHeight = 220, error }: Props) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rte-content',
        style: `min-height:${minHeight}px`,
        'data-placeholder': placeholder ?? 'Write your email content here…',
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn = (b: ToolbarBtn) => (
    <button
      key={b.title}
      type="button"
      title={b.title}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!editor || editor.isDestroyed) return;
        b.action();
      }}
      className={`rte-btn${b.active ? ' rte-btn-active' : ''}`}
    >
      <i className={b.icon} />
    </button>
  );

  const setLink = () => {
    if (editor.isDestroyed) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const toolbarGroups: ToolbarBtn[][] = [
    [
      { title: 'Bold',      icon: 'fa-solid fa-bold',         action: () => editor.chain().focus().toggleBold().run(),      active: editor.isActive('bold')      },
      { title: 'Italic',    icon: 'fa-solid fa-italic',       action: () => editor.chain().focus().toggleItalic().run(),    active: editor.isActive('italic')    },
      { title: 'Underline', icon: 'fa-solid fa-underline',    action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
      { title: 'Strike',    icon: 'fa-solid fa-strikethrough', action: () => editor.chain().focus().toggleStrike().run(),   active: editor.isActive('strike')    },
    ],
    [
      { title: 'H1', icon: 'fa-solid fa-heading',     action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
      { title: 'H2', icon: 'fa-solid fa-h',           action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
      { title: 'H3', icon: 'fa-solid fa-text-height', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    ],
    [
      { title: 'Bullet list',  icon: 'fa-solid fa-list-ul',     action: () => editor.chain().focus().toggleBulletList().run(),  active: editor.isActive('bulletList')  },
      { title: 'Ordered list', icon: 'fa-solid fa-list-ol',     action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
      { title: 'Blockquote',   icon: 'fa-solid fa-quote-right', action: () => editor.chain().focus().toggleBlockquote().run(),  active: editor.isActive('blockquote')  },
      { title: 'Code block',   icon: 'fa-solid fa-code',        action: () => editor.chain().focus().toggleCode().run(),        active: editor.isActive('code')        },
    ],
    [
      { title: 'Align left',   icon: 'fa-solid fa-align-left',   action: () => editor.chain().focus().setTextAlign('left').run(),   active: editor.isActive({ textAlign: 'left' })   },
      { title: 'Align center', icon: 'fa-solid fa-align-center', action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
      { title: 'Align right',  icon: 'fa-solid fa-align-right',  action: () => editor.chain().focus().setTextAlign('right').run(),  active: editor.isActive({ textAlign: 'right' })  },
    ],
    [
      { title: 'Link',    icon: 'fa-solid fa-link',       action: setLink,                                               active: editor.isActive('link') },
      { title: 'Unlink',  icon: 'fa-solid fa-link-slash', action: () => editor.chain().focus().unsetLink().run(),        active: false                   },
      { title: 'Divider', icon: 'fa-solid fa-minus',      action: () => editor.chain().focus().setHorizontalRule().run(), active: false                  },
    ],
    [
      { title: 'Undo', icon: 'fa-solid fa-rotate-left',  action: () => editor.chain().focus().undo().run() },
      { title: 'Redo', icon: 'fa-solid fa-rotate-right', action: () => editor.chain().focus().redo().run() },
    ],
  ];

  return (
    <div className={`rte-wrapper${error ? ' rte-wrapper-error' : ''}`}>
      <div className="rte-toolbar">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="rte-group">
            {group.map(btn)}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
