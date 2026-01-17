## What 

A static site generator for a personal blog written in Ruby. The site supports blog posts (with categories/tags), a "train of thoughts" feature for short notes with nested children, and generates static HTML files for deployment.

## Development Commands

### Local Development
```bash
# Start development server on http://localhost:3000
rake dev:run
```

### Testing Deployment
```bash
# Build static HTML and serve with nginx in Docker on http://localhost:3001
rake test:build-and-deploy
```

### Production Deployment
```bash
# Build and deploy to S3 (requires AWS profile "ishiori1gp")
# Will prompt to login if not authenticated
rake prod:build-and-deploy
```

### Direct Scripts
```bash
# Run development server directly
ruby operations/scripts/dev-server.rb

# Build static HTML directly
ruby operations/scripts/build-html.rb
```

## Architecture

### Core Components

**Renderer (`operations/renderer/main.rb`)**
- Central class that orchestrates all HTML generation
- Loads and parses metadata from markdown posts and YAML thought files
- Handles pagination for posts and thoughts (hierarchical pagination for thoughts)
- Renders ERB templates with appropriate data
- Key constants: `POSTS_PER_PAGE = 5`, `FLATTENED_THOUGHTS_PER_PAGE = 150`

**Dev Server (`operations/scripts/dev-server.rb`)**
- WEBrick server that dynamically renders pages on each request
- Routes are defined inline using pattern matching
- Serves static files from `/statics` directory
- Runs on port 3000

**Build Script (`operations/scripts/build-html.rb`)**
- Pre-generates all static HTML pages to `build/` directory
- Builds: home, post lists, category/tag pages, individual posts, thought pages, error page
- Copies static assets to build directory

### Content Structure

**Blog Posts (`posts/*.md`)**
Posts use markdown with a special metadata block:
```markdown
<!---META
title: Post Title
subtitle: Optional subtitle
slug: url-friendly-slug
published_unix: 1234567890
image_preview: /statics/media/image.png
categories: [Category1, Category2]
tags: [tag1, tag2]
--->

# Markdown content here
```
- `image_preview` is optional and used for OpenGraph/Twitter card images

**Train of Thoughts (`train-of-thoughts/*.yaml`)**
YAML files (named by date, e.g., `2026-01.yaml`) with hierarchical structure:
```yaml
contents:
  - content: |
      Parent thought content
    ts_unix: 1234567890
    childs:
      - content: |
          Child thought content
        ts_unix: 1234567891
```
- Root thoughts sorted newest first
- Child thoughts sorted oldest first (chronological order within thread)
- Each thought gets a SHA256 hash ID based on content + timestamp
- Pagination counts flattened tree structure

### Templates (`templates/*.erb`)

- `profile.erb` - Home page profile section
- `home-train-of-thoughts.erb` - Recent thoughts on home page
- `home-article-list.erb` - Recent posts on home page
- `post-list.erb` - Post list page
- `thoughts-list.erb` - Thoughts list page
- `post.erb` - Individual post page
- `thought-fetcher.erb` - Redirect page for direct thought links
- `_footer.erb`, `_pagination.erb`, `_post_item.erb`, `_train-of-thoughts-content.erb` - Reusable partials

Templates access variables directly from the Renderer's binding. Use `render_partial(name, locals)` for partials.

### Static Assets (`statics/`)

- `assets/` - CSS and JavaScript files
  - `_global_styles.css`, `_global_scripts.js` - Included on every page
  - Page-specific CSS/JS files (e.g., `post.css`, `post.js`, `train-of-thoughts.js`)
- `media/` - Images and other media files (e.g., `profile.png`, `favicon.svg`)
- Files are copied as-is to build output

### URL Structure

- `/` - Home page (profile + recent thoughts + recent posts)
- `/posts/{page}.html` - All posts, paginated
- `/posts/category/{category}/{page}.html` - Posts by category
- `/posts/tag/{tag}/{page}.html` - Posts by tag
- `/post/{slug}.html` - Individual post
- `/carriages/{page}.html` - All thoughts ("carriages" metaphor for train)
- `/carriages/fetcher.html?id={thought_id}` - Redirects to page containing specific thought
- `/error.html` - 404 error page

## Development Workflow

1. **Adding a post**: Create a markdown file in `posts/` with the required metadata block
2. **Adding thoughts**: Edit/create YAML files in `train-of-thoughts/` following the date-based naming convention
3. **Modifying templates**: Edit ERB files in `templates/`
4. **Testing locally**: Use `rake dev:run` for live development with auto-rendering
5. **Testing build**: Use `rake test:build-and-deploy` to verify static generation works correctly
6. **Deploying**: Use `rake prod:build-and-deploy` to build and sync to S3

## Important Implementation Details

### Thought Pagination Algorithm
Thoughts pagination is hierarchical - entire thought trees (parent + all children) stay together on the same page. The algorithm:
1. Counts flattened size of each thought tree (parent + all descendants)
2. Assigns trees to pages such that each page has approximately `FLATTENED_THOUGHTS_PER_PAGE` items
3. Builds a map of thought IDs to page numbers for the fetcher redirect functionality

### Post Metadata Extraction
The `extract_metadata` method parses the `<!---META ... --->` block using regex to extract title, slug, categories, tags, etc. It validates for duplicate slugs across all posts.

### Template Rendering
The `render_page` method wraps body content in a complete HTML document with:
- Global CSS (including GitHub markdown styles from CDN)
- Page-specific CSS/JS files
- Footer partial
- SEO meta tags (description, OpenGraph, Twitter cards)

### Custom Markdown Syntax
The renderer supports custom comment-style syntax that gets converted to HTML:

**Ruby Annotations** (furigana for Japanese text):
```
RUBY{漢字|かん.じ}
```
- Converts to `<ruby>` elements with readings above each character
- Dot-separated readings map to each base character
- Wrapped in `<span class="rg">` for grouped hover behavior

**Translator's Notes**:
```
<!--TLN Your note here -->
```
- Converts to `<aside class="tln-footnote">` elements
- Supports multiline notes

## Dependencies

- `github-markup` - Markdown rendering using GitHub's engine
- `commonmarker` - CommonMark parser (used by github-markup)
- `webrick` - Development server
- `rake` - Task runner
- `erb` - Template engine (stdlib)
- `yaml` - YAML parsing (stdlib)
