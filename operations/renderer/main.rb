require 'erb'
require 'github/markup'
require 'yaml'
require 'digest'

class Renderer
  TEMPLATES_DIR = File.expand_path('../../templates', __dir__)
  POSTS_PER_PAGE = 10
  THOUGHTS_PER_PAGE = 3

  attr_reader :posts, :categories, :tags, :thoughts

  def initialize
    @posts = []
    @thoughts = []
    extract_metadata
    load_train_of_thoughts
  end

  def render_partial(partial_name, locals = {})
    partial_path = File.join(TEMPLATES_DIR, "#{partial_name}.erb")
    partial_content = File.read(partial_path)

    # Create a binding with the local variables
    b = binding
    locals.each { |key, value| b.local_variable_set(key, value) }

    ERB.new(partial_content).result(b)
  end

  def get_profile_html
    categories = @categories
    tags = @tags
    thoughts = @thoughts

    profile_erb_template = File.read(File.join(TEMPLATES_DIR, 'profile.erb'))
    profile_html = ERB.new(profile_erb_template).result

    train_of_thoughts_erb_template = File.read(File.join(TEMPLATES_DIR, 'home-train-of-thoughts.erb'))
    train_of_thoughts_html = ERB.new(train_of_thoughts_erb_template).result(binding)

    article_list_erb_template = File.read(File.join(TEMPLATES_DIR, 'home-article-list.erb'))
    article_list_html = ERB.new(article_list_erb_template).result(binding)

    body_content = <<~BODY
      #{profile_html}
      #{train_of_thoughts_html}
      #{article_list_html}
    BODY

    render_page(
      body_content,
      title: 'Profile Preview',
      css_files: [
        '/statics/profile.css',
        '/statics/train-of-thoughts.css',
        '/statics/post-list.css'
      ],
      js_files: [
        '/statics/profile.js',
        '/statics/train-of-thoughts.js',
        '/statics/post-list.js'
      ]
    )
  end

  def get_all_post_list(page: 1, per_page: POSTS_PER_PAGE)
    sorted_posts = @posts.sort_by { |post| -post[:published_unix] }
    paginated_data = paginate(sorted_posts, page, per_page)

    render_post_list(
      posts: paginated_data[:items],
      pagination: paginated_data[:pagination],
      title: 'All Posts',
      heading: 'All Posts',
      base_url: '/posts'
    )
  end

  def get_category_post_list(category, page: 1, per_page: POSTS_PER_PAGE)
    filtered_posts = @posts
      .select { |post| post[:categories].any? { |cat| cat.downcase == category.downcase } }
      .sort_by { |post| -post[:published_unix] }

    paginated_data = paginate(filtered_posts, page, per_page)

    render_post_list(
      posts: paginated_data[:items],
      pagination: paginated_data[:pagination],
      title: "Category: #{category}",
      heading: "Posts in Category: #{category}",
      base_url: "/posts/category/#{category}"
    )
  end

  def get_tags_post_list(tag, page: 1, per_page: POSTS_PER_PAGE)
    filtered_posts = @posts
      .select { |post| post[:tags].any? { |t| t.downcase == tag.downcase } }
      .sort_by { |post| -post[:published_unix] }

    paginated_data = paginate(filtered_posts, page, per_page)

    render_post_list(
      posts: paginated_data[:items],
      pagination: paginated_data[:pagination],
      title: "Tag: ##{tag}",
      heading: "Posts tagged with ##{tag}",
      base_url: "/posts/tag/#{tag}"
    )
  end

  def get_post_by_slug(slug)
    post = @posts.find { |p| p[:slug] == slug }

    raise "Post not found with slug: '#{slug}'" unless post

    # Read the markdown file
    markdown_content = File.read(post[:file_path])

    # Remove the metadata block
    markdown_content = markdown_content.sub(/<!---META\n.*?\n--->\n*/m, '')

    # Render markdown to HTML using github-markup
    post_html = GitHub::Markup.render(post[:filename], markdown_content)

    # Render the post template
    post_template = File.read(File.join(TEMPLATES_DIR, 'post.erb'))
    body_content = ERB.new(post_template).result(binding)

    render_page(
      body_content,
      title: post[:title],
      css_files: ['/statics/post.css'],
      js_files: ['/statics/post.js']
    )
  end

  def get_all_thoughts_list(page: 1, per_page: THOUGHTS_PER_PAGE)
    paginated_data = paginate(@thoughts, page, per_page)

    render_thoughts_list(
      thoughts: paginated_data[:items],
      pagination: paginated_data[:pagination],
      title: 'Train of Thoughts',
      heading: 'Train of Thoughts',
      base_url: '/carriages'
    )
  end

  private

  def paginate(items, page, per_page)
    page = [page.to_i, 1].max
    total_items = items.length
    total_pages = (total_items.to_f / per_page).ceil
    total_pages = [total_pages, 1].max

    page = [page, total_pages].min

    offset = (page - 1) * per_page
    paginated_items = items[offset, per_page] || []

    {
      items: paginated_items,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        per_page: per_page,
        total_items: total_items,
        has_prev: page > 1,
        has_next: page < total_pages
      }
    }
  end

  def render_post_list(posts:, pagination:, title:, heading:, base_url:)
    post_list_template = File.read(File.join(TEMPLATES_DIR, 'post-list.erb'))
    body_content = ERB.new(post_list_template).result(binding)

    render_page(
      body_content,
      title: title,
      css_files: ['/statics/post-list.css'],
      js_files: ['/statics/post-list.js']
    )
  end

  def render_thoughts_list(thoughts:, pagination:, title:, heading:, base_url:)
    thoughts_list_template = File.read(File.join(TEMPLATES_DIR, 'thoughts-list.erb'))
    body_content = ERB.new(thoughts_list_template).result(binding)

    render_page(
      body_content,
      title: title,
      css_files: ['/statics/train-of-thoughts.css'],
      js_files: ['/statics/train-of-thoughts.js']
    )
  end

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
        metadata[:filename] = File.basename(file_path)

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

    footer_html = render_partial('_footer')

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
        <div class="markdown-body-wrapper">
          <article class="markdown-body">
            #{body_content}
            #{footer_html}
          </article>
        </div>
      </body>
        <script src="/statics/_global_scripts.js"></script>
        #{js_tags}
      </html>
    HTML
  end

  def load_train_of_thoughts
    thoughts_dir = File.expand_path('../../train-of-thoughts', __dir__)
    all_thoughts = []

    Dir.glob(File.join(thoughts_dir, '*.yaml')).sort.reverse.each do |file_path|
      data = YAML.load_file(file_path)
      if data && data['contents']
        all_thoughts.concat(parse_thoughts(data['contents']))
      end
    end

    # Sort by timestamp, most recent first
    @thoughts = all_thoughts.sort_by { |t| -t[:ts_unix] }
  end

  def parse_thoughts(contents)
    thoughts = contents.map do |item|
      thought = {
        content: item['content'],
        ts_unix: item['ts_unix'],
        id: Digest::SHA256.hexdigest("#{item['content']}#{item['ts_unix']}")
      }

      if item['childs'] && !item['childs'].empty?
        thought[:childs] = parse_thoughts(item['childs'])
      end

      thought
    end

    # Sort by timestamp, most recent first
    thoughts.sort_by { |t| -t[:ts_unix] }
  end
end
