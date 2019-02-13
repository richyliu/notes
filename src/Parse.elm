port module Parse exposing (getNote, updateNote)

import Http exposing (..)
import Json.Decode as Decode exposing (Decoder, Value, field, string)
import Json.Encode as Encode


baseHeaders : List Header
baseHeaders =
    [ header "X-Parse-Application-Id" "7ngryN9HNZj6MjUGOwSraXk5Fnolq3NYSpHoz7T1"
    , header "X-Parse-Javascript-Key" "5sJCo3VWSLH1oIB0UV9xG8IyKpy667q2NtK5QCNZ"
    ]


baseUrl : String
baseUrl =
    "https://parseapi.back4app.com/"


getNote : String -> (Result Error String -> msg) -> Cmd msg
getNote noteId tagger =
    request
        { method = "GET"
        , headers = baseHeaders
        , url = baseUrl ++ "classes/Note/" ++ noteId
        , body = emptyBody
        , expect = Http.expectJson tagger <| field "content" string
        , timeout = Nothing
        , tracker = Nothing
        }


updateNote : String -> String -> (Result Error () -> msg) -> Cmd msg
updateNote noteId newNote tagger =
    request
        { method = "PUT"
        , headers = baseHeaders
        , url = baseUrl ++ "classes/Note/" ++ noteId
        , body = jsonBody <| Encode.object [ ( "content", Encode.string newNote ) ]
        , expect = Http.expectWhatever tagger
        , timeout = Nothing
        , tracker = Nothing
        }
