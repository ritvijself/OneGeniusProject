import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Table } from "react-bootstrap";
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
import { PiNotePencilFill } from "react-icons/pi";
import { format } from "date-fns";
import ImageUploadButton from "./Image/ImageUploadsButton";
import ImagePlugin from "./Image/ImagePlugin";
import { ImageNode, $createImageNode } from "./Image/ImageNode";
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
import { formatDateLocal } from "../../../utils/FormatDate";

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

// Plugin to move caret to the end when activated
const FocusAtEndPlugin = ({ active }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => {
      editor.update(() => {
        try {
          const root = $getRoot();
          root.selectEnd();
        } catch (e) {
          // no-op
        }
      });
    }, 0);
    return () => clearTimeout(id);
  }, [active, editor]);
  return null;
};

const ExecutiveSummaryItem = ({
  summary,
  onSave,
  onDelete,
  onCancel,
  isEditing: initialEditing,
  title,
  // NEW: control visibility of the inline edit icon
  showInlineEdit = true, // default true preserves old behavior
  // NEW: allow forcing edit from parent
  forceEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing || forceEditing);
  const [tempSummaryText, setTempSummaryText] = useState(
    summary?.summary || ""
  );
  const [attachedImages, setAttachedImages] = useState([]);
  const contentEditableRef = useRef(null);
  const scrollPosRef = useRef({
    x: typeof window !== "undefined" ? window.scrollX : 0,
    y: typeof window !== "undefined" ? window.scrollY : 0,
  });

  const lockScrollPosition = () => {
    scrollPosRef.current = { x: window.scrollX, y: window.scrollY };
  };

  useEffect(() => {
    // keep in sync when parent toggles forceEditing
    if (forceEditing) {
      // capture current scroll so it can be restored after editor mounts
      lockScrollPosition();
      setIsEditing(true);
    }
  }, [forceEditing]);

  // Seed existing images into the edit state when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setAttachedImages((prev) => {
        // If already seeded, don't duplicate
        const hasExistingSeed = prev.some((img) => img && img.existing === true);
        if (hasExistingSeed) return prev;
        const seeded = Array.isArray(summary?.images)
          ? summary.images
              .filter(Boolean)
              .slice(0, 3)
              .map((src) => ({ file: null, dataUrl: src, existing: true }))
          : [];
        return seeded;
      });
    } else {
      // Clear edit buffer when leaving edit mode
      setAttachedImages([]);
    }
  }, [isEditing, summary?.images]);

  // When entering edit mode, focus editor without changing page scroll position
  useEffect(() => {
    if (!isEditing) return;
    const { x, y } = scrollPosRef.current;
    const raf = requestAnimationFrame(() => {
      try {
        contentEditableRef.current?.focus({ preventScroll: true });
      } catch (e) {
        // ignore
      }
      // restore the scroll position to avoid any auto-scroll jump
      window.scrollTo(x, y);
    });
    return () => cancelAnimationFrame(raf);
  }, [isEditing]);

  const handleSave = () => {
    // Only send newly attached image files. Keep existing images on server intact.
    const existingUrls = attachedImages
      .filter((image) => image && image.existing && image.dataUrl)
      .map((image) => image.dataUrl);
    const newFilesAll = attachedImages
      .filter((image) => image && !image.existing && image.file)
      .map((image) => image.file);

    // Enforce max 3 total
    const remainingSlots = Math.max(0, 3 - existingUrls.length);
    const newFiles = newFilesAll.slice(0, remainingSlots);

    onSave(tempSummaryText, newFiles, existingUrls);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSummaryText(summary?.summary || "");
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  const handleEdit = () => {
    // capture current scroll so opening editor doesn't change page position
    lockScrollPosition();
    setIsEditing(true);
  };

  const renderSummaryText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    let currentList = [];
    let listType = null;
    const elements = [];

    lines.forEach((line, index) => {
      let trimmedLine = line.trim();
      // ignore first line title match
      if (trimmedLine === title && index === 0) {
        return;
      }
      let isBold = false;
      let content = trimmedLine;
      if (trimmedLine.startsWith("<b>") && trimmedLine.endsWith("</b>")) {
        isBold = true;
        content = trimmedLine.replace(/<\/?b>/g, "").trim();
      }

      if (trimmedLine.startsWith("- ")) {
        if (listType !== "ul") {
          if (currentList.length > 0) {
            elements.push(
              React.createElement(
                listType,
                { key: `list-${index}`, className: style.summary_para },
                currentList
              )
            );
            currentList = [];
          }
          listType = "ul";
        }
        currentList.push(
          <li key={`bullet-${index}`}>
            {isBold ? (
              <b>{content.substring(2).trim()}</b>
            ) : (
              content.substring(2).trim()
            )}
          </li>
        );
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        if (listType !== "ol") {
          if (currentList.length > 0) {
            elements.push(
              React.createElement(
                listType,
                { key: `list-${index}`, className: style.summary_para },
                currentList
              )
            );
            currentList = [];
          }
          listType = "ol";
        }
        currentList.push(
          <li key={`numbered-${index}`}>
            {isBold ? (
              <b>{content.replace(/^\d+\.\s/, "").trim()}</b>
            ) : (
              content.replace(/^\d+\.\s/, "").trim()
            )}
          </li>
        );
      } else if (trimmedLine.startsWith("# ")) {
        if (currentList.length > 0) {
          elements.push(
            React.createElement(
              listType,
              { key: `list-${index}`, className: style.summary_para },
              currentList
            )
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <h3 key={`heading-${index}`} className={style.summary_heading}>
            {isBold ? (
              <b>{content.substring(2).trim()}</b>
            ) : (
              content.substring(2).trim()
            )}
          </h3>
        );
      } else {
        if (currentList.length > 0) {
          elements.push(
            React.createElement(
              listType,
              { key: `list-${index}`, className: style.summary_para },
              currentList
            )
          );
          currentList = [];
          listType = null;
        }
        if (trimmedLine) {
          elements.push(
            <p key={`para-${index}`} className={style.summary_para}>
              {isBold ? <b>{content}</b> : content}
            </p>
          );
        }
      }
    });

    if (currentList.length > 0) {
      elements.push(
        React.createElement(
          listType,
          { key: `list-end`, className: style.summary_para },
          currentList
        )
      );
    }

    return elements;
  };

  const editorConfig = {
    namespace: `ExecutiveSummaryEditor-${summary?.summarySeq || "new"}`,
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
    editorState: tempSummaryText
      ? () => {
          const root = $getRoot();
          const lines = tempSummaryText.split("\n");
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
          // append existing images
          if (Array.isArray(summary?.images) && summary.images.length > 0) {
            summary.images.forEach((src) => {
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

      root.getChildren().forEach((node) => {
        if (node.getType() === "paragraph" || node.getType() === "heading") {
          const text = node.getTextContent();
          if (text) {
            const format = node.getFormat();
            let formattedText = text;
            if (format & 1) formattedText = `<b>${text}</b>`;
            if (format & 2) formattedText = `<i>${text}</i>`;
            if (format & 4) formattedText = `<u>${text}</u>`;
            output.push(formattedText);
          }
        } else if (node.getType() === "list") {
          const prefix = node.getListType() === "bullet" ? "- " : "1. ";
          node.getChildren().forEach((item) => {
            const text = item.getTextContent();
            const format = item.getFormat();
            let formattedText = prefix + text;
            if (format & 1) formattedText = prefix + `<b>${text}</b>`;
            if (format & 2) formattedText = prefix + `<i>${text}</i>`;
            if (format & 4) formattedText = prefix + `<u>${text}</u>`;
            output.push(formattedText);
          });
        }
      });

      setTempSummaryText(output.join("\n"));
    });
  };

  const handleImageSelected = (file, dataUrl) => {
    setAttachedImages((prev) => {
      const next = [...prev, { file, dataUrl, existing: false }];
      // Keep only first 3
      return next.slice(0, 3);
    });
  };

  // Do not seed attached images; include existing ones in the outgoing payload on save

  return (
    <div
      className="mb-4"
      style={{
        borderBottom: "1px solid #eee",
        paddingBottom: "20px",
        borderRadius: "8px",
        padding: "10px",
        border: "1px solid grey",
      }}
    >
      <h4
        className={`${style.summary_text} mb-2 mt-2`}
        style={{ fontSize: "16px", textDecoration: "none" }}
      >
        {summary &&
          showInlineEdit && ( // UPDATED: make inline edit conditional
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
                onClick={() => onDelete(summary.summarySeq)}
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
                  ref={contentEditableRef}
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
                  Enter summary...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <ImagePlugin />
            <OnChangePlugin onChange={handleEditorChange} />
            <FocusAtEndPlugin active={isEditing} />
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
        summary?.summary && (
          <div
            className={`${style.summary_container} mb-3`}
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            {renderSummaryText(summary.summary)}
            {Array.isArray(summary?.images) && summary.images.length > 0 && (
              <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                {summary.images.map((src, idx) => (
                  <img key={idx} src={src} alt={`summary-${idx}`} style={{ width: "100%", height: "auto", borderRadius: "4px" }} />
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

const CompareExecutiveSummary = ({
  startDate,
  clientSeq,
  onInitialSummaryFetch,
}) => {
  const [labelSummaries, setLabelSummaries] = useState([]);
  const [executiveSummaries, setExecutiveSummaries] = useState([]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isAddingExecutive, setIsAddingExecutive] = useState(false);

  // NEW: track which label items are in edit mode when header icon clicked with existing records
  const [forceEditLabelIds, setForceEditLabelIds] = useState([]); // array of summarySeq
  // NEW: track which executive items are in edit mode when header icon clicked with existing records
  const [forceEditExecutiveIds, setForceEditExecutiveIds] = useState([]); // array of summarySeq

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedMonthYear = startDate
    ? format(new Date(startDate), "MMM yy")
    : "";

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!token || !clientSeq) return;

      try {
        const formattedStart = formatDateLocal(startDate);

        const [labelResponse, executiveResponse] = await Promise.all([
          fetch(
            `${apibaseurl}/api/ExecutiveSummary/compare-LabelSummary?_startDate=${formattedStart}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${apibaseurl}/api/ExecutiveSummary/compare-ExecutiveSummary?_startDate=${formattedStart}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        const labelData = labelResponse.ok ? await labelResponse.json() : [];
        const executiveData = executiveResponse.ok
          ? await executiveResponse.json()
          : [];

        setLabelSummaries(labelData);
        setExecutiveSummaries(executiveData);

        // reset header-driven edit state on new fetch
        setForceEditLabelIds([]);
        setForceEditExecutiveIds([]);

        if (onInitialSummaryFetch) {
          onInitialSummaryFetch({
            labelSummaries: labelData,
            executiveSummaries: executiveData,
          });
        }
      } catch (err) {
        console.error("Error fetching summaries:", err);
        setLabelSummaries([]);
        setExecutiveSummaries([]);
        setForceEditLabelIds([]);
      }
    };
    fetchSummaries();
  }, [apibaseurl, token, clientSeq, startDate, onInitialSummaryFetch]);

  const handleAddNewLabelSummary = () => setIsAddingLabel(true);
  const handleAddNewExecutiveSummary = () => setIsAddingExecutive(true);
  const handleCancelNewLabel = () => setIsAddingLabel(false);
  const handleCancelNewExecutive = () => setIsAddingExecutive(false);

  // Ensure future header-pencil clicks can re-open items after cancel
  const handleCancelLabelEdit = (summarySeq) => {
    setForceEditLabelIds((prev) => prev.filter((id) => id !== summarySeq));
  };
  const handleCancelExecutiveEdit = (summarySeq) => {
    setForceEditExecutiveIds((prev) => prev.filter((id) => id !== summarySeq));
  };

  const handleSaveSummary = async (text, summarySeq, type, imageFiles = [], existingUrls = []) => {
    if (!token || !clientSeq) return;

    try {
      const formattedStart = formatDateLocal(startDate);
      let createdDate = formattedStart;
      if (!summarySeq && type === "label") {
        const dateObj = new Date(formattedStart);
        dateObj.setMonth(dateObj.getMonth() - 1);
        createdDate = dateObj.toISOString();
      }

      const flag =
        type === "label" ? "labelsummary" : "compareexecutivesummary";

      let response;

      const formData = new FormData();
      formData.append("summary", text || "");
      formData.append("summaryFlag", flag);
      formData.append("createdDate", createdDate);
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach((file) => file && formData.append("Images", file));
      }
      // Pass through existing image URLs so backend can retain them
      formData.append("existingImageUrls", JSON.stringify(Array.isArray(existingUrls) ? existingUrls.slice(0, 3) : []));

      if (summarySeq) {
        response = await fetch(
          `${apibaseurl}/api/ExecutiveSummary/update/${summarySeq}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      } else {
        response = await fetch(`${apibaseurl}/api/ExecutiveSummary/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (summarySeq) {
          if (type === "label") {
            setLabelSummaries((prev) =>
              prev.map((s) =>
                s.summarySeq === summarySeq
                  ? { ...s, summary: text, images: (data.imageUrls || s.images || []).slice(0, 3) }
                  : s
              )
            );
            // exit force edit for this item after save
            setForceEditLabelIds((prev) =>
              prev.filter((id) => id !== summarySeq)
            );
          } else {
            setExecutiveSummaries((prev) =>
              prev.map((s) =>
                s.summarySeq === summarySeq
                  ? { ...s, summary: text, images: (data.imageUrls || s.images || []).slice(0, 3) }
                  : s
              )
            );
            // exit force edit for this item after save
            setForceEditExecutiveIds((prev) =>
              prev.filter((id) => id !== summarySeq)
            );
          }
        } else {
          if (type === "label") {
            // Ensure images capped at 3 if backend returns more
            const created = data && data.imageUrls ? { ...data, images: (data.imageUrls || []).slice(0, 3) } : data;
            setLabelSummaries((prev) => [...prev, created]);
            setIsAddingLabel(false);
          } else {
            const created = data && data.imageUrls ? { ...data, images: (data.imageUrls || []).slice(0, 3) } : data;
            setExecutiveSummaries((prev) => [...prev, created]);
            setIsAddingExecutive(false);
          }
        }
      } else {
        console.error(
          `Failed to ${summarySeq ? "update" : "create"} ${type} summary:`,
          response.statusText
        );
      }
    } catch (err) {
      console.error(
        `Error ${summarySeq ? "updating" : "creating"} ${type} summary:`,
        err
      );
    }
  };

  const handleDeleteSummary = async (summarySeq, type) => {
    if (!token || !clientSeq || !summarySeq) return;

    try {
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;

      const response = await fetch(
        `${apibaseurl}/api/ExecutiveSummary/delete/${summarySeq}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ clientSeq, createdDate }),
        }
      );

      if (response.ok) {
        if (type === "label") {
          setLabelSummaries((prev) =>
            prev.filter((s) => s.summarySeq !== summarySeq)
          );
          setForceEditLabelIds((prev) =>
            prev.filter((id) => id !== summarySeq)
          );
        } else {
          setExecutiveSummaries((prev) =>
            prev.filter((s) => s.summarySeq !== summarySeq)
          );
          setForceEditExecutiveIds((prev) =>
            prev.filter((id) => id !== summarySeq)
          );
        }
      } else {
        console.error("Failed to delete summary:", response.statusText);
        return false;
      }
    } catch (err) {
      console.error("Error deleting summary:", err);
      return false;
    }

    return true;
  };

  // NEW: header click handler for "Task recommended for"
  const handleHeaderLabelClick = () => {
    if (labelSummaries.length === 0) {
      // no records -> create new (original behavior)
      setIsAddingLabel(true);
      setForceEditLabelIds([]);
    } else {
      // records exist -> edit the first one
      const firstId = labelSummaries[0]?.summarySeq; // <-- FIXED
      setForceEditLabelIds(firstId ? [firstId] : []);
      setIsAddingLabel(false);
    }
  };

  // NEW: header click handler for "Task done in"
  const handleHeaderExecutiveClick = () => {
    if (executiveSummaries.length === 0) {
      // no records -> create new
      setIsAddingExecutive(true);
      setForceEditExecutiveIds([]);
    } else {
      // records exist -> edit the first one
      const firstId = executiveSummaries[0]?.summarySeq;
      setForceEditExecutiveIds(firstId ? [firstId] : []);
      setIsAddingExecutive(false);
    }
  };

  return (
    <div
      className="pb-3"
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        background: "#fff",
      }}
    >
      <Table responsive bordered>
        <thead>
          <tr>
            <th className={style.table_header}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="m-0">
                  Task recommended for {formattedMonthYear}
                </h6>
                {/* UPDATED: header icon now conditionally creates or edits */}
                <PiNotePencilFill
                  onClick={handleHeaderLabelClick}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                />
              </div>
            </th>
            <th className={style.table_header}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="m-0">Task done in {formattedMonthYear}</h6>
                <PiNotePencilFill
                  onClick={handleHeaderExecutiveClick}
                  style={{ cursor: "pointer", fontSize: "20px" }}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* Label Summaries Column */}
            <td className={style.table_cell}>
              {labelSummaries.length === 0 ? (
                <div
                  className="text-center p-3"
                  style={{ color: "gray", fontSize: "16px" }}
                >
                  No Task Found
                </div>
              ) : (
                labelSummaries.map((summary) => (
                  <ExecutiveSummaryItem
                    key={`label-${summary.summarySeq}`}
                    summary={summary}
                    onSave={(text, files, existingUrls) =>
                      handleSaveSummary(text, summary.summarySeq, "label", files, existingUrls)
                    }
                    onDelete={(seq) => handleDeleteSummary(seq, "label")}
                    onCancel={() => handleCancelLabelEdit(summary.summarySeq)}
                    title={`Task recommended for ${formattedMonthYear}`}
                    // UPDATED: hide inline edit icon when records present and header should act as edit
                    showInlineEdit={false}
                    // UPDATED: force editing for the one chosen by header click
                    forceEditing={forceEditLabelIds.includes(
                      summary.summarySeq
                    )}
                  />
                ))
              )}
              {/* When header creates new */}
              {isAddingLabel && labelSummaries.length === 0 && (
                <ExecutiveSummaryItem
                  onSave={(text, files, existingUrls) => handleSaveSummary(text, null, "label", files, existingUrls)}
                  onCancel={handleCancelNewLabel}
                  isEditing={true}
                  title=""
                  showInlineEdit={false}
                />
              )}
            </td>

            {/* Executive Summaries Column */}
            <td className={style.table_cell}>
              {executiveSummaries.length === 0 ? (
                <div
                  className="text-center p-3"
                  style={{ color: "gray", fontSize: "16px" }}
                >
                  No Task Found
                </div>
              ) : (
                executiveSummaries.map((summary) => (
                  <ExecutiveSummaryItem
                    key={`executive-${summary.summarySeq}`}
                    summary={summary}
                    onSave={(text, files, existingUrls) =>
                      handleSaveSummary(text, summary.summarySeq, "executive", files, existingUrls)
                    }
                    onDelete={(seq) => handleDeleteSummary(seq, "executive")}
                    onCancel={() =>
                      handleCancelExecutiveEdit(summary.summarySeq)
                    }
                    title={`Task done in ${formattedMonthYear}`}
                    showInlineEdit={false}
                    forceEditing={forceEditExecutiveIds.includes(
                      summary.summarySeq
                    )}
                  />
                ))
              )}
              {isAddingExecutive && executiveSummaries.length === 0 && (
                <ExecutiveSummaryItem
                  onSave={(text, files, existingUrls) => handleSaveSummary(text, null, "executive", files, existingUrls)}
                  onCancel={handleCancelNewExecutive}
                  isEditing={true}
                  title=""
                  showInlineEdit={false}
                />
              )}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default CompareExecutiveSummary;
