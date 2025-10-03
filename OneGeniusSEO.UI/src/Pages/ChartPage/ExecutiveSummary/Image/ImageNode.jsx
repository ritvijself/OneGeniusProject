// ImageNode.js
import { DecoratorNode } from "lexical";

function ImageComponent({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "200px", // fixed width
        height: "200px", // fixed height
        objectFit: "cover", // crops if needed
        display: "block",
        borderRadius: "8px", // optional: rounded corners
      }}
    />
  );
}

export class ImageNode extends DecoratorNode {
  __src;
  __alt;

  static getType() {
    return "image";
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src, alt, key) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  createDOM() {
    const dom = document.createElement("span");
    return dom;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <ImageComponent src={this.__src} alt={this.__alt} />;
  }

  // HTML mein save karne ke liye
  static importDOM() {
    return {
      img: (node) => ({
        conversion: (domNode) => {
          const { alt, src } = domNode;
          return { node: $createImageNode(src, alt) };
        },
        priority: 0,
      }),
    };
  }

  exportDOM(editor) {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__alt);
    return { element };
  }
}

export function $createImageNode(src, alt) {
  return new ImageNode(src, alt);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
