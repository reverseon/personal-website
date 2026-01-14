#!/usr/bin/env ruby

require_relative '../renderer/main'
require 'fileutils'

BUILD_DIR = File.expand_path('../../build', __dir__)

# Clean and create build directory
FileUtils.rm_rf(BUILD_DIR)
FileUtils.mkdir_p(BUILD_DIR)

puts "Building static site to #{BUILD_DIR}..."

renderer = Renderer.new

# Build home page
puts "Building home page..."
File.write(File.join(BUILD_DIR, 'index.html'), renderer.get_profile_html)

# Build all posts pages
puts "Building posts pages..."
FileUtils.mkdir_p(File.join(BUILD_DIR, 'posts'))
(1..renderer.total_posts_pages).each do |page|
  html = renderer.get_all_post_list(page: page)
  File.write(File.join(BUILD_DIR, 'posts', "#{page}.html"), html)
end

# Build category pages
puts "Building category pages..."
renderer.categories.each do |category|
  category_dir = File.join(BUILD_DIR, 'posts', 'category', category.downcase)
  FileUtils.mkdir_p(category_dir)

  # Determine how many pages this category needs
  category_posts = renderer.posts.select { |post| post[:categories].any? { |cat| cat.downcase == category.downcase } }
  category_pages = category_posts.length > 0 ? (category_posts.length.to_f / Renderer::POSTS_PER_PAGE).ceil : 1

  (1..category_pages).each do |page|
    html = renderer.get_category_post_list(category, page: page)
    File.write(File.join(category_dir, "#{page}.html"), html)
  end
end

# Build tag pages
puts "Building tag pages..."
renderer.tags.each do |tag|
  tag_dir = File.join(BUILD_DIR, 'posts', 'tag', tag.downcase)
  FileUtils.mkdir_p(tag_dir)

  # Determine how many pages this tag needs
  tag_posts = renderer.posts.select { |post| post[:tags].any? { |t| t.downcase == tag.downcase } }
  tag_pages = tag_posts.length > 0 ? (tag_posts.length.to_f / Renderer::POSTS_PER_PAGE).ceil : 1

  (1..tag_pages).each do |page|
    html = renderer.get_tags_post_list(tag, page: page)
    File.write(File.join(tag_dir, "#{page}.html"), html)
  end
end

# Build individual post pages
puts "Building individual posts..."
FileUtils.mkdir_p(File.join(BUILD_DIR, 'post'))
renderer.posts.each do |post|
  html = renderer.get_post_by_slug(post[:slug])
  File.write(File.join(BUILD_DIR, 'post', "#{post[:slug]}.html"), html)
end

# Build thoughts/carriages pages
puts "Building thoughts pages..."
FileUtils.mkdir_p(File.join(BUILD_DIR, 'carriages'))
(1..renderer.total_thoughts_pages).each do |page|
  html = renderer.get_all_thoughts_list(page: page)
  File.write(File.join(BUILD_DIR, 'carriages', "#{page}.html"), html)
end

# Build thought fetcher page
puts "Building thought fetcher page..."
html = renderer.get_thought_fetcher
File.write(File.join(BUILD_DIR, 'carriages', 'fetcher.html'), html)

# Build error page
puts "Building error page..."
File.write(File.join(BUILD_DIR, 'error.html'), renderer.get_error_html)

# Copy statics directory
puts "Copying static files..."
statics_source = File.expand_path('../../statics', __dir__)
statics_dest = File.join(BUILD_DIR, 'statics')
FileUtils.cp_r(statics_source, statics_dest)

puts "\n✓ Build complete!"
puts "Output directory: #{BUILD_DIR}"
puts "Total files generated:"
puts "  - 1 home page"
puts "  - #{renderer.total_posts_pages} posts list pages"
puts "  - #{renderer.categories.length} categories with pages"
puts "  - #{renderer.tags.length} tags with pages"
puts "  - #{renderer.posts.length} individual posts"
puts "  - #{renderer.total_thoughts_pages} thoughts list pages"
puts "  - 1 thought fetcher page"
puts "  - 1 error page"
puts "  - Static assets copied"
