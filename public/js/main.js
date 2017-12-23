window.onload = function() {
  var html = document.querySelectorAll('.components-group');

  function replaceExtra(str) {
    var replaced = ['<div class="block"></div>', ' data-title="(.*?)"'];
    var pattern = new RegExp(replaced.join('|'), 'g');
    return str.replace(pattern, '');
  }

  for (var i = 0; i < html.length; i++) {
    html[i].insertAdjacentHTML(
      'beforeend',
      '<pre><code class="language-html">' +
        Prism.highlight(
          replaceExtra(html[i].innerHTML.trim()),
          Prism.languages.html,
        ) +
        '</code></pre>',
    );
  }
};
