import React from 'react';
import styled from '../../utils/theme';
import { TagInfo, getTagsInfo, Tag } from '../../utils/tags';

interface TagStyledProps {
  level: number;
}
const TagStyled = styled.button`
  border-radius: 20px !important;
  border: none !important;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: ${(p: TagStyledProps) => p.level * 30 + 10}px !important;
  text-align: start !important;
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
}
const TagButton: React.FC<TagButtonProps> = ({ tag }) => (
  <div>
    <TagStyled level={tag.level} className="btn btn-block">
      {tag.name}
    </TagStyled>
  </div>
);

interface TagsListProps {
  tags: Tag[];
}
const TagsList: React.FC<TagsListProps> = ({ tags }) => (
  <div>
    {getTagsInfo(tags).map((tag, i) => (
      <TagButton tag={tag} key={i} />
    ))}
  </div>
);

export default TagsList;
