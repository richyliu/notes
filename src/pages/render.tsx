import React from 'react';
import Interweave from 'interweave';
import styled from 'styled-components';

const Border = styled.div`
	border: 1px solid gray;
	padding: 5px;
  font-family: Helvetica;
  
  & .task-list-item:check {
    color: blue;
  }
`;

const Render: React.FC<any> = ({ location }) => (
	<Border>
		<Interweave
			content={new URLSearchParams(location.search).get('html')}
		/>
	</Border>
);

export default Render;
