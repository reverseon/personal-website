import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Profile } from './components/Profile'
import { MastodonFeed } from './components/MastodonFeed'
import { BlogFeed } from './components/blog/Feed'
import { Meta } from './components/Meta'
import { usePageTitle } from './hooks/usePageTitle'
import { metadata, getMastodonProfileImage } from './utils/seo'
import type { MetaData } from './utils/seo'
import './App.css'

function App() {
  usePageTitle('ReverseON')
  const navigate = useNavigate()
  const [homeMetadata, setHomeMetadata] = useState<MetaData>(metadata.home)

  useEffect(() => {
    const fetchMastodonImage = async () => {
      const image = await getMastodonProfileImage()
      setHomeMetadata(prev => ({ ...prev, image }))
    }
    fetchMastodonImage()
  }, [])

  const handlePageChange = (page: number) => {
    navigate({ to: '/posts/$page', params: { page: String(page) } })
  }

  return (
    <>
      <Meta data={homeMetadata} />
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
    </>
  )
}

export default App
