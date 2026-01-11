require 'erb'

class Renderer
  PROFILE_TEMPLATE_PATH = File.expand_path('../../templates/profile.erb', __dir__)
  HOME_ARTICLE_LIST_TEMPLATE_PATH = File.expand_path('../../templates/home-article-list.erb', __dir__)

  attr_reader :posts, :categories, :tags

  def initialize
    @posts = []
    extract_metadata
  end

  def get_profile_html
    categories = @categories
    tags = @tags

    profile_erb_template = File.read(PROFILE_TEMPLATE_PATH)
    profile_html = ERB.new(profile_erb_template).result
    article_list_erb_template = File.read(HOME_ARTICLE_LIST_TEMPLATE_PATH)
    article_list_html = ERB.new(article_list_erb_template).result(binding)

    body_content = <<~BODY
      <article class="markdown-body" style="box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px;">
        #{profile_html}
        #{article_list_html}
      </article>
    BODY

    render_page(
      body_content,
      title: 'Profile Preview',
      css_files: [
        '/statics/profile.css',
      ],
      js_files: ['/statics/profile.js']
    )
  end

  private

  def extract_metadata
    posts_dir = File.expand_path('../../posts', __dir__)
    all_categories = []
    all_tags = []
    slugs = []

    Dir.glob(File.join(posts_dir, '*.md')).each do |file_path|
      content = File.read(file_path)

      # Extract metadata from the <!---META ... ---> block
      if content =~ /<!---META\n(.*?)\n--->/m
        metadata_text = $1
        metadata = {}

        # Extract all metadata fields
        metadata[:title] = $1.strip if metadata_text =~ /title:\s*(.+)/
        metadata[:subtitle] = $1.strip if metadata_text =~ /subtitle:\s*(.+)/ # optional
        metadata[:slug] = $1.strip if metadata_text =~ /slug:\s*(.+)/
        metadata[:published_unix] = $1.strip.to_i if metadata_text =~ /published_unix:\s*(\d+)/

        # Extract categories
        if metadata_text =~ /categories:\s*\[(.*?)\]/
          metadata[:categories] = $1.split(',').map(&:strip)
          all_categories.concat(metadata[:categories])
        else
          metadata[:categories] = []
        end

        # Extract tags
        if metadata_text =~ /tags:\s*\[(.*?)\]/
          metadata[:tags] = $1.split(',').map(&:strip)
          all_tags.concat(metadata[:tags])
        else
          metadata[:tags] = []
        end

        metadata[:file_path] = file_path

        # Check for duplicate slug
        if metadata[:slug]
          if slugs.include?(metadata[:slug])
            raise "Duplicate slug found: '#{metadata[:slug]}' in #{file_path}"
          end
          slugs << metadata[:slug]
        end

        @posts << metadata
      end
    end

    # Store unique values sorted alphabetically
    @categories = all_categories.uniq.sort
    @tags = all_tags.uniq.sort
  end

  def render_page(body_content, title: 'Page', css_files: [], js_files: [])
    css_tags = css_files.map { |href| "<link rel=\"stylesheet\" href=\"#{href}\">" }.join("\n")
    js_tags = js_files.map { |src| "<script src=\"#{src}\"></script>" }.join("\n")

    <<~HTML
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>#{title}</title>
        <link rel="icon" href="/statics/favicon.svg" type="image/svg+xml">
        <link rel="stylesheet" href="/statics/_global_styles.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown-dark.css">
        #{css_tags}
      </head>
      <body>
        #{body_content}
      </body>
        <script src="/statics/_global_scripts.js"></script>
        #{js_tags}
      </html>
    HTML
  end
end
