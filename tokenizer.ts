export interface Token {
    type: string;
    value: string;
    start: number;
    end: number;
}

let Keywords = {
    'not': 'NOT',
    'and': 'AND',
    'or': 'OR',
    // 'empty': 'EMPTY',
    // 'EMPTY': 'EMPTY',
    // 'is': 'IS',
    // 'IS': 'IS',
    'order': 'ORDER',
    'by': 'BY',
    'asc': 'ASC',
    'ascending':'ASC',
    'desc': 'DESC',
    'descending': 'DESC'
}

export function tokenize(sourceString:string):Token[]{
    let start = 0;
    let current = 0;
    let tokens: Token[] = [];

    if(!sourceString){
        return tokens;
    }

    while (!isAtEnd()){
        start = current;
        scanToken();
    }

    tokens.push({type:'EOF',value: null, start: current, end: current});
    return tokens;

    function isAtEnd(): boolean{
        return current >= sourceString.length;
    }

    function advance(): string {
        current++;
        return sourceString.charAt(current - 1);
    }

    function addToken(type: string): void{
        let text = sourceString.substring(start, current);
        tokens.push({type:type, value:text, start:start, end:current-1})
    }

    function match(expected: string): boolean{
        if(isAtEnd()) return false;
        if(sourceString.charAt(current) != expected) return false;
        current++;
        return true;    
    }

    function peek(): string{
        if(isAtEnd()) return '\0';
        return sourceString.charAt(current);
    }

    function peekNext(): string{
        if(isAtEnd()) return '\0';
        return sourceString.charAt(current + 1);
    }

    function string():void {
        while(peek() != '"' && !isAtEnd()){
            advance();
        }
        if(isAtEnd()){
            console.log('Unterminated string - started at: ' + start);
            return;
        }
        advance();
        addToken('STRING');
    }

    function isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    function isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z')   ||
               (c >= 'A' && c <= 'Z')   ||
               c == '_';
    }

    function isAlphanumeric(c: string): boolean{
        return isAlpha(c) || isDigit(c);
    }

    function number():void {
        while(isDigit(peek())) advance();

        if(peek() == '.' && isDigit(peekNext())){
            advance();
            while(isDigit(peek())) advance();
        }

        addToken('NUMBER');
    }

    function identifier():void {
        while(isAlphanumeric(peek())) advance();

        let text = sourceString.substring(start, current);
        if(!Keywords[text]){
            addToken('IDENTIFIER');
        } else {
            addToken(Keywords[text]);
        }
        
    }

    function scanToken(): void{
        let c = advance();
        switch (c) {
            case '(':
                addToken('LEFT_PAREN');
                break;
            case ')':
                addToken('RIGHT_PAREN');
                break;
            case ',':
                addToken('COMMA');
                break;
            case '=':
                addToken('EQUAL');
                break;
            case '~':
                addToken('TILDA');
                break;
            case '!':
                addToken(match('=') ? 'BANG_EQUAL' : match('~') ? 'BANG_TILDA': 'BANG' );
                break;
            case '<':
                addToken(match('=') ? 'LESS_EQUAL' : 'LESS' );
                break;
            case '>':
                addToken(match('=') ? 'GREATER_EQUAL' : 'GREATER' );
                break;
            case ' ':
            case '\r':
            case '\t':
            case '\n':
                addToken('WHITESPACE');
                break;
            case '"':
                string();
                break;
            default:
                if(isDigit(c)){
                    number();
                } else if(isAlpha(c)){
                    identifier();
                }else {
                    console.log('Unexpected char at :' + current);
                }
        }
    }
    

}