import { useNavigate } from '@tanstack/react-router'
import { Profile } from './components/Profile'
import { MastodonFeed } from './components/MastodonFeed'
import { BlogFeed } from './components/blog/Feed'

function App() {
  const navigate = useNavigate()

  const handlePageChange = (page: number) => {
    navigate({ to: '/posts/$page', params: { page: String(page) } })
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem', display: 'flex', gap: '2rem' }}>
      <div style={{ flex: '0 0 300px', position: 'sticky', top: '1rem', height: 'fit-content' }}>
        <Profile />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <MastodonFeed />
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '2px solid #1890ff', paddingBottom: '0.5rem', display: 'inline-block' }}>Blog Posts</h2>
          <div style={{ marginTop: '1rem' }}>
            <BlogFeed maxResults={3} currentPage={1} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
