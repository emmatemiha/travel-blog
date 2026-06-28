import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div style={{ background: '#0f1a12', minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif" }}>404</div>
            <h1 style={{ color: '#f0e8d8', fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 400, margin: 0 }}>Page not found</h1>
            <p style={{ color: '#5a7a5e', fontFamily: "'Lato', sans-serif", fontSize: '13px', margin: 0 }}>The page you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/blogs')}
                style={{ marginTop: '8px', background: '#2d5a30', border: '1px solid #4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer' }}>
                Back to blogs
            </button>
        </div>
    )
}

export default NotFound;