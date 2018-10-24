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

# Given an episode, return the Jekyll page stub with YAML front matter and
# Markdown content
def stub ep
  <<~EOS
    ---
    #{regen_front ep}
    ---
    #{content ep.md_file if File.exists? ep.md_file}
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

  ffprobeJSON = `ffprobe -v quiet -show_streams -print_format json "#{f}"`
  ffprobe = JSON.parse ffprobeJSON

  date = get_date(ep, ffprobe)
  mime = MimeMagic.by_magic(File.open f)
  size = File.size(f)
  duration_total = ffprobe['streams'][0]['duration'].to_f
  duration_m, duration_s = duration_total.divmod 60
  duration_str = sprintf('%d:%02d', duration_m, duration_s)
  <<~END
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

def get_date(ep, ffprobe, preserveMarkdownDate=true)
  ff_date = ffprobe&.[]('streams')&.[](0)&.[]('tags')&.[]('creation_time')
  return ff_date if ff_date
  if preserveMarkdownDate
    mdYAML = File.read(ep.md_file)
    md = YAML.load mdYAML
    return md['date'] if md['date']
  end
  fmt = '%Y-%m-%dT%H:%M%SZ'
  File.birthtime(fname).strftime fmt
end


# Read the Markdown content from the given Jekyll page file
def content fname
  sep_count = 0
  lines = []
  File.open(fname).each do |l|
    lines.push l if sep_count >= 2
    sep_count += 1 if l.chomp == '---'
  end
  lines.join ""
end

def dupes eps
  by_id = {}
  eps.each do |e|
    if by_id.key? e.id
      by_id[e.id].push e
    else
      by_id[e.id] = [e]
    end
  end
  results = []
  by_id.select{|k, v| v.length > 1}.each_pair do |k, dupe_ary|
    results.push "#{k}:"
    dupe_ary.each{|e| results.push "  #{e.orig}"}
  end
  if results.length > 0
    results.join "\n"
  else
    "No duplicates."
  end
end

def episodes(files, first, last)
  parsed = files.map{|f| Episode.new f}.sort
  if first
    parsedFirst = Episode.new first
    highpass = parsed.select{|e| e >= parsedFirst}
  else
    highpass = parsed
  end
  if last
    parsedLast = Episode.new last
    lowpass = highpass.select{|e| e <= parsedLast}
  else
    lowpass = highpass
  end
end

def usage
  puts "Usage:"
  puts "    #{$PROGRAM_NAME} VERB [FIRST [LAST]]"
  puts ""
  puts "VERB:"
  puts "    list - print the audio files"
  puts "    stub - write markdown files for the audio files"
  puts "    dupes - print files with colliding episode IDs in their name"
  puts ""
  puts "[FIRST [LAST]]:"
  puts "    These are episode IDs, like '2' or '13a'."
  puts ""
end

def main
  verb, first, last, *rest = ARGV
  eps = episodes(audio_files, first, last)
  case verb
  when 'list'
    eps.map{|e| puts e.orig}
  when 'stub'
    eps.each do |e|
      eStub = stub e
      File.open(e.md_file, 'w') {|f| f.write eStub}
    end
  when 'dupes'
    puts dupes eps
  else
    puts `Unknown verb "#{verb}"`
    usage
    exit 1
  end
end

main
