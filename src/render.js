import {processJSX} from './dom';
import {replacer, 
        reviver, 
        formatKeyValuePairs,
        checkForObjectString,
        isObject,
        sanitizeString,
        normalizePropPlaceholderAndUtilInTrigger,
        isPromise
      } from './utils'

let _$;

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
       return handleClientRendering(updatedComponent, props);
      }
      const resolvedComponent = await resolveComponent(updatedComponent, props)
      const result = await processJSX(sanitizeOpeningTagAttributes(resolvedComponent));
      return result;
    } catch (error) {
      console.error(`${error} in ${component.name}()`);
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
    console.error('Invalid parameters. Parent element and array of elements are expected');
  }
}

function stopIfNotStartWithHash(selector, insertionType){
  if (!/^#/.test(selector)) {
    console.error(`${insertionType} value must start with #`);
  } 
}

function sanitizeOpeningTagAttributes(tag) {
  const regex = /(\w+)=("[^"]*"|'[^']*')/g;
    return tag.replace(regex, (match, attributeName, attributeValue) => {
      const sanitizedValue = attributeValue
                             .replace(/</g, '&lt;')
                             .replace(/>/g, '&gt;');
      return `${attributeName}=${sanitizedValue}`;
  });
}
function deSanitizeOpeningTagAttributes(tag) {
  const regex = /(\w+)=("[^"]*"|'[^']*')/g;
    return tag.replace(regex, (match, attributeName, attributeValue) => {
      const sanitizedValue = attributeValue
                             .replace(/&lt;/g, '<')
                             .replace(/&gt;/g, '>');
      return `${attributeName}=${sanitizedValue}`;
  });
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
  } else if(el && parsedComponent.dataset.replace) {
    stopIfNotStartWithHash(parsedComponent.dataset.replace, 'data.replace');
    el.parentNode.replaceChild(parsedComponent, el);

  } else if(el && parsedComponent.dataset.append) {
    stopIfNotStartWithHash(parsedComponent.dataset.append, 'data.append');
    const component = $select(`${parsedComponent.dataset.append}`);
    const latestChildren = parsedComponent.querySelectorAll(`${parsedComponent.dataset.append}> *`);
    insertElementsIntoParent(component, latestChildren, parsedComponent);

  } else if(el && parsedComponent.dataset.prepend) {
    stopIfNotStartWithHash(parsedComponent.dataset.append, 'data.prepend');
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

  // Todo: Make the argument optional
  func = func.replace(/(\w+)="\$render\(([^{}]+)\, \{([^{}]+)\}\)"/g, (match, key, component, prop) => {
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
    globalThis[component.name] = component;
    depth++;
  }
  return globalThis;
}

function $trigger(func, anchors, data){
  try {
    if(typeof func === 'function'){
      if(!anchors && !data){
        return func();
      }
      if(!anchors && data){
        return func($purify(data));
      }
      const elements = $select(anchors);
      const result = !data ? func(elements) : func(elements, $purify(data));
      return result;
    }
    throw(`There is an error in ${func.name ?? func}`)
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
  let [selector, constraints] = queryString.split('[').filter(Boolean);

  if(selector && selector.endsWith(']')){
    selector = selector.slice(0, -1)
  }
  if(constraints && constraints.endsWith(']')){
    constraints = constraints.slice(0, -1)
  }
  
  if(constraints && !constraints.includes("|")){ 
    return constraints.includes('=') ? [queryString, undefined] : [selector, constraints]; 
  }

  if(constraints && constraints.includes('|=')) return [queryString, undefined];

  if(constraints === undefined){
    return [selector];
  }

  constraints = constraints.split('|');
  let params = constraints[1].split(/(\w+)(>=?|<=?|={1,2})(\w+|"")/).filter(Boolean);
  constraints = [constraints[0], params]
  return [selector, constraints];
}
 
function $select(str, offSuperpowers = false) {
  if (typeof str !== "string" || str === "") {
    throw ("$select expects a string of selectors");
  }

  try {
    const selectors = str.split(",");
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

    return elements.length === 1 ? elements[0] : elements;
  } catch (error) {
    console.error(`${error}. You can\'t use $select on the server or check the selector(s) '${str}' provided for validity`);
  }

}

function applyAction(elements, constraints) {
  let action;
  if (Array.isArray(constraints)) {
    [action] = constraints;
  }
  if (typeof constraints === 'string' && elements) return elements[constraints];
  if (!constraints && elements.length === 1) return elements[0];
  if (!constraints && elements.length > 1) return elements;
  if (action === 'delete') {
    return del(elements, constraints);
  } else if(constraints !== undefined){
    return setAttribute(elements, constraints);
  }
}

const operators = {
  '>': (key, element, value) => element.getAttribute(key) > value,
  '<': (key, element, value) => element.getAttribute(key) < value,
  '=': (key, element, value) => element.getAttribute(key) === value,
  '<=': (key, element, value) => element.getAttribute(key) <= value,
  '>=': (key, element, value) => element.getAttribute(key) >= value,
  '!=': (key, element, value) => element.getAttribute(key) !== value,
}

function del(elements, constraints) {
  const [action, params] = constraints;
  const [key, operator, value] = params;
  const result = []

  for (let index = 0; index < elements.length; index++) {
    if ((key === 'i' || 'index') && index == value) {
      elements[value].remove();
      result.push(elements[value]);
      continue;
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
      elements[i].classList[action](value);
      continue
    }   
    elements[i].setAttribute(key, value);
  }
  return elements;
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
  $register,
  $select,
  stringify,
  $trigger,
  $purify,
  makeFunctionFromString,
  sanitizeOpeningTagAttributes,
  deSanitizeOpeningTagAttributes
}
