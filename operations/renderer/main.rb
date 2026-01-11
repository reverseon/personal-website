require 'erb'

class Renderer
  TEMPLATES_DIR = File.expand_path('../../templates', __dir__)
  POSTS_PER_PAGE = 10

  attr_reader :posts, :categories, :tags

  def initialize
    @posts = []
    extract_metadata
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

    profile_erb_template = File.read(File.join(TEMPLATES_DIR, 'profile.erb'))
    profile_html = ERB.new(profile_erb_template).result
    article_list_erb_template = File.read(File.join(TEMPLATES_DIR, 'home-article-list.erb'))
    article_list_html = ERB.new(article_list_erb_template).result(binding)

    body_content = <<~BODY
      #{profile_html}
      #{article_list_html}
    BODY

    render_page(
      body_content,
      title: 'Profile Preview',
      css_files: [
        '/statics/profile.css',
        '/statics/post-list.css'
      ],
      js_files: [
        '/statics/profile.js',
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
        <div class="markdown-body-wrapper">
          <article class="markdown-body">
            #{body_content}
          </article>
        </div>
      </body>
        <script src="/statics/_global_scripts.js"></script>
        #{js_tags}
      </html>
    HTML
  end
end
