import React from 'react';
import TagsList from './tagsList';
import { ScrollContainer } from '../styled/layout';

const SideBar: React.FC = () => (
  <ScrollContainer>
    <TagsList />
  </ScrollContainer>
);

export default SideBar;
