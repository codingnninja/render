import { 
  sanitizeOpeningTagAttributes, 
  deSanitizeOpeningTagAttributes,
  makeFunctionFromString 
} from "./render";
import { 
  reviver, 
  checkForObjectString, 
  isPromise, 
  deSanitizeString } from "./utils";

const CONSTANT = {
  cap: 'cap',
  isFirstLetterCapped: 'isFirstLetterCapped',
  isComponentCloseTag: 'isComponentCloseTag',
  isNotTag: 'isNotTag'
}

 /**
 * remove script tag
 * @param str
 * @returns {string | * | void}
 */

 function removeScript(str){
   return str.replace(/<script[^>]*>([^]*?)<\/script>/g, '');
 }
 
  /**
 * normalize brackets
 * @param str
 * @returns {string | * | void}
 */

 function correctBracket(str) {
   return str.replace(/("[^<>\/"]*)<([^<>\/"]+)>([^<>\/"]*")/g, '"$1|$2|$3"');
 }
 
  /**
 * remove comment
 * @param str
 * @returns {string | * | void}
 */

 function removeComment(str) {
   return str.replace(/<!--[^>]*-->/g, '');
 }
 
 /**
  * remove break line
  * @param str
  * @returns {string | * | void}
  */
 function removeBreakLine(str) {
   return str.replace(/[\r\n\t]/g, '');
 }
 
 /**
  * get body if available
  * @param str
  * @returns {*}
  */
 function getBodyIfHave(str) {
   const match = str.match(/<body[^>]*>([^]*)<\/body>/);
   if (!match) {
     return str;
   }
   return match[1];
 }

  /**
 * Tag regex matchers
 * @param str
 * @returns {Boolean}
 */
 function isLine(property, line){
  let patterns = {
    cap: /[A-Z]/.test(line),
    self: /<([^\s<>]+) ?([^<>]*)\/>/.test(line),
    close: /<\/([^\s<>]+)>/.test(line),
    start: /<([^\s<>]+) ?([^<>]*)>/.test(line),
    text: /<(?:\/?[A-Za-z]+\b[^>]*>|!--.*?--)>/.test(line),
    isFirstLetterCapped: /<([A-Z][A-Za-z0-9]*)/.test(line),
    isComponentCloseTag: /<\/[A-Z][A-Za-z0-9]*>/.test(line),
    isNotTag: /^(?!<\w+\/?>$).+$/.test(line)
  }
  return patterns[property];
 }

 /**
  * node type
  * @type {{text: string, self: string, close: string, start: string}}
  */
  const NODE_TYPE = {
    text: 'text',
    self: 'self',
    close: 'close',
    // start or total
    start: 'start',
    element: 'element',
  };
 
 
/**
 * converts attributes to props
 * @param str
 * Todo: This should be made better with a proper parsing 
 * @returns {{}}
 */

 function convertAttributesToProps(str){
  const regexToMatchProps = /([\S]+=([`"']?)(_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_)\1)/g;
  const matches = {};
  let match;

  try {
    while ((match = regexToMatchProps.exec(str)) !== null) {
      const extractedContent = match[1].match(/([^=]+)=([^]*)/);
      const value = extractedContent[2].match(/([`"']?)(_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_)\1/);
    
      const parsedJSON = JSON.parse(value[3], reviver);
      matches[extractedContent[1]] = parsedJSON;
    }
  } catch (error) {
    // If parsing fails due to a SyntaxError, handle the error here
    console.error("Parsing Error:", error);
  }

  return matches;
}

/**
 * make sure strings in boolean or number nature are converted to boolean or number
 * @param str
 * @returns {{}}
 */

function normalizeNumberOrBoolean(paramValue){
  if (/^\d+$/.test(paramValue)) {
    return Number(paramValue);
  } else if (/^(true|false)$/.test(paramValue)) {
    paramValue = paramValue === 'true';
    return paramValue;
  }
  return paramValue;
}

/**
 * handle attribute
 * @param str
 * @returns {{}}
 */
 function convertAttributes(str) {
  if (!str) {
    return {};
  }
  const extractedNonStructuredDataType = {}
  const extractedObjectAndArray = convertAttributesToProps(str);
  const regexToMatchProps = /([\S]+=([`"']?)(_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_)\1)/g;
  const _str = str.replace(regexToMatchProps, ' ');
  const arr = _str.replace(/[\s]+/g, ' ').trim().match(/([\S]+="[^"]*")|([^\s"]+)/g);

  arr.forEach((item) => {
    if (item.indexOf('=') === -1) {
      if(item === "/"){
        return;
      }
      extractedNonStructuredDataType[item] = true;
    } else {
      //just split first =
      const match = item.match(/([^=]+)=([^]*)/);
      // remove string ""
      let paramValue = (match[2] && match[2].replace(/^"([^]*)"$/, '$1'));
      extractedNonStructuredDataType[match[1]] = normalizeNumberOrBoolean(paramValue);
    }
  });
  const props = {
    ...extractedObjectAndArray, 
    ...extractedNonStructuredDataType
  }; 

  return props;
}

 /**
  * check for component
  * @param str
  * @returns boolean
  */
 function isComponent(line){
  if(!isLine(CONSTANT.isFirstLetterCapped, line)){
    return false;
  }
  return true;
 }

 /**
 * Normalize html tags
 * @param str
 * @returns {string | * | void}
 */
function normalizeHTML(str){
  return correctBracket(
    getBodyIfHave(
      removeBreakLine(
        removeComment(
          removeScript(str)
        )
      )
    )
  );
}

const parseChildrenComponents = async function(extensibleStr, currentElement){
  
  const line = currentElement;
  const regularMatch = line.match(/<([^\s<>]+) ?([^<>]*)>/);
  const selfClosingMatch = line.match(/<([^\s<>]+) ?([^<>]*)\/>/);
  
  const node = regularMatch ? regularMatch : selfClosingMatch;
  const dependencies = {
    tagName: node[1], 
    props: convertAttributes(deSanitizeString(node[2])), 
    children: selfClosingMatch ? '' : '__placeholder'
  };

  try {
    let calledComponent = await callComponent(dependencies);
    const component = normalizeHTML(sanitizeOpeningTagAttributes(calledComponent));

    const indexOfCurrentElement = extensibleStr.indexOf(currentElement);
    const result = component.split(/(<[^<>]+>)/);

    if(indexOfCurrentElement !== -1) {
      extensibleStr.splice(indexOfCurrentElement, 1, ...result);
      return extensibleStr;
    }
  } catch(error){
    console.error(error);
  }
};

 /**
 * sanitizes string
 * @param str
 * @returns {string | * | void}
 */

function convertStackOfHTMLToString(stack) {
  let html = ``;
  if (stack.length > 0) {
    stack.forEach((node, index) => {
      // text node
      if(isLine(NODE_TYPE.close, node)) {
        if(isLine(CONSTANT.isComponentCloseTag, node)) {
          html+='</div>';
        } else if(!isLine(CONSTANT.isFirstLetterCapped, node) && stack[index - 1] === '__placeholder'){
          html+='';
        } else if(!isLine(CONSTANT.isFirstLetterCapped, node) && stack[index - 1].trim() !== '__placeholder'){
          html+=node;
        } 
        // html+=node;
      } else if(node.trim() === ","){
        html+="";
      } else if(isLine(NODE_TYPE.start, node)) {
        html += node;
      } else if(isLine(CONSTANT.isNotTag, node) && node.trim() !== '__placeholder') {
        html += node;
      }
    });
  }
  return html;
}

/**
* parses html and jsx
* @param str
* @returns {*}
*/
async function parseComponent (str) {
  //open tag matching pattern 
  const pattern = /(<[^<>]+>)/;
  if (!str) {
    return null;
  }

  try {
    let extensibleStr = str.split(pattern);
    const stack = [];
    let depth = 0;
    while (extensibleStr.length > depth ) {
    const currentElement = extensibleStr[depth]
      if(currentElement.trim() === '') {
        depth++
        continue;
      } 
      if(isComponent(currentElement)){
        extensibleStr = await parseChildrenComponents(extensibleStr, currentElement);
      } else {
        stack.push(deSanitizeOpeningTagAttributes(currentElement));
        depth++;
      }
    }

    return convertStackOfHTMLToString(stack);
  } catch (error) {
    console.error(error);
  }
  
};

/**
 * convert tag string to a function equivalent with a tag name
 * @param element
 * @returns {function}
 */

 function resolveFunction(tagName){
  const fn = Function(`return ${tagName}`)(); 
  if (typeof fn !== "function") {
    throw TypeError('This component is not defined');
  }

  return fn;
}

/**
 * Call a component with or without props
 * @param str
 * @returns {function}
 */
async function callComponent(element) {
  
  try {
    const component = globalThis[element.tagName];
    const modifiedComponent = makeFunctionFromString(component.toString());
    const children = element.children;
    let props = element.props;
    if(Object.keys(props).length === 0 && !element.children) {
      return checkForObjectString(modifiedComponent());
    } else {
     /*  if(isObject(props) && 
         isObject(props[Object.keys(props)[0]]) &&
         Object.keys(props).length === 1){
          props = props[Object.keys(props)[0]];
      } */

      if(element.children){
        props.children = children;
      }

      const calledComponent = checkForObjectString(modifiedComponent(props));
      const resolvedComponent = isPromise(calledComponent) ? await calledComponent : calledComponent;
      return resolvedComponent;
    } 
  } catch (error) {
    console.error(`${error} in ${element.tagName}`);
  }
};

/**
* process JSX from html
* @param str
* @constructor
*/
 const processJSX = async function (str) {
   let _str = str || '';
   try {
    _str = normalizeHTML(_str);
    const a = await parseComponent(_str);
    return a;
   } catch (error) {
    console.error(error);
   }
 };

export {processJSX}