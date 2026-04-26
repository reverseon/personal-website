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

  def render_page(body_content, title: 'Page', description: '', image: '/statics/media/icons/favicon.png', css_files: [], js_files: [])
    css_tags = css_files.map { |href| "<link rel=\"stylesheet\" href=\"#{href}\">" }.join("\n")
    js_tags = js_files.map { |src| "<script src=\"#{src}\"></script>" }.join("\n")

    footer_html = render_partial('shared/_footer')

    absolute_image = "#{SITE_DOMAIN}#{image}"

    description_tag = description.empty? ? '' : "<meta name=\"description\" content=\"#{description}\">"
    og_description_tag = description.empty? ? '' : "<meta property=\"og:description\" content=\"#{description}\">"
    twitter_description_tag = description.empty? ? '' : "<meta name=\"twitter:description\" content=\"#{description}\">"

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
        <link rel="stylesheet" href="/statics/css/global/main.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown-dark.css">
        #{css_tags}
      </head>
      <body>
        <div class="markdown-body-wrapper">
          <article class="markdown-body">
            #{body_content}
            #{footer_html}
          </article>
        </div>
        <script src="/statics/js/global/main.js"></script>
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
