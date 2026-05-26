import React, { useState } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';

export default function Login({ onLogin }) {
  const [tela, setTela] = useState('login'); // login | trocar_senha
  const [re, setRe] = useState('');
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [usuario, setUsuario] = useState(null);

  const fazerLogin = async () => {
    if (!re || !senha) return setErro('Preencha o RE e a senha');
    setErro('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/usuarios/login-dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ re, senha })
      });
      const data = await res.json();
      if (data.ok) {
        if (data.usuario.primeiro_acesso) {
          setUsuario(data.usuario);
          setTela('trocar_senha');
        } else {
          sessionStorage.setItem('patrimonio_token', data.token);
          sessionStorage.setItem('patrimonio_usuario', JSON.stringify(data.usuario));
          onLogin(data.usuario, data.token);
        }
      } else {
        setErro(data.erro || 'Erro ao fazer login');
      }
    } catch { setErro('Erro de conexao com o servidor'); }
    setLoading(false);
  };

  const trocarSenha = async () => {
    if (!novaSenha || !confirmarSenha) return setErro('Preencha todos os campos');
    if (novaSenha.length < 6) return setErro('Senha deve ter pelo menos 6 caracteres');
    if (novaSenha !== confirmarSenha) return setErro('Senhas nao conferem');
    setErro('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/usuarios/trocar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ re: usuario.re, senha_atual: senha, nova_senha: novaSenha })
      });
      const data = await res.json();
      if (data.ok) {
        // Faz login novamente com nova senha
        const res2 = await fetch(`${BASE}/usuarios/login-dashboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ re: usuario.re, senha: novaSenha })
        });
        const data2 = await res2.json();
        if (data2.ok) {
          sessionStorage.setItem('patrimonio_token', data2.token);
          sessionStorage.setItem('patrimonio_usuario', JSON.stringify(data2.usuario));
          onLogin(data2.usuario, data2.token);
        }
      } else {
        setErro(data.erro || 'Erro ao trocar senha');
      }
    } catch { setErro('Erro de conexao'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0c10',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 20
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { font-family: inherit; }
        button { font-family: inherit; cursor: pointer; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="https://res.cloudinary.com/dgoujj0ux/image/upload/v1777987791/6bpmi_dahzpc.png" alt="6 BPM/I" style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
          <div style={{ color: '#3b82f6', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
            Policia Militar do Estado de Sao Paulo
          </div>
          <div style={{ color: '#e8edf5', fontSize: 20, fontWeight: 700 }}>5a CIA PM — 6o BPM/I</div>
          <div style={{ color: '#8892a4', fontSize: 13, marginTop: 4 }}>Controle Patrimonial</div>
        </div>

        {/* Card */}
        <div style={{ background: '#0f1117', border: '1px solid #1e2535', borderRadius: 16, padding: 28 }}>
          {tela === 'login' ? (
            <>
              <h2 style={{ color: '#e8edf5', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Acesso ao Sistema</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8892a4', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>RE / Usuario</label>
                  <input
                    type="text" value={re} onChange={e => setRe(e.target.value)}
                    placeholder="Digite seu RE"
                    onKeyDown={e => e.key === 'Enter' && fazerLogin()}
                    style={{ width: '100%', background: '#0a0c10', border: '1px solid #2a3347', color: '#e8edf5', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8892a4', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Senha</label>
                  <input
                    type="password" value={senha} onChange={e => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    onKeyDown={e => e.key === 'Enter' && fazerLogin()}
                    style={{ width: '100%', background: '#0a0c10', border: '1px solid #2a3347', color: '#e8edf5', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none' }}
                  />
                </div>
              </div>

              {erro && (
                <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginTop: 14 }}>
                  {erro}
                </div>
              )}

              <button onClick={fazerLogin} disabled={loading} style={{
                background: '#3b82f6', color: '#fff', width: '100%',
                padding: '13px', fontSize: 15, fontWeight: 700,
                borderRadius: 10, border: 'none', marginTop: 20,
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#4a5568' }}>
                Primeiro acesso: use seu RE como senha
              </div>
            </>
          ) : (
            <>
              <h2 style={{ color: '#e8edf5', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Primeiro Acesso</h2>
              <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 20 }}>Crie sua senha para continuar</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8892a4', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nova Senha</label>
                  <input
                    type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    style={{ width: '100%', background: '#0a0c10', border: '1px solid #2a3347', color: '#e8edf5', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8892a4', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirmar Senha</label>
                  <input
                    type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
                    style={{ width: '100%', background: '#0a0c10', border: '1px solid #2a3347', color: '#e8edf5', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none' }}
                  />
                </div>
              </div>
              {erro && (
                <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginTop: 14 }}>
                  {erro}
                </div>
              )}
              <button onClick={trocarSenha} disabled={loading} style={{
                background: '#10b981', color: '#fff', width: '100%',
                padding: '13px', fontSize: 15, fontWeight: 700,
                borderRadius: 10, border: 'none', marginTop: 20,
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Salvando...' : 'Criar Senha e Entrar'}
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#2a3347' }}>
          5a CIA PM | 6o BPM/I — Sistema de Controle Patrimonial
        </div>
      </div>
    </div>
  );
}
