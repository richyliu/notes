import React from 'react';
import styled from 'styled-components';

import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

const Border = styled.div`
	border: 1px solid gray;
	padding: 5px;
	font-family: Helvetica;
`;

const Render: React.FC<any> = ({ location }) => (
	<Border
		dangerouslySetInnerHTML={{
			__html: new URLSearchParams(location.search).get('html') || '',
		}}
	/>
);

export default Render;
