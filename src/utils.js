function removeComments(code) {
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
    const sanitizedString = sanitizeString(removeComments(value.toString()))
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
  const regex = /\$trigger\(([^,$]+)(?:,([^,$]+))?(?:,\s*{([^{}$]+)}\s*)?\)/g;
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
    console.log(input)
    throw new Error('You are expected to pass an object or an array of object(s) with {} but you used ${}');
  }
  return input;
}

function isPromise(value) {
  return Boolean(value && typeof value.then === "function");
}

export {
  replacer,
  reviver,
  isPromise,
  formatKeyValuePairs,
  checkForObjectString,
  normalizePropPlaceholderAndUtilInTrigger,
  isObject,
  sanitizeString,
  deSanitizeString
}