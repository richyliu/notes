import StandardDatabase from './std';
import config from '../utils/config';
import { Tag } from '../utils/tags';
import { NoteInfo, Note, NotePartial } from '../utils/notes';

export interface StoredTags {
  [tag: string]: NoteInfo[];
}

const LocalStorage = {
  set<T>(key: string, item: T) {
    localStorage.setItem(key, JSON.stringify(item));
  },
  get<T>(key: string, defaultItem?: T): T {
    const lsItem = localStorage.getItem(key);
    if (lsItem) return JSON.parse(lsItem) as T;
    else if (defaultItem) return defaultItem;
    else throw new Error('No default item provided');
  },
  has(key: string): boolean {
    return Boolean(localStorage.getItem(key));
  },
};

const lsdb: StandardDatabase = {
  /**
   * Get list of tags. Tags are stored as an object with key as tag and value
   * as NoteInfo's associated with the tag
   */
  async getTags() {
    return Object.keys(await this.getStoredTags());
  },
  async getStoredTags() {
    return LocalStorage.get<StoredTags>(config.lsdb.tagsKey, {});
  },
  async setStoredTags(tags) {
    LocalStorage.set(config.lsdb.tagsKey, tags);
  },
  async getNotes(tagsIn) {
    const tags: StoredTags = LocalStorage.get(config.lsdb.tagsKey, {});
    return Object.keys(tags).reduce(
      (notes, storedTag) =>
        tagsIn.includes(storedTag) ? [...notes, ...tags[storedTag]] : notes,
      []
    );
  },
  async isNote(id: string) {
    return LocalStorage.has(id);
  },
  async getNote(id: string) {
    if (await this.isNote(id)) return LocalStorage.get<Note>(id);
    else return undefined;
  },
  async setNote(id: string, note: Note) {
    console.count('saved ' + id);

    // if setting new note or note tags have changed
    if (
      !await this.isNote(note.info.id) ||
      ((await this.getNote(note.info.id)) as Note).info.tags.toString() !==
        note.info.tags.toString()
    ) {
      // remove all of note from storedTags list
      let storedTags = await this.getStoredTags();
      Object.keys(storedTags).forEach(
        tag =>
          (storedTags[tag] = storedTags[tag].filter(
            tagNote => tagNote.id !== note.info.id
          ))
      );

      // add note back to new storedTags list
      note.info.tags.forEach(
        tag =>
          Object.keys(storedTags).includes(tag)
            ? storedTags[tag].push(note.info)
            : (storedTags[tag] = [note.info])
      );

      // remove tags that don't have any noteInfos
      Object.keys(storedTags).forEach(
        tag => storedTags[tag].length === 0 && delete storedTags[tag]
      );

      // set stored tags
      await this.setStoredTags(storedTags);
    }

    return LocalStorage.set(id, note);
  },
  async addNote(note: NotePartial) {
    // generate new note
    const id = await this.generateId();
    const newNote = { content: note.content, info: { ...note.info, id } };
    await this.setNote(id, newNote);

    return newNote;
  },
  async removeNote(id: string) {
    if (!this.isNote(id)) return await false;
    localStorage.removeItem(id);

    // remove associated tags
    let storedTags = await this.getStoredTags();
    Object.keys(storedTags).forEach(
      tag =>
        (storedTags[tag] = storedTags[tag].filter(tagNote => tagNote.id !== id))
    );
    await this.setStoredTags(storedTags);

    return true;
  },

  async generateId() {
    return await Math.random().toString(16).slice(2);
  },
  async setup() {
    await this.setStoredTags({});

    // add in series
    for (const note of config.lsdb.defaultNotes) {
      await this.addNote(note);
    }
  },
};

export default lsdb;
