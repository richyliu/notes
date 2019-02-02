module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode as Decode exposing (Decoder, field, int, map3, string)
import Svg
import Svg.Attributes as Attr
import Task
import Time


main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- MODEL


type alias Position =
    { lat : Float
    , long : Float
    , time : Int
    }


type alias Id =
    Int


type alias Todo =
    { id : Id
    , content : String
    , done : Bool
    }


type Load
    = Failure
    | Loading
    | Success String


type alias Model =
    { todos : List Todo
    , idCounter : Id
    , inputValue : String
    , load : Load
    , iss : Maybe Position
    , issError : Maybe String
    , time : Time.Posix
    , clockOn : Bool
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { todos =
            [ { id = 0, content = "eat food", done = False }
            , { id = 1, content = "foo bar", done = False }
            , { id = 2, content = "baz", done = False }
            ]
      , idCounter = 3
      , inputValue = ""
      , load = Loading
      , iss = Nothing
      , issError = Nothing
      , time = Time.millisToPosix 0
      , clockOn = True
      }
    , Cmd.batch
        [ Http.get
            { url = "https://elm-lang.org/assets/public-opinion.txt"
            , expect = Http.expectString GotText
            }
        , getISSPosition
        ]
    )



-- UPDATE


type Msg
    = Add
    | Change Id String
    | Remove Id
    | Toggle Id
    | Reset
    | ChangeInput String
    | NoOp
    | GotText (Result Http.Error String)
    | GotISSPosition (Result Http.Error Position)
    | GetISSPosition
    | Tick Time.Posix
    | ToggleClock


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        Add ->
            let
                content =
                    model.inputValue
            in
            if String.length content > 0 then
                let
                    nextModel =
                        incrementIdCounter model
                in
                ( { nextModel
                    | todos = createTodo nextModel content :: nextModel.todos
                    , inputValue = ""
                  }
                , Cmd.none
                )

            else
                ( model, Cmd.none )

        Change id content ->
            ( { model
                | todos =
                    List.map
                        (\todo ->
                            if todo.id == id then
                                { todo | content = content }

                            else
                                todo
                        )
                        model.todos
              }
            , Cmd.none
            )

        Remove id ->
            ( { model | todos = List.filter (\todo -> todo.id /= id) model.todos }, Cmd.none )

        Toggle id ->
            ( { model
                | todos =
                    List.map
                        (\todo ->
                            if todo.id == id then
                                { todo | done = not todo.done }

                            else
                                todo
                        )
                        model.todos
              }
            , Cmd.none
            )

        Reset ->
            init ()

        ChangeInput inputValue ->
            ( { model | inputValue = inputValue }, Cmd.none )

        GotText result ->
            case result of
                Ok fullText ->
                    ( { model | load = Success fullText }, Cmd.none )

                Err _ ->
                    ( { model | load = Failure }, Cmd.none )

        GotISSPosition result ->
            case result of
                Ok pos ->
                    ( { model | iss = Just pos }, Cmd.none )

                Err err ->
                    case err of
                        Http.BadBody str ->
                            ( { model | issError = Just str }, Cmd.none )

                        Http.Timeout ->
                            ( { model | issError = Just "Timeout" }, Cmd.none )

                        Http.NetworkError ->
                            ( { model | issError = Just "NetworkError" }, Cmd.none )

                        Http.BadStatus status ->
                            ( { model | issError = Just <| "BadStatus: " ++ String.fromInt status }, Cmd.none )

                        Http.BadUrl str ->
                            ( { model | issError = Just str }, Cmd.none )

        GetISSPosition ->
            ( model, getISSPosition )

        Tick newTime ->
            ( { model | time = newTime }, Cmd.none )

        ToggleClock ->
            ( { model | clockOn = not model.clockOn }, Cmd.none )


getNextId : Model -> Id
getNextId model =
    model.idCounter


incrementIdCounter : Model -> Model
incrementIdCounter model =
    { model | idCounter = model.idCounter + 1 }


createTodo : Model -> String -> Todo
createTodo model content =
    { id = getNextId model
    , content = content
    , done = False
    }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.clockOn then
        Time.every 1000 Tick

    else
        Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    div [ style "font-family" "Arial" ]
        [ input
            [ onInput ChangeInput
            , onKeyDown
                (\t ->
                    if t == 13 then
                        Add

                    else
                        NoOp
                )
            , value model.inputValue
            , placeholder "Type a todo..."
            ]
            []
        , button [ onClick Add ] [ text "Add" ]
        , button [ onClick Reset ] [ text "Clear" ]
        , viewTodosList model
        , div [] [ viewLoad model ]
        , viewIssPosition model.iss
        , p []
            (case model.issError of
                Just errStr ->
                    [ text errStr ]

                Nothing ->
                    []
            )
        , viewTime model.time
        , button [ onClick ToggleClock ]
            [ text <|
                "Toggle clock: "
                    ++ (if model.clockOn then
                            "On"

                        else
                            "Off"
                       )
            ]
        , viewAnalogClock model.time
        ]


onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
    on "keydown" (Decode.map tagger keyCode)


viewTodosList : Model -> Html Msg
viewTodosList model =
    div []
        (model.todos
            |> List.sortWith
                (\a b ->
                    if a.done == b.done then
                        compare a.content b.content

                    else if a.done then
                        GT

                    else
                        LT
                )
            |> List.map
                (\todo ->
                    p [ style "cursor" "pointer", onClick <| Toggle <| todo.id ]
                        [ span [] (checkBox todo.done)
                        , span [] [ text todo.content ]
                        , span [ style "color" "red", style "margin-left" "10px" ] [ text <| String.fromInt <| todo.id ]
                        ]
                )
        )


viewIssPosition : Maybe Position -> Html Msg
viewIssPosition issPos =
    div []
        [ p []
            (case issPos of
                Just pos ->
                    [ text "( "
                    , text <| String.fromFloat pos.lat
                    , text ", "
                    , text <| String.fromFloat pos.long
                    , text " ) at "
                    , text <| String.fromInt pos.time
                    ]

                Nothing ->
                    [ text "Unable to load ISS position" ]
            )
        , button [ onClick GetISSPosition ] [ text "Get ISS Position" ]
        ]


checkBox : Bool -> List (Html Msg)
checkBox isChecked =
    [ input [ type_ "checkbox", checked isChecked ] [] ]


viewLoad : Model -> Html Msg
viewLoad model =
    case model.load of
        Failure ->
            text "I was unable to load your book."

        Loading ->
            text "Loading..."

        Success fullText ->
            pre [] [ text <| String.slice 0 100 fullText ]


viewTime : Time.Posix -> Html Msg
viewTime time =
    let
        hour =
            String.fromInt <| Time.toHour Time.utc time

        minute =
            String.fromInt <| Time.toMinute Time.utc time

        second =
            String.fromInt <| Time.toSecond Time.utc time
    in
    p []
        [ span
            [ style "font-family" "Verdana"
            , style "letter-spacing" "2px"
            , style "background-color" "darkgray"
            , style "border-radius" "5px"
            , style "border" "solid 2px black"
            , style "padding" "5px"
            ]
            [ text <| hour ++ ":" ++ minute ++ ":" ++ second ]
        ]


viewAnalogClock : Time.Posix -> Html Msg
viewAnalogClock time =
    let
        hour =
            (toFloat <| Time.toHour Time.utc time) / 12 * 2 * pi

        minute =
            (toFloat <| Time.toMinute Time.utc time) / 60 * 2 * pi

        second =
            (toFloat <| Time.toSecond Time.utc time) / 60 * 2 * pi

        handLength =
            60

        calcX handLen pos =
            handLen * cos (pos - pi / 2) + 60

        calcY handLen pos =
            handLen * sin (pos - pi / 2) + 60
    in
    Svg.svg
        [ Attr.width "120"
        , Attr.height "120"
        , Attr.viewBox "0 0 120 120"
        ]
        [ Svg.circle
            [ Attr.cx "60"
            , Attr.cy "60"
            , Attr.r "60"
            ]
            []
        , Svg.line
            [ Attr.x1 "60"
            , Attr.y1 "60"
            , Attr.x2 <| String.fromFloat <| calcX handLength second
            , Attr.y2 <| String.fromFloat <| calcY handLength second
            , Attr.stroke "red"
            , Attr.strokeWidth "2"
            ]
            []
        , Svg.line
            [ Attr.x1 "60"
            , Attr.y1 "60"
            , Attr.x2 <| String.fromFloat <| calcX handLength minute
            , Attr.y2 <| String.fromFloat <| calcY handLength minute
            , Attr.stroke "white"
            , Attr.strokeWidth "1"
            ]
            []
        , Svg.line
            [ Attr.x1 "60"
            , Attr.y1 "60"
            , Attr.x2 <| String.fromFloat <| calcX (handLength / 2) hour
            , Attr.y2 <| String.fromFloat <| calcY (handLength / 2) hour
            , Attr.stroke "white"
            , Attr.strokeWidth "2"
            ]
            []
        ]



-- HTTP


getISSPosition : Cmd Msg
getISSPosition =
    Http.get
        { url = "http://api.open-notify.org/iss-now.json"
        , expect = Http.expectJson GotISSPosition positionEncoder
        }


floatInQuotes : Decoder Float
floatInQuotes =
    Decode.map
        (Maybe.withDefault 0 << String.toFloat)
        string


positionEncoder : Decoder Position
positionEncoder =
    map3 Position
        (field "iss_position" <| field "latitude" floatInQuotes)
        (field "iss_position" <| field "longitude" floatInQuotes)
        (field "timestamp" int)
