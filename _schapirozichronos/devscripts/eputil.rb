#!/usr/bin/env ruby
require_relative 'lib/episode.rb'
require 'json'
require 'yaml'
require 'mimemagic'
require 'zip'

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
  result = <<~EOS
    ---
    #{regen_front ep}
    ---
    #{content ep.md_file if File.exists? ep.md_file}
  EOS
  result.chomp
end

def probe_media file
  ffprobeJSON = `ffprobe -v quiet -show_streams -print_format json "#{file}"`
  ffprobe = JSON.parse ffprobeJSON
end

# Create Jekyll front matter YAML
def regen_front ep
  f = ep.orig
  ext = File.extname f
  order = ep.id
  base = f.chomp ext #fsx
  frest = base.split(order + " - ").pop
  title = frest.split(/ 5[0-9][0-9][0-9] /, 2).pop
  hdate = frest.split(" "+title).shift
  ffprobe = probe_media f
  date = get_date(ep, ffprobe)
  _, mime = identify f
  size = File.size f
  duration_total = ffprobe['streams'][0]['duration'].to_f
  duration_m, duration_s = duration_total.divmod 60
  duration_str = sprintf('%d:%02d', duration_m, duration_s)
  result = <<~END
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
  result.chomp
end

def get_date(ep, ffprobe, preserveMarkdownDate=true)
  ff_date = ffprobe&.[]('streams')&.[](0)&.[]('tags')&.[]('creation_time')
  return ff_date if ff_date
  if preserveMarkdownDate and File.exists? ep.md_file
    mdYAML = File.read(ep.md_file)
    md = YAML.load mdYAML
    return md['date'] if md['date']
  end
  fmt = '%Y-%m-%dT%H:%M%SZ'
  File.birthtime(ep.orig).strftime fmt
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
  by_id.select{|k, v| v.length > 1}
end

def fix_ext files
  suggest = {}
  files.select{|f| File.file? f}.sort.each do |f|
    expExt, mime = identify f
    if !f.end_with? expExt
      oldExt = File.extname f
      oldMinusExt = f[0, f.length - oldExt.length]
      newF = "#{oldMinusExt}#{expExt}"
      puts "  #{f} => #{newF}"
      suggest[f] = newF
    end
  end
  puts "Apply the above renames [y/N]? "
  case $stdin.gets.chomp
  when 'y'
    puts 'Renaming...'
    suggest.each_pair do |oldF, newF|
      File.rename oldF, newF
    end
    puts 'Done.'
  else
    puts 'Doing nothing.'
  end
end

def identify file
  exts_by_mime = {
    'application/pdf' => '.pdf',
    'application/xml' => '.webloc',
    'image/jpeg' => '.jpg',
    # 'video/mp4' => '.mp4', # more id needed, sometimes this is just audio
    # nil => '.md', # more id needed, maybe just plain text
    # 'application/zip' # maybe docx
  }
  mime = MimeMagic.by_magic(File.open file)
  return [exts_by_mime[mime], mime] if exts_by_mime.key? mime

  # zips might be docx
  if mime == 'application/zip'
    Zip::File.open(file) do |zip_file|
      # Find specific entry
      if zip_file.glob('word/document.xml').length == 1
        return [
          '.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
      end
    end
    return ['.zip', mime]
  end

  # Markdown with Jekyll header?
  buf = ''
  File.open(file) do |f|
    buf = f.read("---\n".length)
  end
  return ['.md', 'text/markdown'] if buf == "---\n"

  # media file ID
  ffprobe = probe_media file
  if ffprobe
    video = nil
    audio = nil
    ffprobe&.[]('streams')&.each do |stream|
      case stream&.[]('codec_type')
      when "audio"
        audio = stream&.[]('codec_long_name')
      when "video"
        video = stream&.[]('codec_long_name')
      end
    end
    if video
      return ['.mp4', 'video/mpeg'] if video.include? 'MPEG-4'
      puts "Unknown mime #{mime}"
      puts "  and video codec #{video}"
      puts "  for file #{file}"
      return
    elsif audio
      return ['.m4a', 'audio/x-m4a'] if audio.include? 'AAC'
      return ['.mp3', 'audio/mp3'] if audio.include? 'MP3'
      puts "Unknown mime #{mime}"
      puts "  and audio codec #{audio}"
      puts "  for file #{file}"
      return
    end
  end

  puts "Unknown mime: #{mime}"
  puts "  for file: #{file}"
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
  puts "    ext - suggest file extension corrections"
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
    d = dupes eps
    if d.length == 0
      puts 'No duplicates.'
      exit 0
    end
    d.each_pair do |k, dupe_ary|
      puts "#{k}:"
      dupe_ary.each{|e| puts "  #{e.orig}"}
    end
  when 'ext'
    if first or last
      puts 'No FIRST or LAST arg for ext'
      exit 1
    end
    Dir.chdir audio_dir
    fix_ext Dir.glob '*'
  else
    puts `Unknown verb "#{verb}"`
    usage
    exit 1
  end
end

main
