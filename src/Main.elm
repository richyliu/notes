module Main exposing (main)

import Array
import Browser
import Database as Db
import EditorPorts
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Markdown exposing (defaultOptions)


main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- MODEL


type alias Tag =
    String


type alias Note =
    { id : String
    , content : String
    , tags : List Tag
    }


type alias Model =
    { editorContent : String
    , displayMarkdown : Bool
    , messages : List String
    , currentNote : Maybe Note
    , currentTag : Maybe Tag
    , notes : List Note
    , tags : List Tag
    , searchStr : Maybe String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { editorContent = ""
      , displayMarkdown = False
      , messages = []
      , currentNote = Nothing
      , currentTag = Nothing
      , notes = []
      , tags = []
      , searchStr = Nothing
      }
    , Db.send "GetAllTags" "" []
    )



-- UPDATE


type Msg
    = Change String
    | UpdateEditor String
    | ToggleDisplayMarkdown
    | AddMessage String
    | ServerUpload
    | ServerDownload
    | SetAllTags (List Tag)
    | GetNotesByTags (List Tag)
    | SetNotes (List Note)
    | SetCurrentNote Note
    | SetCurrentTag Tag
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- updates internals state only
        Change content ->
            ( { model | editorContent = content }, Cmd.none )

        -- updates external editor and internal state
        UpdateEditor content ->
            ( { model | editorContent = content }
            , EditorPorts.setContent content
            )

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

        AddMessage str ->
            ( { model | messages = str :: model.messages }, Cmd.none )

        ServerUpload ->
            ( model, Db.send "UpdateNote" "" [ "ImwmPGfDkl", model.editorContent ] )

        ServerDownload ->
            ( model, Db.send "GetNote" "" [ "ImwmPGfDkl" ] )

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
            let
                ( updated, command ) =
                    update (UpdateEditor note.content) model
            in
            ( { updated | currentNote = Just note }, command )

        SetCurrentTag tag ->
            let
                ( updated, command ) =
                    update (GetNotesByTags [ tag ]) model
            in
            ( { updated | currentTag = Just tag }, command )

        NoOp ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ div
            [ id "editor-wrapper"
            , style "height" "300px"
            , style "display" <| boolToBlockOrNone <| not model.displayMarkdown
            ]
            []
        , viewMarkdown model.editorContent model.displayMarkdown
        , div []
            [ button [ onClick ToggleDisplayMarkdown ] [ text "toggle display" ]
            , button [ onClick ServerDownload ] [ text "server download" ]
            , button [ onClick ServerUpload ] [ text "server upload" ]
            ]
        , div [] <|
            List.map
                (\tag ->
                    button
                        [ onClick <| SetCurrentTag tag ]
                        [ text tag ]
                )
                model.tags
        , div []
            [ text <| "You currently have: " ++ String.fromInt (List.length model.notes) ++ " notes"
            ]
        , pre [] <| List.map (\m -> code [] [ text <| m ++ "\n" ]) model.messages
        ]


viewMarkdown : String -> Bool -> Html Msg
viewMarkdown md shouldDisplay =
    div [ style "display" <| boolToBlockOrNone shouldDisplay ]
        [ Markdown.toHtmlWith
            { defaultOptions
                | githubFlavored = Just { tables = True, breaks = True }
                , defaultHighlighting = Just "javascript"
                , sanitize = False
            }
            [ class "markdown-body" ]
            md
        ]


boolToBlockOrNone : Bool -> String
boolToBlockOrNone bool =
    if bool then
        "block"

    else
        "none"



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ EditorPorts.toElm handleEditor
        , Db.received handleDb
        ]



-- Handle incoming port subscriptions


handleEditor : EditorPorts.ReceivedMsg -> Msg
handleEditor { type_, data } =
    case type_ of
        EditorPorts.Error ->
            AddMessage data

        EditorPorts.SetContent ->
            Change data

        EditorPorts.ToggleMarkdown ->
            ToggleDisplayMarkdown



-- Handle responses from the database


handleDb : Db.Msg -> Msg
handleDb { type_, datatype, data } =
    case datatype of
        "" ->
            case type_ of
                "GetNote" ->
                    case List.head data of
                        Just noteStr ->
                            let
                                note =
                                    getNoteFromContent noteStr
                            in
                            case note of
                                Just actualNote ->
                                    SetCurrentNote actualNote

                                Nothing ->
                                    NoOp

                        Nothing ->
                            NoOp

                "UpdateNote" ->
                    case List.head data of
                        Just note ->
                            AddMessage note

                        Nothing ->
                            NoOp

                "GetAllTags" ->
                    SetAllTags data

                "GetNotesByTags" ->
                    SetNotes <| List.filterMap getNoteFromContent data

                "JsonParseError" ->
                    AddMessage <| "Database received could not be parsed correctly by Elm with error: " ++ String.join ", " data

                unknown ->
                    AddMessage <| "Unknown database message received: " ++ unknown

        "error" ->
            AddMessage <| "JS gave an error message: " ++ String.join ", " data

        "message" ->
            AddMessage <| "JS gave a message: " ++ String.join ", " data

        -- Does not match any of the above
        unknownDataType ->
            AddMessage <|
                "Unknown data of type: \""
                    ++ unknownDataType
                    ++ "\" received by handleDb: [ \""
                    ++ String.join "\", \"" data
                    ++ "\" ]"


defaultText : String
defaultText =
    """
## sub heading

```javascript
function foo() {}
```

foo bar baz

foo

1. hello
1. hello
\t2. hello
\t3. foo
1. hello

> This is a blockquote

- [x] foo
* [x] bar
"""



{- Extracts full note, including id and tags from a note string

   Example note:

   ---
   id: the_id
   tags: separated,by,commas
   ---
   # The content
   now begins the actual content.
   Notice there is no spacing after the `---`
-}


getNoteFromContent : String -> Maybe Note
getNoteFromContent str =
    let
        lines : Array.Array String
        lines =
            str
                |> String.split "\n"
                |> Array.fromList

        id : Maybe String
        id =
            lines
                |> Array.get 1
                |> Maybe.withDefault ""
                |> String.split ": "
                |> List.tail
                |> Maybe.withDefault []
                |> List.head

        tags : List String
        tags =
            lines
                |> Array.get 2
                |> Maybe.withDefault ""
                |> String.split ": "
                |> List.tail
                |> Maybe.withDefault []
                |> List.head
                |> Maybe.withDefault ""
                |> String.split ","

        content : String
        content =
            lines
                |> Array.slice 4 (Array.length lines)
                |> Array.toList
                |> String.join "\n"

        line0 : String
        line0 =
            lines
                |> Array.get 0
                |> Maybe.withDefault ""

        line3 : String
        line3 =
            lines
                |> Array.get 3
                |> Maybe.withDefault ""
    in
    if line0 == "---" && line3 == "---" then
        case id of
            Just theId ->
                Just
                    { content = content
                    , id = theId
                    , tags = tags
                    }

            Nothing ->
                Nothing

    else
        Nothing
