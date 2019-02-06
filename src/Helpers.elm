module Helpers exposing (ite)

{-| Ternary syntax shortcut. Good for one line if-then-else statements. Note
that values are not evaluated lazily like regular if-then-else, which could
lead to performance issues for larger values

    ite True "true" "false" == "true"

-}


ite : Bool -> a -> a -> a
ite condition then_ else_ =
    if condition then
        then_

    else
        else_
