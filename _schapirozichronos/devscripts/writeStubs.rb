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

# Filter the given list to the episode range [first, last]
def episodes(list, first, last)
  list.select {|ep| episode_in_range?(ep, first, last)}
end

# Whether the given episode is in the range [first, last]
def episode_in_range?(fname, first, last)
  fnum = first.to_i 
  lnum = last ? last.to_i : Float::INFINITY
  num, letter = ep_id fname
  num.between?(fnum, lnum)
end

# return int and letter part of episode id
def ep_id episode
  # I could do this with a regex, but I want to practice manual parsing
  num = ''
  letter = ''
  rest = episode
  
  found_num = false
  found_num_end = false
  found_letter_end = false
  episode.split('').each_with_index { |c, i|
    rest = episode[i..-1]
    if !found_num
      if c.between?('1', '9')
        found_num = true
        num += c
      elsif c == '0'
        next
      else
        puts 'unexpected character while getting ep_id from episode:'
        puts episode
        puts ' '*i + '^'
        raise
      end
    elsif !found_num_end
      if c.between?('0', '9')
        num += c
      elsif c == ' ' or c == '.'
        found_num_end = true
        found_letter_end = true
        break
      else
        found_num_end = true
        letter += c
      end
    elsif !found_letter_end
      if c.between?('a', 'z')
        letter += c
      elsif c == ' ' or c == '.'
        found_letter_end = true
      else
        puts 'unexpected character while getting ep_id from episode:'
        puts episode
        puts ' '*i + '^'
        raise
      end
    else
      break
    end
  }
  [num.to_i, letter, rest]
end

# Given an audio file name beginning with an episode id, returns the
# corresponding Jekyll page file name.
def md_name fname
  "#{ep_id_str fname}.md"
end

# Concatenate the 0-padded episode number and letter together, e.g. 0032a
def ep_id_str fname
  num, letter = ep_id fname
  "#{pad_ep_num num}#{letter}"
end

# Add 0-padding to episode nums
def pad_ep_num num
  sprintf('%04d', num)
end

main
