import { Tag } from '../utils/tags';
import { Note, NoteInfo, NotePartial } from '../utils/notes';

/**
 * Standard database interface for loading and saving notes
 */
export default interface StandardDatabase {
  getTags(): Promise<Tag[]>;
  getAllNotes(): Promise<NoteInfo[]>;
  getNotes(tag: Tag | Tag[]): Promise<NoteInfo[] | undefined>;
  isNote(id: string): Promise<boolean>;
  getNote(id: string): Promise<Note | undefined>;
  setNote(id: string, note: Note): Promise<void>;
  setNotes(ids: string[], notes: Note[]): Promise<void>;
  addNote(note: NotePartial): Promise<Note>;
  removeNote(id: string): Promise<boolean>;

  addTagToList(tag: Tag): Promise<void>;
  generateId(): Promise<string>;
  setup(): Promise<void>;
}
