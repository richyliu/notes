port module Ports exposing (SendMsg, editorChanged, send)


type alias SendMsg =
    { type_ : String
    , data : String
    }


port send : SendMsg -> Cmd msg


{-| Called when editor content changes
-}
port editorChanged : (String -> msg) -> Sub msg
