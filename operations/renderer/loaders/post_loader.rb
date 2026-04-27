class PostLoader
  def self.load_posts(posts_dir)
    posts = []
    all_categories = []
    all_tags = []
    slugs = []

    Dir.glob(File.join(posts_dir, '*.md')).each do |file_path|
      content = File.read(file_path)

      if content =~ /<!---META\n(.*?)\n--->/m
        metadata_text = $1
        metadata = {}

        metadata[:title] = $1.strip if metadata_text =~ /title:\s*(.+)/
        metadata[:subtitle] = $1.strip if metadata_text =~ /subtitle:\s*(.+)/
        metadata[:slug] = $1.strip if metadata_text =~ /slug:\s*(.+)/
        metadata[:published_unix] = $1.strip.to_i if metadata_text =~ /published_unix:\s*(\d+)/
        metadata[:image_preview] = $1.strip if metadata_text =~ /image_preview:\s*(.+)/

        if metadata_text =~ /categories:\s*\[(.*?)\]/
          metadata[:categories] = $1.split(',').map(&:strip)
          all_categories.concat(metadata[:categories])
        else
          metadata[:categories] = []
        end

        if metadata_text =~ /tags:\s*\[(.*?)\]/
          metadata[:tags] = $1.split(',').map(&:strip)
          all_tags.concat(metadata[:tags])
        else
          metadata[:tags] = []
        end

        metadata[:file_path] = file_path
        metadata[:filename] = File.basename(file_path)

        if metadata[:slug]
          if slugs.include?(metadata[:slug])
            raise "Duplicate slug found: '#{metadata[:slug]}' in #{file_path}"
          end
          slugs << metadata[:slug]
        end

        posts << metadata
      end
    end

    {
      posts: posts,
      categories: all_categories.uniq.sort,
      tags: all_tags.uniq.sort
    }
  end
end
