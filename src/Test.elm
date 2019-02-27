module Text exposing (main)

import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Html
import Set


main =
    Element.layout []
        appHome


appHome =
    row
        [ width fill
        , centerY
        , spacing 10
        , height fill
        , padding 10
        , Font.size 18
        ]
        [ tagsPanel
        , panel 1 <| text "hello"
        , editorPanel
        ]


panel : Int -> Element msg -> Element msg
panel size contents =
    el
        [ Background.color (rgb255 120 0 245)
        , Font.color (rgb255 255 255 255)
        , Border.rounded 5
        , Border.width 3
        , Border.color (rgb255 0 0 0)
        , padding 30
        , width <| fillPortion size
        , height fill
        ]
        contents


tagsPanel : Element msg
tagsPanel =
    panel 1 <|
        column [] <|
            heading1 "Tags"
                :: List.map tagButton (getTags notes)


tagButton : Tag -> Element msg
tagButton tag =
    el
        [ paddingXY 0 5
        ]
        (text tag)


editorPanel : Element msg
editorPanel =
    panel 2 <| html <| Html.div [] [ Html.text "hi" ]


heading1 : String -> Element msg
heading1 title =
    el
        [ Font.size 35
        , paddingXY 0 20
        ]
    <|
        text title


type alias Note =
    { id : String
    , content : String
    , tags : List Tag
    , title : String
    }


type alias Tag =
    String


notes : List Note
notes =
    [ { id = "1"
      , content = "# Note 1\nContent of note 1"
      , title = "Note 1"
      , tags = [ "Food", "Baz" ]
      }
    , { id = "2"
      , content = "This is a very pointless note"
      , title = "Note 2???"
      , tags = [ "Food/Yuck" ]
      }
    , { id = "3"
      , content = "# Note 3\n## Subtitle"
      , title = "Note 3.5"
      , tags = []
      }
    , { id = "4"
      , content = "Note number 4"
      , title = "Note 1"
      , tags = [ "Food", "Food/Yuck", "Bar/Bar" ]
      }
    ]


getTags : List Note -> List String
getTags inNotes =
    List.foldr (\n list -> n.tags ++ list) [] inNotes
        |> Set.fromList
        |> Set.toList
