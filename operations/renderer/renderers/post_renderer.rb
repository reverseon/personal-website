module PostRenderer
  def get_all_post_list(page: 1, per_page: Renderer::POSTS_PER_PAGE)
    sorted_posts = @posts.sort_by { |post| -post[:published_unix] }
    paginated_data = Paginator.paginate(sorted_posts, page, per_page)

    render_post_list(
      posts: paginated_data[:items],
      pagination: paginated_data[:pagination],
      title: 'All Posts',
      description: 'Browse all blog posts covering various topics and insights.',
      heading: 'All Posts',
      base_url: '/posts'
    )
  end

  def get_category_post_list(category, page: 1, per_page: Renderer::POSTS_PER_PAGE)
    filtered_posts = @posts
      .select { |post| post[:categories].any? { |cat| cat.downcase == category.downcase } }
      .sort_by { |post| -post[:published_unix] }

    paginated_data = Paginator.paginate(filtered_posts, page, per_page)

    render_post_list(
      posts: paginated_data[:items],
      pagination: paginated_data[:pagination],
      title: "Category: #{category}",
      description: "Browse all posts in the #{category} category.",
      heading: "Posts in Category: #{category}",
      base_url: "/posts/category/#{category}"
    )
  end

  def get_tags_post_list(tag, page: 1, per_page: Renderer::POSTS_PER_PAGE)
    filtered_posts = @posts
      .select { |post| post[:tags].any? { |t| t.downcase == tag.downcase } }
      .sort_by { |post| -post[:published_unix] }

    paginated_data = Paginator.paginate(filtered_posts, page, per_page)

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

    # Render markdown to HTML using CommonMarker with GitHub-flavored extensions
    post_html = Commonmarker.to_html(
      markdown_content,
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

    # Render the post template
    post_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'posts/single.erb'))
    body_content = ERB.new(post_template).result(binding)

    render_opts = {
      title: post[:title],
      description: post[:subtitle] || post[:title],
      css_files: ['/statics/css/components/post.css'],
      js_files: ['/statics/js/components/post.js']
    }
    render_opts[:image] = post[:image_preview] if post[:image_preview]

    render_page(body_content, **render_opts)
  end

  private

  def render_post_list(posts:, pagination:, title:, description:, heading:, base_url:)
    post_list_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'posts/list.erb'))
    body_content = ERB.new(post_list_template).result(binding)

    render_page(
      body_content,
      title: title,
      description: description,
      css_files: ['/statics/css/components/post-list.css'],
      js_files: ['/statics/js/components/post-list.js']
    )
  end
end
