module View exposing (view)

import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input exposing (button)
import Html exposing (Html)
import Html.Attributes as Attr
import Markdown exposing (defaultOptions)
import Model exposing (..)
import Update exposing (..)


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
        [ tagsPanel model
        , notesListPanel model
        , editorPanel model
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


tagsPanel : Model -> Element Msg
tagsPanel model =
    panel 1 <|
        column [ spacing 10, width fill ] <|
            heading1 "Tags"
                :: List.map (\t -> simpleButton (SetCurrentTag t) t) model.tags


notesListPanel : Model -> Element Msg
notesListPanel model =
    panel 1 <|
        column [ spacing 10, width fill ] <|
            heading1 "Notes"
                :: List.map (\n -> simpleButton (SetCurrentNote n) n.title) model.notes


editorPanel : Model -> Element Msg
editorPanel model =
    let
        withNoteMsg =
            doWithCurrentNote model NoOp
    in
    panel 2 <|
        column
            [ width fill ]
            [ row [ width fill, paddingXY 0 10 ]
                [ el [ width fill, Font.family [ Font.monospace ] ] <| text <| "Name: " ++ doWithCurrentNote model "" .title
                , el [ width fill, Font.family [ Font.monospace ] ] <| text <| "Id: " ++ doWithCurrentNote model "" .id
                ]
            , html <|
                Html.div [ Attr.style "width" "100%" ]
                    [ Html.div
                        [ Attr.id "editor-wrapper"
                        , Attr.style "height" "300px"
                        , Attr.style "margin-bottom" "10px"
                        , Attr.style "display" <| boolToBlockOrNone <| not model.displayMarkdown
                        ]
                        []
                    , viewMarkdown
                        (.content <| Maybe.withDefault emptyNote model.currentNote)
                        model.displayMarkdown
                    ]
            , row [ spacing 5 ]
                [ simpleButton ToggleDisplayMarkdown "toggle display"
                , simpleButton (withNoteMsg SetNote) "save current note"
                , simpleButton (withNoteMsg (\n -> GetNote n.id)) "get current note"
                ]
            ]


{-| Send a msg with current note if it isn't nothing
-}
doWithCurrentNote : Model -> a -> (Note -> a) -> a
doWithCurrentNote model default msg =
    case model.currentNote of
        Just note ->
            msg note

        Nothing ->
            default


simpleButton : Msg -> String -> Element Msg
simpleButton msg title =
    button
        [ Border.color <| rgb 0 0 0
        , Border.width 2
        , Border.rounded 5
        , paddingXY 10 5
        , width fill
        ]
        { onPress = Just msg
        , label = el [ centerX ] <| text title
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
