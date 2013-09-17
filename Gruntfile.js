module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['tmp', 'dist']
    },

    concat: {
      options: {
        process: function(src) {
          return "(function() {\n" + src + "\n})();\n";
        }
      },
      lib: {
        src: ['packages/ember-utils/lib/*.js'],
        dest: 'dist/ember-utils.js'
      }
    }
  });

  grunt.registerTask('default', "Build & test your module.", ['build', 'test']);
  grunt.registerTask('build', ['clean', 'concat']);
  grunt.registerTask('test');
};
