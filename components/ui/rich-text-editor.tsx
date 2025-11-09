"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { Node, mergeAttributes } from '@tiptap/core'
import { useState, useEffect } from 'react'
import { UploadService } from '@/lib/services/uploadService'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings
} from 'lucide-react'

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Custom Image extension with width/height support
const CustomImage = Node.create({
  name: 'image',
  
  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
});

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedImageSize, setSelectedImageSize] = useState<string>('');
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issue
    extensions: [
      StarterKit,
      CustomImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto shadow-lg mx-auto block my-4 cursor-pointer resizable-image',
        },
        allowBase64: true,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      ListItem,
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc ml-6',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal ml-6',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Track selected image size
  useEffect(() => {
    if (!editor) return;
    
    const handleSelectionUpdate = () => {
      const { state } = editor;
      const { selection } = state;
      
      const node = state.doc.nodeAt(selection.from);
      if (node && node.type.name === 'image') {
        const width = node.attrs.width || 'auto';
        const height = node.attrs.height || 'auto';
        setSelectedImageSize(`${width}${typeof width === 'number' ? 'px' : ''} × ${height}${typeof height === 'number' ? 'px' : ''}`);
      } else {
        setSelectedImageSize('');
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
    };
  }, [editor]);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setIsUploading(true);
      try {
        const result = await UploadService.uploadImage(file);
        // Move cursor to end and insert image
        if (editor) {
          const { state } = editor;
          const { doc } = state;
          const endPos = doc.content.size;
          
          editor.chain()
            .focus()
            .setTextSelection(endPos)
            .setImage({ 
              src: result.url,
              alt: file.name,
              title: file.name
            })
            .run();
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  const resizeImage = (scale: number) => {
    if (!editor) return;
    
    const { state } = editor;
    const { selection } = state;
    
    // Get the current node at selection
    const node = state.doc.nodeAt(selection.from);
    if (node && node.type.name === 'image') {
      const currentSrc = node.attrs.src;
      const currentAlt = node.attrs.alt || '';
      const currentTitle = node.attrs.title || '';
      const currentWidth = node.attrs.width || 300; // Default width if not set
      
      // Calculate new width
      const newWidth = Math.max(50, Math.min(800, Math.round(currentWidth * scale)));
      
      // Update the image with new attributes
      editor.chain().focus().setImage({
        src: currentSrc,
        alt: currentAlt,
        title: currentTitle,
        width: newWidth
      }).run();
    }
  };

  const resizeImageWithInput = () => {
    if (!editor) return;
    
    const { state } = editor;
    const { selection } = state;
    
    const node = state.doc.nodeAt(selection.from);
    if (node && node.type.name === 'image') {
      // Set current values in inputs
      setCustomWidth(node.attrs.width?.toString() || '');
      setCustomHeight(node.attrs.height?.toString() || '');
      setShowResizeModal(true);
    }
  };

  const applyCustomResize = () => {
    if (!editor) return;
    
    const { state } = editor;
    const { selection } = state;
    
    const node = state.doc.nodeAt(selection.from);
    if (node && node.type.name === 'image') {
      const currentSrc = node.attrs.src;
      const currentAlt = node.attrs.alt || '';
      const currentTitle = node.attrs.title || '';
      
      const newWidth = customWidth ? parseInt(customWidth) : undefined;
      const newHeight = customHeight ? parseInt(customHeight) : undefined;
      
      editor.chain().focus().setImage({
        src: currentSrc,
        alt: currentAlt,
        title: currentTitle,
        width: newWidth,
        height: newHeight
      }).run();
      
      setShowResizeModal(false);
      setCustomWidth('');
      setCustomHeight('');
    }
  };

  const resetImageSize = () => {
    if (!editor) return;
    
    const { state } = editor;
    const { selection } = state;
    
    // Get the current node at selection
    const node = state.doc.nodeAt(selection.from);
    if (node && node.type.name === 'image') {
      const currentSrc = node.attrs.src;
      const currentAlt = node.attrs.alt || '';
      const currentTitle = node.attrs.title || '';
      
      // Reset to original size (remove width/height attributes)
      editor.chain().focus().setImage({
        src: currentSrc,
        alt: currentAlt,
        title: currentTitle
        // Don't set width/height to let it use natural size
      }).run();
    }
  };

  const handleAddLink = () => {
    setShowLinkModal(true);
  };

  const applyLink = () => {
    if (!editor || !linkUrl || !linkText) return;

    editor.chain().focus().insertContent({
      type: 'text',
      text: linkText,
      marks: [
        {
          type: 'link',
          attrs: {
            href: linkUrl,
            target: '_blank'
          }
        }
      ]
    }).run();

    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const updateSelectedLink = () => {
    if (!editor || !linkUrl || !linkText) return;

    editor.chain().focus().setLink({ href: linkUrl, target: '_blank' }).run();
    
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };

  if (!mounted || !editor) {
    return (
      <div className="border rounded-lg h-96 flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Custom CSS for resizable images */}
      <style jsx>{`
        .resizable-image {
          resize: both !important;
          overflow: hidden !important;
          min-width: 50px !important;
          min-height: 50px !important;
          max-width: 100% !important;
          border: 2px dashed transparent;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .resizable-image:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        .resizable-image:focus {
          border-color: #1d4ed8;
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        
        /* Make images responsive and centered */
        .ProseMirror img {
          display: block !important;
          margin: 1rem auto !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          cursor: pointer;
          max-width: 100% !important;
          height: auto !important;
        }
        
        .ProseMirror img[width] {
          width: attr(width px) !important;
        }
        
        .ProseMirror img[height] {
          height: attr(height px) !important;
        }
        
        .ProseMirror img:hover {
          box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        /* Selected image styling */
        .ProseMirror img.ProseMirror-selectednode {
          border: 3px solid #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
        }
        
        /* Resize handle styling */
        .ProseMirror img.ProseMirror-selectednode::after {
          content: '↘️';
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: #3b82f6;
          color: white;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 10px;
          opacity: 0.8;
        }
        
        /* Custom scrollbar for editor */
        .ProseMirror {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .ProseMirror::-webkit-scrollbar {
          width: 8px;
        }
        
        .ProseMirror::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .ProseMirror::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('strike') ? 'bg-gray-200' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Quote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Link */}
        <button
          onClick={handleAddLink}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-gray-200' : ''
          }`}
          title="Thêm liên kết"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor.isActive('link') && (
          <button
            onClick={removeLink}
            className="p-2 rounded hover:bg-gray-100 text-red-600"
            title="Xóa liên kết"
          >
            <span className="text-xs">✕</span>
          </button>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Image Upload */}
        <button
          onClick={handleImageUpload}
          disabled={isUploading}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Image Resize Controls */}
        <button
          onClick={() => resizeImage(1.2)}
          className="p-2 rounded hover:bg-gray-100"
          title="Phóng to ảnh"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => resizeImage(0.8)}
          className="p-2 rounded hover:bg-gray-100"
          title="Thu nhỏ ảnh"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetImageSize}
          className="p-2 rounded hover:bg-gray-100"
          title="Reset kích thước ảnh"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={resizeImageWithInput}
          className="p-2 rounded hover:bg-gray-100"
          title="Tùy chỉnh kích thước"
        >
          <Settings className="w-4 h-4" />
        </button>
        
        {/* Image Size Display */}
        {selectedImageSize && (
          <div className="px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded">
            {selectedImageSize}
          </div>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[300px]"
        placeholder={placeholder || "Nhập nội dung..."}
      />

      {/* Resize Modal */}
      {showResizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Tùy chỉnh kích thước ảnh</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chiều rộng (px)
                </label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập chiều rộng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chiều cao (px)
                </label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập chiều cao"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowResizeModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={applyCustomResize}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Thêm liên kết</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Văn bản hiển thị
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập văn bản hiển thị"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={applyLink}
                  disabled={!linkUrl || !linkText}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm liên kết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}