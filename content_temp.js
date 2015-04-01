
var marks = [];
var cur = 0;

function InfoSpan() {

  var span = document.createElement('span');

  span.className = "__regexp_search_count";

  this.setText = function(text) {
      span.innerHTML = text;
  }

  // Remove the infoSpan from the screen
  this.remove = function() {
      if (span.parentNode) {
          span.parentNode.removeChild(span);
      }
  }

  // Show the infoSpan on the screen
  this.add = function() {
      if (!span.parentNode) {
          document.getElementsByTagName('body')[0].appendChild(span);
      }
  }
}

var infoSpan = new InfoSpan();

function makeTimeoutCall(fn, data, timeout) {
    setTimeout(function() {fn.call(null, data);}, timeout);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      // console.log("Received command " + request.command);
      if (request.command == "search") {
          // console.log("Searching for regex: " + request.regexp);
          var flags = "gim";
          // if (request.caseInsensitive === true) {
          //     // console.log("Case insensitive enabled");
          //     flags = "gi";
          // }
          // console.log(document.body.innerHTML);
          clear();
          if (request.regexp.trim() == '') {
            return;
          }
          infoSpan.add();
          infoSpan.setText("Searching...");
          var re = new RegExp(request.regexp, flags);

          // Search needs to be delayed because InfoSpan isn't updated fast
          // enough
          makeTimeoutCall(function(re) {delayedSearch(re);}, re, 10);
      } else if (request.command == "clear") {
          clear();
      } else if (request.command == "prev") {
          move(false);
      } else if (request.command == "next") {
          move(true);
      } else {
          console.log("Invalid command");
      }
      if (request.command != "search") {
          if (marks.length > 0) {
              marks[cur].className = "__regexp_search_selected";
              if (!elementInViewport(marks[cur])) {
                  $('body').scrollTop($(marks[cur]).offset().top - 20);
              }
          }
      }
});

function delayedSearch(re){
  var html = document.body;
  // Perform search
  recurse(html, re);

  displayCount();
  if (marks.length > 0) {
      marks[cur].className = "__regexp_search_selected";

      // Scroll if match is out of view
      if (!elementInViewport(marks[cur])) {
          $('body').scrollTop($(marks[cur]).offset().top - 20);
      }
  }
}

function recurse(element, regexp) {
  if (element.nodeName == "MARK" || element.nodeName == "SCRIPT" ||
      element.nodeName == "NOSCRIPT" ||
      element.nodeName == "STYLE" ||
      element.nodeType == Node.COMMENT_NODE) {
    return;
  }

  // Skipping infoSpan
  if (element.id == '_regexp_search_count') {
    return;
  }

  // Skip all invisible nodes. But check if its the node we added for which style.display wont be present
  if (element.nodeType != Node.TEXT_NODE) {
      var disp = $(element).css('display');
      if (disp == 'none' || disp == 'hidden')
        return;
  }

  // If the current node has children, recurse to the bottom
  if (element.childNodes.length > 0) {
      for (var i = 0; i < element.childNodes.length; i++) {
          recurse(element.childNodes[i], regexp);
      }
  }

  if (element.nodeType == Node.TEXT_NODE && element.nodeValue.trim() !== '') {
      /*
       * 1. Find all regex matches
       * 2. Loop through matches, finding their starting positions
       * 3. Add everything between the last match and this match as a text node
       * 4. Add the match as a <mark>
       * 5. After loop is finished, add remainder as text node
       */
      var str = element.nodeValue;
      var matches = str.match(regexp);
      var parent = element.parentNode;

      if (matches !== null) {
        var pos = 0;
        var mark;
        for (var i = 0; i < matches.length; i++) {
          var index = str.indexOf(matches[i], pos);
          var before = document.createTextNode(str.substring(pos, index));
          pos = index + matches[i].length;

          /*
           * We can only replace the child once, after that we insert after
           * the previous mark element
           */

          if (element.parentNode == parent) {
              parent.replaceChild(before, element);
          } else {
              parent.insertBefore(before, mark.nextSibling);
          }

          mark = document.createElement('mark');
          mark.appendChild(document.createTextNode(matches[i]));

          parent.insertBefore(mark, before.nextSibling);
          marks.push(mark);
        }
        var after = document.createTextNode(str.substring(pos));
        parent.insertBefore(after, mark.nextSibling);
      }
  }
}

// Remove all matches
function clear(){
  infoSpan.setText("Clearing...");
  setTimeout(function() {
    cur = 0;
    for (var i = 0; i < marks.length; i++) {
        var mark = marks[i];
        var parent = mark.parentNode;
        parent.replaceChild(mark.firstChild, mark);
        parent.normalize();
    }
    marks.length = 0;
    infoSpan.remove();
  }, 10);
}

// Set the infoSpan text to the number of matches
function displayCount(){
  var num;
  if (marks.length > 0) {
      num = cur + 1;
  } else {
      num = 0;
  }
  infoSpan.setText(num + " of " + marks.length + " matches.");
  infoSpan.add();
}

// Move the current match
function move(next) {
  if (marks.length > 0) {
      console.assert(cur >= 0 && cur < marks.length);
      marks[cur].className = "";
      if (next) {
          nextMatch();
      } else {
          prevMatch();
      }
      marks[cur].className = "__regexp_search_selected";
      infoSpan.setText((cur + 1) + " of " + marks.length + " matches.");
  }
}

// Move current match to the next match
function nextMatch() {
  cur++;
  cur %= marks.length;
}

// Move the current match to the previous match
function prevMatch() {
  cur--;
  if (cur < 0) {
      cur += marks.length;
  }
}

// Returns true if el is in the viewport, false otherwise
function elementInViewport(el) {
  var top    = el.offsetTop;
  var left   = el.offsetLeft;
  var width  = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
  }

  return top >= window.pageYOffset && left >= window.pageXOffset &&
      (top + height) <= (window.pageYOffset + window.innerHeight) &&
      (left + width) <= (window.pageXOffset + window.innerWidth);
}
