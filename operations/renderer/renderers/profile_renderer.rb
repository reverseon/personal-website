module ProfileRenderer
  def get_profile_html
    categories = @categories
    tags = @tags
    thoughts = @thoughts

    profile_erb_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'home/profile.erb'))
    profile_html = ERB.new(profile_erb_template).result

    train_of_thoughts_erb_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'home/_train-of-thoughts.erb'))
    train_of_thoughts_html = ERB.new(train_of_thoughts_erb_template).result(binding)

    article_list_erb_template = File.read(File.join(Renderer::TEMPLATES_DIR, 'home/_article-list.erb'))
    article_list_html = ERB.new(article_list_erb_template).result(binding)

    body_content = <<~BODY
      #{profile_html}
      #{train_of_thoughts_html}
      #{article_list_html}
    BODY

    render_page(
      body_content,
      title: 'ReverseON - Thirafi Najwan Kurniatama',
      description: 'Personal blog with my short bio, some notes, and my random thoughts.',
      image: '/statics/media/profile.png',
      css_files: [
        '/statics/css/components/profile.css',
        '/statics/css/components/train-of-thoughts.css',
        '/statics/css/components/post-list.css'
      ],
      js_files: [
        '/statics/js/components/share-btn.js',
        '/statics/js/components/train-of-thoughts.js',
        '/statics/js/components/post-list.js'
      ]
    )
  end
end
