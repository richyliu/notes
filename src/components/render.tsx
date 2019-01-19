import React from 'react';
import styled from '../utils/theme';

import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

const Border = styled.div`
	border: 1px solid gray;
	padding: 5px;
	font-family: Helvetica;
`;

interface RenderProps {
	html: string;
}

const Render: React.FC<RenderProps> = ({ html }) => (
	<Border dangerouslySetInnerHTML={{ __html: html }} />
);

export default Render;
