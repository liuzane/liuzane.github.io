'use strict';

var search = new Search({ url: '/search.json', keywordClassName: 'home-search-keyword' });
var inputElement = document.getElementById('home-search-input');
var loadingElement = document.getElementById('home-search-loading');
var contentElement = document.getElementById('home-search-dropdown');
var loading = true;
var loadingText = 'loading';
var time = null;

search.onDataLoadSucceeded = function() {
  loading = false;
  clearInterval(time);
  loadingElement.style.display = 'none';
  contentElement.style.display = 'block';
}

inputElement.addEventListener('input', function(e) {
  if (loading) {
    clearInterval(time);
    loadingElement.innerText = loadingText;
    loadingElement.style.display = 'block';
    contentElement.style.display = 'none';

    time = setInterval(function() {
      if (loadingElement.innerText.length >= 10) {
        loadingElement.innerText = loadingText;
      } else {
        loadingElement.innerText += '.';
      }
      if (!loading) {
        clearInterval(time);
        loadingElement.style.display = 'none';
        contentElement.style.display = 'block';
        renderSearchResult(e);
      }
    }, 500);
  } else {
    clearTimeout(time);
    time = setTimeout(function() {
      console.log(e)
      renderSearchResult(e);
    }, 300);
  }
});

function judgeTextAttr(element) {
  return element.textContent !== undefined ? 'textContent' : 'innerText';
}

function renderSearchResult(e) {
  contentElement.innerHTML = '';

  var event = e || window.event;
  var target = event.target || event.srcElement;
  var value = target.value.replace(/(^\s*)|(\s*$)/g, '');

  if (!value) {
    return;
  }

  var searchData = search.search(target.value);

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
}