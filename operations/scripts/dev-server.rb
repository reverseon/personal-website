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
  res['Content-Type'] = 'text/html'
  res.body = renderer.get_profile_html
end

trap('INT') { server.shutdown }

puts "Server starting on http://localhost:#{PORT}"
puts "Serving static files from: #{STATICS_PATH}"
puts "Press Ctrl+C to stop"

server.start
