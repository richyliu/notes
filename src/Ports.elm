port module Ports exposing (InMsg, InMsgType(..), OutMsg, OutMsgType(..), fromElm, toElm)

import Json.Decode as Decode
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode



-- Messages going out to javascript from elm


type OutMsgType
    = OutSetContent
    | OutHasStorage
    | OutRequestStorage
    | OutSetStorage


type alias OutMsg =
    { type_ : OutMsgType
    , data : String
    }


port fromElmPort : Encode.Value -> Cmd msg


fromElm : OutMsg -> Cmd msg
fromElm msg =
    fromElmPort <| encodeMsg msg


encodeMsg : OutMsg -> Encode.Value
encodeMsg msg =
    Encode.object
        [ ( "type_", encodeOutMsgType msg.type_ )
        , ( "data", Encode.string msg.data )
        ]


encodeOutMsgType : OutMsgType -> Encode.Value
encodeOutMsgType outMsg =
    case outMsg of
        OutSetContent ->
            Encode.string "SetContent"

        OutHasStorage ->
            Encode.string "HasStorage"

        OutRequestStorage ->
            Encode.string "RequestStorage"

        OutSetStorage ->
            Encode.string "SetStorage"



-- Messages coming in to elm from javascript


type InMsgType
    = InSetContent
    | InHasStorage
    | InToggleMarkdown
    | InReceiveStorage
    | InError


type alias InMsg =
    { type_ : InMsgType
    , data : String
    }


port toElmPort : (Decode.Value -> msg) -> Sub msg


toElm : (InMsg -> msg) -> Sub msg
toElm tagger =
    toElmPort (decodeMsg >> tagger)


decodeMsg : Decode.Value -> InMsg
decodeMsg val =
    let
        result =
            Decode.decodeValue
                (Decode.succeed InMsg
                    |> required "type_" decodeInMsgType
                    |> optional "data" Decode.string ""
                )
                val
    in
    case result of
        Ok value ->
            value

        Err err ->
            let
                errMsg =
                    case err of
                        Decode.Field field _ ->
                            "Field wrong: " ++ field

                        Decode.Index idx _ ->
                            "Index wrong: " ++ String.fromInt idx

                        Decode.OneOf errors ->
                            errors
                                |> List.length
                                |> String.fromInt
                                |> (++) "List of errors length: "

                        Decode.Failure reason _ ->
                            "Failure: " ++ reason
            in
            { type_ = InError, data = errMsg }


decodeInMsgType : Decode.Decoder InMsgType
decodeInMsgType =
    Decode.andThen
        (\str ->
            case str of
                "SetContent" ->
                    Decode.succeed InSetContent

                "ToggleMarkdown" ->
                    Decode.succeed InToggleMarkdown

                "HasStorage" ->
                    Decode.succeed InHasStorage

                "ReceiveStorage" ->
                    Decode.succeed InReceiveStorage

                unknown ->
                    Decode.fail <| "Incorrect in option: " ++ unknown
        )
        Decode.string
