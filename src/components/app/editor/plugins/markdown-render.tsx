/**
 * Renders mark and block markdown elements (used in conjunction with slate-md-serializer)
 */
import React from 'react';

import { Plugin } from 'slate-react';

export default function MarkdownRenderPlugin(options?) {
  return {
    renderNode(props, _, next) {
      // pull these props off to silence warnings, hopefully no impact on performance?
      const { isSelected, isFocused, ...rest } = props;

      switch (props.node.type) {
        case 'list-content':
        case 'paragraph':
          return <p>{rest.children}</p>;
        case 'block-quote':
          return <blockquote {...rest} />;
        case 'bulleted-list':
          return <ul {...rest} />;
        case 'ordered-list':
          return <ol {...rest} />;
        case 'ordered-list-lower-alpha':
          return <ol type="a" {...rest} />;
        case 'ordered-list-upper-alpha':
          return <ol type="A" {...rest} />;
        case 'ordered-list-lower-roman':
          return <ol type="i" {...rest} />;
        case 'ordered-list-upper-roman':
          return <ol type="I" {...rest} />;
        case 'todo-list':
          return <ul {...rest} />;
        case 'table':
          return <table {...rest} />;
        case 'table-row':
          return <tr {...rest} />;
        case 'table-head':
          return <th {...rest} />;
        case 'table-cell':
          return <td {...rest} />;
        case 'list-item':
          return <li {...rest} />;
        case 'horizontal-rule':
          return <hr />;
        case 'code':
          return <code {...rest} />;
        case 'image':
          return <img src={(rest as any).src} title={(rest as any).title} />;
        case 'link':
          return <a href={(rest as any).href} {...rest} />;
        case 'heading1':
          return <h1 {...rest} />;
        case 'heading2':
          return <h2 {...rest} />;
        case 'heading3':
          return <h3 {...rest} />;
        case 'heading4':
          return <h4 {...rest} />;
        case 'heading5':
          return <h5 {...rest} />;
        case 'heading6':
          return <h6 {...rest} />;
        default:
          return next();
      }
    },
    renderMark(props, _, next) {
      const { children } = props;

      switch (props.mark.type) {
        case 'bold':
          return <strong>{children}</strong>;
        case 'code':
          return <code>{children}</code>;
        case 'italic':
          return <em>{children}</em>;
        case 'underline':
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
