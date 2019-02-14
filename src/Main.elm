module Main exposing (main)

-- import Helpers exposing (..)

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


type alias Model =
    { editorContent : String
    , displayMarkdown : Bool
    , messages : List String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { editorContent = ""
      , displayMarkdown = False
      , messages = []
      }
    , Db.send "GetNote" [ "ImwmPGfDkl" ]
    )



-- UPDATE


type Msg
    = Change String
    | UpdateEditor String
    | ToggleDisplayMarkdown
    | AddMessage String
    | ServerUpload
    | ServerDownload
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- updates outside storage as well as internal data
        Change content ->
            ( { model | editorContent = content }, Cmd.none )

        -- updates external editor
        UpdateEditor content ->
            ( { model | editorContent = content }
            , EditorPorts.setContent content
            )

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

        AddMessage str ->
            ( { model | messages = str :: model.messages }, Cmd.none )

        ServerUpload ->
            ( model, Db.send "UpdateNote" [ "ImwmPGfDkl", model.editorContent ] )

        ServerDownload ->
            ( model, Db.send "GetNote" [ "ImwmPGfDkl" ] )

        NoOp ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Html Msg
view { editorContent, displayMarkdown, messages } =
    div []
        [ div
            [ id "editor-wrapper"
            , style "height" "300px"
            , style "display" <| boolToBlockOrNone <| not displayMarkdown
            ]
            []
        , viewMarkdown editorContent displayMarkdown
        , div []
            [ button [ onClick ToggleDisplayMarkdown ] [ text "toggle display" ]
            , button [ onClick ServerDownload ] [ text "server download" ]
            , button [ onClick ServerUpload ] [ text "server upload" ]
            ]
        , pre [] <| List.map (\m -> code [] [ text <| m ++ "\n" ]) messages
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
handleDb { type_, data } =
    case data of
        [ note ] ->
            case type_ of
                "GetNote" ->
                    UpdateEditor note

                "UpdateNote" ->
                    AddMessage note

                "JsonParseError" ->
                    AddMessage <| "Database received could not be parsed correctly by Elm with error: " ++ String.join ", " data

                unknown ->
                    AddMessage <| "Unknown database message received: " ++ unknown

        [ _, error ] ->
            AddMessage error

        -- Does not match any of the above
        unknownList ->
            AddMessage <| "Unknown data received by handleDb: [ \"" ++ String.join "\", \"" unknownList ++ "\" ]"


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
