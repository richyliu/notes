import { ValueJSON } from 'slate';

const __STORAGE_KEY = 'notes_default';
const __INITIAL_TEXT = 'Hello world';

type Note = string;

export function save(str: Note) {
  localStorage.setItem(__STORAGE_KEY, str);
}

export function load(): Note {
  return localStorage.getItem(__STORAGE_KEY) || __INITIAL_TEXT;
}
