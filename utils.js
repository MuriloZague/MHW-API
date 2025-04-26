//função utilizada para criar elementos com atributos
export function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
  
    for (let [key, value] of Object.entries(attrs)) {
      el[key] = value;
    }
  
    children.forEach((child) =>
      el.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child
      )
    );
  
    return el;
  }