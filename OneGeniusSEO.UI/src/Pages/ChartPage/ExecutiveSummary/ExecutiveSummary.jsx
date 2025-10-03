import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { FaPencilAlt } from "react-icons/fa";
import ImageUploadButton from "./Image/ImageUploadsButton";
import { ImageNode, $createImageNode } from "../ExecutiveSummary/Image/ImageNode";
import ImagePlugin from "../ExecutiveSummary/Image/ImagePlugin";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import style from "./ExecutiveSummary.module.css";

const Toolbar = ({ onImageSelected }) => {
  const [editor] = useLexicalComposerContext();

  return (
    <div
      className="toolbar mb-2"
      style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
    >
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        style={{ minWidth: "40px" }}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        style={{ minWidth: "40px" }}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        style={{ minWidth: "40px" }}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const heading = $createHeadingNode("h3");
              const text = $createTextNode(selection.getTextContent());
              heading.append(text);
              selection.insertNodes([heading]);
            }
          });
        }}
        style={{ minWidth: "40px" }}
      >
        H3
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        style={{ minWidth: "40px" }}
      >
        • List
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        style={{ minWidth: "40px" }}
      >
        1. List
      </button>
      <ImageUploadButton onImageSelected={onImageSelected} />
    </div>
  );
};

const ExecutiveSummary = ({
  showSummary,
  summaryText,
  summaryImages = [],
  onSaveSummary,
  onDeleteSummary,
}) => {
  const [isEditing, setIsEditing] = useState(!summaryText);
  const [tempSummaryText, setTempSummaryText] = useState(summaryText || "");
  const [attachedImages, setAttachedImages] = useState([]);

  useEffect(() => {
    setTempSummaryText(summaryText || "");
    setIsEditing(!summaryText);
  }, [summaryText]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // ensure we preserve existing images by converting data URLs to Files
    const dataUrlToFile = (dataUrl, filename = "image.png") => {
      try {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
      } catch (e) {
        return null;
      }
    };

    const files = attachedImages
      .map((i, idx) => (i.file ? i.file : (i.dataUrl ? dataUrlToFile(i.dataUrl, `image_${idx}.png`) : null)))
      .filter((f) => !!f);
    onSaveSummary(tempSummaryText, files);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSummaryText(summaryText);
    setIsEditing(false);
  };

  const renderSummaryText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    let currentList = [];
    let listType = null;
    const elements = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("- ")) {
        if (listType !== "ul") {
          if (currentList.length > 0) {
            elements.push(
              <listType key={`list-${index}`} className={style.summary_para}>
                {currentList}
              </listType>
            );
            currentList = [];
          }
          listType = "ul";
        }
        currentList.push(
          <li key={`bullet-${index}`}>{trimmedLine.substring(2).trim()}</li>
        );
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        if (listType !== "ol") {
          if (currentList.length > 0) {
            elements.push(
              <listType key={`list-${index}`} className={style.summary_para}>
                {currentList}
              </listType>
            );
            currentList = [];
          }
          listType = "ol";
        }
        currentList.push(
          <li key={`numbered-${index}`}>
            {trimmedLine.replace(/^\d+\.\s/, "").trim()}
          </li>
        );
      } else if (trimmedLine.startsWith("# ")) {
        if (currentList.length > 0) {
          elements.push(
            <listType key={`list-${index}`} className={style.summary_para}>
              {currentList}
            </listType>
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <h3 key={`heading-${index}`} className={style.summary_heading}>
            {trimmedLine.substring(2).trim()}
          </h3>
        );
      } else {
        if (currentList.length > 0) {
          elements.push(
            <listType key={`list-${index}`} className={style.summary_para}>
              {currentList}
            </listType>
          );
          currentList = [];
          listType = null;
        }
        if (trimmedLine) {
          elements.push(
            <p key={`para-${index}`} className={style.summary_para}>
              {trimmedLine}
            </p>
          );
        }
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <listType key={`list-end`} className={style.summary_para}>
          {currentList}
        </listType>
      );
    }

    return elements;
  };

  const editorConfig = {
    namespace: "ExecutiveSummaryEditor",
    nodes: [ListNode, ListItemNode, HeadingNode, LinkNode, ImageNode],
    onError: (error) => console.error("Lexical Error:", error),
    theme: {
      paragraph: style.summary_para,
      heading: {
        h3: style.summary_heading,
      },
      list: {
        ul: style.summary_para,
        ol: style.summary_para,
      },
      text: {
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
      },
    },
    editorState: summaryText
      ? () => {
          const root = $getRoot();
          const lines = summaryText.split("\n");
          let currentList = null;
          let currentListType = null;

          lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("- ")) {
              if (currentListType !== "bullet") {
                if (currentList) {
                  root.append(currentList);
                }
                currentList = new ListNode("bullet");
                currentListType = "bullet";
              }
              const item = new ListItemNode();
              const text = $createTextNode(trimmedLine.substring(2).trim());
              if (trimmedLine.includes("<u>")) {
                text.setFormat("underline");
              }
              if (trimmedLine.includes("<b>")) {
                text.setFormat("bold");
              }
              if (trimmedLine.includes("<i>")) {
                text.setFormat("italic");
              }
              item.append(text);
              currentList.append(item);
            } else if (trimmedLine.match(/^\d+\.\s/)) {
              if (currentListType !== "number") {
                if (currentList) {
                  root.append(currentList);
                }
                currentList = new ListNode("number");
                currentListType = "number";
              }
              const item = new ListItemNode();
              const text = $createTextNode(
                trimmedLine.replace(/^\d+\.\s/, "").trim()
              );
              if (trimmedLine.includes("<u>")) {
                text.setFormat("underline");
              }
              if (trimmedLine.includes("<b>")) {
                text.setFormat("bold");
              }
              if (trimmedLine.includes("<i>")) {
                text.setFormat("italic");
              }
              item.append(text);
              currentList.append(item);
            } else if (trimmedLine.startsWith("# ")) {
              if (currentList) {
                root.append(currentList);
                currentList = null;
                currentListType = null;
              }
              const heading = $createHeadingNode("h3");
              heading.append($createTextNode(trimmedLine.substring(2).trim()));
              root.append(heading);
            } else {
              if (currentList) {
                root.append(currentList);
                currentList = null;
                currentListType = null;
              }
              const paragraph = $createParagraphNode();
              const text = $createTextNode(trimmedLine);
              if (trimmedLine.includes("<u>")) {
                text.setFormat("underline");
              }
              if (trimmedLine.includes("<b>")) {
                text.setFormat("bold");
              }
              if (trimmedLine.includes("<i>")) {
                text.setFormat("italic");
              }
              paragraph.append(text);
              root.append(paragraph);
            }
          });

          if (currentList) {
            root.append(currentList);
          }

          // Append images passed from API so they are visible when editing
          if (Array.isArray(summaryImages) && summaryImages.length > 0) {
            summaryImages.forEach((src) => {
              if (src) {
                const imageNode = $createImageNode(src, "");
                root.append(imageNode);
              }
            });
          }
        }
      : null,
  };

  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const output = [];
      const imageDataUrls = [];
      root.getChildren().forEach((node) => {
        if (node.getType() === "paragraph") {
          const text = node.getTextContent();
          if (text) {
            const format = node.getFormat();
            if (format & 1) output.push(`<b>${text}</b>`);
            if (format & 2) output.push(`<i>${text}</i>`);
            if (format & 4) output.push(`<u>${text}</u>`);
            if (!(format & (1 | 2 | 4))) output.push(text);
          }
        } else if (node.getType() === "list") {
          const prefix = node.getListType() === "bullet" ? "- " : "1. ";
          node.getChildren().forEach((item) => {
            const text = item.getTextContent();
            const format = item.getFormat();
            if (format & 1) output.push(`${prefix}<b>${text}</b>`);
            if (format & 2) output.push(`${prefix}<i>${text}</i>`);
            if (format & 4) output.push(`${prefix}<u>${text}</u>`);
            if (!(format & (1 | 2 | 4))) output.push(`${prefix}${text}`);
          });
        } else if (node.getType() === "heading") {
          output.push(`# ${node.getTextContent()}`);
        } else if (node.getType && node.getType() === "image") {
          const src = node.__src;
          if (src) imageDataUrls.push(src);
        }
      });

      setTempSummaryText(output.join("\n"));
      if (imageDataUrls.length) {
        setAttachedImages((prev) => {
          const existing = new Set(prev.map((p) => p.dataUrl));
          const additions = imageDataUrls
            .filter((src) => src.startsWith("data:") && !existing.has(src))
            .map((src) => ({ file: null, dataUrl: src }));
          return additions.length ? [...prev, ...additions] : prev;
        });
      }
    });
  };

  const handleImageSelected = (file, dataUrl) => {
    setAttachedImages((prev) => [...prev, { file, dataUrl }]);
  };

  useEffect(() => {
    if (isEditing) {
      // seed existing images into attachedImages so they persist on save
      if (Array.isArray(summaryImages) && summaryImages.length > 0) {
        setAttachedImages((prev) => {
          if (prev.length > 0) return prev;
          return summaryImages.map((src) => ({ file: null, dataUrl: src }));
        });
      }
    }
  }, [isEditing, summaryImages]);

  return (
    <>
      {showSummary && (
        <>
          <h4
            className={`${style.summary_text} mb-2 mt-2`}
            style={{ fontSize: "16px", fontWeight: 600, textAlign: "left" }}
          >
            Executive Summary:
            {summaryText && (
              <>
                <FaPencilAlt
                  title="Edit"
                  className={style.edit_button}
                  onClick={handleEdit}
                  style={{
                    cursor: "pointer",
                    marginLeft: "12px",
                    fontSize: "14px",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
                <span
                  className={style.delete_button}
                  onClick={onDeleteSummary}
                  style={{
                    cursor: "pointer",
                    marginLeft: "12px",
                    color: "white",
                    fontSize: "14px",
                    display: "none",
                  }}
                >
                  [Delete]
                </span>
              </>
            )}
          </h4>

          {isEditing ? (
            <Form.Group className="mb-3">
              <LexicalComposer initialConfig={editorConfig}>
                <Toolbar onImageSelected={handleImageSelected} />
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className={`${style.textarea} form-control`}
                      style={{
                        minHeight: "200px",
                        fontSize: "16px",
                        lineHeight: "1.6",
                        padding: "12px",
                      }}
                    />
                  }
                  placeholder={
                    <div
                      className="placeholder"
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        color: "#999",
                        fontSize: "16px",
                      }}
                    >
                      Enter executive summary...
                    </div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <ListPlugin />
                <ImagePlugin />
                <OnChangePlugin onChange={handleEditorChange} />
                <div className="mt-3" style={{ display: "flex", gap: "10px" }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    style={{ padding: "8px 20px" }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancel}
                    style={{ padding: "8px 20px" }}
                  >
                    Cancel
                  </Button>
                </div>
              </LexicalComposer>
            </Form.Group>
          ) : (
            summaryText && (
              <div
                className={`${style.summary_container} mb-3`}
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                {renderSummaryText(summaryText)}
                {Array.isArray(summaryImages) && summaryImages.length > 0 && (
                  <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                    {summaryImages.map((src, idx) => (
                      <img key={idx} src={src} alt={`summary-${idx}`} style={{ width: "100%", height: "auto", borderRadius: "4px" }} />)
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}
    </>
  );
};

export default ExecutiveSummary;
