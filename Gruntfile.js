module.exports = function(grunt) {
    'use strict';

    //Project Configuration
    grunt.initConfig({

        less: {
            development: {
                options: {
                    paths: "less/include"
                },
                files: [
                    {
                        expand: true,
                        //flatten: true, //will make dest folder flat
                        cwd: 'less/',
                        src: ['**/*.less', '!include/*.less'],
                        dest: 'public/stylesheets/',
                        ext: '.css'
                    }
                ]
            }
        },

        watch: {
            less: {
                files: 'less/**/*.less',
                tasks: ['less:development'],
                options: {
                    interrupt : true
                }
            },

            scripts: {
                files: ['**/*.js', '!node_modules/**/.js'],
                tasks: ['exec:scriptTest', 'exec:test'],
                options: {
                    interrupt: true
                }
            }
        },

        exec: {
            test: {
                cmd: "mocha --colors test" 
            },
            scriptTest: {
                cmd: 'clear && echo watch js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('test', ['exec:test']);
    grunt.registerTask('development', 'less:development');
}