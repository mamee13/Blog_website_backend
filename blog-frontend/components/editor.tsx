'use client';

import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const Quill = require('quill');
      if (!quillRef.current && editorRef.current) {
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: 'Write your content here...',
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean'],
            ],
          },
        });

        quillRef.current.on('text-change', () => {
          const content = quillRef.current.root.innerHTML;
          onChange(content);
        });
      }

      if (quillRef.current && value !== quillRef.current.root.innerHTML) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value, onChange]);

  return (
    <div className="w-full">
      <div 
        ref={editorRef} 
        className="editor-theme"  // Apply your theme class here
        style={{ 
          height: '300px',
          marginBottom: '40px'
        }}
      />
    </div>
  );
}