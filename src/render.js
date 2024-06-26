let _$;

function removeJsComments(code) {
  return code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ' ');
}
function sanitizeString(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, "&#x27;")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/`/g, "&#96")
    .replace(/\//g, '&#x2F;');
}

function deSanitizeString(str) {
  const props = str.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/&#96/g, "`")
    .replace(/&#x2F;/g, '\/');
  return props
}

const replacer = (key, value) => {
  if (typeof value === 'function') {
    const sanitizedString = sanitizeString(normalizeHTML(value.toString()))
    return `__function__:${sanitizedString}`;
  } else if (typeof value === 'symbol') {
    return `__symbol__${String(value)}`;
  } else if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries())
    };
  } else if (value instanceof Set) {
    return {
      dataType: 'Set',
      value: Array.from(value)
    };
  } else {
    return value;
  }
};

const reviver = (key, value) => {
  if (typeof value === 'string' && value.startsWith('__function__')) {
    let functionString = value.slice(13);
    const deSanitizedString = deSanitizeString(functionString);
    return new Function(`return ${deSanitizedString}`)();
  } else if (value && typeof value === 'object' && value.dataType === 'Map') {
    return new Map(value.value);
  } else if (value && typeof value === 'object' && value.dataType === 'Set') {
    return new Set(value.value);
  } else {
    return value;
  }
};

function formatKeyValuePairs(input) {
  return input.replace(/(\w+)=\${(.*?)}/g, (match, key, value) => {
    return key + '="${' + value + '}"';
  });
}

//replace $trigger first argument with ${name} if it has {name}
function normalizePropPlaceholderAndUtilInTrigger(input) {
  const regex = /\s*\$trigger\s*\(\s*([^,]+)\s*(?:,\s*([^,]+)\s*)?(?:,\s*{\s*([^{}$]+)\s*}\s*)?\s*\)/g;/* \{([^{}]+)\}\) */
  return input.replace(regex, (_, arg1, arg2, value) => {
    const updatedArg1 = arg1.startsWith('{') ? `$${arg1}`: arg1;
    if(value === undefined) {
      return "$trigger("+updatedArg1 + "," + arg2 + ")";
    } 
    return "$trigger("+updatedArg1 + "," + arg2 + ",'${stringify(" + value + ")}')";
  });
}

function isObject(value) {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
};

async function checkForObjectString(input) {
  input = isPromise(input) ? await input : input;
  if (input.includes('[object Object]')) {
    throw new Error('You are expected to pass an object or an array of object(s) with {} but you used ${}');
  }
  return input;
}

function isPromise(value) {
  return Boolean(value && typeof value.then === "function");
}

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
          removeJsComments(
            removeScript(str)
          )
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
 * Call a component with or without props
 * @param str
 * @returns {function}
 */
async function callComponent(element) {
  
  try {
    const component = globalThis[element.tagName];
    const children = element.children;
    let props = element.props;
    if(Object.keys(props).length === 0 && !element.children) {
      return checkForObjectString(component());
    } else {
     /*  if(isObject(props) && 
         isObject(props[Object.keys(props)[0]]) &&
         Object.keys(props).length === 1){
          props = props[Object.keys(props)[0]];
      } */

      if(element.children){
        props.children = children;
      }

      const calledComponent = checkForObjectString(component(props));
      const resolvedComponent = isPromise(calledComponent) ? await calledComponent : calledComponent;
      return resolvedComponent;
    } 
  } catch (error) {
    console.error(`${error} in ${globalThis[element.tagName]}`);
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

if(typeof document !== 'undefined'){
   _$ = document.querySelectorAll.bind(document);
}
/**
* @desc Checking rendering environment
* @param void
* @returns boolean
*/
const isBrowser = (_) => {
// Check if the environment is Node.js
  if (typeof process === "object" &&
      typeof require === "function") {
      return false;
  }
  // Check if the environment is a
  // Service worker
  if (typeof importScripts === "function") {
      return false;
  }
  // Check if the environment is a Browser
  if (typeof globalThis === "object") {
      return true;
  }
}
function isInitialLetterUppercase(func, context) {
  if(typeof func !== 'function') {
    throw(`Use ${context}(functionName, arg) instead of ${context}(funcationName(arg))`)
  }
  const initialLetter = func.name.charAt(0);
  return initialLetter === initialLetter.toUpperCase();
}

 /**
  * @desc renders component
  * @param component string
  * @returns string || void (mutates the DOM)
  */
  async function $render(component, props) {
    const updatedComponent = makeFunctionFromString(component.toString());
    try {
      if(!isInitialLetterUppercase(component, '$render')){
        throw('A component must start with a capital letter.')
      }
      if(isBrowser() && typeof document !== 'undefined'){
        let renderedApp;
        if(document.readyState === 'complete'){
          executeFallback(updatedComponent.toString());
          renderedApp = await handleClientRendering(updatedComponent, props);
          return renderedApp
        } else {
          window.addEventListener('DOMContentLoaded', async ()=> {
            renderedApp = await handleClientRendering(updatedComponent, props);
            return renderedApp;
          })
        }
      }
      const resolvedComponent = await resolveComponent(updatedComponent, props)
      const result = await processJSX(sanitizeOpeningTagAttributes(resolvedComponent));
      return result;
    } catch (error) {
      console.error(`${error} in ${globalThis[component.name]}`);
    }
  }

 /**
  * Main processor to process JSX from html
  * @param component:function, arg: any
  * @return 
  */
async function resolveComponent(component, arg){
  const props = (typeof arg === 'function') ? arg : $purify(arg);
  let resolvedComponent = arg ?  component(props) : component();
  
  if(isPromise(resolvedComponent)){
    const result = await resolvedComponent;
    return result;
  }

  if(typeof resolvedComponent !== 'string'){
    throw('A component must return a string');
  }

  return checkForObjectString(resolvedComponent);
}
function isFetcher(parsedComponent){
  if(parsedComponent.dataset.append ||
     parsedComponent.dataset.prepend ||
     parsedComponent.dataset.replace){
    return true;
  }
  return false;
}

function extractFetcherAttributes(functionString){
  const fallbackMatcher = /data-(fallback)="([^"]*)"/;
  const componentMatcher = /data-(replace|prepend|append)="([^"]*)/;

  const fetcherAttributes = {};

  const matchedFallback = fallbackMatcher.exec(functionString);
  const matchedComponent = componentMatcher.exec(functionString);

  matchedFallback ? fetcherAttributes[matchedFallback[1]] = matchedFallback[2] : fetcherAttributes["data-fallback"] = matchedFallback;
  matchedComponent ? fetcherAttributes["componentId"] = matchedComponent[2] : fetcherAttributes["componentId"] = matchedComponent;
  fetcherAttributes["action"] = matchedComponent ? matchedComponent[1] : null;

  return fetcherAttributes;
}

function executeFallback(value){  
  const fetcherAttributes = extractFetcherAttributes(value.toString());
  if (fetcherAttributes.componentId && fetcherAttributes.componentId.startsWith('#')){ 
    const targetComponent = document.querySelector(fetcherAttributes.componentId);
    const component = globalThis[fetcherAttributes['fallback']];
    const modifiedComponent = component ? makeFunctionFromString(component.toString()) : '';
    const fallback = document.createElement('div');
    fallback.id = 'render-fallback';
    const content = `${(modifiedComponent && fetcherAttributes.componentId) ? modifiedComponent(targetComponent.id): 'Loading...'}`;
    
    const resolvedDefaultFallback = !component && fetcherAttributes['fallback'] ? fetcherAttributes['fallback'] : content;

    fallback.innerHTML = resolvedDefaultFallback ;
    fetcherAttributes.action == 'prepend' ? targetComponent.prepend(fallback) : targetComponent.append(fallback);
    return true;
  };
}

function removeFallback(target){
  if(!target){ return false }
  const fallback = document.querySelector(`${target}>#render-fallback`);
  fallback.remove();
  return true
}

function insertElementsIntoParent(parent, elements, parseComponent){
  if(parent && elements && isBrowser()){
    const fragment = document.createDocumentFragment();
    elements.forEach(element => {
      if(element instanceof Node){
        fragment.appendChild(element);
      }
    })

    if(parseComponent.dataset.append){
      parent.appendChild(fragment);
    } else if(parseComponent.dataset.prepend) {
      parent.prepend(fragment);
    }

  } else {
    console.error(`Invalid parameters. You need to add data-render="defer" to the wrapping div of a component to defer its execution to the client or you need to add data-replace, data-append or data-prepend to the target container to update the content of a fetcher. Solution: (link to docs)`);
  }
}

function stopIfNotStartWithHash(selector, insertionType){
  if (!/^#/.test(selector)) {
    console.error(`${insertionType} value must start with #`);
  } 
}

function sanitizeOpeningTagAttributes(tag) {
  const regex = /(\w+)=("[^"]*"|'[^']*')/g;
    return normalizeHTML(tag.replace(regex, (match, attributeName, attributeValue) => {
      const sanitizedValue = attributeValue
                             .replace(/</g, '&lt;')
                             .replace(/>/g, '&gt;');//make this to not affect arrow function's '=>' and if it works sanitizeString should be enough
      return `${attributeName}=${sanitizedValue}`;
  }));
}
function deSanitizeOpeningTagAttributes(tag) {
  const regex = /(\w+)=("[^"]*"|'[^']*')/g;
    return normalizeHTML(tag.replace(regex, (match, attributeName, attributeValue) => {
      const sanitizedValue = attributeValue
                             .replace(/&lt;/g, '<')
                             .replace(/&gt;/g, '>');
      return `${attributeName}=${sanitizedValue}`;
  }));
}

/**
  * @desc renders client component
  * @param component func
  * @param arg any
  * @returns void (mutates the DOM)
  */
 async function handleClientRendering(component, arg){

  const parser = new DOMParser();
  const resolvedComponent = await resolveComponent(component, arg);
  if(!resolvedComponent) {return resolvedComponent };

  let processedComponent = await processJSX(
    sanitizeOpeningTagAttributes(resolvedComponent)
  );  

  const componentEl = parser.parseFromString(processedComponent, "text/html");
  const parsedComponent = componentEl.querySelector("body > div");
  
  if(!parsedComponent) {
    throw 'A component must be wrapped with a <div> (nothing else)';
  }

  if(parsedComponent.id === ""){
    throw 'A reRenderable component wrapping div must have an ID';
  }

  let el = $el(parsedComponent.id);//current component
  if (el && !isFetcher(parsedComponent)) {
    el.parentNode.replaceChild(parsedComponent, el);
  } else if(el && el.dataset.render === "defer"){
    el.parentNode.replaceChild(parsedComponent, el);
  } else if(el && parsedComponent.dataset.replace) {
    stopIfNotStartWithHash(parsedComponent.dataset.replace, 'data.replace');
    el.parentNode.replaceChild(parsedComponent, el);

  } else if(el && parsedComponent.dataset.append) {
    removeFallback(parsedComponent.dataset.append);
    stopIfNotStartWithHash(parsedComponent.dataset.append, 'data.append');
    const component = $select(`${parsedComponent.dataset.append}`);
    const latestChildren = parsedComponent.querySelectorAll(`${parsedComponent.dataset.append}> *`);
    insertElementsIntoParent(component, latestChildren, parsedComponent);

  } else if(el && parsedComponent.dataset.prepend) {
    removeFallback(parsedComponent.dataset.prepend);
    stopIfNotStartWithHash(parsedComponent.dataset.prepend, 'data.prepend');
    const component = $select(`${parsedComponent.dataset.prepend}`);
    const latestChildren = parsedComponent.querySelectorAll(`${parsedComponent.dataset.prepend}> *`);
    insertElementsIntoParent(component, latestChildren, parsedComponent);

  } else {
    useRoot(processedComponent);
  }
  return processedComponent;
}


function makeFunctionFromString(functionString){
  return Function(`return ${replaceValueWithStringify(functionString)}`)();
}

function replaceValueWithStringify(functionString) {
  let func = formatKeyValuePairs(functionString);
  func = func.replace(/(\w+)=["']?\{([^'$][^{}]+)\}["']?/g
  , (match, key, value) => {
      return key + "=" + "${stringify(" + value + ")}";     
  });

  // Todo: Make sure the argument optional
  func = func.replace(/(\w+)="\s*\$render\s*\(([^{}]+)\,\s*\{\s*([^{}]+)\s*\}\s*\)\s*"/g, (match, key, component, prop) => {
    return key + '="' + '$render(' + component + ',' + "'${stringify(" + prop + ")}')" + '"';  
  });
  return normalizePropPlaceholderAndUtilInTrigger(func);
  ;
}

 /**
  * Push function to the global scope
  * @param agrs functions
  * @return boolean
  */
function $register(...args) {
  const components = [...args];
  let depth = 0;
  
  while(components.length > depth){
    const component = components[depth];
    if(typeof component !== 'function') {
      throw('Only function is expected');
    }
    globalThis[component.name] = makeFunctionFromString(component.toString());
    depth++;
  }
  return globalThis;
}

function callFunctionWithElementsAndData(func, anchors, data) {
  if(typeof func === 'function'){
    if(!anchors && !data){
      return func();
    }
    if(!anchors && data){
      return func($purify(data));
    } 
    const elements = typeof anchors !== 'string' ? anchors : $select(anchors);

    const result = !data ? func(elements) : func(elements, $purify(data));
    return result;
  }
  throw(`There is an error in ${func.name ?? func} or the first argument passed to $trigger is not a function`);
}
function $trigger(func, anchors, data){
  try {
    if(isBrowser() && typeof document !== 'undefined'){
      if(document.readyState === 'complete'){
        return callFunctionWithElementsAndData(func, anchors, data);
      } else {
        window.addEventListener('load', ()=> {
          return callFunctionWithElementsAndData(func, anchors, data);
        })
      }
    } else {
      throw('You can not use $trigger on servers');
    }
  } catch (error) {
    console.error(`${error} but ${func.name ? `${typeof func.name}` : typeof func} is provided in ${func.name ?? func}`);
  }
}
function $el(elementId) {
  return document.getElementById(elementId);
}

function useRoot(component) {
  $el("root").innerHTML = component;
}

function stringify(arrOrObj){
  try {
    const data = JSON.stringify(arrOrObj, replacer);
    const sanitizedString = sanitizeString(data);
    return `_9s35Ufa7M67wghwT_${sanitizedString}_9s35Ufa7M67wghwT_`;
  } catch (error) {
    console.error(error);
  }
}

function convertToPropSystem(str){
  const regex = /([`"']?)(_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_)\1/g
  let match = regex.exec(str);
  if(match) {
    try {
      const parsedJSON = JSON.parse(match[3], reviver);
      return parsedJSON;
    } catch (error) {
      console.error("Parsing Error:", error);
    }
  }
  return JSON.parse(str, reviver);
}

function $purify(props){
  try {
    if(isObject(props) || Array.isArray(props)) {
      return props;
    } else if(typeof props === 'string'){
      const isCrude = /_9s35Ufa7M67wghwT_/.test(props);
      if(!isCrude){
        return props;
      } 
    } else if (props === undefined) {
      return;
    }
    return convertToPropSystem(props);
  } catch (error) {
    console.error(error)
  }
}

function buildDataStructureFrom(queryString){  
  let [selector, constraints] = resolveActionAndConstraints(queryString);

  if(constraints === undefined){
    return [selector];
  }

  if(/(\S+|\[\S+\])\[(\d+)\]/.test(queryString)){
    return [selector, constraints];
  }
  constraints = resolveMultipleAttributes(constraints.split(','))
  return [selector, constraints];
}

function resolveActionAndConstraints(queryString){
  const regex = /(\S+|\[\S+\])\[(\d+)\]/;
  const match = queryString.match(regex);

  if(match){
    return [match[1], match[2]];
  }

  if(!queryString.includes('|') || queryString.includes('|=')){
    return [queryString.trim(), undefined];
  }

  const splittedQuery = queryString.split('[').filter(Boolean);
  if(splittedQuery.length === 2){
    const selector = splittedQuery[0].endsWith(']') ? `[${splittedQuery[0]}` : splittedQuery[0];
    const constraints = splittedQuery[1].split(']')[0];
    return [selector.trim(), constraints.trim()];
  }

  const selector = `${splittedQuery[0]}[${splittedQuery[1]}`;
  const constraints = splittedQuery[2].split(']')[0];
  return [selector.trim(), constraints.trim()];
}

function resolveMultipleAttributes (constraints){

  let processedConstraints = [];
  let depth = 0;
  while(depth < constraints.length){
    let splittedConstraints = constraints[depth].split('|').filter(Boolean);
    const [action, paramString] = splittedConstraints;
    const param = paramString.split(/(\w+)(\!=|\-=|\+=|>=?|<=?|={1,2})(.+)/).filter(Boolean);
    processedConstraints.push([action.trim(), param]);
    depth++
  }
  return processedConstraints;
}
 
function $select(str, offSuperpowers = false) {
  if (typeof str !== "string" || str === "") {
    throw ("$select expects a string of selectors");
  }

  try {
    const selectors = str.split(/,(?![^\[]*\])/);
    let elements = [];
    let depth = 0;
    
    while(selectors.length > depth){
      const selectorWithConstraints = selectors[depth];
      const [selector, constraints] = buildDataStructureFrom(selectorWithConstraints);

      const nestedElements = _$(selector);

      const modifiedElements = applyAction(nestedElements, constraints);
      const numberOfElementsSelected = modifiedElements === undefined ? undefined : modifiedElements.length;
      if (numberOfElementsSelected && !offSuperpowers) {
        //turn grouped elements to a real array
        const iterableGroupedElements = [...modifiedElements];
        elements.push(iterableGroupedElements);
      } else if (numberOfElementsSelected > 1 && offSuperpowers) {
        elements.push(modifiedElements);
      } else {
        elements.push(modifiedElements);
      } 
      depth++
    }
    if(elements[0].length === 0) return null;
    return (elements && elements.length === 1) ? elements[0] : elements;
  } catch (error) {
    console.error(`Oops! Check the selector(s) '${str}' provided for validity because it seems the target is not found.`);
  }

}

function applyAction(elements, constraints) {
  
  if (typeof constraints === 'string' && elements.length !== 0) return elements[constraints];
  if (!constraints && elements.length === 1) return elements[0];
  if (!constraints && elements.length > 1) return elements;

  let depth = 0;
  let result = elements;

  while(constraints && depth < constraints.length){
    const [action, constraint] = constraints[depth]
    if (action === 'delete') {
      result = del(result, constraints[depth]);
    } else if (action.includes('filter')) {
      result = filter(elements, constraints[depth]);
    } else if (constraints !== undefined){
      result = setAttribute(result, constraints[depth]);
    }
    depth++;
  }
  
  return result;
}

const operators = {
  '>': (key, element, value) => element[key] > value,
  '<': (key, element, value) => element[key] < value,
  '=': (key, element, value) => element[key] === value,
  '<=': (key, element, value) => element[key] <= value,
  '>=': (key, element, value) => element[key] >= value,
  '!=': (key, element, value) => element[key] !== value,
  '+=': (key, element, value) => Number(element[key]) + Number(value),
  '-=': (key, element, value) => Number(element[key]) - Number(value)
}

function del(elements, constraints) {
  const [action, params] = constraints;
  const [key, operator, value] = params;
  const result = []

  for (let index = 0; index < elements.length; index++) {
    if ((key === 'i' | key === 'index')) {
      const dummyElement = makeTag(index);
     
      if(operators[operator]('id', dummyElement, value)){
        const deletedElement =  key === 'i' | key === 'index' ? elements[index] :  elements[value];
        deletedElement.remove();
        result.push(deletedElement);
        continue;
      }
    }

    if (operators[operator](key, elements[index], value)) {
      elements[index].remove();
      result.push(elements[index]);
      continue;
    }
    console.log('the selector and constraints you provided do not match any target')
  }
  return result.length === 1 ? result[0] : result;
}

function setAttribute(elements, constraints) {
  const [action, params] = constraints;
  const [key, operator, value] = params;

  for (let i = 0; i < elements.length; i++) {
    if (key === 'class') {
      elements[i].classList[action](...value.split(" "));
      continue
    }
  
    if(!value){
      elements[i][key] = ' ';
    } else if(operator === '+=' || operator === '-=') {
      const foundOperator = operators[operator](key, elements[i], value)
      elements[i][key] = (foundOperator) ? foundOperator: value;
    } else {
      elements[i][key] = value;
    }
  }

  return elements;
}

function makeTag (index) {
  console.log(index)
  const div = document.createElement('div');
  div.id = index;
  return div;
}

function filter(elements, constraints){
  const result = [];
  const [action, params] = constraints;
  let [key, operator, value] = params;
  let depth = 0;

  while (depth < elements.length){
    let element = (key === 'i' | key === 'index') ? makeTag(value) : elements[depth];
    key = (key === 'i' | key === 'index') ? 'id' : key;
    
    const condition = key === 'class' ? operators[key]('contains', element, value) : operators[operator](key, element, value);
    
    if( (action ==='filterIn' && condition) | (action ==='filterOut' && !condition)){
      const filteredElement = (params[0] === 'i' | params[0] === 'index') ? elements[value] : elements[depth];
      result.push(filteredElement);
    }
    depth++;
  }
  return result.length === 1 ? result[0] : result;
}

function registerInternalUtils(){
  globalThis['$render'] = $render;
  globalThis['stringify'] = stringify;
  globalThis['$trigger'] = $trigger;
  globalThis['$select'] = $select;
  globalThis['$purify'] = $purify;
}

registerInternalUtils();

export {
  $render,
  $select,
  $trigger,
  $register,
  stringify,
  $purify
}