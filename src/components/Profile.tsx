import { useQuery } from '@tanstack/react-query'
import { SunOutlined, EnvironmentOutlined, GithubOutlined, LinkedinFilled, InstagramOutlined, GlobalOutlined } from '@ant-design/icons'
import './Profile.css'

export function Profile() {
  const { data: accountData } = useQuery({
    queryKey: ['mastodon-account'],
    queryFn: async () => {
      const response = await fetch('https://mastodon.social/api/v1/accounts/lookup?acct=kuusourevie')
      if (!response.ok) throw new Error('Failed to fetch account')
      return response.json()
    },
  })

  return (
    <div className="profile-card">
      <div className="profile-header">
        <img
          src={accountData?.avatar || 'https://files.mastodon.social/accounts/avatars/116/930/918/690/237/571/original/8cca0cfc61e2f533.png'}
          alt="Profile picture"
          className="profile-avatar"
        />

        <div>
          <h2 className="profile-name">
            Thirafi Najwan Kurniatama
          </h2>
          <p className="profile-handle">
            a.k.a. ReverseON
          </p>
          <p className="profile-tagline">
            SRE & Train Enthusiast
          </p>
        </div>
      </div>

      <div className="profile-info">
        <div className="profile-info-row">
          <SunOutlined />
          <span>SRE by day, Ongeki addict by night.</span>
        </div>

        <div className="profile-info-row">
          <EnvironmentOutlined />
          <span>Yokohama, Japan.</span>
        </div>

        <div className="profile-info-row">
          <EnvironmentOutlined />
          <span className="small-text">Low-level programming and distributed systems while orchestrating LLM in between.</span>
        </div>

        <div className="profile-info-row">
          <GlobalOutlined />
          <span className="small-text">日本語 (初級), English, and Indonesian</span>
        </div>
      </div>

      <div className="profile-links">
        <a
          href="https://github.com/reverseon"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link profile-link--github"
        >
          <GithubOutlined /> GitHub
        </a>
        <a
          href="https://linkedin.com/in/thirafinajwan"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link profile-link--linkedin"
        >
          <LinkedinFilled /> LinkedIn
        </a>
        <a
          href="https://instagram.com/thirafinajwan"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link profile-link--instagram"
        >
          <InstagramOutlined /> Instagram
        </a>
      </div>
    </div>
  )
}
