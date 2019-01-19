import baseStyled, { ThemedStyledInterface } from 'styled-components';

export const theme = {
	color: {
		white: 'white',
	},
};

export type Theme = typeof theme;
const styled = baseStyled as ThemedStyledInterface<Theme>;
export default styled;
