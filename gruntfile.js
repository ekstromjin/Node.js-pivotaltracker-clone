/*!
 * Pothongriver's Gruntfile
 * http://pothongriver.com
 */

module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var fs = require('fs');
  var path = require('path');
  
  var getLessVarsData = function () {
    var filePath = path.join(__dirname, 'less/variables.less');
    var fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    var parser = new BsLessdocParser(fileContent);
    return { sections: parser.parseFile() };
  };

  var configBridge = grunt.file.readJSON('./grunt/configBridge.json', { encoding: 'utf8' });

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    jqueryCheck: configBridge.config.jqueryCheck.join('\n'),
    jqueryVersionCheck: configBridge.config.jqueryVersionCheck.join('\n'),

    // Task configuration.
    clean: {
      dist: 'client/dist'
    },

    concat: {
      bootstrap: {
        src: [

        ],
        dest: 'client/dist/js/<%= pkg.name %>.js'
      },
      vendor: {
        src: [
          'client/lib/jquery/jquery.min.js',
          'client/lib/bootstrap/js/bootstrap.min.js',
          "client/lib/angular/angular.min.js",
          "client/lib/angular/angular-route.min.js",
          "client/lib/angular/angular-animate.min.js",
          "client/lib/angular/angular-cookies.min.js",
          "client/lib/angular-socket-io/socket.min.js",
          "client/lib/angular-moment/angular-moment.min.js",
          "client/lib/angular-bootstrap/ui-bootstrap.min.js",
          "client/lib/angular-bootstrap/ui-bootstrap-tpls.min.js",
          'client/lib/jquery-ui/jquery-ui-1.10.3.custom.min.js',
          'client/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
          'client/lib/select2/select2.js',
          'client/lib/bootstrap-fileupload/bootstrap-fileupload.js',
          'client/lib/jquery-migrate-1.2.1.min.js',
          'client/lib/bson.js',
          'client/lib/clipboard.1.5.5.min.js',
          'client/lib/gritter/js/jquery.gritter.js',
          'client/lib/chart/amcharts.js'
        ],
        dest: 'client/dist/js/vendor.js'
      },
    },

    uglify: {
      options: {
        compress: {
          warnings: false
        },
        mangle: true,
        preserveComments: 'some'
      },
      core: {
        src: '<%= concat.bootstrap.dest %>',
        dest: 'client/dist/js/<%= pkg.name %>.min.js'
      },
      vendor: {
        src: '<%= concat.vendor.dest %>',
        dest: 'client/dist/js/vendor.min.js'
      }
      // customize: {
      //   src: configBridge.paths.customizerJs,
      //   dest: 'docs/assets/js/customize.min.js'
      // }
    },

    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: 'client/dist/css/<%= pkg.name %>.css.map'
        },
        src: 'client/assets/less/<%= pkg.name %>.less',
        dest: 'client/dist/css/<%= pkg.name %>.css'
      }
    },

    autoprefixer: {
      options: {
        browsers: configBridge.config.autoprefixerBrowsers
      },
      core: {
        options: {
          map: true
        },
        src: 'client/dist/css/<%= pkg.name %>.css'
      }
    },

    cssmin: {
      options: {
        // TODO: disable `zeroUnits` optimization once clean-css 3.2 is released
        //    and then simplify the fix for https://github.com/twbs/bootstrap/issues/14837 accordingly
        compatibility: 'ie8',
        keepSpecialComments: '*',
        advanced: false
      },
      minifyCore: {
        src: 'client/dist/css/<%= pkg.name %>.css',
        dest: 'client/dist/css/<%= pkg.name %>.min.css'
      }
    },

    copy: {
      fonts: {
        expand: true,
        cwd: 'client/assets/fonts/',
        src: '*',
        dest: 'client/dist/fonts'
      },
      images: {
        expand: true,
        cwd: 'client/assets/images/',
        src: '*',
        dest: 'client/dist/images'
      },
      vendormap: {
        expand: true,
        cwd: 'client/lib/',
        src: '**/*.map',
        dest: 'client/dist/js',
        flatten: true,
        filter: 'isFile'
      }
    },

    watch: {
      coffee: {
        files: 'client/assets/coffee/**/*.coffee',
        tasks: ['coffee', 'uglify:core']
      },
      less: {
        files: 'client/assets/less/**/*.less',
        tasks: ['less','cssmin']
      },
      fonts: {
        files: 'client/assets/fonts/**/*.*',
        tasks: ['copy:fonts']        
      },
      images: {
        files: 'client/assets/images/**/*',
        tasks: ['copy:images']
      },
      vendermap: {
        files: 'client/lib/**/*.map',
        tasks: ['copy:vendermap']
      }
    },

    sed: {
      versionNumber: {
        pattern: (function () {
          var old = grunt.option('oldver');
          return old ? RegExp.quote(old) : old;
        })(),
        replacement: grunt.option('newver'),
        exclude: [
          'client/dist/fonts',
          'fonts',
          'js/tests/vendor',
          'node_modules',
          'test-infra'
        ],
        recursive: true
      }
    },

    coffee: {
      compile: {
        files:[
          {
            'client/dist/js/<%= pkg.name %>.js': 'client/assets/coffee/**/*.coffee',
          }
        ]
      }
    }    

  });


  // These plugins provide necessary tasks.
  // require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  // require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sails-linker');

  // Docs HTML validation task
  grunt.registerTask('validate-html', ['jekyll:docs', 'htmllint']);

  var runSubset = function (subset) {
    return !process.env.TWBS_TEST || process.env.TWBS_TEST === subset;
  };
  var isUndefOrNonZero = function (val) {
    return val === undefined || val !== '0';
  };

  // JS distribution task.
  // grunt.registerTask('dist-js', ['concat', 'uglify:core', 'commonjs']);
  grunt.registerTask('dist-js', ['concat:vendor', 'uglify:core']);

  // CSS distribution task.
  grunt.registerTask('less-compile', ['less:compileCore']);
  grunt.registerTask('dist-css', ['less-compile',  'cssmin:minifyCore']);

  // watch 
  grunt.registerTask('watch-task', ['watch']);

  // Full distribution task.
  grunt.registerTask('dist', ['dist-css', 'coffee', 'dist-js']);

  // Default task.
  grunt.registerTask('default', ['clean:dist', 'copy', 'dist', 'watch-task']);

  // Version numbering task.
  // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
  // This can be overzealous, so its changes should always be manually reviewed!
  grunt.registerTask('change-version-number', 'sed');

  grunt.registerTask('commonjs', 'Generate CommonJS entrypoint module in dist dir.', function () {
    var srcFiles = grunt.config.get('concat.bootstrap.src');
    var destFilepath = 'client/dist/js/npm.js';
    generateCommonJSModule(grunt, srcFiles, destFilepath);
  });
};
