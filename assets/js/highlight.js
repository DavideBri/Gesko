(() => {
 
  function toRegExp(text) {
    return new RegExp(text, 'g');
  }
 
  function toSpan(text, className) {
    return '<span class="' + className + '">' + text + '</span>';
  }
 
  const input = document.querySelector('#input-text');
  const text = document.querySelector('#text');
  const content = text.textContent;
 
  input.addEventListener('input', e => {
    text.textContent = content;
    let string = e.target.value;
 
    if (string.length > 0) {
      text.innerHTML = text.textContent.replace(toRegExp(string), toSpan(string, 'highlight'));
    }
  });
 
})();