module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: false,
          yuicompress: false,
          optimization: 2
        },
        files: {
          // target.css file: source.less file
          'assets/css/styles.css': 'assets/less/styles.less',
        }
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'assets/css',
          src: ['*.css', '!*.min.css'],
          dest: 'assets/css',
          ext: '.min.css'
        }],
      },
      options: {

      }
    },
    autoprefixer: {
      options: {
        cascade: true
      },
      development: {
        browsers: ['> 2 %', 'last 2 version', 'BB 7', 'BB 10', 'Android 2', 'Android 3', 'Android 4', 'Android 5', 'Firefox ESR'],
        expand: true,
        flatten: true,
        src: 'assets/css/*.css',
        dest: 'assets/css'
      }
    },
    bowercopy: {
      options: {
        clean: false
      },
      less: {
            options: {
                destPrefix: './assets/less/imports/vendor'
            },
            files: {
                'open-iconic.less': 'open-iconic/font/css/open-iconic.less',
            }
        },
        font: {
            options: {
                destPrefix: './assets/fonts'
            },
            files: {
                'open-iconic.eot': 'open-iconic/font/fonts/open-iconic.eot',
                'open-iconic.otf': 'open-iconic/font/fonts/open-iconic.otf',
                'open-iconic.svg': 'open-iconic/font/fonts/open-iconic.svg',
                'open-iconic.ttf': 'open-iconic/font/fonts/open-iconic.ttf',
                'open-iconic.woff': 'open-iconic/font/fonts/open-iconic.woff'
            }
        },
        js: {
            options: {
                destPrefix: './assets/js/vendor'
            },
            files: {
                'require.js': 'requirejs/require.js',
                'microajax.js': 'microajax/ajax.js',
                'knockout.js': 'knockout/dist/knockout.js',
                'knockout.mapping.js': 'knockout.mapping/build/output/knockout.mapping-latest.js',
                'lodash.min.js': 'lodash/lodash.min.js',
                'postal.min.js': 'postal/lib/postal.min.js'
            }
        }
    },
    watch: {
      styles: {
        files: ['assets/less/**/*.less', 'assets/js/*.js', 'static/*.html'],
        tasks: ['less', 'autoprefixer', 'cssmin'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['assets/js/*/*.js'],
        tasks: ['less', 'autoprefixer', 'cssmin'],
        options: {
          livereload: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['bowercopy', 'watch']);
};