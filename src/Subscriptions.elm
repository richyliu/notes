module Subscriptions exposing (subscriptions)

import Array
import Database as Db
import EditorPorts
import Model exposing (..)
import Update exposing (..)


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

                -- get all the tags, and get all the notes of the first tag
                "GetAllTags" ->
                    Batch
                        [ SetAllTags data
                        , case List.head data of
                            Just firstTag ->
                                GetNotesByTags [ firstTag ]

                            Nothing ->
                                NoOp
                        ]

                "GetNotesByTags" ->
                    SetNotes <| List.filterMap getNoteFromContent data

                "Sync" ->
                    AddMessage <| String.join "" data

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
   title: The title
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

        title : Maybe String
        title =
            lines
                |> Array.get 3
                |> Maybe.withDefault ""
                |> String.split ": "
                |> List.tail
                |> Maybe.withDefault []
                |> List.head

        content : String
        content =
            lines
                |> Array.slice 5 (Array.length lines)
                |> Array.toList
                |> String.join "\n"

        line0 : String
        line0 =
            lines
                |> Array.get 0
                |> Maybe.withDefault ""

        line4 : String
        line4 =
            lines
                |> Array.get 4
                |> Maybe.withDefault ""
    in
    if line0 == "---" && line4 == "---" then
        case ( id, title ) of
            ( Just theId, Just theTitle ) ->
                Just
                    { content = content
                    , id = theId
                    , tags = tags
                    , title = theTitle
                    }

            _ ->
                Nothing

    else
        Nothing
