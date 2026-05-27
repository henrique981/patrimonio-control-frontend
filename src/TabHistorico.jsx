import React, { useState, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';

const api = {
  async get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); },
  async put(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  async delete(path) { const r = await fetch(`${BASE}${path}`, { method: 'DELETE' }); return r.json(); }
};

const LABEL_TIPO = {
  frente: 'Frente', lateral_esquerda: 'Lateral Esq.', traseira: 'Traseira',
  lateral_direita: 'Lateral Dir.', abastecimento: 'Abastecimento', troca_oleo: 'Troca de Oleo'
};

const VIATURAS_OPERACIONAIS = [
  'I-06500','I-06510','I-06514','I-06515','I-06517','I-06518','I-06520',
  'I-06522','I-06523','I-06530','I-06531','I-06532','I-06533','I-06534',
  'I-06535','I-06550','I-06551','I-06560','I-06583','I-06584','I-06585',
  'I-06586','I-06587','I-06588','I-06589'
];

// ============================================================
// MODAL DE EDIÇÃO
// ============================================================
const ModalEdicao = ({ registro, onSalvar, onFechar }) => {
  const [form, setForm] = useState({
    policial_re: registro.policial_re || '',
    policial_nome: registro.policial_nome || '',
    km_saida: registro.km_saida || '',
    km_retorno: registro.km_retorno || '',
    observacao_saida: registro.observacao_saida || '',
    observacao_retorno: registro.observacao_retorno || '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async () => {
    setSalvando(true);
    try {
      const res = await api.put(`/assuncao/registro/${registro.id}`, form);
      if (res.ok) onSalvar();
      else setErro(res.erro || 'Erro ao salvar');
    } catch { setErro('Erro de conexao'); }
    setSalvando(false);
  };

  const F = ({ label, name, type = 'text' }) => (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Editar Registro #{registro.id}</h3>
          <button onClick={onFechar} style={{ background: 'var(--border)', color: 'var(--text2)', width: 32, height: 32, borderRadius: 8, fontSize: 18 }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <F label="RE do Policial" name="policial_re" />
          <F label="Nome de Guerra" name="policial_nome" />
          <F label="KM Saida" name="km_saida" type="number" />
          <F label="KM Retorno" name="km_retorno" type="number" />
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase' }}>Obs. Saida</label>
            <textarea value={form.observacao_saida} onChange={e => setForm(f => ({ ...f, observacao_saida: e.target.value }))} rows={2}
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'none' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase' }}>Obs. Retorno</label>
            <textarea value={form.observacao_retorno} onChange={e => setForm(f => ({ ...f, observacao_retorno: e.target.value }))} rows={2}
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'none' }} />
          </div>
        </div>
        {erro && <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginTop: 12 }}>{erro}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onFechar} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          <button onClick={salvar} disabled={salvando} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: salvando ? 0.7 : 1 }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MODAL DE FOTOS
// ============================================================
const ModalFotos = ({ fotos, assuncaoId, onFechar, onExcluir }) => {
  const [excluindo, setExcluindo] = useState(null);
  const [fotoGrande, setFotoGrande] = useState(null);

  const excluir = async (id) => {
    setExcluindo(id);
    try {
      const res = await api.delete(`/assuncao/foto/${id}`);
      if (res.ok) onExcluir(id);
    } catch {}
    setExcluindo(null);
  };

  return (
    <div style={{ position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, background: '#000000ee', zIndex: 9999, overflowY: 'auto', padding: 20 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 1400, margin: '0 auto 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Fotos — Registro #{assuncaoId}</h3>
          <button onClick={onFechar} style={{ background: 'var(--border)', color: 'var(--text2)', width: 32, height: 32, borderRadius: 8, fontSize: 18, border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        {fotos.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>Nenhuma foto registrada</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {fotos.map(f => (
              <div key={f.id} style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={f.foto_url} alt={f.tipo_foto} onClick={() => setFotoGrande(f.foto_url)}
                  style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'cover', cursor: 'pointer', display: 'block' }} />
                <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{LABEL_TIPO[f.tipo_foto] || f.tipo_foto}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{new Date(f.data_hora_foto).toLocaleString('pt-BR')}</div>
                  </div>
                  <button onClick={() => excluir(f.id)} disabled={excluindo === f.id}
                    style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                    {excluindo === f.id ? '...' : 'Excluir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Foto em tela cheia */}
      {fotoGrande && (
        <div onClick={() => setFotoGrande(null)} style={{ position: 'fixed', inset: 0, background: '#000000ee', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={fotoGrande} alt="foto" style={{ maxWidth: '95vw', maxHeight: '95vh', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
};

// ============================================================
// GERADOR DE PDF
// ============================================================
const gerarPDF = async () => {
  try {
    const res = await api.get('/assuncao/relatorio/viaturas');
    if (!res.ok) return alert('Erro ao buscar dados');

    const viaturas = res.viaturas;
    const grupos = {
      operacional: viaturas.filter(v => v.situacao === 'operacional'),
      baixada:     viaturas.filter(v => v.situacao === 'baixada'),
      descarga:    viaturas.filter(v => v.situacao === 'descarga'),
    };

    const LABELS = { operacional: 'Operacional', baixada: 'Baixada', descarga: 'Descarga' };
    const CORES  = { operacional: '#10b981',     baixada: '#06b6d4',  descarga: '#ef4444' };

    const agora = new Date().toLocaleString('pt-BR');

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatorio de Viaturas</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #1a2035; background: #fff; padding: 30px; }
          .header { background: #003366; color: white; padding: 20px 24px; border-radius: 10px; margin-bottom: 24px; }
          .header h1 { font-size: 20px; font-weight: 700; }
          .header p { font-size: 13px; opacity: 0.8; margin-top: 4px; }
          .meta { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
          .grupo { margin-bottom: 24px; }
          .grupo-titulo { font-size: 14px; font-weight: 700; padding: 8px 14px; border-radius: 6px; margin-bottom: 10px; color: white; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
          td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:last-child td { border-bottom: none; }
          .total { font-size: 12px; color: #6b7280; margin-top: 6px; text-align: right; }
          .rodape { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Policia Militar do Estado de Sao Paulo</h1>
          <p>5a CIA PM — 6o BPM/I | Relatorio de Frota de Viaturas</p>
        </div>
        <div class="meta">Gerado em: ${agora} | Total de viaturas: ${viaturas.length}</div>
    `;

    for (const [sit, label] of [['operacional','Operacional'],['baixada','Baixada'],['descarga','Descarga']]) {
      const grupo = grupos[sit];
      if (grupo.length === 0) continue;
      html += `
        <div class="grupo">
          <div class="grupo-titulo" style="background: ${CORES[sit]}">${label} — ${grupo.length} viatura(s)</div>
          <table>
            <thead><tr><th>#</th><th>Prefixo</th><th>Placa</th><th>Marca</th><th>Modelo</th><th>KM Atual</th></tr></thead>
            <tbody>
              ${grupo.map((v, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${v.prefixo}</strong></td>
                  <td>${v.placa || '—'}</td>
                  <td>${v.marca || '—'}</td>
                  <td>${v.modelo || '—'}</td>
                  <td>${Number(v.km_atual || 0).toLocaleString('pt-BR')} km</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">${grupo.length} viatura(s)</div>
        </div>
      `;
    }

    html += `
        <div class="rodape">5a CIA PM | 6o BPM/I — Documento gerado automaticamente em ${agora}</div>
      </body></html>
    `;

    const janela = window.open('', '_blank');
    janela.document.write(html);
    janela.document.close();
    setTimeout(() => janela.print(), 500);

  } catch (err) {
    alert('Erro ao gerar relatorio: ' + err.message);
  }
};

// ============================================================
// COMPONENTE PRINCIPAL — TAB HISTÓRICO
// ============================================================
export default function TabHistorico({ showToast }) {
  const [prefixoSel, setPrefixoSel] = useState('');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(null);
  const [modalFotos, setModalFotos] = useState(null);

  const buscar = useCallback(async () => {
    if (!prefixoSel) return;
    setLoading(true);
    try {
      const res = await api.get(`/assuncao/${prefixoSel}/historico`);
      if (res.ok) setHistorico(res.historico);
      else showToast(res.erro || 'Erro ao buscar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setLoading(false);
  }, [prefixoSel, showToast]);

  const handleExcluirFoto = (fotoId) => {
    setModalFotos(m => m ? { ...m, fotos: m.fotos.filter(f => f.id !== fotoId) } : null);
    setHistorico(h => h.map(r => ({ ...r, fotos: r.fotos.filter(f => f.id !== fotoId) })));
    showToast('Foto excluida!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filtros e ações */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={prefixoSel} onChange={e => setPrefixoSel(e.target.value)}
          style={{ minWidth: 180, background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
          <option value="">Selecione a viatura</option>
          {VIATURAS_OPERACIONAIS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={buscar} disabled={!prefixoSel || loading}
          style={{ background: 'var(--accent)', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: (!prefixoSel || loading) ? 0.6 : 1 }}>
          {loading ? 'Buscando...' : 'Buscar Historico'}
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={gerarPDF}
          style={{ background: '#003366', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Gerar Relatorio PDF
        </button>
      </div>

      {/* Tabela de histórico */}
      {historico.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Historico — {prefixoSel}</span>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{historico.length} registros</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                  {['#','RE','Nome','Saida','KM Saida','Retorno','KM Retorno','Status','Fotos','Acoes'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historico.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 14px', color: 'var(--text2)', fontSize: 12 }}>{r.id}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--cyan)', fontSize: 12 }}>{r.policial_re}</td>
                    <td style={{ padding: '10px 14px' }}>{r.policial_nome || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text2)' }}>
                      {new Date(r.data_hora_saida).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>{Number(r.km_saida).toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text2)' }}>
                      {r.data_hora_retorno ? new Date(r.data_hora_retorno).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
                      {r.km_retorno ? Number(r.km_retorno).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: r.status === 'aberta' ? '#f59e0b20' : '#10b98120',
                        color: r.status === 'aberta' ? '#f59e0b' : '#10b981',
                        border: `1px solid ${r.status === 'aberta' ? '#f59e0b40' : '#10b98140'}`,
                        borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600
                      }}>{r.status === 'aberta' ? 'Em Servico' : 'Encerrado'}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => setModalFotos({ fotos: r.fotos || [], assuncaoId: r.id })}
                        style={{ background: '#8b5cf620', color: '#8b5cf6', border: '1px solid #8b5cf640', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        {(r.fotos || []).length} foto(s)
                      </button>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => setModalEdicao(r)}
                        style={{ background: '#3b82f620', color: 'var(--accent)', border: '1px solid #3b82f640', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {historico.length === 0 && prefixoSel && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>Nenhum registro encontrado para {prefixoSel}</div>
      )}

      {/* Modais */}
      {modalEdicao && (
        <ModalEdicao registro={modalEdicao} onFechar={() => setModalEdicao(null)}
          onSalvar={() => { setModalEdicao(null); buscar(); showToast('Registro atualizado!', 'success'); }} />
      )}
      {modalFotos && (
        <ModalFotos fotos={modalFotos.fotos} assuncaoId={modalFotos.assuncaoId}
          onFechar={() => setModalFotos(null)} onExcluir={handleExcluirFoto} />
      )}
    </div>
  );
}
