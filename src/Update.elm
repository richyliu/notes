module Update exposing (Msg(..), update)

import Database as Db
import EditorPorts
import Model exposing (..)


type Msg
    = ChangeInternal String
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
    | SetTitleInternal String
    | SetTitle String
    | Batch (List Msg)
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ChangeInternal content ->
            ( case model.currentNote of
                Just note ->
                    { model
                        | currentNote = Just { note | content = content }
                        , notes =
                            List.map
                                (\n ->
                                    if n.id == note.id then
                                        { n | content = content }

                                    else
                                        n
                                )
                                model.notes
                    }

                Nothing ->
                    model
            , Cmd.none
            )

        Change content ->
            update (Batch [ ChangeInternal content, SaveCurrentNote ]) model

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

        SetTitleInternal title ->
            ( case model.currentNote of
                Just note ->
                    { model | currentNote = Just { note | title = title } }

                Nothing ->
                    model
            , Cmd.none
            )

        SetTitle title ->
            update (Batch [ SetTitleInternal title, SaveCurrentNote ]) model

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
