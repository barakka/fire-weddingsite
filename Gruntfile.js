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
          'jslib/ua-parser/ua-parser.min.js',
          'jslib/addtohome/addtohomescreen.min.js',
          'jslib/angulartics/angulartics.min.js',
          'jslib/angulartics/angulartics-ga.min.js'
        ],
        dest: 'dist/jslib/combined.min.js'
      }
    },

    cssmin: {
      css: {
        src: 'dist/css/combined.css',
        dest: 'dist/css/combined.min.css'
      }
    },

    uglify: {
      js: {
        files: {
          'dist/js/combined.min.js': ['dist/js/combined.js']
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
    }
  });

  // Load the plugin that provides tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-image-resize');

  // Default task(s).
  grunt.registerTask('default', ['concat:css', 'concat:js', 'concat:jslib', 'cssmin:css']);
  grunt.registerTask('imgresize', ['imagemin', 'image_resize:home_m','image_resize:home_w']);
  
  grunt.registerTask('dist', ['concat:css', 'concat:js', 'concat:jslib', 'cssmin:css','uglify', 'imagemin']);
};