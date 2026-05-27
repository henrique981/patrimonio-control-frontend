import React, { useState, useEffect, useRef, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';

const api = {
  async get(path) {
    const res = await fetch(`${BASE}${path}`);
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  }
};

const formatarData = () => new Date().toLocaleString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

const adicionarMarcaDagua = (imageSrc, prefixo, re, nome, tipo) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = 'rgba(0,0,51,0.65)';
      ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(18, canvas.width / 26)}px Arial`;
      ctx.fillText(`${prefixo} — ${tipo.toUpperCase()}`, 14, canvas.height - 84);
      ctx.font = `${Math.max(14, canvas.width / 32)}px Arial`;
      ctx.fillText(`RE: ${re} — ${nome || ''}`, 14, canvas.height - 54);
      ctx.fillText(`5a CIA PM | 6o BPM/I — ${formatarData()}`, 14, canvas.height - 24);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = imageSrc;
  });
};

const comprimirImagem = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1200 / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const Style = () => (
  <style>{`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #eef0f4; font-family: 'Segoe UI', Arial, sans-serif; min-height: 100vh; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade { animation: fadeIn 0.3s ease; }
    input, select, textarea {
      width: 100%; padding: 13px 14px; border: 2px solid #d1d5db;
      border-radius: 10px; font-size: 16px; font-family: inherit;
      background: #ffffff; color: #1a2035; outline: none; transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus { border-color: #003366; }
    button { font-family: inherit; cursor: pointer; border: none; border-radius: 10px; font-weight: 700; transition: all 0.15s; }
    button:active { transform: scale(0.97); }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
  `}</style>
);

const Header = ({ viatura }) => (
  <div style={{ background: '#003366' }}>
    <div style={{ background: '#002244', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ffffff20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚔</div>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Policia Militar - SP</div>
        <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 700 }}>5a CIA PM - 6o BPM/I</div>
      </div>
    </div>
    {viatura && (
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 700 }}>{viatura.prefixo}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            {viatura.marca} {viatura.modelo}{viatura.placa ? ` - ${viatura.placa}` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>KM Atual</div>
          <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>{Number(viatura.km_atual || 0).toLocaleString('pt-BR')}</div>
        </div>
      </div>
    )}
    <div style={{ height: 3, background: '#1a56a0' }} />
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background: '#ffffff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', ...style }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#003366', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    {children}
  </label>
);

const BtnPrimary = ({ onClick, disabled, children, color }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: color || '#003366', color: '#ffffff',
    padding: '14px 24px', fontSize: 15, width: '100%',
    boxShadow: '0 4px 12px rgba(0,51,102,0.25)'
  }}>{children}</button>
);

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
    <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#003366', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
);

const Alert = ({ type, msg }) => {
  const map = {
    error:   { bg: '#fee2e2', border: '#ef4444', color: '#991b1b', icon: 'Atencao:' },
    success: { bg: '#dcfce7', border: '#16a34a', color: '#166534', icon: 'OK:' },
    info:    { bg: '#dbeafe', border: '#3b82f6', color: '#1e40af', icon: 'Info:' },
  };
  const s = map[type] || map.info;
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '12px 16px', color: s.color, fontSize: 14, fontWeight: 600 }}>
      {s.icon} {msg}
    </div>
  );
};

const FotoItem = ({ label, icon, foto, onTirar, loading }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <Label>{icon} {label}</Label>
    {foto ? (
      <div>
        <img src={foto} alt={label} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, border: '2px solid #16a34a' }} />
        <button onClick={onTirar} style={{ marginTop: 6, background: '#f3f4f6', color: '#374151', padding: '6px 12px', fontSize: 12, width: '100%' }}>
          Refazer
        </button>
      </div>
    ) : (
      <button onClick={onTirar} disabled={loading} style={{
        background: '#003366', color: '#fff', padding: '14px',
        fontSize: 14, border: '2px dashed #1a56a0', borderRadius: 10
      }}>
        {loading ? 'Processando...' : 'Tirar Foto'}
      </button>
    )}
  </div>
);

// TELA 1 - IDENTIFICACAO
const TelaIdentificacao = ({ prefixo, kmAtual, onConfirmar }) => {
  const [re, setRe] = useState('');
  const [nome, setNome] = useState('');
  const [km, setKm] = useState(kmAtual > 0 ? String(kmAtual) : '');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const confirmar = async () => {
    if (!re || re.length < 5) return setErro('Digite um RE valido');
    if (!km || parseInt(km) <= 0) return setErro('Digite o KM inicial');
    setErro('');
    setLoading(true);
    try {
      const res = await api.post(`/assuncao/${prefixo}/saida`, {
        policial_re: re, policial_nome: nome, km_saida: parseInt(km)
      });
      if (res.ok) onConfirmar({ re, nome, km: parseInt(km), assuncao_id: res.assuncao.id });
      else setErro(res.erro || 'Erro ao registrar saida');
    } catch { setErro('Erro de conexao com o servidor'); }
    setLoading(false);
  };

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#003366', marginBottom: 16 }}>Identificacao</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Label>RE do Policial *</Label>
            <input type="number" placeholder="Digite seu RE" value={re} onChange={e => setRe(e.target.value)} />
          </div>
          <div>
            <Label>Nome de Guerra</Label>
            <input type="text" placeholder="NOME DE GUERRA" value={nome} onChange={e => setNome(e.target.value.toUpperCase())} style={{ textTransform: "uppercase" }} />
          </div>

        </div>
      </Card>
      {erro && <Alert type="error" msg={erro} />}
      <BtnPrimary onClick={confirmar} disabled={loading}>
        {loading ? 'Registrando...' : 'Iniciar Servico'}
      </BtnPrimary>
    </div>
  );
};

// TELA 2 - FOTOS DE SAIDA
const TelaFotosSaida = ({ prefixo, policial, onConcluir }) => {
  const FOTOS = [
    { key: 'frente',           label: 'Frente',          icon: 'FRENTE' },
    { key: 'lateral_direita',  label: 'Lateral Direita', icon: 'DIR' },
    { key: 'traseira',         label: 'Traseira',        icon: 'TRAS' },
    { key: 'lateral_esquerda', label: 'Lateral Esq.',    icon: 'ESQ' },
  ];

  const [fotos, setFotos] = useState({});
  const [loadingFoto, setLoadingFoto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const inputRef = useRef(null);
  const [fotoAtual, setFotoAtual] = useState('');

  const tirarFoto = (key) => { setFotoAtual(key); inputRef.current.click(); };

  const processarFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingFoto(fotoAtual);
    try {
      const comprimida = await comprimirImagem(file);
      const comMarca = await adicionarMarcaDagua(comprimida, prefixo, policial.re, policial.nome, fotoAtual.replace('_', ' '));
      setFotos(f => ({ ...f, [fotoAtual]: comMarca }));
    } catch { setErro('Erro ao processar foto'); }
    setLoadingFoto('');
    e.target.value = '';
  };

  const totalOk = FOTOS.filter(f => fotos[f.key]).length;
  const todasOk = totalOk === FOTOS.length;

  const enviar = async () => {
    if (!todasOk) return setErro('Tire todas as 4 fotos obrigatorias');
    setErro('');
    setEnviando(true);
    try {
      for (const f of FOTOS) {
        await api.post(`/assuncao/${prefixo}/foto`, {
          assuncao_id: policial.assuncao_id,
          tipo_foto: f.key,
          foto_base64: fotos[f.key],
          policial_re: policial.re
        });
      }
      onConcluir();
    } catch { setErro('Erro ao enviar fotos'); }
    setEnviando(false);
  };

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#003366' }}>Fotos da Viatura</div>
          <div style={{
            background: todasOk ? '#dcfce7' : '#dbeafe',
            color: todasOk ? '#166534' : '#1e40af',
            borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700
          }}>{totalOk}/4</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {FOTOS.map(f => (
            <FotoItem key={f.key} label={f.label} icon={f.icon} foto={fotos[f.key]}
              loading={loadingFoto === f.key} onTirar={() => tirarFoto(f.key)} />
          ))}
        </div>
      </Card>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={processarFoto} style={{ display: 'none' }} />
      {erro && <Alert type="error" msg={erro} />}
      <BtnPrimary onClick={enviar} disabled={enviando || !todasOk}>
        {enviando ? 'Enviando fotos...' : todasOk ? 'Confirmar Saida' : `Faltam ${4 - totalOk} foto(s)`}
      </BtnPrimary>
    </div>
  );
};

// TELA 3 - EM SERVICO
const TelaEmServico = ({ prefixo, assuncao, onRetorno }) => {
  const [expandido, setExpandido] = useState(false);
  const [tipoExtra, setTipoExtra] = useState('');
  const [fotoExtra, setFotoExtra] = useState(null);
  const [enviandoExtra, setEnviandoExtra] = useState(false);
  const [msgExtra, setMsgExtra] = useState('');
  const inputRef = useRef(null);

  const EXTRAS = [
    { key: 'abastecimento', label: 'Abastecimento' },
    { key: 'troca_oleo',    label: 'Troca de Oleo/Filtro' },
  ];

  const tirarFotoExtra = (key) => { setTipoExtra(key); setFotoExtra(null); setMsgExtra(''); inputRef.current.click(); };

  const processarExtra = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const comprimida = await comprimirImagem(file);
    const comMarca = await adicionarMarcaDagua(comprimida, prefixo, assuncao.policial_re, assuncao.policial_nome, tipoExtra.replace('_', ' '));
    setFotoExtra(comMarca);
    e.target.value = '';
  };

  const enviarExtra = async () => {
    if (!fotoExtra) return;
    setEnviandoExtra(true);
    try {
      const res = await api.post(`/assuncao/${prefixo}/foto`, {
        assuncao_id: assuncao.id,
        tipo_foto: tipoExtra,
        foto_base64: fotoExtra,
        policial_re: assuncao.policial_re
      });
      if (res.ok) { setMsgExtra('Comprovante enviado!'); setFotoExtra(null); }
      else setMsgExtra('Erro ao enviar');
    } catch { setMsgExtra('Erro de conexao'); }
    setEnviandoExtra(false);
  };

  const duracao = () => {
    const diff = Math.floor((new Date() - new Date(assuncao.data_hora_saida)) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ borderLeft: '4px solid #16a34a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Em Servico</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2035', marginTop: 4 }}>
              RE: {assuncao.policial_re}{assuncao.policial_nome ? ` - ${assuncao.policial_nome}` : ''}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              Saida: {new Date(assuncao.data_hora_saida).toLocaleString('pt-BR')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Tempo</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#003366' }}>{duracao()}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0f9ff', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#6b7280' }}>KM Saida</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#003366' }}>{Number(assuncao.km_saida).toLocaleString('pt-BR')}</div>
        </div>
      </Card>

      <Card>
        <button onClick={() => setExpandido(!expandido)} style={{ background: 'none', color: '#003366', padding: 0, fontSize: 15, fontWeight: 700, width: '100%', textAlign: 'left' }}>
          Registrar Comprovante {expandido ? '▲' : '▼'}
        </button>
        {expandido && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {EXTRAS.map(e => (
                <button key={e.key} onClick={() => tirarFotoExtra(e.key)} style={{
                  background: tipoExtra === e.key ? '#003366' : '#f3f4f6',
                  color: tipoExtra === e.key ? '#fff' : '#374151',
                  padding: '12px', fontSize: 13
                }}>{e.label}</button>
              ))}
            </div>
            {fotoExtra && (
              <div>
                <img src={fotoExtra} alt="Comprovante" style={{ width: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover' }} />
                <button onClick={enviarExtra} disabled={enviandoExtra} style={{ background: '#003366', color: '#fff', padding: '12px', width: '100%', fontSize: 14, marginTop: 8 }}>
                  {enviandoExtra ? 'Enviando...' : 'Enviar Comprovante'}
                </button>
              </div>
            )}
            {msgExtra && <Alert type={msgExtra.includes('Erro') ? 'error' : 'success'} msg={msgExtra} />}
          </div>
        )}
      </Card>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={processarExtra} style={{ display: 'none' }} />
      <BtnPrimary onClick={onRetorno}>Encerrar Turno</BtnPrimary>
    </div>
  );
};

// TELA 4 - RETORNO
const TelaRetorno = ({ prefixo, assuncao, onConcluir }) => {
  const FOTOS = [
    { key: 'frente',           label: 'Frente',          icon: 'FRENTE' },
    { key: 'lateral_direita',  label: 'Lateral Direita', icon: 'DIR' },
    { key: 'traseira',         label: 'Traseira',        icon: 'TRAS' },
    { key: 'lateral_esquerda', label: 'Lateral Esq.',    icon: 'ESQ' },
  ];

  const [km, setKm] = useState('');
  const [obs, setObs] = useState('');
  const [fotos, setFotos] = useState({});
  const [loadingFoto, setLoadingFoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const inputRef = useRef(null);
  const fotoAtualRef = useRef('');
  const [fotoAtual, setFotoAtual] = useState('');

  const tirarFoto = (key) => {
    fotoAtualRef.current = key;
    setFotoAtual(key);
    setTimeout(() => inputRef.current && inputRef.current.click(), 50);
  };

  const processarFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const key = fotoAtualRef.current;
    setLoadingFoto(key);
    try {
      const comprimida = await comprimirImagem(file);
      const comMarca = await adicionarMarcaDagua(comprimida, prefixo, assuncao.policial_re, assuncao.policial_nome, key.replace('_', ' '));
      setFotos(f => ({ ...f, [key]: comMarca }));
    } catch { setErro('Erro ao processar foto'); }
    setLoadingFoto('');
    e.target.value = '';
  };

  const totalOk = FOTOS.filter(f => fotos[f.key]).length;
  const todasOk = totalOk === FOTOS.length;

  const confirmar = async () => {
    if (!km || parseInt(km) < 0) return setErro('Digite o KM final');
    if (!todasOk) return setErro('Tire todas as 4 fotos obrigatorias');
    setErro('');
    setLoading(true);
    try {
      // Envia fotos
      for (const f of FOTOS) {
        await api.post(`/assuncao/${prefixo}/foto`, {
          assuncao_id: assuncao.id,
          tipo_foto: f.key,
          foto_base64: fotos[f.key],
          policial_re: assuncao.policial_re
        });
      }
      // Registra retorno
      const res = await api.post(`/assuncao/${prefixo}/retorno`, {
        assuncao_id: assuncao.id, km_retorno: parseInt(km), observacao: obs
      });
      if (res.ok) onConcluir(parseInt(km));
      else setErro(res.erro || 'Erro ao encerrar turno');
    } catch { setErro('Erro de conexao'); }
    setLoading(false);
  };

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#003366', marginBottom: 16 }}>Encerrar Turno</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', background: '#f0f9ff', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280' }}>KM Saida</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#003366' }}>{Number(assuncao.km_saida).toLocaleString('pt-BR')}</div>
          </div>
          <div>
            <Label>KM Final *</Label>
            <input type="number" placeholder="KM atual da viatura" value={km} onChange={e => setKm(e.target.value)} />
          </div>
          <div>
            <Label>Observacoes</Label>
            <textarea rows={3} placeholder="Ocorrencias, avarias ou observacoes gerais..." value={obs} onChange={e => setObs(e.target.value)} style={{ resize: 'none' }} />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#003366' }}>Fotos da Viatura</div>
          <div style={{
            background: todasOk ? '#dcfce7' : '#dbeafe',
            color: todasOk ? '#166534' : '#1e40af',
            borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700
          }}>{totalOk}/4</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {FOTOS.map(f => (
            <FotoItem key={f.key} label={f.label} icon={f.icon} foto={fotos[f.key]}
              loading={loadingFoto === f.key} onTirar={() => tirarFoto(f.key)} />
          ))}
        </div>
      </Card>

      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={processarFoto} style={{ display: 'none' }} />
      {erro && <Alert type="error" msg={erro} />}
      <BtnPrimary onClick={confirmar} disabled={loading || !todasOk}>
        {loading ? 'Encerrando...' : todasOk ? 'Encerrar Turno' : `Faltam ${4 - totalOk} foto(s)`}
      </BtnPrimary>
    </div>
  );
};

// TELA 5 - CONCLUIDO
const TelaConcluido = ({ prefixo, kmRetorno, kmSaida }) => (
  <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center', padding: '30px 0' }}>
    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>✓</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: '#003366' }}>Retorno Registrado!</div>
    <div style={{ fontSize: 14, color: '#6b7280' }}>Servico encerrado com sucesso</div>
    <Card style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>KM Final</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#003366' }}>{Number(kmRetorno).toLocaleString('pt-BR')}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>KM Rodados</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{Number(kmRetorno - kmSaida).toLocaleString('pt-BR')}</div>
        </div>
      </div>
    </Card>
    <div style={{ fontSize: 13, color: '#6b7280' }}>{prefixo} — {formatarData()}</div>
  </div>
);

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Assuncao({ prefixo }) {
  const [viatura, setViatura] = useState(null);
  const [assuncaoAberta, setAssuncaoAberta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [tela, setTela] = useState('identificacao');
  const [policial, setPolicial] = useState(null);
  const [kmRetorno, setKmRetorno] = useState(0);
  const [kmAtual, setKmAtual] = useState(0);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assuncao/${prefixo}`);
      if (res.ok) {
        setViatura(res.viatura);
        setKmAtual(res.viatura.km_atual || 0);
        if (res.assuncao_aberta) {
          setAssuncaoAberta(res.assuncao_aberta);
          setTela('em_servico');
        }
      } else setErro(res.erro || 'Viatura nao encontrada');
    } catch { setErro('Erro de conexao'); }
    setLoading(false);
  }, [prefixo]);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) return (
    <div style={{ minHeight: '100vh' }}>
      <Style /><Header viatura={null} />
      <div style={{ padding: 20 }}><Spinner /></div>
    </div>
  );

  if (erro) return (
    <div style={{ minHeight: '100vh' }}>
      <Style /><Header viatura={null} />
      <div style={{ padding: 20 }}><Alert type="error" msg={erro} /></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 30 }}>
      <Style />
      <Header viatura={viatura} />
      <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
        {tela === 'identificacao' && (
          <TelaIdentificacao prefixo={prefixo} kmAtual={kmAtual} onConfirmar={(p) => {
            setPolicial(p);
            setAssuncaoAberta({ ...p, id: p.assuncao_id, km_saida: p.km, policial_re: p.re, policial_nome: p.nome, data_hora_saida: new Date().toISOString() });
            setTela('em_servico');
          }} />
        )}
        {tela === 'em_servico' && assuncaoAberta && (
          <TelaEmServico prefixo={prefixo} assuncao={assuncaoAberta} onRetorno={() => setTela('retorno')} />
        )}
        {tela === 'retorno' && assuncaoAberta && (
          <TelaRetorno prefixo={prefixo} assuncao={assuncaoAberta} onConcluir={(km) => { setKmRetorno(km); setTela('concluido'); }} />
        )}
        {tela === 'concluido' && (
          <TelaConcluido prefixo={prefixo} kmRetorno={kmRetorno} kmSaida={assuncaoAberta?.km_saida || 0} />
        )}
      </div>
    </div>
  );
}
