port module EditorPorts exposing (ReceivedMsg, ReceivedMsgType(..), setContent, toElm)

import Json.Decode as Decode
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode



-- Messages going out to javascript from elm


port setContentPort : Encode.Value -> Cmd msg


setContent : String -> Cmd msg
setContent content =
    setContentPort <| Encode.string content



-- Messages coming in to elm from javascript


type ReceivedMsgType
    = SetContent
    | ToggleMarkdown
    | Error


type alias ReceivedMsg =
    { type_ : ReceivedMsgType
    , data : String
    }


port toElmPort : (Decode.Value -> msg) -> Sub msg


toElm : (ReceivedMsg -> msg) -> Sub msg
toElm tagger =
    toElmPort (decodeMsg >> tagger)


decodeMsg : Decode.Value -> ReceivedMsg
decodeMsg val =
    let
        result =
            Decode.decodeValue
                (Decode.succeed ReceivedMsg
                    |> required "type_" decodeMsgType
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
            { type_ = Error, data = errMsg }


decodeMsgType : Decode.Decoder ReceivedMsgType
decodeMsgType =
    Decode.andThen
        (\str ->
            case str of
                "SetContent" ->
                    Decode.succeed SetContent

                "ToggleMarkdown" ->
                    Decode.succeed ToggleMarkdown

                unknown ->
                    Decode.fail <| "Incorrect in option: " ++ unknown
        )
        Decode.string
