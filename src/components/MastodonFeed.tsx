import { useQuery } from '@tanstack/react-query'
import { Spin, Empty, Alert, Typography, Modal } from 'antd'
import { useState } from 'react'
import './MastodonFeed.css'

const { Text } = Typography

function getImageGridClass(count: number): string {
  if (count === 1) return 'mastodon-item-images--1'
  if (count === 2) return 'mastodon-item-images--2'
  if (count === 3) return 'mastodon-item-images--3'
  if (count === 4) return 'mastodon-item-images--4'
  return 'mastodon-item-images--5plus'
}

export function MastodonFeed() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
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
        <div className="mastodon-loading">
          <Spin />
        </div>
      )}

      {error && (
        <Alert
          message="Error loading feed"
          description={error.message}
          type="error"
          showIcon
          className="mastodon-error"
        />
      )}

      {parsedFeed && (
        <div className="mastodon-feed">
          <div className="mastodon-timeline-line" />
          {parsedFeed.items.slice(0, 5).map((item, idx) => (
            <div key={idx} className="mastodon-item">
              <div className="mastodon-item-dot" />
              {item.images.length > 0 && (
                <div className={`mastodon-item-images ${getImageGridClass(item.images.length)}`}>
                  {item.images.map((image, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={image}
                      alt=""
                      onClick={() => setSelectedImage(image)}
                      className="mastodon-item-image"
                    />
                  ))}
                </div>
              )}
              <div
                className="mastodon-item-title"
                dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(item.title) }}
              />
              <Text type="secondary" className="mastodon-item-date">
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
          <div className="mastodon-footer">
            <Text type="secondary">
              <a
                href="https://mastodon.social/@kuusourevie"
                target="_blank"
                rel="noopener noreferrer"
                className="mastodon-footer-link"
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
      >
        {selectedImage && (
          <img src={selectedImage} alt="" className="mastodon-modal-image" />
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
