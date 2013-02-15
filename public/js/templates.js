this["JST"] = this["JST"] || {};
this["JST"]["attask-login"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }with (obj) {__p += '<header><h2>AtTask Projects</h2></header><section class="well"><h4>Enter AtTask Credentials</h4><form id="attask-login" method="POST" action="/api/attask/session" class="form-horizontal"><div class="control-group"><label class="control-label" for="inputUsername">Username</label><div class="controls"><div class="input-append"><input name="username" type="text" id="inputUsername"><span class="add-on"><i class="icon-user"></i></span></div></div></div><div class="control-group"><label class="control-label" for="inputPassword">Password</label><div class="controls"><div class="input-append"><input name="password" type="password" id="inputPassword"><span class="add-on"><i class="icon-key"></i></span></div></div><div class="control-group"><div class="controls"><label class="checkbox"><input type="checkbox" checked="checked"> Remember my credentials</label><button type="submit" class="btn">Sign In</button></div></div></form>'; if (typeof(error) !== "undefined") { ;__p += '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Error!</strong> ' +((__t = ( error )) == null ? '' : __t) +'</div>'; } ;__p += '<p class="help-inline">We need your credentials so we can log hours for you with AtTask. If you leave remember my credentials checked, we will be able to automatically regenerate sessions whenever they age for you, this is recommended for best performance.</p></section>';}return __p};
this["JST"]["github-login"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __d = obj.obj || obj;__p += '<header><h2>Github Repositories</h2></header><section class="well"><h4>Authorize us to access your repositories.</h4><div class="pagination-centered"><a data-bypass="bypass" href="/auth/github" class="btn btn-large">Authorize</a></div><p class="help-inline">We need your credentials so we can log hours for you with AtTask. If you leave remember my credentials checked, we will be able to automatically regenerate sessions whenever they age for you, this is recommended for best performance.</p></section>';return __p};
this["JST"]["layouts/main"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }with (obj) {__p += '<section class="row-fluid"><section class="offset1 span5">' +((__t = ( subview('github') )) == null ? '' : __t) +'</section><section class="span5">' +((__t = ( subview('attask') )) == null ? '' : __t) +'</section></section><section class="row-fluid"><div class="offset2 span8">' +((__t = ( subview('logview') )) == null ? '' : __t) +'</div></section>';}return __p};
this["JST"]["layouts/main2"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __d = obj.obj || obj;__p += '<header></header><section>Layout2<a href="/">Load this again.. do we reinject?></a></section><footer></footer>';return __p};
this["JST"]["loading"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __d = obj.obj || obj;__p += '<div class="loading well">The data is coming round the mountain...<br /><i class="icon-spin icon-spinner icon-2x"></i></div>';return __p};
this["JST"]["main"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __d = obj.obj || obj;__p += '<div class="bar"></div><div class="secondView"></div>';return __p};
this["JST"]["projects"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }with (obj) {__p += '<header><h2>AtTask Projects</h2><button class="btn icon-refresh float-right"> Resync</button></header><ul class="unstyled">'; for (var i = 0; i < projects.length; i++) { ; var project = projects[i]; ;__p += '<li class="well"><div class="info"><h3><i class="icon-briefcase"></i><a href="/show">' +((__t = ( project.name )) == null ? '' : __t) +'</a></h3></div></li>'; } ;__p += '</ul>';}return __p};
this["JST"]["repos"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }with (obj) {__p += '<header><h2>Github Repositories</h2><button class="btn icon-refresh pull-right"> Resync</button></header><ul class="unstyled">'; for (var i = 0; i < repos.length; i++) { ; var repo = repos[i]; ;__p += '<li class="well"><div class="avatar">' +((__t = ( '<img src="' + repo.owner.avatar_url + '" alt="' + repo.owner.login + '"/>' )) == null ? '' : __t) +'</div><div class="info"><h3><i class="icon-folder-open"></i><a href="/show">' +((__t = ( repo.full_name.slice(repo.full_name.indexOf('/') + 1) )) == null ? '' : __t) +'</a></h3><div class="stat">' +((__t = ((repo.lastRan)? ('Last hook run:' + repo.lastRan): ('Last hook run: <em>Never</em>'))) == null ? '' : __t) +'</div></div></li>'; } ;__p += '</ul>';}return __p};
this["JST"]["test"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }with (obj) {__p += '<ul>'; for (var i = 0; i < books.length; i++) { ; var book = books[i]; ;__p += '<li><em>' +((__t = ( book.title )) == null ? '' : __t) +'</em> by ' +((__t = ( book.author )) == null ? '' : __t) +'</li>'; } ;__p += '</ul>';}return __p};