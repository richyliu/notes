import { ValueJSON } from 'slate';

const __STORAGE_KEY = 'default';
const __INITIAL_TEXT = `{"document":{"nodes":[{"object":"block","type":"paragraph","nodes":[{"object":"text","leaves":[{
  "text":"A line of text in a paragraph."}]}]}]}}`;

type Note = ValueJSON;

export function save(str: Note) {
  localStorage.setItem(__STORAGE_KEY, JSON.stringify(str));
}

export function load(): Note {
  return JSON.parse(localStorage.getItem(__STORAGE_KEY) || __INITIAL_TEXT);
}
