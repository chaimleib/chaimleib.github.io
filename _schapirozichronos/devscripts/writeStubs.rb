#!/usr/bin/env ruby

def this_dir
  File.expand_path File.dirname(__FILE__)
end

# Where the podcast audio lives
def audio_dir
  File.dirname this_dir
end

def main
  first, last, *rest = ARGV
  unless first
    puts 'need first episode'
    usage
  end
  puts episodes(audio_files, first, last)
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
def regen_front fname
  ext = File.extname fname
  order = ep_id_str fname
  
end

# Read the Markdown content from the given Jekyll page file
def content fname
end

# Given an audio file name beginning with an episode id, returns the
# corresponding Jekyll page file name.
def md_name fname
  "#{ep_id_str fname}.md"
end

main
