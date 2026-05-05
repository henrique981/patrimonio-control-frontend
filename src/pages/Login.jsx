import { useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
  const [matricula, setMatricula] = useState('');
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await api.post('/auth/login', { matricula, pin });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      onLogin(res.data.usuario);
    } catch (err) {
      setErro('Matricula ou PIN incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Patrimônio Control</h1>
        <p style={styles.subtitulo}>Sistema de Controle Patrimonial</p>
        <input style={styles.input} placeholder="Matricula" value={matricula} onChange={e => setMatricula(e.target.value)} />
        <input style={styles.input} placeholder="PIN" type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} />
        {erro && <p style={styles.erro}>{erro}</p>}
        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#16213e', borderRadius: 16, padding: 40, width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #0f3460' },
  titulo: { color: '#ffffff', fontSize: 24, fontWeight: 700, margin: 0 },
  subtitulo: { color: '#8892a4', fontSize: 14, marginBottom: 32 },
  input: { width: '100%', padding: '12px 16px', marginBottom: 12, borderRadius: 8, border: '1px solid #0f3460', backgroundColor: '#1a1a2e', color: '#ffffff', fontSize: 15, boxSizing: 'border-box' },
  erro: { color: '#ff6b6b', fontSize: 13, marginBottom: 8 },
  btn: { width: '100%', padding: '13px', borderRadius: 8, border: 'none', backgroundColor: '#4d9fff', color: '#ffffff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
};
