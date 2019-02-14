import {Database, Note} from '../database';

const getItem = key => localStorage.getItem(key);
const setItem = (key, item) => localStorage.setItem(key, item);

const lsPrefix = 'notes_elm_stored_';

const LocalStorage: Database = {
  async isNote(id: string) {
    return Boolean(localStorage[lsPrefix + id]);
  },
  async getNote(id: string) {
    if (await this.isNote(id)) return getItem(lsPrefix + id);
    else return ['', `Note id: ${id} does not exist.`];
  },
  async setNote(id: string, note: Note) {
    setItem(lsPrefix + id, note);
    return undefined;
  },
  async addNote(note: string) {
    const id = (Math.random() + '').slice(2);
    await this.setNote(id, note);
    return id;
  },
};

export default LocalStorage;
