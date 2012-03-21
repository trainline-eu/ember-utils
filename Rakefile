abort "Please use Ruby 1.9 to build Copal.js!" if RUBY_VERSION !~ /^1\.9/

require "bundler/setup"
require "erb"
require "uglifier"

# for now, the SproutCore compiler will be used to compile Ember.js
require "sproutcore"

LICENSE = File.read("generators/license.js")

## Some Ember modules expect an exports object to exist. Mock it out.

module SproutCore
  module Compiler
    class Entry
      def body
        "\n(function(exports) {\n#{@raw_body}\n})({});\n"
      end
    end
  end
end

## HELPERS ##

def strip_require(file)
  result = File.read(file)
  result.gsub!(%r{^\s*require\(['"]([^'"])*['"]\);?\s*}, "")
  result
end

def strip_ember_assert(file)
  result = File.read(file)
  result.gsub!(%r{^(\s)+ember_assert\((.*)\).*$}, "")
  result
end

def uglify(file)
  uglified = Uglifier.compile(File.read(file))
  "#{LICENSE}\n#{uglified}"
end

# Set up the intermediate and output directories for the interim build process

SproutCore::Compiler.intermediate = "tmp/intermediate"
SproutCore::Compiler.output       = "tmp/static"

# Create a compile task for an Ember package. This task will compute
# dependencies and output a single JS file for a package.
def compile_package_task(input, output=input)
  js_tasks = SproutCore::Compiler::Preprocessors::JavaScriptTask.with_input "packages/#{input}/lib/**/*.js", "."
  SproutCore::Compiler::CombineTask.with_tasks js_tasks, "#{SproutCore::Compiler.intermediate}/#{output}"
end

## TASKS ##

# Create ember:package tasks for each of the Ember packages
namespace :ember do
  %w(animations browser datetime form geolocation history markdown
    orientation overlay objectproxy responder routing searchable utils validators).each do |package|
    task package => compile_package_task("ember-#{package}", "ember-#{package}")
  end
end

# Create a build task that depends on all of the package dependencies
task :build => ["ember:animations", "ember:browser", "ember:datetime", "ember:form", "ember:geolocation",
  "ember:history", "ember:markdown", "ember:orientation", "ember:overlay",
  "ember:objectproxy", "ember:responder", "ember:routing", "ember:searchable", "ember:utils", "ember:validators"]

distributions = {
  "ember-animations" => ["ember-animations"],
  "ember-browser" => ["ember-browser"],
  "ember-datetime" => ["ember-datetime"],
  "ember-form" => ["ember-form"],
  "ember-geolocation" => ["ember-geolocation"],
  "ember-history" => ["ember-history"],
  "ember-markdown" => ["ember-markdown"],
  "ember-orientation" => ["ember-orientation"],
  "ember-overlay" => ["ember-overlay"],
  "ember-objectproxy" => ["ember-objectproxy"],
  "ember-responder" => ["ember-responder"],
  "ember-routing" => ["ember-routing"],
  "ember-searchable" => ["ember-searchable"],
  "ember-utils" => ["ember-utils"],
  "ember-validators" => ["ember-validators"]
}

distributions.each do |name, libraries|
  # Strip out require lines. For the interim, requires are
  # precomputed by the compiler so they are no longer necessary at runtime.
  file "dist/#{name}.js" => :build do
    puts "Generating #{name}.js"

    mkdir_p "dist"

    File.open("dist/#{name}.js", "w") do |file|
      libraries.each do |library|
        file.puts strip_require("tmp/static/#{library}.js")
      end
    end
  end

  # Minified distribution
  file "dist/#{name}.min.js" => "dist/#{name}.js" do
    require 'zlib'

    print "Generating #{name}.min.js... "
    STDOUT.flush

    File.open("dist/#{name}.prod.js", "w") do |file|
      file.puts strip_ember_assert("dist/#{name}.js")
    end

    minified_code = uglify("dist/#{name}.prod.js")
    File.open("dist/#{name}.min.js", "w") do |file|
      file.puts minified_code
    end

    gzipped_kb = Zlib::Deflate.deflate(minified_code).bytes.count / 1024

    puts "#{gzipped_kb} KB gzipped"

    rm "dist/#{name}.prod.js"
  end
end


desc "Build Ember.js"
task :dist => distributions.keys.map {|name| "dist/#{name}.min.js"}

desc "Clean build artifacts from previous builds"
task :clean do
  sh "rm -rf tmp && rm -rf dist"
end

task :default => :dist
