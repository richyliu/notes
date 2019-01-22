import React from 'react';
import TagsList from './tagsList';
import { ScrollContainer } from '../styled/layout';
import { Tag } from '../../utils/tags';

interface SideBarProps {
  tags: Tag[];
  active: Tag;
}
const SideBar: React.FC<SideBarProps> = ({ tags, active }) => (
  <ScrollContainer>
    <TagsList tags={tags} active={active} />
  </ScrollContainer>
);

export default SideBar;
