'use strict';
/*
 * GET home page.
 */
var inspect = require('util').inspect;


exports.index = function(req, res){
  res.render('index', {user: inspect(req)});
};