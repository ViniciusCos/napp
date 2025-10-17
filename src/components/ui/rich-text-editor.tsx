'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useEffect } from 'react'
import { Label } from './label'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type RichTextEditorProps = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  placeholder = 'Digite aqui...',
  disabled = false,
  rows = 6,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Desabilitar link do StarterKit para usar nossa configuração personalizada
        link: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
          disabled && 'opacity-50 cursor-not-allowed'
        ),
        style: `min-height: ${rows * 24}px`,
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const MenuButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-gray-100 transition-colors',
        active && 'bg-gray-200 text-blue-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )

  const ColorPicker = () => {
    const colors = [
      { name: 'Preto', value: '#000000' },
      { name: 'Azul', value: '#2563eb' },
      { name: 'Verde', value: '#16a34a' },
      { name: 'Vermelho', value: '#dc2626' },
      { name: 'Laranja', value: '#ea580c' },
      { name: 'Roxo', value: '#9333ea' },
    ]

    return (
      <div className="relative group">
        <button
          type="button"
          title="Cor do texto"
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <Palette className="w-4 h-4" />
        </button>
        <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border rounded-lg shadow-lg p-2 z-10">
          <div className="grid grid-cols-3 gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.name}
                onClick={() => editor.chain().focus().setColor(color.value).run()}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        className={cn(
          'border rounded-lg overflow-hidden',
          disabled ? 'bg-gray-50 border-gray-200' : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            disabled={disabled}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            disabled={disabled}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            disabled={disabled}
            title="Sublinhado (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            disabled={disabled}
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            disabled={disabled}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            disabled={disabled}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            disabled={disabled}
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            disabled={disabled}
            title="Alinhar à direita"
          >
            <AlignRight className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {!disabled && <ColorPicker />}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

