require_relative '../lib/episode'
require 'test/unit'

class TestEpisode < Test::Unit::TestCase
  def test_parse
    cases = [
      ['1234', 1234, ''],
      ['0001', 1, ''],
      ['1', 1, ''],
      ['1234b', 1234, 'b'],
      ['0001c', 1, 'c'],
      ['000001c', 1, 'c'],
      ['01c', 1, 'c'],
      ['1c', 1, 'c'],
      ['0001c - some title', 1, 'c'],
      ['0001 - some title', 1, ''],
    ]
    cases.each do |c|
      ep, exp_int_part, exp_letter_part = c
      int_part, letter_part = Episode.parse ep
      assert_equal(
        exp_int_part,
        int_part,
        "Episode.parse #{ep.to_s.inspect} incorrect")
      assert_equal(
        exp_letter_part,
        letter_part,
        "Episode.parse #{ep.to_s.inspect} incorrect")
    end
  end

  def test_new
    ep = Episode.new "0001c - some title"
    assert_equal(ep.int_part, 1)
    assert_equal(ep.letter_part, 'c')
  end

  def test_id
    cases = [
      ['1234', '1234'],
      ['0001', '0001'],
      ['1', '0001'],
      ['1234b', '1234b'],
      ['1234ab', '1234ab'],
      ['0001c', '0001c'],
      ['000001c', '0001c'],
      ['01c', '0001c'],
      ['1c', '0001c'],
      ['0001c - some title', '0001c'],
      ['0001 - some title', '0001'],
    ]
    cases.each do |c|
      input, exp_id = c
      ep = Episode.new input
      assert_equal(ep.id, exp_id, "id(#{input.inspect}) incorrect")
    end
  end

  def test_compare
    cases = [
      ['1234', '1234', 0],
      ['01234', '1234', 0],
      ['1a', '1', 1],
      ['1a', '1b', -1],
      ['1ca', '1d', 1],
      ['1ba', '1d', 1],
      ['1', '2', -1],
      ['10', '2', 1],
      ['1b', '2a', -1],
      ['10b', '2a', 1],
    ]
    cases.each do |c|
      a_str, b_str, expected = c
      a = Episode.new a_str
      b = Episode.new b_str
      assert_equal(a <=> b, expected, "#{a_str} <=> #{b_str} != #{expected}")
      if expected == -1
        assert_true(a < b, "#{a_str} !< #{b_str}")
      elsif expected == 1
        assert_true(a > b, "#{a_str} !> #{b_str}")
      else
        assert_equal(a, b, "#{a_str} != #{b_str}")
      end
      assert_equal(b <=> a, -expected, "#{b_str} <=> #{a_str} != -(#{expected})")
    end
  end
end
