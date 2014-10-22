/**
 * Clean tasks - remove build/tmp artifacts
 */
'use strict';

module.exports = function(grunt) {

    grunt.config('clean', {
        all: {
            files: [{
                dot: true,
                src: [
                    '.tmp',
                    'build',
                    'dist/*'
                ]
            }],
            options: {
                force: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
};
