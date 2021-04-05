'use strict';

var Search = new Search({ keywordClassName: 'home-search-keyword' });
var inputElement = document.getElementById('home-search-input');
var contentElement = document.getElementById('home-search-dropdown');
var judgeTextAttr = function(element) {
  return element.textContent !== undefined ? 'textContent' : 'innerText';
};
var renderSearchResult = function(e) {
  contentElement.innerHTML = '';

  var event = e || window.event;
  var target = event.target || event.srcElement;
  var value = target.value.replace(/(^\s*)|(\s*$)/g, '');

  if (!value) {
    return;
  }

  var searchData = Search.search(target.value);

  if (searchData.length > 0) {
    var listElement = document.createElement('ul');
    listElement.className = 'home-search-wrap';

    for (var i = 0; i < searchData.length; i++) {
      var searchDataItem = searchData[i];

      var itemElement = document.createElement('li');
      itemElement.className = 'home-search-item';

      var linkElement = document.createElement('a');
      linkElement.className = 'home-search-link';
      linkElement.href = searchDataItem.url;

      var titleElement = document.createElement('p');
      titleElement.className = 'home-search-title';
      titleElement[judgeTextAttr(titleElement)] = searchDataItem.title;
      titleElement.innerHTML = titleElement[judgeTextAttr(titleElement)];

      var resultElement = document.createElement('p');
      resultElement.className = 'home-search-result';
      resultElement[judgeTextAttr(resultElement)] = searchDataItem.content;
      resultElement.innerHTML = resultElement[judgeTextAttr(resultElement)];

      linkElement.appendChild(titleElement);
      linkElement.appendChild(resultElement);
      itemElement.appendChild(linkElement);
      listElement.appendChild(itemElement);
    }

    contentElement.appendChild(listElement);

  } else {
    var emptyElement = document.createElement('p');
    emptyElement.className = 'home-search-empty';
    emptyElement[judgeTextAttr(emptyElement)] = 'Content not found, try changing the search term.';

    contentElement.appendChild(emptyElement);
  }
};


var time = null;
inputElement.addEventListener('input', function(e) {
  clearTimeout(time);
  time = setTimeout(function() {
    renderSearchResult(e);
  }, 300);
});
inputElement.addEventListener('keydown', function(e) {
  var event = e || window.event;
  if (event.keyCode === 13) {
    renderSearchResult(e);
  }
});