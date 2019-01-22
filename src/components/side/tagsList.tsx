import React from 'react';
import styled from '../../utils/theme';
import { TagInfo, getTagsInfo, Tag, getTagInfo } from '../../utils/tags';

interface TagStyledProps {
  level: number;
  active: boolean;
}
const TagStyled = styled.button`
  border-radius: 20px !important;
  border: none !important;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: ${(p: TagStyledProps) => p.level * 30 + 10}px !important;
  text-align: start !important;
  color: ${(p: TagStyledProps) => (p.active ? 'green' : 'blue')} !important;
`;

// const tags: TagInfo[] = getTagsInfo([
//   'All',
//   'Notebooks',
//   'Notebooks/one',
//   'Notebooks/two',
//   'Tags',
//   'Tags/business',
//   'Tags/art',
//   'Tags/business/node',
//   'Tags/language',
//   'Tags/language/art',
//   'Tags/language/foo',
//   'Extra',
//   'Trash',
// ]);

interface TagButtonProps {
  tag: TagInfo;
  active: boolean;
}
const TagButton: React.FC<TagButtonProps> = ({ tag, active }) => (
  <div>
    <TagStyled level={tag.level} active={active} className="btn btn-block">
      {tag.name}
    </TagStyled>
  </div>
);

interface TagsListProps {
  tags: Tag[];
  active: Tag;
}
const TagsList: React.FC<TagsListProps> = ({ tags, active }) => (
  <div>
    {tags.map((tag, i) => (
      <TagButton tag={getTagInfo(tag)} key={i} active={active === tag} />
    ))}
  </div>
);

export default TagsList;
