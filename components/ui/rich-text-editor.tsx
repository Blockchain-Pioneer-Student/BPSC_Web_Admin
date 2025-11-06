"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        apiKey="um1n2yyk9t6ytgltph4g2lupbiogzt1kexhx2mf9em7dqf6l" // You can get a free API key from TinyMCE
        onInit={(_evt: any, editor: any) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
            'emoticons', 'template', 'codesample'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | link image media | table | code codesample | fullscreen',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #004987;
              font-weight: 600;
              margin: 1rem 0 0.5rem 0;
            }
            a {
              color: #004987;
            }
            p {
              margin: 0 0 1rem 0;
            }
            ul, ol {
              margin: 0 0 1rem 1.5rem;
            }
            blockquote {
              margin: 1rem 0;
              padding: 0.5rem 1rem;
              border-left: 4px solid #004987;
              background-color: #f8f9fa;
            }
            code {
              background-color: #f1f3f4;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-family: 'Monaco', 'Consolas', monospace;
              font-size: 0.875em;
            }
            pre {
              background-color: #f8f9fa;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              border: 1px solid #e9ecef;
            }
          `,
          placeholder: placeholder || "Nhập nội dung sự kiện...",
          branding: false,
          promotion: false,
          skin: 'oxide',
          content_css: 'default',
          directionality: 'ltr',
          language: 'vi',
          // Custom toolbar groups
          toolbar_mode: 'sliding',
          // Image upload (you can customize this)
images_upload_handler: (blobInfo) => {
  return new Promise((resolve) => {
    const img = 'data:image/jpeg;base64,' + blobInfo.base64();
    resolve(img);
  });
},
          // Link options
          link_default_target: '_blank',
          link_assume_external_targets: true,
          // Table options
          table_default_attributes: {
            class: 'table table-bordered'
          },
          table_default_styles: {
            width: '100%',
            'border-collapse': 'collapse'
          },
          // Code sample languages
          codesample_languages: [
            {text: 'HTML/XML', value: 'markup'},
            {text: 'JavaScript', value: 'javascript'},
            {text: 'CSS', value: 'css'},
            {text: 'Python', value: 'python'},
            {text: 'Java', value: 'java'},
            {text: 'C++', value: 'cpp'},
            {text: 'C#', value: 'csharp'},
            {text: 'PHP', value: 'php'}
          ],
          // Enable paste from Word
          paste_word_valid_elements: 'b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ol,ul,li,a[href],span,color,font-size,font-color,font-family,mark,table,tr,td,th,tbody,thead,tfoot',
          paste_retain_style_properties: 'color font-size font-family',
          // Advanced options
          convert_urls: false,
          remove_script_host: false,
          document_base_url: '/',
        }}
      />
    </div>
  );
}