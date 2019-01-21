import StandardDatabase from './std';
import config from '../utils/config';
import { Tag } from '../utils/tags';
import { NoteInfo, Note, NotePartial } from '../utils/notes';

const lsdb: StandardDatabase = {
  async getTags() {
    return await (JSON.parse(
      localStorage.getItem(config.lsdb.tagsKey) || '[]'
    ) || config.lsdb.defaultTags);
  },
  async getAllNotes() {
    return await JSON.parse(
      localStorage.getItem(config.lsdb.notesListKey) || '[]'
    );
  },
  async getNotes(tag: Tag | Tag[]) {
    return new Promise(async (resolve, reject) => {
      if (typeof tag !== 'string') {
        console.error('getNotes with Tag[] is not yet supported');
        reject();
      } else {
        const noteInfos: NoteInfo[] = (await this.getAllNotes()).filter(
          note => note.tags && note.tags.includes(tag)
        );

        if (noteInfos.length > 0) resolve(noteInfos);
        else reject();
      }
    });
  },
  async isNote(id: string) {
    return await Boolean(localStorage.getItem(id));
  },
  async getNote(id: string) {
    if (await this.isNote(id))
      return await JSON.parse(localStorage.getItem(id) || '{}');
    else return await undefined;
  },
  async setNote(id: string, note: Note) {
    console.count('saved ' + id);
    return await localStorage.setItem(id, JSON.stringify(note));
  },
  async setNotes(ids: string[], notes: Note[]) {
    await Promise.all(
      ids.map(async (id, i) => await this.setNote(id, notes[i]))
    );
    return await undefined;
  },
  async addNote(note: NotePartial) {
    // generate new note
    const id = await this.generateId();
    const newNote = { ...note, info: { ...note.info, id } };
    // add to localstorage
    await this.setNote(id, newNote);

    // add to list of all notes
    const notes: NoteInfo[] = JSON.parse(
      localStorage.getItem(config.lsdb.notesListKey) || '[]'
    );
    localStorage.setItem(
      config.lsdb.notesListKey,
      JSON.stringify([...notes, newNote.info])
    );

    // add new tag if necessary
    const tags = await this.getTags();
    if (newNote.info.tags) {
      newNote.info.tags.forEach(tag => {
        if (!tags.includes(tag)) this.addTagToList(tag);
      });
    }

    return newNote;
  },
  async removeNote(id: string) {
    if (!this.isNote(id)) return await false;
    localStorage.removeItem(id);
    return await true;
  },

  async addTagToList(tag: Tag) {
    const oldTags: Tag[] = JSON.parse(
      localStorage.getItem(config.lsdb.tagsKey) || '[]'
    );
    localStorage.setItem(
      config.lsdb.tagsKey,
      JSON.stringify([...oldTags, tag])
    );
    return await undefined;
  },
  async generateId() {
    return await Math.random()
      .toString(16)
      .slice(2);
  },
  async setup() {
    localStorage.setItem(
      config.lsdb.tagsKey,
      JSON.stringify(config.lsdb.defaultTags)
    );
    localStorage.setItem(config.lsdb.notesListKey, JSON.stringify([]));

    localStorage.setItem(
      config.lsdb.defaultNote.id,
      JSON.stringify({
        info: config.lsdb.defaultNote,
        content: config.lsdb.defaultText,
      })
    );
    // this.addNote({
    //   info: {
    //     title: 'Hello world number 2',
    //   },
    //   content: '# Hello world\nfoo bar',
    // });
    return await undefined;
  },
};

export default lsdb;
