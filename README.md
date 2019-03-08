# Notes

A notes/todos app powered by Elm and Codemirror.

## Getting started

This project uses [pnpm](https://pnpm.js.org/), although it's not strictly necessary to getting started.

## Code overview

Files under `js/database/` are responsible for data replication and backup. See the `localStorage.ts` for a good example.

The elm files under `src/` are reponsible for what they are named for. Communication between JS and Elm is handled by `EditorPorts.elm` & `js/editor-setup.ts` for the Codemirror editor and `Database.elm` and `js/database.ts` for data backup.
