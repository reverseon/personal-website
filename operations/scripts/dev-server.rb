#!/usr/bin/env ruby

require 'webrick'
require 'github/markup'
require_relative '../renderer/main'

PORT = 3000
STATICS_PATH = File.expand_path('../../statics', __dir__)
renderer = Renderer.new

server = WEBrick::HTTPServer.new(Port: PORT)

server.mount '/statics', WEBrick::HTTPServlet::FileHandler, STATICS_PATH

server.mount_proc '/' do |req, res|
  path = req.path

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
    category = $1
    page = $2.to_i
    res.body = renderer.get_category_post_list(category, page: page)

  when %r{^/posts/tag/([^/]+)/(\d+)\.html$}
    # Matches: /posts/tag/ruby/1.html, /posts/tag/ruby/2.html
    tag = $1
    page = $2.to_i
    res.body = renderer.get_tags_post_list(tag, page: page)

  else
    res.status = 404
    res.body = '<h1>404 - Not Found</h1>'
  end
end

trap('INT') { server.shutdown }

puts "Server starting on http://localhost:#{PORT}"
puts "Serving static files from: #{STATICS_PATH}"
puts "Press Ctrl+C to stop"

server.start
