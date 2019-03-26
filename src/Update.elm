module Update exposing (Msg(..), update)

import Database as Db
import EditorPorts
import Model exposing (..)


type Msg
    = UpdateCurrentNote Note
    | Change String
    | ToggleDisplayMarkdown
    | AddMessage String
    | SaveCurrentNote
    | SetNote Note
    | GetNote String
    | SetAllTags (List Tag)
    | GetNotesByTags (List Tag)
    | SetNotes (List Note)
    | SetCurrentNote Note
    | SetCurrentTag Tag
    | Sync
    | SetNoteSearch String
    | SetTitle String
    | SetTags (List Tag)
    | Batch (List Msg)
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateCurrentNote note ->
            update SaveCurrentNote
                { model
                    | currentNote = Just note
                    , notes =
                        List.map
                            (\n ->
                                if n.id == note.id then
                                    note

                                else
                                    n
                            )
                            model.notes
                }

        Change content ->
            case model.currentNote of
                Just note ->
                    update (UpdateCurrentNote { note | content = content }) model

                Nothing ->
                    ( model, Cmd.none )

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

        AddMessage str ->
            ( { model | messages = str :: model.messages }, Cmd.none )

        SaveCurrentNote ->
            case model.currentNote of
                Just note ->
                    update (SetNote note) model

                Nothing ->
                    ( model, Cmd.none )

        SetNote note ->
            ( model, Db.send "UpdateNote" "" [ note.id, note.title, String.join "," note.tags, note.content ] )

        GetNote id ->
            ( model, Db.send "GetNote" "" [ id ] )

        SetAllTags tags ->
            ( { model
                | tags = tags
                , currentTag = List.head tags
              }
            , Cmd.none
            )

        GetNotesByTags tags ->
            ( model, Db.send "GetNotesByTags" "" tags )

        SetNotes notes ->
            ( { model | notes = notes }, Cmd.none )

        SetCurrentNote note ->
            ( { model | currentNote = Just note }, EditorPorts.setContent note.content )

        SetCurrentTag tag ->
            ( { model | currentTag = Just tag }, Cmd.none )

        Sync ->
            ( model, Db.send "Sync" "" [] )

        SetNoteSearch search ->
            ( { model | noteSearch = search }, Cmd.none )

        SetTitle title ->
            case model.currentNote of
                Just note ->
                    update (UpdateCurrentNote { note | title = title }) model

                Nothing ->
                    ( model, Cmd.none )

        -- TODO: Need to update master tags list too, perhaps do the updating here instead of in TS?
        SetTags tags ->
            case model.currentNote of
                Just note ->
                    let
                        ( newModel, command ) =
                            update (UpdateCurrentNote { note | tags = tags }) model
                    in
                    -- TODO: related to above, current implementation inefficient
                    ( newModel, Cmd.batch [ command, Db.send "GetAllTags" "" [] ] )

                Nothing ->
                    ( model, Cmd.none )

        Batch msgs ->
            List.foldl
                (\curMsg ( curModel, prevCommand ) ->
                    let
                        ( updatedModel, newCommand ) =
                            update curMsg curModel
                    in
                    ( updatedModel, Cmd.batch [ prevCommand, newCommand ] )
                )
                ( model, Cmd.none )
                msgs

        NoOp ->
            ( model, Cmd.none )
