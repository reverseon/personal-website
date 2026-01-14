# frozen_string_literal: true

namespace :dev do
  desc "Run the development server"
  task :run do
    ruby "operations/scripts/dev-server.rb"
  end
end

namespace :test do
  desc "Run the test before deploying to production"

  desc "Build HTML and serve with nginx in Docker on localhost:3001"
  task :'build-and-deploy' do
    # Build the static HTML
    puts "Building static HTML..."
    ruby "operations/scripts/build-html.rb"

    # Setup paths
    build_dir = File.expand_path('build', __dir__)

    # Create nginx config with error page
    nginx_config = <<~NGINX
      server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        error_page 404 /error.html;

        location / {
          try_files $uri $uri/ =404;
        }
      }
    NGINX

    nginx_conf_path = File.join(build_dir, 'nginx.conf')
    File.write(nginx_conf_path, nginx_config)

    puts "\nStarting nginx in Docker on http://localhost:3001"
    puts "Serving from: #{build_dir}"
    puts "Press Ctrl+C to stop"

    # Run nginx in Docker with custom config
    exec "docker run --rm -p 3001:80 -v #{build_dir}:/usr/share/nginx/html:ro -v #{nginx_conf_path}:/etc/nginx/conf.d/default.conf:ro nginx:alpine"
  end
end

namespace :prod do
  desc "Build HTML and deploy to S3 bucket (requires ishiori1gp AWS profile)"
  task :'build-and-deploy' do
    s3_bucket = "reverseon-personal-website-bucket"
    aws_profile = "ishiori1gp"

    # Verify AWS credentials
    puts "Verifying AWS credentials for profile '#{aws_profile}'..."
    unless system("aws --profile #{aws_profile} sts get-caller-identity > /dev/null 2>&1")
      abort "Error: Not logged in to AWS profile '#{aws_profile}'. Please run 'aws sso login --profile #{aws_profile}' first."
    end
    puts "AWS credentials verified."

    # Build the static HTML
    puts "\nBuilding static HTML..."
    ruby "operations/scripts/build-html.rb"

    build_dir = File.expand_path('build', __dir__)

    # Sync to S3
    puts "\nDeploying to S3 bucket: #{s3_bucket}..."
    unless system("aws --profile #{aws_profile} s3 sync #{build_dir} s3://#{s3_bucket} --delete")
      abort "Error: Failed to sync to S3"
    end

    puts "\nDeployment complete!"
  end
end