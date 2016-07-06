module.exports = function(grunt) {

    // load libraries
    var libraries = {},
        libdirs = grunt.file.expand('libs/*/data.{json,yml}');
    libdirs.forEach(
        function(dataPath) {
            var libpath = dataPath.split('/data')[0],
                libname = dataPath.split('/')[1],
                ext = dataPath.split('/')[2],
                thislib = {};

            // add data
            if (ext === 'data.json') {
                thislib.data = grunt.file.readJSON(dataPath);
            } else if (ext === 'data.yml') {
                thislib.data = grunt.file.readYAML(dataPath);
            }

            // load helpers
            var helpers = {},
                helperFiles = grunt.file.expand( {cwd: libpath + '/helpers' }, ['**/*.js'] );
            helperFiles.forEach(
                function(fileName) {
                    var basename = fileName.split('.')[0],
                        helperPath = './' + libpath + '/helpers/' + fileName;
                    helpers[basename] = require(helperPath)[basename];
                }
            );
            thislib.helper = helpers;

            // add partial path, relative to project folders
            thislib.partials = '../../' + libpath + '/partials/';

            libraries[libname] = thislib;
        }
    );

    var project = 'project/',
        dir = {
            src: 'src/' + project,
            dist: 'dist/' + project
        };

    var defaultTasks = ['ejs', 'sass', 'juice', 'replace'];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        ejs: {
            all: {
                options: {
                    // libraries are dynamically added after config
                    // could also be loaded as helper?
                    getData: function(path) {
                        return grunt.file.readYAML(dir.src + path);
                    }
                },
                cwd: dir.src,
                src: '**/*.ejs',
                dest: dir.dist,
                expand: true,
                ext: '.html',
            },
        },

        sass: {
            build: {
                files: [{
                    expand: true,
                    cwd: dir.src,
                    src: '*.scss',
                    dest: dir.dist + 'styles',
                    ext: '.css'
                }]
            }
        },

        juice: {
            options: {
                widthElements: ['table', 'td', 'img'],
                applyWidthAttributes: true,
                // heightElements: ['img'],
                // applyHeightAttributes: true,
                    // also useful for tables and other elements?
                    // any exclusions for images that should be allowed to collapse?
                webResources: {
                    strict: true,
                    images: false,
                    scripts: false,
                    // preserveImportant: true,
                    // cssmin: true // test if this causes any rendering issues first
                }
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: dir.dist,
                    src: '*.html',
                    dest: dir.dist
                }]
            }
        },

        replace: {
            dist: {
                options: {
                    silent: true,
                    patterns: [
                        { match: /\sclass=["'][\w \-]*['"]/g, replacement: '' }, // remove CSS classes
                        { match: /[\s]*<!--[\S\s]*?-->/g, replacement: '' }, // remove HTML comments // possibly end with [\n\r]*
                        { match: /^$/gm, replacement: '' }, // remove empty lines
                        // { match: 'EMAILNAME', replacement: '<%= emailName %>' }, // replace 'EMAILNAME' with GA tag
                        // { match: '!img', replacement: 'img' } // enable tracking image
                    ]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: dir.dist + '*.html',
                    dest: dir.dist
                }]
            }
        },

        watch: {
            dist: {
                files: [dir.src + '**/*.{ejs,yml,scss}', 'libs/**/{helpers,partials}/**/*.{js,ejs}'],
                tasks: defaultTasks,
                options: {
                    spawn: false,
                    atBegin: true
                }
            },
            configFiles: {
                files: ['Gruntfile.js'],
                tasks: defaultTasks,
                options: { reload: true }
            }
        },

    });

    // dynamically add libraries
    var lib_config = { ejs: { all: { options: {} } } };
    Object.keys(libraries).forEach(function(item) {
        lib_config.ejs.all.options[item] = libraries[item];
    });
    grunt.config.merge(lib_config);

    grunt.loadNpmTasks('grunt-ejs');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-juice');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', defaultTasks);

};
