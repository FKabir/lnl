define(function(){
  this["JST"] = this["JST"] || {};
  this["JST"]["templates/book.html"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }with (obj) {__p += '<ul>'; for (var i = 0; i < books.length; i++) { ; var book = books[i]; ;__p += '<li><em>' +((__t = ( book.title )) == null ? '' : __t) +'</em> by ' +((__t = ( book.author )) == null ? '' : __t) +'</li>'; } ;__p += '</ul>';}return __p};
  this["JST"]["templates/foo/bar.html"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __d = obj.obj || obj;__p += 'Teehee';return __p};
  this["JST"]["templates/main.html"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __d = obj.obj || obj;__p += '<div class="bar"></div><div class="secondView"></div>';return __p};
  this["JST"]["templates/test.html"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }with (obj) {__p += '<ul>'; for (var i = 0; i < books.length; i++) { ; var book = books[i]; ;__p += '<li><em>' +((__t = ( book.title )) == null ? '' : __t) +'</em> by ' +((__t = ( book.author )) == null ? '' : __t) +'</li>'; } ;__p += '</ul>';}return __p};
  return this["JST"];
});