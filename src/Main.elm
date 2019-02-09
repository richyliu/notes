module Main exposing (main)

import Browser
import Helpers exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Markdown exposing (defaultOptions)
import Parse exposing (..)
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
    , fromElm { type_ = OutHasStorage, data = "" }
    )



-- UPDATE


type Msg
    = Change String
    | UpdateEditor String
    | ToggleDisplayMarkdown
    | RequestStorage
    | SetStorage String
    | AddMessage String
    | ServerUpload
    | ServerDownload
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- updates outside storage as well as internal data
        Change content ->
            ( { model | editorContent = content }, fromElm { type_ = OutSetStorage, data = content } )

        -- updates external editor
        UpdateEditor content ->
            ( { model | editorContent = content }
            , fromElm { type_ = OutSetContent, data = content }
            )

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

        RequestStorage ->
            ( model, fromElm { type_ = OutRequestStorage, data = "" } )

        -- equivalent to Change and UpdateEditor
        SetStorage str ->
            ( { model | editorContent = str }
            , Cmd.batch
                [ fromElm { type_ = OutSetStorage, data = str }
                , fromElm { type_ = OutSetContent, data = str }
                ]
            )

        AddMessage str ->
            ( { model | messages = str :: model.messages }, Cmd.none )

        ServerUpload ->
            ( model
            , updateNote "ImwmPGfDkl"
                model.editorContent
                (\result ->
                    case result of
                        Ok _ ->
                            AddMessage "Successfully uploaded"

                        Err err ->
                            case err of
                                Http.Timeout ->
                                    AddMessage "Timeout"

                                Http.NetworkError ->
                                    AddMessage "Network error"

                                Http.BadStatus status ->
                                    AddMessage <| "Bad status: " ++ String.fromInt status

                                _ ->
                                    AddMessage "Other error: bad body or bad url"
                )
            )

        ServerDownload ->
            ( model
            , getNote "ImwmPGfDkl"
                (\result ->
                    case result of
                        Ok note ->
                            UpdateEditor note

                        Err _ ->
                            NoOp
                )
            )

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
        , div [] <| List.map (\m -> p [] [ text m ]) messages
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
    toElm handleIncoming


handleIncoming : InMsg -> Msg
handleIncoming { type_, data } =
    case {- Debug.log "[elm] incoming msg" -} type_ of
        InError ->
            AddMessage data

        InSetContent ->
            Change data

        InToggleMarkdown ->
            ToggleDisplayMarkdown

        InHasStorage ->
            if String.length data == 0 then
                SetStorage defaultText

            else
                RequestStorage

        InReceiveStorage ->
            UpdateEditor data


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
