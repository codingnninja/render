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
 * Todo: This should be made better by a properly proper parsing 
 * @returns {{}}
 */

 function convertAttributesToProps(str){
  const regex = /([\S]+=_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_)/g;
  const matches = {};
  let match;

  while ((match = regex.exec(str)) !== null) {
    const extractedContent = match[1].match(/([^=]+)=([^]*)/);
    const value = extractedContent[2].match(/_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_/);
    try {
      const parsedJSON = JSON.parse(value[1]);
      matches[extractedContent[1]] = parsedJSON;
    } catch (error) {
      // If parsing fails due to a SyntaxError, handle the error here
      console.error("Parsing Error:", error);
    }
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

  const _str = str.replace(/([\S]+=_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_)/g, ' ');
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

function generateDivWithRandomId() {
  const alpherNumericCharacters = 'abcdefghijklmnopqrstvwxyz';
  const randomId = Array.from({length:12}, () => alpherNumericCharacters.charAt(Math.floor(Math.random() * alpherNumericCharacters.length))).join('');
  const divString = `<div id="${randomId}"></div>`;
  globalThis.$trackedDataFetcherkeys = globalThis.$trackedDataFetcherkeys || [];
  globalThis.$trackedDataFetcherkeys.push(`#${randomId}`);
  return divString;
}

function isPromise(value){
  return Boolean(value && typeof value.then === "function");
}

function handlePromise(returnedValue){
  if(isPromise(returnedValue)){
    return generateDivWithRandomId();
  }
  return returnedValue;
}

const parseChildrenComponents = function(extensibleStr, currentElement){
  const line = currentElement;
  const regularMatch = line.match(/<([^\s<>]+) ?([^<>]*)>/);
  const selfClosingMatch = line.match(/<([^\s<>]+) ?([^<>]*)\/>/);

  const node = regularMatch ? regularMatch : selfClosingMatch;
  const dependencies = {
    tagName: node[1], 
    props: convertAttributes(sanitizedString(node[2])), 
    children: selfClosingMatch ? '' : '__placeholder'
  };

  try {
    const component = normalizeHTML(handlePromise(callComponent(dependencies)));

    const indexOfCurrentElement = extensibleStr.indexOf(currentElement);
    const result = component.split(/(<[^<>]+>)/);

    if(indexOfCurrentElement !== -1) {
      extensibleStr.splice(indexOfCurrentElement, 1, ...result);
      return extensibleStr;
    }
  } catch(error){
    throw(`${error}`);
  }
};

 /**
 * sanitizes string
 * @param str
 * @returns {string | * | void}
 */
function sanitizedString(str) {
  const _str = str.replace(/&amp;/g, '&')
     .replace(/&lt;/g, '<')
     .replace(/&gt;/g, '>')
     .replace(/&quot;/g, '"')
     .replace(/&#x27;/g, "'")
     .replace(/&#x2F;/g, '\/');
  return _str;
}

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
function parseComponent (str) {
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
        extensibleStr = parseChildrenComponents(extensibleStr, currentElement);
      } else {
        stack.push(currentElement);
        depth++;
      }
    }

    return convertStackOfHTMLToString(stack);
  } catch (error) {
    throw(`${error}`);
  }
  
};
 
/**
 * figures argument length of a function
 * @param function
 * @returns {obj}
 */
function getArgsLength(component) {
  // Extract the arguments using regex
  
  const argsRegex = /function\s*\w*\s*\((.*?)\)|\((.*?)\)|\((.*?)\)\s*=>/;
  const match = component.match(argsRegex);

  let args = [];
  if (match) {
    const argsString = match[1] || match[2];
    if(match[1] === "") { return {length: 0}};
    args = argsString.split(',').map(arg => arg.trim());
  }

  if (args.length === 1) {
    return {length: 1, args}
  }
  return {length: args.length, args};
}

/**
 * string to parameters
 * @param str
 * @returns {obj}
 */
function convertStringToParams(string) {
  const regex = /(\w+)\s*=\s*(.*?)(?=\s*(?:,|$))/g;
  const parameterObj = {};

  let matches;
  while ((matches = regex.exec(string)) !== null) {
    const paramName = matches[1].trim();
    let paramValue = normalizeNumberOrBoolean(matches[2].trim());
    parameterObj[paramName] = paramValue;
  }
  return parameterObj;
}

/**
 * convert tag string to a function equivalent with a tag name
 * @param element
 * @returns {function}
 */

function resolveFunction(element){
  const fn = Function(`return ${element.tagName}`)(); 

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
const callComponent = function(element) {
  try {
    const component = resolveFunction(element);
    const componentArgs = getArgsLength(component.toString());

    const children = element.children;
    let attributes = element.props;
    const keys = Object.keys(attributes);

    if(componentArgs.length === 0) {
      return component();
    } else {
      let prop = attributes[keys[0]];
      if(Object.keys(attributes).length === 0) {
        const convertedProp = convertStringToParams(componentArgs.args);
        const key = Object.keys(convertedProp);
        prop = convertedProp[key];
      }

      attributes.children = children;
      const finalProp = /\{\s*\w+\s*\}/.test(componentArgs.args) ? attributes : prop;
      return component(finalProp);
    } 
  } catch (error) {
    throw(`${error}`);
  }
};

/**
* process JSX from html
* @param str
* @constructor
*/
 const processJSX = function (str) {
   let _str = str || '';
   try {
    _str = normalizeHTML(_str);
    return parseComponent(_str);
   } catch (error) {
    throw(`${error}`);
   }
 };

export {processJSX}