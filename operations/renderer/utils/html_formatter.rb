module HtmlFormatter
  # Convert custom comment syntax to HTML elements
  # Ruby annotations: RUBY{漢字|かん.じ} becomes <span class="rg"><ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby></span>
  # Each dot in the reading separates annotations per base character
  # The .rg (ruby-group) wrapper allows hovering to reveal all readings at once
  # TLN (Translator's Note): <!--TLN note text --> becomes a footnote-style element
  def self.convert_custom_comments(html)
    # Ruby annotation pattern: RUBY{base|reading.reading.reading}
    html = html.gsub(/RUBY\{([^|{}]+)\|([^{}]+)\}/) do |match|
      base_text = $1
      readings = $2.split('.')
      base_chars = base_text.chars

      ruby_content = if base_chars.length == readings.length
        # One reading per character
        base_chars.zip(readings).map do |char, reading|
          "<ruby>#{char}<rt>#{reading}</rt></ruby>"
        end.join
      else
        # Mismatch: wrap entire base with joined readings
        "<ruby>#{base_text}<rt>#{readings.join}</rt></ruby>"
      end

      "<span class=\"rg\">#{ruby_content}</span>"
    end

    # TLN pattern: <!--TLN note text --> becomes a footnote-style element
    # Using /m flag to allow matching across multiple lines
    html = html.gsub(/<!--TLN\s+(.+?)\s*-->/m) do |match|
      note_text = $1.gsub(/\n/, '<br>')
      "<aside class=\"tln-footnote\"><span class=\"tln-label\">TLN:</span> #{note_text}</aside>"
    end

    html
  end
end
