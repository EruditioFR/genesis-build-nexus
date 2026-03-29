import { useRef, useCallback, useEffect, ClipboardEvent } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading2, Heading3, Quote, Minus, Undo2, Redo2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const ToolbarButton = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={cn(
      "p-1.5 rounded-md transition-colors hover:bg-muted",
      active && "bg-primary/10 text-primary"
    )}
  >
    {children}
  </button>
);

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  className,
  minHeight = '250px',
}: RichTextEditorProps) => {
  const { t } = useTranslation('capsules');
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value changes into the editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      // If content is just <br> or empty divs, treat as empty
      const cleaned = html.replace(/<br\s*\/?>/gi, '').replace(/<div><\/div>/gi, '').trim();
      onChange(cleaned ? html : '');
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');

    if (html) {
      // Parse and clean the pasted HTML
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // Remove all style attributes, class attributes, and unwanted tags
      doc.querySelectorAll('*').forEach((el) => {
        el.removeAttribute('style');
        el.removeAttribute('class');
        el.removeAttribute('id');
        el.removeAttribute('dir');
        el.removeAttribute('lang');
        el.removeAttribute('data-stringify-type');
      });
      // Remove script, style, meta, link tags
      doc.querySelectorAll('script, style, meta, link, head, title, comment').forEach((el) => el.remove());
      // Only keep allowed tags
      const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'HR', 'DIV', 'SPAN', 'A']);
      const cleanNode = (node: Element) => {
        Array.from(node.children).forEach((child) => {
          if (!allowed.has(child.tagName)) {
            // Replace with its text content
            const text = document.createTextNode(child.textContent || '');
            child.replaceWith(text);
          } else {
            cleanNode(child);
          }
        });
      };
      cleanNode(doc.body);
      const cleaned = doc.body.innerHTML;
      document.execCommand('insertHTML', false, cleaned);
    } else {
      document.execCommand('insertText', false, plain);
    }
    handleInput();
  }, [handleInput]);

  const isActive = (command: string) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const iconSize = "w-4 h-4";

  return (
    <div className={cn("border-2 rounded-xl overflow-hidden bg-background focus-within:border-primary transition-colors", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">
        <ToolbarButton onClick={() => execCommand('bold')} title="Gras" active={isActive('bold')}>
          <Bold className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italique" active={isActive('italic')}>
          <Italic className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="Souligné" active={isActive('underline')}>
          <Underline className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand('formatBlock', '<h2>')} title="Titre">
          <Heading2 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<h3>')} title="Sous-titre">
          <Heading3 className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Liste à puces" active={isActive('insertUnorderedList')}>
          <List className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Liste numérotée" active={isActive('insertOrderedList')}>
          <ListOrdered className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<blockquote>')} title="Citation">
          <Quote className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand('insertHorizontalRule')} title="Séparateur">
          <Minus className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('undo')} title="Annuler">
          <Undo2 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('redo')} title="Rétablir">
          <Redo2 className={iconSize} />
        </ToolbarButton>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={cn(
          "px-4 py-3 text-lg text-foreground outline-none",
          "prose prose-lg max-w-none",
          "prose-headings:text-foreground prose-headings:font-bold",
          "prose-h2:text-xl prose-h3:text-lg",
          "prose-p:my-1 prose-ul:my-1 prose-ol:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground/50"
        )}
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;
