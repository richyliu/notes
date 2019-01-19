import styled from '../utils/theme';

interface HiddenProps {
	shown?: boolean;
}
export const Hidden = styled.div`
	display: ${(p: HiddenProps) => (p.shown ? 'inherit' : 'none')};
`;
