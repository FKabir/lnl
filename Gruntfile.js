module.exports = function(grunt) {
	'use strict';

	//Project Configuration
	grunt.initConfig({

		/*less: {
			development: {
				options: {
					paths: "less/include"
				},
				files: [
					{src: "!less/include/*.less"},
					{src: "less/**/
					/*.less", dest: "public/stylesheets/*.css"}
				]
			}
		},*/

		simplemocha: {
			all: {
				src: 'tests/**/*.spec.js',
				options: {
					timeout: 5000,
					ignoreLeaks: false,
					ui: 'bdd',
					reporter: 'spec'
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.registerTask('test', 'simplemocha');
	grunt.registerTask('less', 'less');
	grunt.registerTask('development', 'less:development');
}