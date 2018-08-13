require_relative '../lib/episode'
require 'test/unit'

class TestEpisode < Test::Unit::TestCase
  def test_parse
    cases = {
      '1234': [1234, ''],
      '0001': [1, ''],
      '1': [1, ''],
      '1234b': [1234, 'b'],
      '0001c': [1, 'c'],
      '000001c': [1, 'c'],
      '01c': [1, 'c'],
      '1c': [1, 'c'],
      '0001c - some title': [1, 'c'],
      '0001 - some title': [1, ''],
    }
    cases.each do |ep, exp|
      exp_int_part, exp_letter_part = exp
      int_part, letter_part = Episode.parse ep.to_s
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
      '1234': '1234',
      '0001': '0001',
      '1': '0001',
      '1234b': '1234b',
      '0001c': '0001c',
      '000001c': '0001c',
      '01c': '0001c',
      '1c': '0001c',
      '0001c - some title': '0001c',
      '0001 - some title': '0001',
    ]
    cases.each do |ep|
      int_part, letter_part = Episode.parse ep.to_s
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
end