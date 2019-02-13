module Main exposing (main)

import Browser
import Database as Db
import Helpers exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Markdown exposing (defaultOptions)
import Ports exposing (..)


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
            , fromElm { type_ = OutSetContent, data = content }
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
            , style "display" <| ite displayMarkdown "none" "block"
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
    div [ style "display" <| ite shouldDisplay "block" "none" ]
        [ Markdown.toHtmlWith
            { defaultOptions
                | githubFlavored = Just { tables = True, breaks = True }
                , defaultHighlighting = Just "javascript"
                , sanitize = False
            }
            [ class "markdown-body" ]
            md
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ toElm handleIncoming
        , Db.received handleDb
        ]



-- Handle incoming port subscriptions


handleIncoming : InMsg -> Msg
handleIncoming { type_, data } =
    case {- Debug.log "[elm] incoming msg" -} type_ of
        InError ->
            AddMessage data

        InSetContent ->
            Change data

        InToggleMarkdown ->
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
                    AddMessage <| "Javascript sent an unknown message of type_: " ++ type_ ++ " and data: " ++ String.join ", " data

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
