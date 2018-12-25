class Episode
  include Comparable
  def initialize name
    @int_part, @letter_part = self.class.parse name
    @orig = name
  end

  attr_reader :int_part
  attr_reader :letter_part
  attr_reader :orig

  # Concatenate the 0-padded episode number and letter together, e.g. 0032a
  def id
    padded = sprintf('%04d', int_part)
    "#{padded}#{letter_part}"
  end

  # The corresponding Jekyll page file name
  def md_file
    "#{id}.md"
  end

  def <=>(other)
    begin
      if @int_part == other.int_part
        if @letter_part.length == other.letter_part.length
          @letter_part <=> other.letter_part
        else
          @letter_part.length <=> other.letter_part.length
        end
      else
        @int_part <=> other.int_part
      end
    rescue
      nil
    end
  end

  # Given a string beginning with an episode id, return the int and letter parts
  def self.parse episode
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
        elsif c == ' ' or c == '.' or c == ')'
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
        elsif c == ' ' or c == '.' or c == ')'
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
end
