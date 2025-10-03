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
import { format, addMonths } from "date-fns";
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
  $nodesOfType,
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

const ExecutiveSummaryItem = ({
  summary,
  onSave,
  onDelete,
  onCancel,
  isEditing: initialEditing,
  title,
  // control visibility of the inline edit icon
  showInlineEdit = true,
  // allow forcing edit from parent
  forceEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing || forceEditing);
  const [tempSummaryText, setTempSummaryText] = useState(
    summary?.summary || ""
  );
  const [attachedImages, setAttachedImages] = useState([]);
  const [editorInitialized, setEditorInitialized] = useState(false);
  // Keep a live ref of the latest text so Save always has the freshest value
  const latestSummaryTextRef = useRef(summary?.summary || "");

  useEffect(() => {
    if (forceEditing) {
      setIsEditing(true);
      // Reset attached images when entering edit mode
      setAttachedImages([]);
      setEditorInitialized(false);
    }
  }, [forceEditing]);

  const handleSave = () => {
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

    const existingFiles = Array.isArray(summary?.images)
      ? summary.images
          .map((src, idx) => dataUrlToFile(src, `existing_${idx}.png`))
          .filter(Boolean)
      : [];
    const newFiles = attachedImages
      .map((i, idx) =>
        i.file
          ? i.file
          : i.dataUrl
          ? dataUrlToFile(i.dataUrl, `image_${idx}.png`)
          : null
      )
      .filter(Boolean);
    const files = [...existingFiles, ...newFiles];
    // Use the latest ref to avoid stale state when saving immediately after an image/text change
    const textToSave = latestSummaryTextRef.current ?? tempSummaryText;
    onSave(textToSave, files);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSummaryText(summary?.summary || "");
    setIsEditing(false);
    setAttachedImages([]);
    setEditorInitialized(false);
    if (onCancel) onCancel();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setAttachedImages([]);
    setEditorInitialized(false);
  };

  const renderSummaryText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    let currentList = [];
    let listType = null;
    const elements = [];

    lines.forEach((line, index) => {
      let trimmedLine = line.trim();
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
    editorState:
      tempSummaryText && !editorInitialized
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
                heading.append(
                  $createTextNode(trimmedLine.substring(2).trim())
                );
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

            // Only append existing images when first entering edit mode
            if (
              Array.isArray(summary?.images) &&
              summary.images.length > 0 &&
              !editorInitialized
            ) {
              summary.images.forEach((src) => {
                if (src) {
                  const imageNode = $createImageNode(src, "");
                  root.append(imageNode);
                }
              });
              setEditorInitialized(true);
            }
          }
        : null,
  };

  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const output = [];
      const imageNodes = $nodesOfType(ImageNode);

      // Update attached images based on current editor state
      const currentImageUrls = imageNodes
        .map((node) => node.getSrc())
        .filter(Boolean);
      setAttachedImages(currentImageUrls.map((url) => ({ dataUrl: url })));

      root.getChildren().forEach((node) => {
        if (node.getType() === "paragraph" || node.getType() === "heading") {
          const text = node.getTextContent();
          if (text) {
            const format = node.getFormat();
            let formattedText = text;
            if (format & 1) formattedText = `<b>${text}</b>`; // Bold
            if (format & 2) formattedText = `<i>${text}</i>`; // Italic
            if (format & 4) formattedText = `<u>${text}</u>`; // Underline
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
      // Also update the live ref for immediate, synchronous reads during Save
      latestSummaryTextRef.current = output.join("\n");
    });
  };

  const handleImageSelected = (file, dataUrl) => {
    setAttachedImages((prev) => [...prev, { file, dataUrl }]);
  };

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
        {summary && showInlineEdit && (
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
              <div
                style={{
                  marginTop: "12px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "10px",
                }}
              >
                {summary.images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`summary-${idx}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

const ExecutiveSummaryContainer = ({
  startDate,
  clientSeq,
  onInitialSummaryFetch,
}) => {
  const [summaries, setSummaries] = useState([]);
  const [SummaryFlag, setSummaryFlag] = useState("labelsummary");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [forceEditIds, setForceEditIds] = useState([]);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedMonthYear = startDate
    ? format(new Date(startDate), "MMM yy")
    : "";
  const formattedMonthPlusOne = startDate
    ? format(addMonths(new Date(startDate), 1), "MMM yy")
    : "";
  useEffect(() => {
    const fetchSummaries = async () => {
      if (!token || !clientSeq) return;

      try {
        const formattedStart = formatDateLocal(startDate);
        const response = await fetch(
          `${apibaseurl}/api/ExecutiveSummary/label-Summary?_startDate=${formattedStart}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const summaryData = await response.json();
          setSummaries(summaryData);
          setForceEditIds([]);
          if (onInitialSummaryFetch) {
            onInitialSummaryFetch(summaryData);
          }
        } else {
          console.error(
            "Failed to fetch executive summaries:",
            response.statusText
          );
          setSummaries([]);
        }
      } catch (err) {
        console.error("Error fetching executive summaries:", err);
        setSummaries([]);
        setForceEditIds([]);
      }
    };

    fetchSummaries();
  }, [apibaseurl, token, clientSeq, startDate, onInitialSummaryFetch]);

  const handleAddNewSummary = () => {
    setIsAddingNew(true);
  };

  const handleSaveSummary = async (text, summarySeq, imageFiles = []) => {
    if (!token || !clientSeq) return;

    try {
      let response;
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;

      const formData = new FormData();
      formData.append("summary", text || "");
      formData.append("summaryFlag", SummaryFlag || "labelsummary");
      formData.append("createdDate", createdDate);
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach((file) => file && formData.append("Images", file));
      }

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
          setSummaries((prev) =>
            prev.map((s) =>
              s.summarySeq === summarySeq
                ? { ...s, summary: text, images: data.imageUrls || s.images }
                : s
            )
          );
          setForceEditIds((prev) => prev.filter((id) => id !== summarySeq));
        } else {
          setSummaries((prev) => [...prev, data]);
          setIsAddingNew(false);
        }
      } else {
        console.error(
          `Failed to ${summarySeq ? "update" : "create"} executive summary:`,
          response.statusText
        );
      }
    } catch (err) {
      console.error(
        `Error ${summarySeq ? "updating" : "creating"} executive summary:`,
        err
      );
    }
  };

  const handleDeleteSummary = async (summarySeq) => {
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
        setSummaries((prev) => prev.filter((s) => s.summarySeq !== summarySeq));
        setForceEditIds((prev) => prev.filter((id) => id !== summarySeq));
      } else {
        console.error(
          "Failed to delete executive summary:",
          response.statusText
        );
        return false;
      }
    } catch (err) {
      console.error("Error deleting executive summary:", err);
      return false;
    }
    return true;
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
  };

  // Header pencil behavior: create new if none, else edit first
  const handleHeaderClick = () => {
    if (summaries.length === 0) {
      setIsAddingNew(true);
      setForceEditIds([]);
    } else {
      const firstId = summaries[0]?.summarySeq;
      setForceEditIds(firstId ? [firstId] : []);
      setIsAddingNew(false);
    }
  };

  // Clear forced edit state on cancel
  const handleCancelEdit = (summarySeq) => {
    setForceEditIds((prev) => prev.filter((id) => id !== summarySeq));
  };

  return (
    <div
      className="pb-3 mt-3"
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
                  Task recommended for {formattedMonthPlusOne}
                </h6>
                <PiNotePencilFill
                  onClick={handleHeaderClick}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={style.table_cell}>
              {summaries.length === 0 ? (
                <div
                  className="text-center p-3"
                  style={{ color: "gray", fontSize: "16px" }}
                ></div>
              ) : (
                summaries.map((summary) => (
                  <ExecutiveSummaryItem
                    key={`label-${summary.summarySeq}`}
                    summary={summary}
                    onSave={(text, files) =>
                      handleSaveSummary(text, summary.summarySeq, files)
                    }
                    onDelete={handleDeleteSummary}
                    onCancel={() => handleCancelEdit(summary.summarySeq)}
                    title={`Task recommended for ${formattedMonthYear}`}
                    showInlineEdit={false}
                    forceEditing={forceEditIds.includes(summary.summarySeq)}
                  />
                ))
              )}
              {isAddingNew && summaries.length === 0 && (
                <ExecutiveSummaryItem
                  onSave={(text, files) =>
                    handleSaveSummary(text, undefined, files)
                  }
                  onCancel={handleCancelNew}
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

export default ExecutiveSummaryContainer;
