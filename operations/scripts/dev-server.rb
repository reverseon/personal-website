#!/usr/bin/env ruby

require 'webrick'
require 'uri'
require 'github/markup'
require_relative '../renderer/main'

PORT = 3000
STATICS_PATH = File.expand_path('../../statics', __dir__)
RENDERER_PATH = File.expand_path('../renderer/main.rb', __dir__)

def load_renderer
  # Remove the cached require so it reloads
  $LOADED_FEATURES.delete(RENDERER_PATH)
  load RENDERER_PATH
  Renderer.new
end

server = WEBrick::HTTPServer.new(Port: PORT)

server.mount '/statics', WEBrick::HTTPServlet::FileHandler, STATICS_PATH

server.mount_proc '/' do |req, res|
  path = req.path
  renderer = load_renderer  # Reload on each request

  res['Content-Type'] = 'text/html'

  case path
  when '/'
    res.body = renderer.get_profile_html

  when %r{^/posts/(\d+)\.html$}
    # Matches: /posts/1.html, /posts/2.html, etc.
    page = $1.to_i
    res.body = renderer.get_all_post_list(page: page)

  when %r{^/posts/category/([^/]+)/(\d+)\.html$}
    # Matches: /posts/category/Tutorial/1.html, /posts/category/Tutorial/2.html
    category = URI.decode_www_form_component($1).force_encoding('UTF-8')
    page = $2.to_i
    res.body = renderer.get_category_post_list(category, page: page)

  when %r{^/posts/tag/([^/]+)/(\d+)\.html$}
    # Matches: /posts/tag/ruby/1.html, /posts/tag/ruby/2.html
    tag = URI.decode_www_form_component($1).force_encoding('UTF-8')
    page = $2.to_i
    res.body = renderer.get_tags_post_list(tag, page: page)

  when %r{^/post/([^/]+)\.html$}
    # Matches: /post/my-blog-post.html
    slug = URI.decode_www_form_component($1).force_encoding('UTF-8')
    begin
      res.body = renderer.get_post_by_slug(slug)
    rescue => e
      res.status = 404
      res.body = renderer.get_error_html
    end

  when %r{^/carriages/(\d+)\.html$}
    # Matches: /carriages/1.html, /carriages/2.html, etc.
    page = $1.to_i
    res.body = renderer.get_all_thoughts_list(page: page)

  when '/carriages/fetcher.html'
    # Matches: /carriages/fetcher.html?id=xxx
    res.body = renderer.get_thought_fetcher

  else
    res.status = 404
    res.body = renderer.get_error_html
  end
end

trap('INT') { server.shutdown }

puts "Server starting on http://localhost:#{PORT}"
puts "Serving static files from: #{STATICS_PATH}"
puts "Press Ctrl+C to stop"

server.start
