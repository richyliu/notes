module Update exposing (Msg(..), update)

import Database as Db
import EditorPorts
import Model exposing (..)


type Msg
    = Change String
    | ToggleDisplayMarkdown
    | AddMessage String
    | SetNote Note
    | GetNote String
    | SetAllTags (List Tag)
    | GetNotesByTags (List Tag)
    | SetNotes (List Note)
    | SetCurrentNote Note
    | SetCurrentTag Tag
    | Bunch (List Msg)
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Change content ->
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

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

        AddMessage str ->
            ( { model | messages = str :: model.messages }, Cmd.none )

        SetNote note ->
            ( model, Db.send "UpdateNote" "" [ note.id, note.title, String.join "," note.tags, note.content ] )

        GetNote id ->
            ( model, Db.send "GetNote" "" [ id ] )

        SetAllTags tags ->
            ( { model
                | tags = tags

                -- TODO get notes based on the new current tag using Bunch
                , currentTag = Debug.log "[elm]: tags" (List.head tags)
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
            let
                ( updated, command ) =
                    update (GetNotesByTags [ tag ]) model
            in
            ( { updated | currentTag = Just tag }, command )

        Bunch msgs ->
            List.foldr
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
