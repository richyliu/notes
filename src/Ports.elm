port module Ports exposing (PortMsg, fromElm, toElm)

import Json.Decode as Decode exposing (Decoder, string)
import Json.Decode.Pipeline exposing (optional, required)


type alias PortMsg =
    { type_ : String
    , data : String
    }


port fromElm : PortMsg -> Cmd msg


port toElmPort : (Decode.Value -> msg) -> Sub msg


toElm : (PortMsg -> msg) -> Sub msg
toElm tagger =
    toElmPort (decodeMsg >> tagger)


decodeMsg : Decode.Value -> PortMsg
decodeMsg val =
    let
        result =
            Decode.decodeValue
                (Decode.succeed PortMsg
                    |> required "type_" string
                    |> optional "data" string ""
                )
                val
    in
    case result of
        Ok value ->
            value

        Err value ->
            { type_ = "error", data = "" }
