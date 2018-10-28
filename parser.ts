import { Token } from './tokenizer';

export function filterWhiteSpace(inputTokens: Token[]): Token[] {
    return inputTokens.filter((token)=>{
        return token.type !='WHITESPACE';
    });
}

let current = 0;
let parsedOutput: {type:string, value: string, start: number, end: number, suggestionType?: string}[];
let nextSuggestionType:string = 'ATTRIBUTES';

export function  getParsedOutput() {
    return parsedOutput.filter((item,index) => {return index < current; });
}

export function getNextSuggestionType() {
    return nextSuggestionType;
}

export function parse(sourceTokens: Token[]){

    let inputTokens = filterWhiteSpace(sourceTokens);
    parsedOutput = [...inputTokens];

    return query();

    function peek(): Token {
        return inputTokens[current];
    }

    function isAtEnd(): boolean {
        return peek().type == 'EOF';
    }

    function previous(): Token {
        return inputTokens[current-1];
    }

    function advance(): Token {
        if(!isAtEnd()) current++;
        return previous();
    }

    function check(tokenType: string): boolean {
        if(isAtEnd()) return false;
        return peek().type == tokenType;
    }

    function match(tokensTypes:string[]): boolean {
        for(let i = 0; i< tokensTypes.length; i++){
            if(check(tokensTypes[i])){
                advance();
                return true;
            }
        }
        return false;
    }

    function attribute(): boolean {
        if(match(['IDENTIFIER','STRING'])){
            parsedOutput[current-1].suggestionType = 'ATTRIBUTES';
            return true;
        }
        return false;
    }

    function operator(): boolean {
        if(match(['EQUAL',
                 'TILDA',
                 'BANG_EQUAL', 
                 'BANG_TILDA', 
                 'LESS_EQUAL',
                 'LESS',
                 'GREATER_EQUAL',
                 'GREATER'])){
            parsedOutput[current-1].suggestionType = 'OPERATOR';
            return true;
        }
        return false;
    }

    function value(): boolean {
        if(match(['IDENTIFIER','STRING', 'NUMBER'])){
            parsedOutput[current-1].suggestionType = 'VALUE';
            return true;
        }
        return false;
    }

    function query(){
        if(clause()){
            if(!isAtEnd()){
                if(!orderPredicate()){
                   return false; 
                }
            }
        } else {
            return false;
        }     
        return true;
    }

    function clause(): boolean {
        if(check('LEFT_PAREN')) {
            nextSuggestionType = 'ATTRIBUTES';
            if(groupClause()){
                return true;
            }
        }

        if(simpleClause()) {
            nextSuggestionType = 'JOINER';
            if(match(['AND', 'OR'])){
                parsedOutput[current-1].suggestionType = 'JOINER';
                return clause();
            }
            return true;
        }

        return false;
    }

    function simpleClause(): boolean {
        if(attribute()){
            nextSuggestionType = 'OPERATOR';
            if(match(['IN', 'NOT'])){
                if(previous().type == 'IN'){
                    if(match(['LEFT_PAREN'])){
                        nextSuggestionType = 'VALUE';
                        if(value()){
                            while(match(['COMMA'])){
                                nextSuggestionType = 'VALUE';
                                if(!value()){
                                    return false;
                                }
                            }
                            if(!match(['RIGHT_PAREN'])){
                                return false;
                            }
                            return true;
                        }
                    }
                } else {
                    if(match(['IN'])){
                        if(match(['LEFT_PAREN'])){
                            nextSuggestionType = 'VALUE';
                            if(value()){
                                while(match(['COMMA'])){
                                    nextSuggestionType = 'VALUE';
                                    if(!value()){
                                        return false;
                                    }
                                }
                                if(!match(['RIGHT_PAREN'])){
                                    return false;
                                }
                                return true;
                            }
                        }
                    }
                }
            } else {
                nextSuggestionType = 'OPERATOR';
                if(operator()){
                    nextSuggestionType = 'VALUE';
                    if(value()){
                        return true;
                    }
                }
            }
        }

        return false;
    }

    function groupClause(): boolean {
        if(match(['LEFT_PAREN'])){
            nextSuggestionType = 'ATTRIBUTE'
            if(clause()){
                if(!match(['RIGHT_PAREN'])){
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    function orderPredicate(): boolean {
        if(match(['ORDER'])){
            if(match(['BY'])){
                nextSuggestionType = 'ATTRIBUTE';
                if(attribute()){
                    while(match(['COMMA'])){
                        nextSuggestionType = 'ATTRIBUTE';
                        if (!attribute()){
                            return false;
                        }
                    }
                    nextSuggestionType = 'ORDERTYPE'
                    if(!isAtEnd()) {
                        if(!match(['ASC','DESC'])){
                            return false;
                        } else {
                            nextSuggestionType = 'NONE';
                            parsedOutput[current-1].suggestionType = 'ORDERTYPE';
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    
}

