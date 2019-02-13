port module Database exposing (Msg, received, send)

import Json.Decode as Decode
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode


type alias Msg =
    -- Type_ represents the request type. The response is of the same type
    { type_ : String

    -- Data is a list of either:
    --      Arguments to javascript function
    --      Resultant payload and error
    , data : List String
    }



-- Out to javascript


port dbOut : Encode.Value -> Cmd msg


send : String -> List String -> Cmd msg
send type_ data =
    dbOut <|
        Encode.object <|
            [ ( "type_", Encode.string type_ )
            , ( "data", Encode.list Encode.string data )
            ]



-- In from javascript


port dbIn : (Decode.Value -> msg) -> Sub msg


received : (Msg -> msg) -> Sub msg
received withMsg =
    dbIn (decodeOutMsg >> withMsg)


decodeOutMsg : Decode.Value -> Msg
decodeOutMsg val =
    let
        result =
            Decode.decodeValue
                (Decode.succeed Msg
                    |> required "type_" Decode.string
                    |> required "data" (Decode.list Decode.string)
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
            { type_ = "JsonParseError", data = [ errMsg ] }
