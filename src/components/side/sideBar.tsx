import React from 'react';
import TagsList from './tagsList';
import { ScrollContainer } from '../styled/layout';
import { Tag } from '../../utils/tags';

interface SideBarProps {
  tags: Tag[];
}
const SideBar: React.FC<SideBarProps> = ({ tags }) => (
  <ScrollContainer>
    <TagsList tags={tags} />
  </ScrollContainer>
);

export default SideBar;
