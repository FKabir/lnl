module.exports = function (grunt) {
  'use strict';

  //Project Configuration
  grunt.initConfig({
    watch: {
      less: {
        files: 'less/**/*.less',
        tasks: ['less:development'],
        options: {
          interrupt : true
        }
      },
      frontend: {
        files: [
        'public/js/*.js',
        'test/frontend/**/*.js',
        '!public/js/vendor/*.js',
        '!public/js/templates.js'
        ],
        tasks: ['exec:testFrontend'], //add requirejs task
        options: {
          interrupt: false
        }
      },
      backend: {
        files: [
        '**/*.js',
        '!test/frontend/**/*.js',
        '!templates/**/*.js',
        '!public/**/*.js',
        '!node_modules/**/*.js'
        ],
        tasks: ['exec:testBackend'],
        options: {
          interrupt: false
        }
      },
      templates: {
        files: ['templates/**/*.html'],
        tasks: ['jst:development'],
        options: {
          interrupt: true
        }
      }
    },
    exec: {
      testAll: {
        cmd: "mocha --colors test"
      },
      testFrontend: {
        cmd: "mocha --colors --recursive test/frontend"
      },
      testBackend: {
        cmd: "mocha --colors --recursive test/backend"
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      frontend: {
        src: [
        'public/**/*.js',
        '!public/js/templates.js',
        '!public/js/vendor/**/*.js'
        ]
      },
      backend: {
        src: [
        '**/*.js',
        '!node_modules/**/*.js',
        '!public/**/*.js',
        '!test/**/*.js'
        ]
      }
    },
    jst: {
      development: {
        options: {
          prettify: true,
          processName: function(filename) {
            filename = filename.slice(filename.indexOf('/') + 1);
            return filename.slice(0, filename.indexOf('.'));

          },
          processContent: function(src) {
            return src.replace(/(^\s+|\s+$)/gm, '');
          }
        },
        files: {
          "public/js/templates.js": ["templates/**/*.html"]
        }
      },
      production: {
        options: {
          amdWrapper: true,
          processContent: function(src) {
            return src.replace(/(^\s+|\s+$)/gm, '');
          }
        },
        files: {
          "public/js/templates.js": ["templates/**/*.html"]
        }
      }
    },
    less: {
      development: {
        options: {
          paths: "less/include"
        },
        files: [{
          expand: true,
          cwd: 'less/',
          src: ['**/*.less', '!include/**/*.less'],
          dest: 'public/css/',
          ext: '.css'
        }]
      },
      production: {

      }
    }
  });
grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-jst');
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.registerTask('test', ['exec:testAll']);
grunt.registerTask('build_development', 'less:development');
};
