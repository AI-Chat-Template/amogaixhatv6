"use client";

import { exampleSetup } from "prosemirror-example-setup";
import { inputRules } from "prosemirror-inputrules";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { memo, useEffect, useRef } from "react";

import type { Suggestion } from "@/lib/db/schema";
import {
  documentSchema,
  handleTransaction,
  headingRule,
} from "@/lib/editor/config";
import {
  buildContentFromDocument,
  buildDocumentFromContent,
  createDecorations,
} from "@/lib/editor/functions";
import {
  projectWithPositions,
  suggestionsPlugin,
  suggestionsPluginKey,
} from "@/lib/editor/suggestions";

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Suggestion[];
};

function PureEditor({
  content,
  onSaveContent,
  suggestions,
  status,
}: EditorProps) {
  console.log("PureEditor - content:", content?.substring(0, 100));
  console.log("PureEditor - status:", status);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);

  useEffect(() => {
    console.log("Editor init effect - content:", content?.substring(0, 50), "editor exists:", !!editorRef.current);
    
    if (containerRef.current && !editorRef.current) {
      console.log("Creating new editor with content:", content?.substring(0, 50));
      try {
        const state = EditorState.create({
          doc: buildDocumentFromContent(content),
          plugins: [
            ...exampleSetup({ schema: documentSchema, menuBar: false }),
            inputRules({
              rules: [
                headingRule(1),
                headingRule(2),
                headingRule(3),
                headingRule(4),
                headingRule(5),
                headingRule(6),
              ],
            }),
            suggestionsPlugin,
          ],
        });

        editorRef.current = new EditorView(containerRef.current, {
          state,
        });
        console.log("Editor created successfully");
      } catch (error) {
        console.error("Error creating editor:", error);
      }
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, [content]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setProps({
        dispatchTransaction: (transaction) => {
          handleTransaction({
            transaction,
            editorRef,
            onSaveContent,
          });
        },
      });
    }
  }, [onSaveContent]);

  useEffect(() => {
    console.log("Content update effect - content:", content?.substring(0, 50), "status:", status);
    
    if (editorRef.current && content) {
      const currentContent = buildContentFromDocument(
        editorRef.current.state.doc
      );

      console.log("Current doc content:", currentContent?.substring(0, 50));
      console.log("Content different?", currentContent !== content);

      if (status === "streaming") {
        const newDocument = buildDocumentFromContent(content);

        const transaction = editorRef.current.state.tr.replaceWith(
          0,
          editorRef.current.state.doc.content.size,
          newDocument.content
        );

        transaction.setMeta("no-save", true);
        editorRef.current.dispatch(transaction);
        console.log("Updated editor with streaming content");
        return;
      }

      if (currentContent !== content) {
        console.log("Updating editor with new content");
        const newDocument = buildDocumentFromContent(content);

        const transaction = editorRef.current.state.tr.replaceWith(
          0,
          editorRef.current.state.doc.content.size,
          newDocument.content
        );

        transaction.setMeta("no-save", true);
        editorRef.current.dispatch(transaction);
      } else {
        console.log("Content same, no update needed");
      }
    } else {
      console.log("No editor or no content - skipping update");
    }
  }, [content, status]);

  useEffect(() => {
    if (editorRef.current?.state.doc && content) {
      const projectedSuggestions = projectWithPositions(
        editorRef.current.state.doc,
        suggestions
      ).filter(
        (suggestion) => suggestion.selectionStart && suggestion.selectionEnd
      );

      const decorations = createDecorations(
        projectedSuggestions,
        editorRef.current
      );

      const transaction = editorRef.current.state.tr;
      transaction.setMeta(suggestionsPluginKey, { decorations });
      editorRef.current.dispatch(transaction);
    }
  }, [suggestions, content]);

  return (
    <div className="prose dark:prose-invert relative" ref={containerRef}>
      {/* Debug fallback - show content directly if editor doesn't load */}
      {content && (
        <div className="editor-content">
          {content.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line || ' '}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// Don't use memo at all - always re-render when content changes
// This ensures the editor always shows the latest document content
export const Editor = PureEditor;
