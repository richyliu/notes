module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Ports exposing (..)
import Random


main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    String


init : () -> ( Model, Cmd Msg )
init _ =
    ( "barst", Cmd.none )



-- UPDATE


type Msg
    = Change String
    | UpdateEditor String
    | RandomChange


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Change content ->
            ( content, Cmd.none )

        UpdateEditor content ->
            ( content
            , send { type_ = "set_content", data = content }
            )

        RandomChange ->
            ( model
            , Random.generate
                (\x ->
                    x
                        |> String.fromInt
                        |> UpdateEditor
                )
                (Random.int 0 1000)
            )



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ div
            [ id "editor-wrapper"
            , style "height" "300px"
            ]
            []
        , pre [] [ code [] [ text model ] ]
        , button [ onClick RandomChange ] [ text "click" ]
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    editorChanged Change
