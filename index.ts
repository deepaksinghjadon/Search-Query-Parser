import { tokenize } from './tokenizer';
import { parse, getParsedOutput , getNextSuggestionType} from './parser';

// let testString =`"settlement date" is not empty`;
// console.log(tokenize(testString));

let testString1 =`"Settlement Date" >= 23.45 and (security = "some value" or fundtype = "FIJ" ) order by "first field", second desc`;
let testString2 =`("Settlement Date" >= 23.45) order by "first field",secondvalue descending`;
let testString3 =`order by instrument descending`;
let testString4 =`instrument !=`;
console.log("Parsing compilation:" + parse(tokenize(testString1)));
console.log("The parsed output is:" + JSON.stringify(getParsedOutput(), null, 2) );
console.log("The next suggested output is: " + getNextSuggestionType());