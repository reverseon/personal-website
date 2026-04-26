module ThoughtRenderer
  def get_all_thoughts_list(page: 1, per_page: Renderer::FLATTENED_THOUGHTS_PER_PAGE)
    paginated_data = Paginator.paginate_thoughts(@thoughts, page, per_page)

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
    page_map = Paginator.build_thought_page_map(@thoughts, Renderer::FLATTENED_THOUGHTS_PER_PAGE)

    # Build a map of thought_id => page_number
    thought_page_map = Paginator.build_thought_id_to_page_map(page_map[:thoughts_by_page])

    fetcher_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'thoughts/fetcher.erb'))
    body_content = ERB.new(fetcher_template).result(binding)

    render_page(
      body_content,
      title: 'Redirecting to Thought...',
      description: 'Finding and redirecting to the specific thought in the train of thoughts.',
      css_files: ['/statics/css/components/thought-fetcher.css'],
      js_files: ['/statics/js/components/thought-fetcher.js']
    )
  end

  def get_thought_by_id(id)
    thought = find_thought_recursive(@thoughts, id)
    return get_error_html if thought.nil?

    individual_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'thoughts/individual.erb'))
    body_content = ERB.new(individual_template).result(binding)

    render_page(
      body_content,
      title: "Thought | ReverseON",
      description: thought[:content][0..160],
      css_files: ['/statics/css/components/train-of-thoughts.css'],
      js_files: ['/statics/js/components/share-btn.js', '/statics/js/components/train-of-thoughts.js']
    )
  end

  private

  def find_thought_recursive(thoughts, id)
    thoughts.each do |thought|
      return thought if thought[:id] == id
      if thought[:childs]
        found = find_thought_recursive(thought[:childs], id)
        return found if found
      end
    end
    nil
  end

  def render_thoughts_list(thoughts:, pagination:, title:, description:, heading:, base_url:)
    thoughts_list_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'thoughts/list.erb'))
    body_content = ERB.new(thoughts_list_template).result(binding)

    render_page(
      body_content,
      title: title,
      description: description,
      css_files: ['/statics/css/components/train-of-thoughts.css'],
      js_files: ['/statics/js/components/share-btn.js', '/statics/js/components/train-of-thoughts.js']
    )
  end
end
