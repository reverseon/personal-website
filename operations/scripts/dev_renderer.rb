#!/usr/bin/env ruby

require 'webrick'
require 'github/markup'
require 'erb'

PORT = 3000
PROFILE_PATH = File.expand_path('../../specials/profile.html', __dir__)
HOME_ARTICLE_LIST_PATH = File.expand_path('../../specials/home-article-list.erb', __dir__)
STATICS_PATH = File.expand_path('../../statics', __dir__)

server = WEBrick::HTTPServer.new(Port: PORT)

server.mount '/statics', WEBrick::HTTPServlet::FileHandler, STATICS_PATH

server.mount_proc '/' do |req, res|
  profile_html = File.read(PROFILE_PATH)
  erb_template = File.read(HOME_ARTICLE_LIST_PATH)
  article_list_html = ERB.new(erb_template).result

  res['Content-Type'] = 'text/html'
  html_content = <<~HTML
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile Preview</title>
      <link rel="stylesheet" href="/statics/_style.css">
      <link rel="stylesheet" href="/statics/profile.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown-dark.css">
    </head>
    <body>
      <article class="markdown-body" style="box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px;">
        #{profile_html}
        #{article_list_html}
      </article>
    </body>
    <script src="/statics/profile.js"></script>
    </html>
  HTML

  res.body = html_content
end

trap('INT') { server.shutdown }

puts "Server starting on http://localhost:#{PORT}"
puts "Serving profile from: #{PROFILE_PATH}"
puts "Serving static files from: #{STATICS_PATH}"
puts "Press Ctrl+C to stop"

server.start
