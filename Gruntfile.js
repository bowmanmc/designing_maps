/**
 * Main Gruntfile for SiteSeer project
 *
 * For task-specific configs, look in seer-ui/grunt
 */
'use strict';

module.exports = function(grunt) {

    // Load grunt tasks automatically
    //require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Load tasks from grunt directory
    grunt.loadTasks('grunt');

    grunt.registerTask('serve', [
        'clean',
        //'copy:build',
        //'bower-install',
        //'concurrent:server',
        'connect:livereload',
        'watch'
    ]);

    // Default is to run serve task
    return grunt.registerTask('default', 'serve');
};