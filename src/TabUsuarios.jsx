import React, { useState, useEffect, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';

const api = {
  async get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); },
  async post(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  async put(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  async post_action(path) {
    const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    return r.json();
  }
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'var(--border)', color: 'var(--text2)', width: 32, height: 32, borderRadius: 8, fontSize: 18, border: 'none', cursor: 'pointer' }}>x</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', options }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
    {options ? (
      <select name={name} value={value || ''} onChange={onChange} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '9px 12px', fontSize: 13 }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value || ''} onChange={onChange}
        style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
    )}
  </div>
);

export default function TabUsuarios({ showToast, usuarioLogado }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/usuarios/usuarios');
      if (res.ok) setUsuarios(res.usuarios);
    } catch { showToast('Erro ao carregar usuarios', 'error'); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSalvar = async () => {
    if (!form.re || !form.nome) return showToast('RE e Nome sao obrigatorios', 'error');
    setSaving(true);
    try {
      let res;
      if (modal === 'add') {
        res = await api.post('/usuarios/usuarios', form);
        if (res.ok) showToast('Usuario cadastrado! Senha inicial = RE', 'success');
      } else {
        res = await api.put(`/usuarios/usuarios/${selected.id}`, form);
        if (res.ok) showToast('Usuario atualizado!', 'success');
      }
      if (res.ok) { setModal(null); load(); }
      else showToast(res.erro || 'Erro ao salvar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSaving(false);
  };

  const handleResetar = async (id, nome) => {
    if (!window.confirm(`Resetar senha de ${nome} para o RE?`)) return;
    try {
      const res = await api.post_action(`/usuarios/usuarios/${id}/resetar-senha`);
      if (res.ok) showToast('Senha resetada para o RE!', 'success');
      else showToast(res.erro || 'Erro ao resetar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
  };

  const handleToggleAtivo = async (usuario) => {
    try {
      const res = await api.put(`/usuarios/usuarios/${usuario.id}`, { ativo: !usuario.ativo });
      if (res.ok) { showToast(usuario.ativo ? 'Usuario desativado!' : 'Usuario ativado!', 'success'); load(); }
      else showToast(res.erro || 'Erro', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
  };

  // Apenas gestor pode acessar
  if (usuarioLogado?.perfil !== 'gestor') {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
        Acesso restrito ao gestor.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{usuarios.length} usuarios cadastrados</div>
        <button onClick={() => { setForm({ perfil: 'operador' }); setModal('add'); }}
          style={{ background: 'var(--accent)', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          + Novo Usuario
        </button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Usuarios do Sistema</div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                  {['RE','Nome','Patente','Email','Perfil','Status','Ultimo Acesso','Acoes'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--cyan)', fontSize: 12 }}>{u.re}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{u.nome}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{u.patente || '--'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text2)', fontSize: 12 }}>{u.email || '--'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: u.perfil === 'gestor' ? '#8b5cf620' : '#3b82f620',
                        color: u.perfil === 'gestor' ? '#8b5cf6' : '#3b82f6',
                        border: `1px solid ${u.perfil === 'gestor' ? '#8b5cf640' : '#3b82f640'}`,
                        borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600
                      }}>{u.perfil}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: u.ativo ? '#10b98120' : '#ef444420',
                        color: u.ativo ? '#10b981' : '#ef4444',
                        border: `1px solid ${u.ativo ? '#10b98140' : '#ef444440'}`,
                        borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600
                      }}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                      {u.data_ultimo_acesso ? new Date(u.data_ultimo_acesso).toLocaleString('pt-BR') : 'Nunca acessou'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                        <button onClick={() => { setForm({ ...u }); setSelected(u); setModal('edit'); }}
                          style={{ background: '#3b82f620', color: 'var(--accent)', border: '1px solid #3b82f640', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          Editar
                        </button>
                        <button onClick={() => handleResetar(u.id, u.nome)}
                          style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          Reset Senha
                        </button>
                        <button onClick={() => handleToggleAtivo(u)}
                          style={{ background: u.ativo ? '#ef444420' : '#10b98120', color: u.ativo ? '#ef4444' : '#10b981', border: `1px solid ${u.ativo ? '#ef444440' : '#10b98140'}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {u.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Nenhum usuario cadastrado</div>}
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Usuario' : 'Editar Usuario'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="RE *" name="re" value={form.re} onChange={handleChange} />
            <Field label="Nome Completo *" name="nome" value={form.nome} onChange={handleChange} />
            <Field label="Patente" name="patente" value={form.patente} onChange={handleChange} />
            <Field label="Email Funcional" name="email" value={form.email} onChange={handleChange} type="email" />
            <Field label="Perfil" name="perfil" value={form.perfil} onChange={handleChange} options={[
              { value: 'operador', label: 'Operador' },
              { value: 'gestor', label: 'Gestor' }
            ]} />
            {modal === 'add' && (
              <div style={{ background: '#3b82f610', border: '1px solid #3b82f630', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>
                Senha inicial sera o proprio RE. O usuario devera trocar no primeiro acesso.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button onClick={handleSalvar} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
