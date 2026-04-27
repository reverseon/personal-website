require 'erb'
require 'github/markup'
require 'commonmarker'
require 'json'

require_relative 'loaders/post_loader'
require_relative 'loaders/thought_loader'
require_relative 'utils/paginator'
require_relative 'utils/html_formatter'
require_relative 'renderers/profile_renderer'
require_relative 'renderers/post_renderer'
require_relative 'renderers/thought_renderer'
require_relative 'renderers/error_renderer'

class Renderer
  include ProfileRenderer
  include PostRenderer
  include ThoughtRenderer
  include ErrorRenderer

  TEMPLATES_DIR = File.expand_path('../../templates', __dir__)
  POSTS_PER_PAGE = 5
  FLATTENED_THOUGHTS_PER_PAGE = 10
  SITE_DOMAIN = ENV.fetch('SITE_INTENDED_DOMAIN', 'http://localhost:3000')

  attr_reader :posts, :categories, :tags, :thoughts, :total_posts_pages, :total_thoughts_pages

  def initialize
    posts_data = PostLoader.load_posts(File.expand_path('../../posts', __dir__))
    @posts = posts_data[:posts]
    @categories = posts_data[:categories]
    @tags = posts_data[:tags]

    @thoughts = ThoughtLoader.load_thoughts(File.expand_path('../../train-of-thoughts', __dir__))

    calculate_total_pages
  end

  def render_partial(partial_name, locals = {})
    partial_path = File.join(TEMPLATES_DIR, "#{partial_name}.erb")
    partial_content = File.read(partial_path)

    # Create a binding with the local variables
    b = binding
    locals.each { |key, value| b.local_variable_set(key, value) }

    ERB.new(partial_content).result(b)
  end

  def render_markdown(text)
    return '' if text.nil?
    Commonmarker.to_html(
      text,
      options: {
        render: {
          unsafe: true,
          github_pre_lang: true,
          hardbreaks: true
        },
        extension: {
          autolink: true,
          strikethrough: true,
          table: true,
          tasklist: true,
          tagfilter: true,
          footnotes: true,
          header_ids: ""
        }
      }
    )
  end

  def render_page(body_content, title: 'Page', description: '', image: '/statics/media/icons/favicon.png', css_files: [], js_files: [])
    css_tags = css_files.map { |href| "<link rel=\"stylesheet\" href=\"#{href}\">" }.join("\n")
    js_tags = js_files.map { |src| "<script src=\"#{src}\"></script>" }.join("\n")

    footer_html = render_partial('shared/_footer')

    # Extract first image from content if default image is used
    if image == '/statics/media/icons/favicon.png'
      if body_content =~ /<img\s+[^>]*src=["']([^"']+)["']/i
        image = $1
      end
    end

    absolute_image = image.start_with?('http') ? image : "#{SITE_DOMAIN}#{image}"

    # Clean up description for meta tags (strip custom annotations and HTML)
    clean_description = HtmlFormatter.strip_custom_annotations(description)
      .gsub(/<[^>]*>/, '') # Strip any existing HTML tags
      .gsub(/\s+/, ' ')    # Normalize whitespace
      .strip

    description_tag = clean_description.empty? ? '' : "<meta name=\"description\" content=\"#{clean_description}\">"
    og_description_tag = clean_description.empty? ? '' : "<meta property=\"og:description\" content=\"#{clean_description}\">"
    twitter_description_tag = clean_description.empty? ? '' : "<meta name=\"twitter:description\" content=\"#{clean_description}\">"

    html = <<~HTML
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>#{title}</title>
        #{description_tag}
        <!-- OpenGraph -->
        <meta property="og:title" content="#{title}">
        #{og_description_tag}
        <meta property="og:image" content="#{absolute_image}">
        <meta property="og:type" content="website">
        <!-- Twitter -->
        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="#{title}">
        #{twitter_description_tag}
        <meta name="twitter:image" content="#{absolute_image}">
        <link rel="icon" href="/statics/media/icons/favicon.svg" type="image/svg+xml">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/statics/css/global/main.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown-dark.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
        #{css_tags}
      </head>
      <body>
        <div class="markdown-body-wrapper">
          <article class="markdown-body">
            #{body_content}
          </article>
          #{footer_html}
        </div>
        <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
          });
        </script>
        <script src="/statics/js/global/main.js"></script>
        <script src="/statics/js/components/tooltip.js"></script>
        #{js_tags}
      </body>
      </html>
    HTML

    HtmlFormatter.convert_custom_comments(html)
  end

  private

  def calculate_total_pages
    # Calculate total pages for posts
    total_posts = @posts.length
    @total_posts_pages = total_posts > 0 ? (total_posts.to_f / POSTS_PER_PAGE).ceil : 1

    # Calculate total pages for thoughts
    page_map = Paginator.build_thought_page_map(@thoughts, FLATTENED_THOUGHTS_PER_PAGE)
    @total_thoughts_pages = page_map[:total_pages]
  end
end
