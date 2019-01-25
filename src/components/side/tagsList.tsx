import React, { useContext } from 'react';
import styled from '../../utils/theme';
import { TagInfo, getTagsInfo, Tag, getTagInfo } from '../../utils/tags';
import NotesViewState from '../../utils/notesViewState';

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
  tag: Tag;
  active: boolean;
}
const TagButton: React.FC<TagButtonProps> = React.memo(({ tag, active }) => {
  const [state, dispatch] = useContext(NotesViewState.Context);
  const tagInfo = getTagInfo(tag);

  return (
    <div>
      <TagStyled
        level={tagInfo.level}
        active={active}
        onClick={() => dispatch({ action: 'activeTag', payload: tag })}
        className="btn btn-block"
      >
        {tagInfo.name}
      </TagStyled>
    </div>
  );
});

interface TagsListProps {
  tags: Tag[];
  active: Tag;
}
const TagsList: React.FC<TagsListProps> = ({ tags, active }) => (
  <div>
    {tags.map((tag, i) => (
      <TagButton tag={tag} key={i} active={active === tag} />
    ))}
  </div>
);

export default TagsList;
