import {processJSX} from './dom';

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
  if (typeof window === "object") {
      return true;
  }
}

const _$ = document.querySelectorAll.bind(document);
function $select(str) {
  if (typeof str !== "string" || str === "") {
    throw ("$select expects a string of selectors");
  }
  const selectors = str.split(",");

  let elements = selectors.map((tagSelecoter) => {
    const nestedElements = _$(tagSelecoter);
    const numberOfElementsSelected = nestedElements.length;
    if (numberOfElementsSelected > 1) {
      //turn grouped elements to a real array
      const iterableGroupedElements = [...nestedElements];
      return iterableGroupedElements;
    }
    return nestedElements[0];
  });
  
  return elements.length === 1 ? elements[0] : elements;
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
  function $render(component, arg) {
    try {
      if(!isInitialLetterUppercase(component, '$render')){
        throw('A component must start with a capital letter.')
      }
      if(isBrowser()){
       return handleClientRendering(component, arg);
      }
      return processJSX(resolveComponent(component, arg));
    } catch (error) {
      throw(`${error} in ${component.name}()`);
    }
  }

 /**
  * Main processor to process JSX from html
  * @param component:function, arg: any
  * @return 
  */
function resolveComponent(component, arg){
  const resolvedArg = (typeof arg === 'function') ? arg : $purify(arg);
  const resolvedComponent = arg ? component(resolvedArg) : component();
  if(typeof resolvedComponent !== 'string'){
    throw('A component must return a string');
  }
  return resolvedComponent;
}

/**
  * @desc renders client component
  * @param component func
  * @param arg any
  * @returns void (mutates the DOM)
  */
 function handleClientRendering(component, arg){
  const parser = new DOMParser();
  const resolvedComponent = resolveComponent(component, arg);
  let processedComponent = processJSX(resolvedComponent);  
  const componentEl = parser.parseFromString(processedComponent, "text/html");
  const parsedComponent = componentEl.querySelector("body > div");
  
  if(!parsedComponent) {
    throw 'A component must be wrapped with a <div> (nothing else)';
  }

  if(parsedComponent.id === ""){
    throw 'A reRenderable component wrapping div must have an ID';
  }

  let el = $el(parsedComponent.id);
  if (el) {
    el.parentNode.replaceChild(parsedComponent, el);
  } else {
    useRoot(processedComponent);
  }
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
    window[component.name] = component;
    depth++;
  }
  window['$render'] = $render;
  window['$trigger'] = $trigger;
  window['$select'] = $select;
  window['$purify'] = $purify;
  return true;
}

function $trigger(func, anchors, data){
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
}
function $el(elementId) {
  return document.getElementById(elementId);
}

function useRoot(component) {
  document.getElementById("root").innerHTML = component;
}

function stringify(arrOrObj) {
  try {
    if(!arrOrObj && !Array.isArray(arrOrObj)) {
      return arrOrObj;
    }
    const data = JSON.stringify(arrOrObj);
    const sanitizedString = data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    return `_9s35Ufa7M67wghwT_${sanitizedString}_9s35Ufa7M67wghwT_`;
  } catch (error) {
    throw(`${error}`)
  }
}

function convertToPropSystem(str){
  const regex = /_9s35Ufa7M67wghwT_([^]*?)_9s35Ufa7M67wghwT_/g;
  let match = regex.exec(str);
  if(match) {
    try {
      const parsedJSON = JSON.parse(match[1]);
      return parsedJSON;
    } catch (error) {
      // If parsing fails due to a SyntaxError, handle the error here
      console.error("Parsing Error:", error);
    }
  }
  return JSON.parse(str);
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
    throw(`Encountered an error: ${error}`)
  }
}

function isObject(value){
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
};

export {
  $render,
  $register,
  stringify,
  $trigger,
  $select,
  $purify
}