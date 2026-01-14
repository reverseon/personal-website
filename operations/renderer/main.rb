require 'erb'
require 'github/markup'
require 'yaml'
require 'digest'
require 'json'

class Renderer
  TEMPLATES_DIR = File.expand_path('../../templates', __dir__)
  POSTS_PER_PAGE = 5
  FLATTENED_THOUGHTS_PER_PAGE = 150

  attr_reader :posts, :categories, :tags, :thoughts, :total_posts_pages, :total_thoughts_pages

  def initialize
    @posts = []
    @thoughts = []
    extract_metadata
    load_train_of_thoughts
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
      title: 'ReverseON',
      description: 'Personal blog my short bio, some notes, and my train of thoughts.',
      css_files: [
        '/statics/profile.css',
        '/statics/train-of-thoughts.css',
        '/statics/post-list.css'
      ],
      js_files: [
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
      description: 'Browse all blog posts covering various topics and insights.',
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
      description: "Browse all posts in the #{category} category.",
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
      description: "Browse all posts tagged with ##{tag}.",
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
      description: post[:subtitle] || post[:title],
      css_files: ['/statics/post.css']
    )
  end

  def get_all_thoughts_list(page: 1, per_page: FLATTENED_THOUGHTS_PER_PAGE)
    paginated_data = paginate_thoughts(@thoughts, page, per_page)

    render_thoughts_list(
      thoughts: paginated_data[:items],
      pagination: paginated_data[:pagination],
      title: 'Train of Thoughts',
      description: 'Explore my train of thoughts - a collection of ideas and reflections.',
      heading: 'Train of Thoughts',
      base_url: '/carriages'
    )
  end

  def get_thought_fetcher
    # Build the thought location map for all thoughts
    page_map = build_thought_page_map(@thoughts, FLATTENED_THOUGHTS_PER_PAGE)

    # Build a map of thought_id => page_number
    thought_page_map = build_thought_id_to_page_map(page_map[:thoughts_by_page])

    fetcher_template = File.read(File.join(TEMPLATES_DIR, 'thought-fetcher.erb'))
    body_content = ERB.new(fetcher_template).result(binding)

    render_page(
      body_content,
      title: 'Redirecting to Thought...',
      description: 'Finding and redirecting to the specific thought in the train of thoughts.',
      css_files: ['/statics/thought-fetcher.css'],
      js_files: ['/statics/thought-fetcher.js']
    )
  end

  def get_error_html
    body_content = <<~HTML
      <div class="error-page">
        <h1 class="error-title">Error</h1>
        <p class="error-message">Something went wrong.</p>
        <a class="error-link" href="/">Go back to home</a>
      </div>
      <style>
        .error-page {
          text-align: center;
          padding: 4rem 2rem;
        }
        .error-title {
          font-size: 3rem;
          color: #c9d1d9;
          margin-bottom: 1rem;
        }
        .error-message {
          font-size: 1.25rem;
          color: #8b949e;
          margin-bottom: 2rem;
        }
        .error-link {
          color: #58a6ff;
          text-decoration: none;
        }
        .error-link:hover {
          text-decoration: underline;
        }
      </style>
    HTML

    render_page(
      body_content,
      title: 'Error',
      description: 'An error occurred.'
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

  def paginate_thoughts(thoughts, page, per_page)
    page = [page.to_i, 1].max

    # Build page mapping: assign each root thought to a page based on flattened count
    page_map = build_thought_page_map(thoughts, per_page)

    total_items = page_map[:total_count]
    total_pages = page_map[:total_pages]

    page = [page, total_pages].min

    # Get thoughts for this page
    paginated_thoughts = page_map[:thoughts_by_page][page] || []

    {
      items: paginated_thoughts,
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

  def build_thought_page_map(thoughts, per_page)
    thoughts_by_page = {}
    current_page = 1
    page_count = 0
    total_count = 0

    thoughts.each do |thought|
      # Count this thought and all its children
      thought_count = count_thought_tree(thought)

      # Start a new page only if current page already has met/exceeded limit
      if page_count >= per_page && page_count > 0
        current_page += 1
        page_count = 0
      end

      # Add thought to current page
      thoughts_by_page[current_page] ||= []
      thoughts_by_page[current_page] << thought

      # Update counters
      page_count += thought_count
      total_count += thought_count
    end

    {
      thoughts_by_page: thoughts_by_page,
      total_count: total_count,
      total_pages: current_page
    }
  end

  def count_thought_tree(thought)
    count = 1
    if thought[:childs] && !thought[:childs].empty?
      thought[:childs].each do |child|
        count += count_thought_tree(child)
      end
    end
    count
  end

  def build_thought_id_to_page_map(thoughts_by_page)
    id_to_page = {}

    thoughts_by_page.each do |page, thoughts|
      thoughts.each do |thought|
        collect_thought_ids(thought, page, id_to_page)
      end
    end

    id_to_page
  end

  def collect_thought_ids(thought, page, id_to_page)
    id_to_page[thought[:id]] = page

    if thought[:childs] && !thought[:childs].empty?
      thought[:childs].each do |child|
        collect_thought_ids(child, page, id_to_page)
      end
    end
  end

  def render_post_list(posts:, pagination:, title:, description:, heading:, base_url:)
    post_list_template = File.read(File.join(TEMPLATES_DIR, 'post-list.erb'))
    body_content = ERB.new(post_list_template).result(binding)

    render_page(
      body_content,
      title: title,
      description: description,
      css_files: ['/statics/post-list.css'],
      js_files: ['/statics/post-list.js']
    )
  end

  def render_thoughts_list(thoughts:, pagination:, title:, description:, heading:, base_url:)
    thoughts_list_template = File.read(File.join(TEMPLATES_DIR, 'thoughts-list.erb'))
    body_content = ERB.new(thoughts_list_template).result(binding)

    render_page(
      body_content,
      title: title,
      description: description,
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

  def render_page(body_content, title: 'Page', description: '', css_files: [], js_files: [])
    css_tags = css_files.map { |href| "<link rel=\"stylesheet\" href=\"#{href}\">" }.join("\n")
    js_tags = js_files.map { |src| "<script src=\"#{src}\"></script>" }.join("\n")

    footer_html = render_partial('_footer')

    description_tag = description.empty? ? '' : "<meta name=\"description\" content=\"#{description}\">"

    <<~HTML
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>#{title}</title>
        #{description_tag}
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
        <script src="/statics/_global_scripts.js"></script>
        #{js_tags}
      </body>
      </html>
    HTML
  end

  def load_train_of_thoughts
    thoughts_dir = File.expand_path('../../train-of-thoughts', __dir__)
    all_thoughts = []

    Dir.glob(File.join(thoughts_dir, '*.yaml')).sort.reverse.each do |file_path|
      data = YAML.load_file(file_path)
      if data && data['contents']
        all_thoughts.concat(parse_thoughts(data['contents'], is_root: true))
      end
    end

    # Sort by timestamp, most recent first (root level only)
    @thoughts = all_thoughts.sort_by { |t| -t[:ts_unix] }
  end

  def parse_thoughts(contents, is_root: false)
    thoughts = contents.map do |item|
      thought = {
        content: item['content'],
        ts_unix: item['ts_unix'],
        id: Digest::SHA256.hexdigest("#{item['content']}#{item['ts_unix']}")
      }

      if item['childs'] && !item['childs'].empty?
        # Children are always sorted oldest first
        thought[:childs] = parse_thoughts(item['childs'], is_root: false)
      end

      thought
    end

    # Only sort newest first if this is root level, otherwise keep oldest first
    is_root ? thoughts.sort_by { |t| -t[:ts_unix] } : thoughts.sort_by { |t| t[:ts_unix] }
  end

  def calculate_total_pages
    # Calculate total pages for posts
    total_posts = @posts.length
    @total_posts_pages = total_posts > 0 ? (total_posts.to_f / POSTS_PER_PAGE).ceil : 1

    # Calculate total pages for thoughts
    page_map = build_thought_page_map(@thoughts, FLATTENED_THOUGHTS_PER_PAGE)
    @total_thoughts_pages = page_map[:total_pages]
  end
end
