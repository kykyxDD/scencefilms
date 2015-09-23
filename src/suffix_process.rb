require 'rubygems'
require 'parseconfig'
require 'find'
require 'fileutils'

File.file?('config.rb') ? config = ParseConfig.new('config.rb') : (raise "Config file 'config.rb' not found")

sass_dir = config['sass_dir'] or raise 'sass_dir not found in config.rb'
config_suffix = config['sfx_suffix'] or raise 'sfx_suffix not found in config.rb'
config_files = config['sfx_files'] or raise 'sfx_files not found in config.rb'

list = []

config_suffix.split(',').each do |s|
  parts = s.strip.split(':')

  data = Hash.new

  data[:target] = parts.length === 2 ? parts[1] : nil
  data[:suffix] = parts[0]

  list.push data
end

files = []

config_files.split(',').each do |name|
  name.strip!

  path = File.join(File.dirname(__FILE__), sass_dir, name + '.scss')

  File.file?(path) and files.push path
end

def parse_file(path, suffix)
  found = []

  lines = File.read(path).split("\n").map do |line|
    index = line.index('//')
    index ? line[0, index] : line
  end

  dir = File.dirname path

  lines.join("\n").scan(/@import ['"]([^'"]+)["']/m).each do |matches|
    match = matches[0]

    match_name = File.basename(match)
    match_base = File.dirname(match)

    ['', '_'].each do |prefix|
      src_path = File.join(dir, match_base, prefix + match_name + '.scss')

      if File.file? src_path
        search_path = File.join(File.dirname(src_path), File.basename(src_path, '.scss') + '--' + suffix + '.scss')

        File.file?(search_path) and found.push search_path

        found.concat parse_file(src_path, suffix)
      end
    end
  end

  found
end

list.each do |item|
  files.each do |path|
    raw_content = parse_file(path, item[:suffix])

    unless raw_content.empty?
      depth = item[:target].nil? ? 0 : item[:target].scan(/\//).length + 1
      relative_prefix = depth.zero? ? '' : Array.new(depth).fill('..').join('/').concat('/')

      content = '//Generated file' + "\n"
      content += '@import "' + relative_prefix + 'common/_include";' + "\n"
      content += '@import "' + relative_prefix + 'common/_mixins";' + "\n"

      raw_content.each do |r|
        name = File.basename(r, '.scss')

        from = r.index(sass_dir) + sass_dir.length + 1

        content += '@import "' + relative_prefix + r.slice(from, r.length - from) + '";' + "\n"
      end

      name = File.basename(path, '.scss')
      dir = File.dirname(path)

      target_dir = sass_dir
      file_path = File.join(dir, name + '__' + item[:suffix] + '.scss')

      unless item[:target].nil?
        file_path = File.join(dir, item[:target] , name + '__' + item[:suffix] + '.scss')
        target_dir = File.join(target_dir, item[:target])
      end

      File.directory?(target_dir) or FileUtils.mkpath target_dir

      f = File.new(file_path, 'w+')
      f.write(content)
      f.close()
    end
  end
end
