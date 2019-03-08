module Main exposing (main)

import Browser
import Database as Db
import Model exposing (Model)
import Subscriptions exposing (subscriptions)
import Update exposing (Msg, update)
import View exposing (view)


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
      , searchStr = Nothing
      }
    , Db.send "GetAllTags" "" []
    )
