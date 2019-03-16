module View exposing (view)

import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input as Input
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
        , messagePanel model
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


messagePanel : Model -> Element Msg
messagePanel model =
    panel 1 <|
        column [ spacing 5, width fill ] <|
            heading1 "Messages"
                :: List.map (\m -> text m) model.messages


tagsPanel : Model -> Element Msg
tagsPanel model =
    panel 2 <|
        column [ spacing 10, width fill ] <|
            heading1 "Tags"
                :: List.map
                    (\tag ->
                        simpleButton
                            (Batch [ SetCurrentTag tag, GetNotesByTags [ tag ] ])
                            tag
                    )
                    model.tags


notesListPanel : Model -> Element Msg
notesListPanel model =
    panel 2 <|
        column [ spacing 10, width fill ] <|
            [ heading1 "Notes"
            , searchInput SetNoteSearch "Search (title and contents)" model.noteSearch
            ]
                ++ (model.notes
                        |> List.filter
                            -- TODO: can search by just title or title AND content, add config
                            ((\n -> n.title ++ n.content)
                                >> String.toLower
                                >> (String.contains <| String.toLower model.noteSearch)
                            )
                        |> List.map (\n -> simpleButton (SetCurrentNote n) n.title)
                   )


editorPanel : Model -> Element Msg
editorPanel model =
    panel 4 <|
        column [ width fill ] <|
            case model.currentNote of
                Just note ->
                    [ column [ width fill, spacing 10, paddingXY 0 10 ]
                        [ row [ width fill, spacing 10 ]
                            [ searchInput SetTitle "Title" <| note.title
                            , text <| "Id: " ++ String.slice 0 6 note.id ++ "..."
                            ]
                        , searchInput (String.split "," >> SetTags) "Tags" <| String.join "," model.tags
                        ]
                    , html <|
                        Html.div [ Attr.style "width" "100%" ]
                            [ Html.div
                                [ Attr.id "editor-wrapper"
                                , Attr.style "margin-bottom" "10px"
                                , Attr.style "display" <| boolToBlockOrNone <| not model.displayMarkdown
                                ]
                                []
                            , viewMarkdown note.content model.displayMarkdown
                            ]
                    , row [ spacing 5 ]
                        [ simpleButton ToggleDisplayMarkdown "toggle display"
                        , simpleButton Sync "sync"

                        -- TODO: finish
                        , simpleButton NoOp "add note"
                        ]
                    ]

                Nothing ->
                    [ text "Please select a note"
                    , html <|
                        Html.div
                            [ Attr.style "visibility" "hidden" ]
                            [ Html.div [ Attr.id "editor-wrapper" ] [] ]
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
