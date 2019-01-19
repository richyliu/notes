import React from 'react';
import EditorWrapper from '../components/editor/editorWrapper';
import { ThemeProvider } from 'styled-components';
import MiddleBar from '../components/middle/middleBar';
import SideBar from '../components/side/sideBar';
import styled, { theme } from '../utils/theme';

const FlexContainer = styled.div`display: flex;`;
const SideBarStyled = styled.div`flex: 1 0 300px;`;
const MiddleBarStyled = styled.div`flex: 1 0 300px;`;
const EditorStyled = styled.div`flex: 4 0 auto;`;

const Editor: React.FC = () => (
	<ThemeProvider theme={theme}>
		<FlexContainer>
			<SideBarStyled>
				<SideBar />
			</SideBarStyled>
			<MiddleBarStyled>
				<MiddleBar />
			</MiddleBarStyled>
			<EditorStyled>
				<EditorWrapper />
			</EditorStyled>
		</FlexContainer>
	</ThemeProvider>
);

export default Editor;
