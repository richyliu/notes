import { Tag } from './tags';
import { Omit } from './helpers';

/**
 * All possible information about a note
 */
export interface Note {
  info: NoteInfo;
  content: string;
}

/**
 * Note metadata
 */
export interface NoteInfo {
  /**
   * Must be a URI encoded string. Spaces are replaced with underscores.
   */
  title: string;
  /**
   * Used by the server to identify a note
   */
  id: string;
  tags?: Tag[];
  favorite?: boolean;
  pinned?: boolean;
  dateCreated?: any;
  dateModified?: any;
}

/**
 * Partial note without id
 */
export type NotePartial = { info: Omit<NoteInfo, 'id'>; content: string };
