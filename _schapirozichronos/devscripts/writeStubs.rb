#!/usr/bin/env ruby

def this_dir
  File.expand_path File.dirname(__FILE__)
end

def main
  first, last, *rest = ARGV
  unless first
    puts 'need first episode'
    usage
  end
  puts episodes(audio_files, first, last)
end

def audio_files
  audio_dir = File.dirname this_dir
  Dir.chdir audio_dir
  Dir.glob '*.m??'
end

def stub fname
  <<~EOS
    ---
    #{regen_front fname}
    ---
    #{content fname}
  EOS
end

def regen_front fname
  ext = File.extname fname
  order = ep_id_str fname
  
end

def content fname
end

def episodes(list, first, last)
  list.select {|ep| episode_in_range?(ep, first, last)}
end

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

def md_name fname
  "#{ep_id_str fname}.md"
end

def ep_id_str fname
  num, letter = ep_id fname
  "#{pad_ep_num num}#{letter}"
end

def pad_ep_num num
  sprintf('%04d', num)
end

main

