import React, { useState, useEffect } from 'react';
import { load, save } from '../../database/notes';
import EditorInput from './editorInput';
import convertMd from '../../utils/convertMd';
import Render from '../render';
import * as Keybinder from '../../utils/keybinder';
import styled from '../../utils/theme';
import MenuBar from './menuBar';

const FlexContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow-y: scroll;
`;

interface EditorStyledProps {
	show: boolean;
}
const EditorStyled = styled.div`
	display: ${(p: EditorStyledProps) => (p.show ? 'block' : 'none')};
	flex: 0 1 auto;
`;
const MenuBarStyled = styled.div`flex: 0 0 10px;`;

const EditorWrapper: React.FC = () => {
	const [ html, setHtml ] = useState<string>('');

	useEffect(
		() =>
			Keybinder.bind(action => {
				switch (action) {
					case 'toggle-editor-view':
						if (html !== '') setHtml('');
						else setHtml(convertMd(load()));
						break;
				}
			}),
		[ html, setHtml ]
	);

	// focus on element when coming back
	useEffect(() => {
		const ta = document.querySelector(
			'.CodeMirror textarea'
		) as HTMLElement;
		if (ta) ta.focus();
	});

	return (
		<FlexContainer>
			<MenuBarStyled>
				<MenuBar />
			</MenuBarStyled>
			<EditorStyled show={html === ''}>
				<EditorInput value={load()} onChange={save} />
			</EditorStyled>
			<EditorStyled show={html !== ''}>
				<Render html={html} />
			</EditorStyled>
		</FlexContainer>
	);
};

export default EditorWrapper;
