let currentRoot = null;
let hookIndex = 0;
let hooks = [];

function flattenChildren(children) {
  return children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false);
}

function createDomNode(value) {
  if (typeof value === "string" || typeof value === "number") {
    return document.createTextNode(value);
  }

  if (typeof value.type === "function") {
    return createDomNode(value.type({ ...value.props, children: value.children }));
  }

  const element = document.createElement(value.type);

  Object.entries(value.props || {}).forEach(([key, propValue]) => {
    if (key === "children" || propValue === null || propValue === undefined) {
      return;
    }

    if (key === "className") {
      element.setAttribute("class", propValue);
      return;
    }

    if (key === "htmlFor") {
      element.setAttribute("for", propValue);
      return;
    }

    if (key === "style" && typeof propValue === "object") {
      Object.assign(element.style, propValue);
      return;
    }

    if (key === "value" || key === "checked") {
      element[key] = propValue;
      return;
    }

    if (key.startsWith("on") && typeof propValue === "function") {
      const eventName = key === "onChange" && ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)
        ? "input"
        : key.slice(2).toLowerCase();
      element.addEventListener(eventName, propValue);
      return;
    }

    element.setAttribute(key, propValue);
  });

  value.children.forEach((child) => element.appendChild(createDomNode(child)));
  return element;
}

function renderRoot() {
  if (!currentRoot) {
    return;
  }

  hookIndex = 0;
  currentRoot.container.replaceChildren(createDomNode(currentRoot.component()));
}

export function createElement(type, props, ...children) {
  return { type, props: props || {}, children: flattenChildren(children) };
}

export function useState(initialValue) {
  const stateIndex = hookIndex;
  hooks[stateIndex] = hooks[stateIndex] ?? initialValue;

  function setState(nextValue) {
    hooks[stateIndex] = typeof nextValue === "function" ? nextValue(hooks[stateIndex]) : nextValue;
    renderRoot();
  }

  hookIndex += 1;
  return [hooks[stateIndex], setState];
}

export function useMemo(factory, dependencies) {
  const memoIndex = hookIndex;
  const previous = hooks[memoIndex];
  const changed = !previous || dependencies.some((dependency, index) => dependency !== previous.dependencies[index]);

  if (changed) {
    hooks[memoIndex] = { value: factory(), dependencies };
  }

  hookIndex += 1;
  return hooks[memoIndex].value;
}

export function createRoot(container) {
  return {
    render(component) {
      currentRoot = {
        container,
        component: typeof component.type === "function" ? () => component.type(component.props || {}) : () => component,
      };
      renderRoot();
    },
  };
}

export default {
  createElement,
  useMemo,
  useState,
};