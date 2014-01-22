/*global module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    base: 'src',
                    debug: !!(process.env.DEBUG || process.env.DEBUG),
                    keepalive: true,
                    open: !!(process.env.OPEN || process.env.open),
                    port: process.env.PORT || process.env.port || 9000
                }
            }
        },
        jshint: {
            src: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {
                    require: true,
                    define: true,
                    requirejs: true,
                    describe: true,
                    expect: true,
                    it: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
