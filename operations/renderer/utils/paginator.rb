module Paginator
  def self.paginate(items, page, per_page)
    page = [page.to_i, 1].max
    total_items = items.length
    total_pages = (total_items.to_f / per_page).ceil
    total_pages = [total_pages, 1].max

    page = [page, total_pages].min

    offset = (page - 1) * per_page
    paginated_items = items[offset, per_page] || []

    {
      items: paginated_items,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        per_page: per_page,
        total_items: total_items,
        has_prev: page > 1,
        has_next: page < total_pages
      }
    }
  end

  def self.paginate_thoughts(thoughts, page, per_page)
    page = [page.to_i, 1].max

    # Build page mapping: assign each root thought to a page based on flattened count
    page_map = build_thought_page_map(thoughts, per_page)

    total_items = page_map[:total_count]
    total_pages = page_map[:total_pages]

    page = [page, total_pages].min

    # Get thoughts for this page
    paginated_thoughts = page_map[:thoughts_by_page][page] || []

    {
      items: paginated_thoughts,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        per_page: per_page,
        total_items: total_items,
        has_prev: page > 1,
        has_next: page < total_pages
      }
    }
  end

  def self.build_thought_page_map(thoughts, per_page)
    thoughts_by_page = {}
    current_page = 1
    page_count = 0
    total_count = 0

    thoughts.each do |thought|
      # Count this thought and all its children
      thought_count = count_thought_tree(thought)

      # Start a new page only if current page already has met/exceeded limit
      if page_count >= per_page && page_count > 0
        current_page += 1
        page_count = 0
      end

      # Add thought to current page
      thoughts_by_page[current_page] ||= []
      thoughts_by_page[current_page] << thought

      # Update counters
      page_count += thought_count
      total_count += thought_count
    end

    {
      thoughts_by_page: thoughts_by_page,
      total_count: total_count,
      total_pages: current_page
    }
  end

  def self.count_thought_tree(thought)
    count = 1
    if thought[:childs] && !thought[:childs].empty?
      thought[:childs].each do |child|
        count += count_thought_tree(child)
      end
    end
    count
  end

  def self.build_thought_id_to_page_map(thoughts_by_page)
    id_to_page = {}

    thoughts_by_page.each do |page, thoughts|
      thoughts.each do |thought|
        collect_thought_ids(thought, page, id_to_page)
      end
    end

    id_to_page
  end

  def self.collect_thought_ids(thought, page, id_to_page)
    id_to_page[thought[:id]] = page

    if thought[:childs] && !thought[:childs].empty?
      thought[:childs].each do |child|
        collect_thought_ids(child, page, id_to_page)
      end
    end
  end
end
