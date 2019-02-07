module Main exposing (main)

import Browser
import Helpers exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
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
    , keys : List Key
    , displayMarkdown : Bool
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { editorContent = ""
      , keys = []
      , displayMarkdown = False
      }
    , Cmd.none
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
    | ClearKeys
    | ToggleDisplayMarkdown
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Change content ->
            ( { model | editorContent = content }, Cmd.none )

        UpdateEditor content ->
            ( { model | editorContent = content }
            , fromElm { type_ = "set_content", data = content }
            )

        ClearKeys ->
            ( { model | keys = [] }, Cmd.none )

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Html Msg
view { editorContent, keys, displayMarkdown } =
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
            , button [ onClick ClearKeys ] [ text "clear keys" ]
            ]
        , viewKeys keys
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



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    toElm handleIncoming


handleIncoming : PortMsg -> Msg
handleIncoming { type_, data } =
    case Debug.log "[elm] incoming msg" type_ of
        "error" ->
            NoOp

        "set_content" ->
            Change data

        "toggle_markdown" ->
            ToggleDisplayMarkdown

        _ ->
            NoOp
