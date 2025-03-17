'use strict';

/*
* @param    {Object}  options                 选项
* @options  {String}  keywordClassName        关键字className
* @options  {Number}  keywordBeforeLength     关键字前面内容的字符长度
* @options  {Number}  keywordAfterLength      关键字后面内容的字符长度
* @options  {String}  ellipsis                超出关键字前后内容长度时的省略符号
* */

function Search(options) {
  options = options || {};
  this.url = options.url || '';
  this.keywordClassName = options.keywordClassName || '';
  this.keywordBeforeLength = options.keywordBeforeLength || 20;
  this.keywordAfterLength = options.keywordAfterLength || 30;
  this.ellipsis = options.ellipsis || '...';
  this.data = [];
  this.onDataLoadSucceeded  = null;
  this.onDataLoadFailed  = null;
  if (this.url) {
    this.getData();
  }
}

Search.prototype.matchMarkdown = function() {
  var regexps = [
    '(^ *|\\s+)(# *)+',                        // 标题
    '(^ *|\\s+)([*+-]|[0-9]+\\.) +',           // 列表
    '```([\\s\\S]*?)``` *',                    // 代码块
    '!?\\[(?=[\\s\\S]*?\\]\\([\\s\\S]*?\\))',  // 图片和链接的 [ 符号
    '\\]\\([\\s\\S]*?\\)',                     // 图片和链接的 ](xxx) 部分
    '(^ *|\\s+)(> *([*+-] +|[0-9]+\\. +)?)+',  // 区块、区块嵌套列表
    '<[^>]+>',                                 // 标签
    '(^ *|\\s+)([*-] *)+',                     // 分隔线
  ];
  return regexps.join('|');
};

Search.prototype.getData = function() {
  var _this = this;
  var xmlhttp = null;

  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
  }

  xmlhttp.open('get', _this.url);
  xmlhttp.send(null);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4) {
      switch (xmlhttp.status) {
        case 200:
          var data = JSON.parse(xmlhttp.responseText);
          var match = new RegExp(_this.matchMarkdown(), 'g');
          for (var i = 0; i < data.length; i++) {
            data[i].content = data[i].content.replace(match, ' ').trim();
          }
          _this.data = data;
          _this.onDataLoadSucceeded ? _this.onDataLoadSucceeded(data) : null;
          break;

        case 404:
          _this.onDataLoadFailed ? _this.onDataLoadFailed() : null;
          break;
      }
    }
  };
  xmlhttp.onerror = function(error) {
    _this.onDataLoadFailed ? _this.onDataLoadFailed(error) : null;
  };
};

Search.prototype.search = function(keyword) {
  var _this = this;
  var result = [];

  this.data.forEach(function(dataItem) {
    var title = dataItem.title;
    var content = dataItem.content;
    var url = dataItem.url;
    var ellipsis = _this.ellipsis;
    var keywordBeforeLength = _this.keywordBeforeLength;
    var keywordAfterLength = _this.keywordAfterLength;
    var keywordRegexp = new RegExp(keyword, 'ig');
    var keywordTag = function(matchText) {
      return '<em class="' + _this.keywordClassName + '">' + matchText + '</em>';
    };
    var titleIndex = title.search(keywordRegexp);
    var contentIndex = content.search(keywordRegexp);

    if (titleIndex > -1 || contentIndex > -1) {
      var start = 0;
      var end = 0;
      var resultItem = {
        url: url,
        title: title,
        content: '',
      };

      if (titleIndex > -1) {
        end = keywordAfterLength;
        resultItem.title = title.replace(keywordRegexp, keywordTag);
        resultItem.content = content.substring(0, end);
      }

      if (contentIndex > -1) {
        start = contentIndex - keywordBeforeLength;
        end = contentIndex + keyword.length + keywordAfterLength;

        if (start < 0) start = 0;
        if (end > content.length) end = content.length;

        resultItem.content = content.substring(start, end).replace(keywordRegexp, keywordTag);
      }

      resultItem.content = (start === 0 ? '' : ellipsis) + resultItem.content + (end >= content.length || end === 0 ? '' : ellipsis);

      result.push(resultItem);
    }
  });

  return result;
};