/**
 * Renders mark and block markdown elements (used in conjunction with slate-md-serializer)
 */
import React from 'react';

import { Plugin } from 'slate-react';

export default function MarkdownRenderPlugin(options?) {
  return {
    renderNode(props, editor, next) {
      const { attributes, children } = props;

      switch (props.node.type) {
        case 'paragraph':
          return <p {...props} />;
        case 'block-quote':
          return <blockquote {...attributes}>{children}</blockquote>;
        case 'bulleted-list':
          return <ul {...attributes}>{children}</ul>;
        case 'ordered-list':
          return <ol {...attributes}>{children}</ol>;
        case 'todo-list':
          return <ul {...attributes}>{children}</ul>;
        case 'table':
          return <table {...attributes}>{children}</table>;
        case 'table-row':
          return <tr {...attributes}>{children}</tr>;
        case 'table-head':
          return <th {...attributes}>{children}</th>;
        case 'table-cell':
          return <td {...attributes}>{children}</td>;
        case 'list-item':
          return <li {...attributes}>{children}</li>;
        case 'horizontal-rule':
          return <hr />;
        case 'code':
          return <code {...attributes}>{children}</code>;
        case 'image':
          return <img src={(props as any).src} title={(props as any).title} />;
        case 'link':
          return <a href={(props as any).href}>{children}</a>;
        case 'heading1':
          return <h1 {...attributes}>{children}</h1>;
        case 'heading2':
          return <h2 {...attributes}>{children}</h2>;
        case 'heading3':
          return <h3 {...attributes}>{children}</h3>;
        case 'heading4':
          return <h4 {...attributes}>{children}</h4>;
        case 'heading5':
          return <h5 {...attributes}>{children}</h5>;
        case 'heading6':
          return <h6 {...attributes}>{children}</h6>;
        default:
          return next();
      }
    },
    renderMark(props, editor, next) {
      const { children } = props;

      switch (props.mark.type) {
        case 'bold':
          return <strong>{children}</strong>;
        case 'code':
          return <code>{children}</code>;
        case 'italic':
          return <em>{children}</em>;
        case 'underlined':
          return <u>{children}</u>;
        case 'deleted':
          return <del>{children}</del>;
        case 'added':
          return <mark>{children}</mark>;
        default:
          return next();
      }
    },
  } as Plugin;
}
