import { SunOutlined, EnvironmentOutlined, DesktopOutlined, GithubOutlined, LinkedinFilled, InstagramOutlined, GlobalOutlined } from '@ant-design/icons'

export function Profile() {
  return (
    <div style={{
      padding: '2rem 1.5rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img
          src="https://files.mastodon.social/accounts/avatars/116/930/918/690/237/571/original/8cca0cfc61e2f533.png"
          alt="Profile picture"
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: '12px',
            marginBottom: '1rem',
            objectFit: 'cover'
          }}
        />

        <div>
          <h2 style={{
            margin: '0.5rem 0 0.25rem 0',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#1f2937'
          }}>
            Thirafi Najwan Kurniatama
          </h2>
          <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 500 }}>
            a.k.a. ReverseON
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
            SRE & Train Enthusiast
          </p>
        </div>
      </div>

      <div style={{
        fontSize: '0.9rem',
        lineHeight: '1.6',
        color: '#374151',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <SunOutlined style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1 }} />
          <span>SRE by day, Ongeki addict by night.</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <EnvironmentOutlined style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1 }} />
          <span>Yokohama, Japan.</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <DesktopOutlined style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1 }} />
          <span style={{ fontSize: '0.85rem' }}>Low-level programming and distributed systems while orchestrating LLM in between.</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <GlobalOutlined style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1 }} />
          <span style={{ fontSize: '0.85rem' }}>日本語 (初級), English, and Indonesian</span>
        </div>
      </div>

      <div style={{
        marginTop: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <a
          href="https://github.com/reverseon"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(31, 41, 55, 0.1)',
            border: '1px solid rgba(31, 41, 55, 0.3)',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#1f2937',
            fontWeight: 500,
            fontSize: '0.9rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(31, 41, 55, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(31, 41, 55, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <GithubOutlined /> GitHub
        </a>
        <a
          href="https://linkedin.com/in/thirafinajwan"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(10, 102, 194, 0.1)',
            border: '1px solid rgba(10, 102, 194, 0.3)',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#0A66C2',
            fontWeight: 500,
            fontSize: '0.9rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(10, 102, 194, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(10, 102, 194, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <LinkedinFilled /> LinkedIn
        </a>
        <a
          href="https://instagram.com/thirafinajwan"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#ec4899',
            fontWeight: 500,
            fontSize: '0.9rem',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <InstagramOutlined /> Instagram
        </a>
      </div>
    </div>
  )
}
