module ErrorRenderer
  def get_error_html
    body_content = <<~HTML
      <div class="error-page">
        <h1 class="error-title">Error</h1>
        <p class="error-message">Something went wrong.</p>
        <a class="nav-link nav-link--prev" href="/#">
          <i data-lucide="arrow-left"></i> Go back to home
        </a>
      </div>
      <style>
        .error-page {
          text-align: center;
          padding: 4rem 2rem;
        }
        .error-title {
          font-size: 3rem;
          color: #c9d1d9;
          margin-bottom: 1rem;
        }
        .error-message {
          font-size: 1.25rem;
          color: #8b949e;
          margin-bottom: 2rem;
        }
      </style>
    HTML

    render_page(
      body_content,
      title: 'Error',
      description: 'An error occurred.'
    )
  end
end
