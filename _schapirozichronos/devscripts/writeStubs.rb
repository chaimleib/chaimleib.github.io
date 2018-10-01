#!/usr/bin/env ruby
require_relative 'lib/episode.rb'
require 'json'
require 'yaml'

def this_dir
  File.expand_path File.dirname(__FILE__)
end

# Where the podcast audio lives
def audio_dir
  File.dirname this_dir
end

# List all audio files
def audio_files
  Dir.chdir audio_dir
  Dir.glob '*.m??'
end

# Jekyll page stub with YAML front matter and Markdown content
def stub fname
  <<~EOS
    ---
    #{regen_front fname}
    ---
    #{content fname}
  EOS
end

# Create Jekyll front matter YAML
def regen_front ep
  ext = File.extname ep.orig
  order = ep.id
  base = ep.orig.chomp ext #fsx
  frest = base.split(order + " - ").pop
  title = frest.split(/ 5[0-9][0-9][0-9] /).pop
  hdate = frest.split(" "+title).shift

  # puts "ext #{ext}"
  # puts "order #{order}"
  # puts "base #{base}"
  # puts "frest #{frest}"
  # puts "title #{title}"
  # puts "hdate #{hdate}"
  ffprobeJSON = `ffprobe -v quiet -show_streams -print_format json "#{ep.orig}"`
  ffprobe = JSON.parse ffprobeJSON

  date = ffprobe['streams'].shift['tags']['creation_time']
  unless date
    mdYAML = YAML.parse(md_name ep.orig)
    date = mdYAML['date']
  end
  puts date
end

# Read the Markdown content from the given Jekyll page file
def content fname
end

# Given an audio file name beginning with an episode id, returns the
# corresponding Jekyll page file name.
def md_name fname
  "#{ep_id_str fname}.md"
end

def episodes(files, first, last)
  parsed = files.map{|f| Episode.new f}.sort
  parsedFirst = Episode.new first
  highpass = parsed.select{|e| e >= parsedFirst}
  filtered = highpass
  if last
    parsedLast = Episode.new last
    lowpass = highpass.select{|e| e <= parsedLast}
  end
end

def main
  first, last, *rest = ARGV
  unless first
    puts 'need first episode'
    usage
  end
  episodes(audio_files, first, last).map{|e| regen_front e}
end

main
