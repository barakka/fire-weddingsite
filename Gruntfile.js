module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      css: {
        src: [
          'css/index.css',
          'css/static-inner.css',
          'css/accommodation.css',
          'css/calendar.css',
          'css/church.css',
          'css/comment.css',
          'css/contacts.css',
          'css/dinner.css',
          'css/home.css',
          'css/invitation.css',
          'css/login.css',
          'css/other.css',
          'css/present.css',
          'css/survey.css',
          'css/upload.css',
          'css/us.css',
          'jslib/addtohome/addtohomescreen.css',
        ],
        dest: 'dist/css/combined.css'
      },
      js: {
        src: [
          'js/config.js',
          'js/wedding.js'
        ],
        dest: 'dist/js/combined.js'
      },
      jslib: {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/moment/min/moment.min.js',
          'bower_components/moment/lang/es.js',
          'bower_components/firebase/firebase.js',
          'bower_components/firebase-simple-login/firebase-simple-login.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angularfire/angularfire.min.js',
          'bower_components/ua-parser-js/src/ua-parser.min.js',
          'jslib/addtohome/addtohomescreen.min.js',
          'bower_components/angulartics/dist/angulartics.min.js',
          'bower_components/angulartics/dist/angulartics-ga.min.js'
        ],
        dest: 'dist/jslib/jslib.min.js'
      },
      fullcalendar: {
        src: [
          'bower_components/fullcalendar/dist/fullcalendar.min.js',
          'bower_components/fullcalendar/dist/gcal.js',
          'bower_components/fullcalendar/dist/lang/es.js'
        ],
        dest: 'dist/jslib/fullcalendar.min.js'
      }
    },

    cssmin: {
      css: {
        src: 'dist/css/combined.css',
        dest: 'dist/css/combined.min.css'
      },
      fullcalendar: {
        src: 'bower_components/fullcalendar/dist/fullcalendar.css',
        dest: 'dist/jslib/fullcalendar.min.css'
      }
    },

    uglify: {
      js: {
        files: {
          'dist/js/combined.min.js': ['dist/js/combined.js']
        }
      },
      admin: {
        files: {
          'dist/admin/js/filesaver.min.js': ['bower_components/FileSaver/FileSaver.js']
        }
      }
    },

    watch: {
      files: ['css/*', 'js/*', '!**/combined*'],
      tasks: ['concat', 'cssmin', 'uglify']
    },

    imagemin: {                          // Task      
      img: {                         // Another target
        files: [{
          expand: true,
          cwd: 'img/',
          src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
          dest: 'dist/img/'                  // Destination path prefix
        }]
      }
    },

    image_resize: {
      home_m: {
        options: {
          width: 70
        },
        files: [{
          expand: true,
          cwd: 'dist/img/home/',
          src: ['*.{png,jpg,gif}'],
          dest: 'dist/img/home/m'
        }]
      },
      home_w: {
        options: {
          width: 140
        },
        files: [{
          expand: true,
          cwd: 'dist/img/home/',
          src: ['*.{png,jpg,gif}'],
          dest: 'dist/img/home/w'
        }]
      }
    },

    copy: {
      main: {
        src: ['index.html', 'admin/**/*.*', 'partials/**/*.*', 'js/config.js', 'fonts/**/*.*'],
        dest: 'dist/',
      },         
      admin: {
        src: ['jslib/qrcode/qrcode.min.js'],
        dest: 'dist/admin/js/qrcode.min.js'
      },         
    },

    clean: {
      dist: {
        src: ["dist"]
      }
    }
  });

  // Load the plugin that provides tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-image-resize');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['concat:css', 'concat:js', 'concat:jslib', 'cssmin:css']);
  grunt.registerTask('imgresize', ['imagemin', 'image_resize:home_m', 'image_resize:home_w']);

  grunt.registerTask('dist', ['clean:dist', 'concat:css', 'concat:js', 'concat:jslib', 'concat:fullcalendar', 'cssmin', 'uglify', 'imgresize', 'copy']);
};
