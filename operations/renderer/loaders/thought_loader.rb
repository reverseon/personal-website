require 'yaml'
require 'digest'

class ThoughtLoader
  def self.load_thoughts(thoughts_dir)
    all_thoughts = []

    Dir.glob(File.join(thoughts_dir, '*.yaml')).sort.reverse.each do |file_path|
      data = YAML.load_file(file_path)
      if data && data['contents']
        all_thoughts.concat(parse_thoughts(data['contents'], is_root: true))
      end
    end

    # Sort by timestamp, most recent first (root level only)
    all_thoughts.sort_by { |t| -t[:ts_unix] }
  end

  def self.parse_thoughts(contents, is_root: false)
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
end
