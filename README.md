# Search-Query-Parser
A small recursive descent parser for dynamic search query language

Grammar for the query language:

* Query -> Clause (OrderPredicate)?
* Clause -> SimpleClause | GroupClause | JoinerClause
* SimpleClause -> Attribute ( Operator Value | ( "in" | "not" "in" ) "(" Value ( "," Value )* ")" )
* GroupClause -> "(" Clause ")"
* JoinerClause -> Clause ( ( "and" | "or" ) Clause )*
* OrderPredicate -> "order" "by" Attribute ( "," Attribute )* ( "asc" | "desc" | "ascending" | "descending" )? 
* Attribute -> IDENTIFIER | STRING
* Operator -> "=" | "!=" | ">" | ">=" | "<" | "<=" | "~" | "!~"
* Value -> IDENTIFIER | STRING | NUMBER
