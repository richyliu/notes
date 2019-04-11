module Main exposing (main)

import Array
import Browser
import Database as Db
import EditorPorts
import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input as Input
import Html exposing (Html)
import Html.Attributes as Attr
import Markdown exposing (defaultOptions)



-- main


main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { displayMarkdown = False
      , messages = []
      , currentNote = Nothing
      , currentTag = Nothing
      , noteSearch = ""
      , notes = []
      , tags = []
      , searchStr = Just ""
      , view =
            { messagesOpen = True
            }
      , currentNoteContent = ""
      }
    , EditorPorts.setContent "hello, world"
    )



-- model


type alias Tag =
    String


type alias Note =
    { id : String
    , content : String
    , tags : List Tag
    , title : String
    }


type alias Model =
    { displayMarkdown : Bool
    , messages : List String
    , currentNote : Maybe Note
    , currentTag : Maybe Tag
    , noteSearch : String
    , notes : List Note
    , tags : List Tag
    , searchStr : Maybe String
    , view :
        { messagesOpen : Bool
        }
    , currentNoteContent : String
    }



-- update


type Msg
    = SetCurrentNoteContent String
    | ToggleDisplayMarkdown
    | Batch (List Msg)
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetCurrentNoteContent content ->
            ( { model | currentNoteContent = content }, Cmd.none )

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

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



-- subscriptions


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ EditorPorts.toElm handleEditor
        ]



-- Handle incoming port subscriptions


handleEditor : EditorPorts.ReceivedMsg -> Msg
handleEditor { type_, data } =
    case type_ of
        EditorPorts.Error ->
            NoOp

        EditorPorts.SetContent ->
            SetCurrentNoteContent data

        EditorPorts.ToggleMarkdown ->
            ToggleDisplayMarkdown



-- view


view : Model -> Html Msg
view model =
    Element.layout [] <| appHome model


viewMarkdown : String -> Bool -> Html Msg
viewMarkdown md shouldDisplay =
    Html.div
        [ Attr.style "display" <| boolToBlockOrNone shouldDisplay
        , Attr.style "background" "white"
        , Attr.style "padding" "10px"
        ]
        [ Markdown.toHtmlWith
            { defaultOptions
                | githubFlavored = Just { tables = True, breaks = True }
                , defaultHighlighting = Just "javascript"
                , sanitize = False
            }
            [ Attr.class "markdown-body" ]
            md
        ]


boolToBlockOrNone : Bool -> String
boolToBlockOrNone bool =
    if bool then
        "block"

    else
        "none"


appHome : Model -> Element Msg
appHome model =
    row
        [ width fill
        , centerY
        , spacing 10
        , height fill
        , padding 10
        , Font.size 18
        ]
        [ editorPanel model
        ]


panel : Int -> Element msg -> Element msg
panel size contents =
    el
        [ Background.color (rgb255 204 214 255)
        , Font.color (rgb255 0 0 0)
        , Border.rounded 5
        , Border.width 3
        , Border.color (rgb255 0 0 0)
        , padding 30
        , width <| fillPortion size
        , height fill
        ]
        contents


editorPanel : Model -> Element Msg
editorPanel model =
    panel 4 <|
        column [ width fill ]
            [ html <|
                Html.div [ Attr.style "width" "100%" ]
                    [ Html.div
                        [ Attr.id "editor-wrapper"
                        , Attr.style "margin-bottom" "10px"
                        , Attr.style "display" <| boolToBlockOrNone <| not model.displayMarkdown
                        ]
                        []
                    , viewMarkdown model.currentNoteContent model.displayMarkdown
                    ]
            , row [ spacing 5 ]
                [ simpleButton ToggleDisplayMarkdown "toggle display"
                ]
            ]


monospaceText : String -> Element Msg
monospaceText content =
    el [ width fill, Font.family [ Font.monospace ] ] <| text content


simpleButton : Msg -> String -> Element Msg
simpleButton msg title =
    Input.button
        [ Border.color <| rgb 0 0 0
        , Border.width 2
        , Border.rounded 5
        , paddingXY 10 5
        , width fill
        ]
        { onPress = Just msg
        , label = el [ centerX ] <| text title
        }


searchInput : (String -> Msg) -> String -> String -> Element Msg
searchInput onChange placeholder current =
    Input.search []
        { onChange = onChange
        , text = current
        , placeholder = Just <| Input.placeholder [] <| text placeholder
        , label = Input.labelHidden placeholder
        }


heading1 : String -> Element msg
heading1 title =
    el
        [ Font.size 38
        , paddingXY 0 20
        , Font.family [ Font.typeface "Verdana" ]
        ]
    <|
        text title
