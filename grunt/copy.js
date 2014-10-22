'use strict';

module.exports = function(grunt) {
    grunt.config('copy', {
        template: {
            files: [{
                expand: true,
                src: ['grunt/template.html', 'grunt/template.js'],
                dest: 'koans/'
            }]
        },
        build: {
            files: [{
                // Everything in the app directory
                expand: true,
                cwd: 'app/',
                src: ['**'],
                dest: 'build/'
            }]
        },
        // copy files for distribution
        dist: {
            files: [{
                // Everything in the build directory
                expand: true,
                cwd: 'build/',
                src: ['**'],
                dest: 'dist/'
            }, {
                // Get Bootstrap fonts (glyphicons)
                expand: true,
                cwd: 'build/bower_components/sass-bootstrap/fonts/',
                src: ['**'],
                dest: 'dist/fonts/'
            }, {
                // Concatenated CSS
                expand: true,
                cwd: '.tmp/concat/styles/',
                src: ['**'],
                dest: 'dist/styles/'
            }, {
                // Concatenated JS
                expand: true,
                cwd: '.tmp/concat/scripts/',
                src: ['**'],
                dest: 'dist/scripts/'
            }]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
};
