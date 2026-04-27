module HtmlFormatter
  # Convert custom comment syntax to HTML elements
  # Ruby annotations: RUBY{漢字|かん.じ} becomes <span class="rg"><ruby>漢<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby></span>
  # Each dot in the reading separates annotations per base character
  # The .rg (ruby-group) wrapper allows hovering to reveal all readings at once
  # Footnote: <!--Footnote note text --> becomes a footnote-style element
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

    # Footnote pattern: <!--Footnote note text --> becomes a footnote-style element
    # Using /m flag to allow matching across multiple lines
    html = html.gsub(/<!--Footnote\s+(.+?)\s*-->/m) do |match|
      note_text = $1.gsub(/\n/, '<br>')
      "<aside class=\"footnote\"><span class=\"footnote-label\">Note:</span> #{note_text}</aside>"
    end

    # Tooltip pattern: TOOLTIP{message|target}
    html = html.gsub(/TOOLTIP\{([^|{}]+)\|([^{}]+)\}/) do |match|
      message = $1
      target = $2
      "<span class=\"tooltip-trigger\" data-tooltip=\"#{message}\">#{target}</span>"
    end

    html
  end

  # Strip custom annotations for plain text usage (e.g. meta descriptions)
  def self.strip_custom_annotations(text)
    return "" if text.nil?
    
    # Strip RUBY{base|reading} -> base
    text = text.gsub(/RUBY\{([^|{}]+)\|([^{}]+)\}/, '\1')
    
    # Strip TOOLTIP{message|target} -> target
    text = text.gsub(/TOOLTIP\{([^|{}]+)\|([^{}]+)\}/, '\2')
    
    # Strip <!--Footnote text --> -> ""
    text = text.gsub(/<!--Footnote\s+(.+?)\s*-->/m, '')
    
    text
  end
end
