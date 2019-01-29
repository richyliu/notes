module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode


main =
  Browser.element
    { init = init
    , update = update
    , view = view
    , subscriptions = subscriptions
    }



-- MODEL


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
    }
  , Http.get
    { url = "https://elm-lang.org/assets/public-opinion.txt"
    , expect = Http.expectString GotText
    }
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
    ]


onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
  on "keydown" (Json.Decode.map tagger keyCode)


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
