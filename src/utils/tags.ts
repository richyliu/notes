/**
 * Tag name. Levels are seperated by a `/` only. Accepts alphanumeric.
 * Spaces are converted to underscores.
 */
export type Tag = string;

export interface TagInfo {
  name: string;
  level: number;
  tag: Tag;
}

/**
 * Get the name (text after last `/`), level (starts from 0), and original tag
 * of a tag.
 * @param tag Tag name to get info. Ex: 'foo/bar/baz'
 */
export function getTagsInfo(tags: Tag[]): TagInfo[] {
  return tags.sort().map(tag => ({
    name: tag.split('/').pop() || '',
    level: (tag.match(/\//g) || []).length,
    tag,
  }));
}
