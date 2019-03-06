module Main exposing (main)

import Array
import Browser
import Database as Db
import EditorPorts
import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input exposing (button)
import Html exposing (Html)
import Html.Attributes as Attr
import Http
import Markdown exposing (defaultOptions)
import Set


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
    , title : String
    }


emptyNote : Note
emptyNote =
    Note "" "" [] ""


getTags : List Note -> List String
getTags notes =
    List.foldr (\n list -> n.tags ++ list) [] notes
        |> Set.fromList
        |> Set.toList


type alias Model =
    { displayMarkdown : Bool
    , messages : List String
    , currentNote : Maybe Note
    , currentTag : Maybe Tag
    , notes : List Note
    , tags : List Tag
    , searchStr : Maybe String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { displayMarkdown = False
      , messages = []
      , currentNote = Nothing
      , currentTag = Nothing
      , notes = []
      , tags = []
      , searchStr = Nothing
      }
    , Cmd.batch
        [ Db.send "GetAllTags" "" [] ]
    )



-- UPDATE


type Msg
    = Change String
    | ToggleDisplayMarkdown
    | AddMessage String
    | SetNote Note
    | GetNote String
    | SetAllTags (List Tag)
    | GetNotesByTags (List Tag)
    | SetNotes (List Note)
    | SetCurrentNote Note
    | SetCurrentTag Tag
    | Bunch (List Msg)
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Change content ->
            ( case model.currentNote of
                Just note ->
                    { model
                        | currentNote = Just { note | content = content }
                        , notes =
                            List.map
                                (\n ->
                                    if n.id == note.id then
                                        { n | content = content }

                                    else
                                        n
                                )
                                model.notes
                    }

                Nothing ->
                    model
            , Cmd.none
            )

        ToggleDisplayMarkdown ->
            ( { model | displayMarkdown = not model.displayMarkdown }, Cmd.none )

        AddMessage str ->
            ( { model | messages = str :: model.messages }, Cmd.none )

        SetNote note ->
            ( model, Db.send "UpdateNote" "" [ note.id, note.title, String.join "," note.tags, note.content ] )

        GetNote id ->
            ( model, Db.send "GetNote" "" [ id ] )

        SetAllTags tags ->
            ( { model
                | tags = tags

                -- TODO get notes based on the new current tag using Bunch
                , currentTag = Debug.log "[elm]: tags" (List.head tags)
              }
            , Cmd.none
            )

        GetNotesByTags tags ->
            ( model, Db.send "GetNotesByTags" "" tags )

        SetNotes notes ->
            ( { model | notes = notes }, Cmd.none )

        SetCurrentNote note ->
            ( { model | currentNote = Just note }, EditorPorts.setContent note.content )

        SetCurrentTag tag ->
            let
                ( updated, command ) =
                    update (GetNotesByTags [ tag ]) model
            in
            ( { updated | currentTag = Just tag }, command )

        Bunch msgs ->
            List.foldr
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



-- VIEW


view : Model -> Html Msg
view model =
    Element.layout [] <| appHome model


viewMarkdown : String -> Bool -> Html Msg
viewMarkdown md shouldDisplay =
    Html.div [ Attr.style "display" <| boolToBlockOrNone shouldDisplay ]
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
        [ Background.color (rgb255 255 196 217)
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
                                    -- TODO batch an AddMessage with this
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
