import { useNavigate } from '@tanstack/react-router'
import { Profile } from './components/Profile'
import { MastodonFeed } from './components/MastodonFeed'
import { BlogFeed } from './components/blog/Feed'
import './App.css'

function App() {
  const navigate = useNavigate()

  const handlePageChange = (page: number) => {
    navigate({ to: '/posts/$page', params: { page: String(page) } })
  }

  return (
    <div className="app-container">
      <div className="app-sidebar">
        <Profile />
      </div>
      <div className="app-main">
        <MastodonFeed />
        <div className="blog-section">
          <h2 className="blog-heading">
            Blog Posts
          </h2>
          <div className="blog-feed-list">
            <BlogFeed maxResults={3} currentPage={1} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
