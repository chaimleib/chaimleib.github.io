#!/usr/bin/env ruby
require_relative 'lib/episode.rb'
require 'json'
require 'yaml'
require 'mimemagic'

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
  f = ep.orig
  ext = File.extname f
  order = ep.id
  base = f.chomp ext #fsx
  frest = base.split(order + " - ").pop
  title = frest.split(/ 5[0-9][0-9][0-9] /).pop
  hdate = frest.split(" "+title).shift

  # puts "ext #{ext}"
  # puts "order #{order}"
  # puts "base #{base}"
  # puts "frest #{frest}"
  # puts "title #{title}"
  # puts "hdate #{hdate}"
  ffprobeJSON = `ffprobe -v quiet -show_streams -print_format json "#{f}"`
  ffprobe = JSON.parse ffprobeJSON

  date = get_date(f, ffprobe)
  mime = MimeMagic.by_magic(File.open f)
  size = File.size(f)
  duration_total = ffprobe['streams'][0]['duration'].to_f
  duration_m, duration_s = duration_total.divmod 60
  duration_str = sprintf('%d:%02d', duration_m, duration_s)
  puts <<~END
  name: "#{base}"
  order: "#{order}"
  date: "#{date}"
  hdate: "#{hdate}"
  title: "#{title}"
  keywords: []
  file:
  - ext: "#{ext}"
    mime: "#{mime}"
    size: #{size}
    duration: "#{duration_str}"
  published: true
  END
end

def get_date(fname, ffprobe, preserveMarkdownDate=true)
  ff_date = ffprobe['streams'][0]['tags']['creation_time']
  if ff_date
    return ff_date
  end
  if preserveMarkdownDate
    mdYAML = File.read(md_name fname)
    md = YAML.parse myYAML
    if md['date']
      return md['date']
    end
  end
  fmt = '%Y-%m-%dT%H:%M%SZ'
  File.birthtime(fname).strftime fmt
end


# Read the Markdown content from the given Jekyll page file
def content fname
end

# Given an audio file name beginning with an episode id, returns the
# corresponding Jekyll page file name
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
  unless last
    last = first
  end
  episodes(audio_files, first, last).map{|e| regen_front e}
end

main
