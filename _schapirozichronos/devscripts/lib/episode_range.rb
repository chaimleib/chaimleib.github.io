class EpisodeRange
  def initialize(first_ep_id, last_ep_id)
    @first = first_ep_id ? Episode.new first_ep_id : nil
    @last = last_ep_id ? Episode.new last_ep_id : nil
  end

  attr_reader :first
  attr_reader :last

  def includes? ep
    if first and ep.int_part == first.int_part
      return letter_part >= first_letter
    elsif last and ep.int_part == last.int_part
      return letter_part <= last_letter
    else 
      return int_part.between?(fnum, lnum)
    end
  end

  def select list
    list.map(&Episode.new).select(&:includes?)
  end
end
