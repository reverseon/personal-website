import { useQuery } from '@tanstack/react-query'
import { Spin, Empty, Alert, Typography, Modal } from 'antd'
import { useState } from 'react'

const { Text } = Typography

export function MastodonFeed() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [linkHover, setLinkHover] = useState(false)
  const { data: xmlData, isLoading, error } = useQuery({
    queryKey: ['mastodon-rss'],
    queryFn: async () => {
      const response = await fetch('https://mastodon.social/@kuusourevie.rss')
      if (!response.ok) throw new Error('Failed to fetch RSS')
      return response.text()
    },
  })

  const parsedFeed = xmlData
    ? (() => {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlData, 'text/xml')

        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
          return null
        }

        const channel = xmlDoc.querySelector('channel')
        if (!channel) return null

        const feedTitle = channel.querySelector('title')?.textContent || ''
        const feedDescription = channel.querySelector('description')?.textContent || ''
        const feedImage = channel.querySelector('image > url')?.textContent || ''

        const items = Array.from(channel.querySelectorAll('item')).map(item => {
          const mediaContents = Array.from(item.querySelectorAll('[url]'))
          return {
            title: item.querySelector('description')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || '',
            images: mediaContents.map(el => el.getAttribute('url')).filter(Boolean) as string[],
          }
        })

        return { feedTitle, feedDescription, feedImage, items }
      })()
    : null

  return (
    <>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spin />
        </div>
      )}

      {error && (
        <Alert
          message="Error loading feed"
          description={error.message}
          type="error"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}

      {parsedFeed && (
        <div style={{ position: 'relative', paddingLeft: '2rem', paddingTop: '1.5rem' }}>
          <div
            style={{
              position: 'absolute',
              left: '0.5rem',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#d9d9d9',
            }}
          />
          {parsedFeed.items.slice(0, 5).map((item, idx) => (
            <div key={idx} style={{ marginBottom: '1rem', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-1.65rem',
                  top: '0.5rem',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#1890ff',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 2px #d9d9d9',
                }}
              />
              {item.images.length > 0 && (
                <div
                  style={{
                    marginBottom: '0.5rem',
                    display: 'grid',
                    gridTemplateColumns:
                      item.images.length === 1 ? '1fr' :
                      item.images.length === 2 ? 'repeat(2, 1fr)' :
                      item.images.length === 3 ? 'repeat(3, 1fr)' :
                      item.images.length === 4 ? 'repeat(2, 1fr)' :
                      'repeat(3, 1fr)',
                    gap: '4px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  {item.images.map((image, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={image}
                      alt=""
                      onClick={() => setSelectedImage(image)}
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                        display: 'block',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              )}
              <div
                style={{ marginBottom: '0.2rem', lineHeight: '1.6', fontSize: '0.9rem' }}
                dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(item.title) }}
              />
              <Text type="secondary" style={{ fontSize: '0.85rem', display: 'block', textAlign: 'right' }}>
                {new Date(item.pubDate).toLocaleString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
          ))}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              <a
                href="https://mastodon.social/@kuusourevie"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setLinkHover(true)}
                onMouseLeave={() => setLinkHover(false)}
                style={{
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: linkHover ? 'underline' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                See more at @kuusourevie@mastodon.social
              </a>
            </Text>
          </div>
        </div>
      )}

      {parsedFeed && parsedFeed.items.length === 0 && <Empty description="No posts found" />}

      <Modal
        open={!!selectedImage}
        onCancel={() => setSelectedImage(null)}
        footer={null}
        width="auto"
        style={{ maxWidth: '90vw' }}
      >
        {selectedImage && (
          <img src={selectedImage} alt="" style={{ width: '100%', borderRadius: '6px' }} />
        )}
      </Modal>
    </>
  )
}

function decodeHtmlEntities(text: string) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  const decoded = textarea.value
  return decoded.replace(/^<p>|<\/p>$/g, '').trim()
}
