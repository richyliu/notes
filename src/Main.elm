module Main exposing (main)

import Browser
import Helpers exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Decode exposing (bool, field, int)
import Markdown exposing (defaultOptions)
import Ports exposing (..)
import Random


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
    , keys : List Key
    }


initialContent : String
initialContent =
    """# foo
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


init : () -> ( Model, Cmd Msg )
init _ =
    ( { editorContent = initialContent, keys = [] }
    , send { type_ = "set_content", data = initialContent }
    )



-- UPDATE


type alias Key =
    { key : String
    , code : Int
    , alt : Bool
    , ctrl : Bool
    }


type Msg
    = Change String
    | UpdateEditor String
    | RandomChange
    | KeyDown Key
    | ClearKeys
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Change content ->
            ( { model | editorContent = content }, Cmd.none )

        UpdateEditor content ->
            ( { model | editorContent = content }
            , send { type_ = "set_content", data = content }
            )

        RandomChange ->
            ( model
            , Random.generate
                (\x -> UpdateEditor <| String.fromInt <| x)
                (Random.int 0 1000)
            )

        KeyDown key ->
            -- ( { model | keys = key :: model.keys }, Cmd.none )
            ( model, Cmd.none )

        ClearKeys ->
            ( { model | keys = [] }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Html Msg
view { editorContent, keys } =
    div []
        [ div
            [ id "editor-wrapper"
            , style "height" "300px"
            , onKeyDown KeyDown
            ]
            []
        , viewMarkdown editorContent
        , div []
            [ button [ onClick RandomChange ] [ text "random number" ]
            , button [ onClick ClearKeys ] [ text "clear keys" ]
            ]
        , viewKeys keys
        ]


viewMarkdown : String -> Html Msg
viewMarkdown md =
    Markdown.toHtmlWith
        { defaultOptions
            | githubFlavored = Just { tables = True, breaks = True }
            , defaultHighlighting = Just "javascript"
            , sanitize = False
        }
        [ class "content" ]
        md


viewKeys : List Key -> Html Msg
viewKeys keys =
    div []
        (List.map
            (\key ->
                p [] <|
                    List.map (\t -> text <| t ++ " ")
                        [ key.key
                        , String.fromInt key.code
                        , ite key.alt "alt" ""
                        , ite key.ctrl "ctrl" ""
                        ]
            )
            keys
        )


onKeyDown : (Key -> msg) -> Attribute msg
onKeyDown tagger =
    on "keydown" <| Decode.map tagger keyDecoder


keyDecoder : Decode.Decoder Key
keyDecoder =
    Decode.map4 Key
        (Decode.field "key" Decode.string)
        (Decode.field "keyCode" Decode.int)
        (Decode.field "altKey" Decode.bool)
        (Decode.field "ctrlKey" Decode.bool)



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    editorChanged Change
