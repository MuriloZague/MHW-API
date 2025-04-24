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
  
  export async function translateText(text, targetLanguage = 'pt-br') {
    const apiKey = ''; //key ocultada
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLanguage,
        format: 'text'
      })
    });
  
    const data = await response.json();
  
    if (data.error){
      alert(data.error.message);
    }
    
    return data.data.translations[0].translatedText;
  }