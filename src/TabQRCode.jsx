import React, { useState, useEffect, useRef } from 'react';

const BASE_URL = 'https://patrimonio-control-frontend.vercel.app/vtr';

const VIATURAS_OPERACIONAIS = [
  { prefixo: 'I-06500', modelo: 'SPIN 18L AT PREMIER', placa: 'GGR1B85' },
  { prefixo: 'I-06510', modelo: 'SPIN 1.8L MT', placa: 'SWU7G24' },
  { prefixo: 'I-06514', modelo: 'SPRINTER FFORMA', placa: 'CMM5193' },
  { prefixo: 'I-06515', modelo: 'SPIN 1.8L MT LT', placa: 'CQU0798' },
  { prefixo: 'I-06517', modelo: 'GOL PATRULHEIRO 1.6', placa: 'EJF5I29' },
  { prefixo: 'I-06518', modelo: 'SPIN 1.8L MT LT', placa: 'CUC3590' },
  { prefixo: 'I-06520', modelo: 'DUSTER ZEN 16', placa: 'TJQ5C61' },
  { prefixo: 'I-06522', modelo: 'GOL PATRULHEIRO 1.6', placa: 'FPU0546' },
  { prefixo: 'I-06523', modelo: 'DUSTER 16 E 4X2', placa: 'FQU0E18' },
  { prefixo: 'I-06530', modelo: 'DUSTER 16 E 4X2', placa: 'ECW0G27' },
  { prefixo: 'I-06531', modelo: 'DUSTER 16 E 4X2', placa: 'GDS5H96' },
  { prefixo: 'I-06532', modelo: 'DUSTER', placa: 'GCQ8F46' },
  { prefixo: 'I-06533', modelo: 'DUSTER', placa: 'FYY2G97' },
  { prefixo: 'I-06534', modelo: 'SPIN 18L AT PREMIER', placa: 'EXO7I57' },
  { prefixo: 'I-06535', modelo: 'SPIN 18L AT PREMIER', placa: 'FIY4C36' },
  { prefixo: 'I-06550', modelo: 'SPIN 18L AT PREMIER', placa: 'GIR1D84' },
  { prefixo: 'I-06551', modelo: 'SPIN 18L AT PREMIER', placa: 'FHR5J93' },
  { prefixo: 'I-06560', modelo: 'SPIN 1.8L MT LT', placa: 'TJS4F44' },
  { prefixo: 'I-06583', modelo: 'XRE 300', placa: 'DJL1624' },
  { prefixo: 'I-06584', modelo: 'LANDER XTZ250', placa: 'CFY0F36' },
  { prefixo: 'I-06585', modelo: 'LANDER XTZ250', placa: 'FUV0D71' },
  { prefixo: 'I-06586', modelo: 'LANDER XTZ250', placa: 'GFX4G62' },
  { prefixo: 'I-06587', modelo: 'LANDER XTZ250', placa: 'CCU6E53' },
  { prefixo: 'I-06588', modelo: 'XTZ250 LANDER', placa: 'SST0D74' },
  { prefixo: 'I-06589', modelo: 'XTZ250 LANDER', placa: 'SUX6F51' },
];

// Gera QR Code usando API pública
const QRCodeImg = ({ value, size = 150 }) => {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png&margin=10`;
  return <img src={url} alt="QR Code" style={{ width: size, height: size, display: 'block' }} />;
};

const CartaoVTR = ({ vtr, selecionada, onToggle }) => {
  const url = `${BASE_URL}/${vtr.prefixo}`;

  return (
    <div style={{
      background: selecionada ? '#3b82f610' : 'var(--bg2)',
      border: `2px solid ${selecionada ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 12, padding: 16, cursor: 'pointer',
      transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
    }} onClick={() => onToggle(vtr.prefixo)}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{vtr.prefixo}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{vtr.modelo}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>{vtr.placa}</div>
        </div>
        <div style={{
          width: 20, height: 20, borderRadius: 4,
          background: selecionada ? 'var(--accent)' : 'transparent',
          border: `2px solid ${selecionada ? 'var(--accent)' : 'var(--border2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0
        }}>
          {selecionada && '✓'}
        </div>
      </div>
      <QRCodeImg value={url} size={120} />
      <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', wordBreak: 'break-all' }}>{url}</div>
    </div>
  );
};

export default function TabQRCode({ showToast }) {
  const [selecionadas, setSelecionadas] = useState([]);
  const printRef = useRef(null);

  const toggleSelecionada = (prefixo) => {
    setSelecionadas(s => s.includes(prefixo) ? s.filter(p => p !== prefixo) : [...s, prefixo]);
  };

  const selecionarTodas = () => setSelecionadas(VIATURAS_OPERACIONAIS.map(v => v.prefixo));
  const limparSelecao = () => setSelecionadas([]);

  const imprimir = () => {
    if (selecionadas.length === 0) return showToast('Selecione pelo menos uma viatura', 'error');

    const vtrsParaImprimir = VIATURAS_OPERACIONAIS.filter(v => selecionadas.includes(v.prefixo));

    const cartoes = vtrsParaImprimir.map(vtr => {
      const url = `${BASE_URL}/${vtr.prefixo}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&format=png&margin=10`;
      return `
        <div class="cartao">
          <div class="header-cartao">
            <div class="brasao">🛡️</div>
            <div>
              <div class="titulo-pm">POLÍCIA MILITAR - SP</div>
              <div class="subtitulo">5ª CIA PM | 6º BPM/I</div>
            </div>
          </div>
          <div class="prefixo">${vtr.prefixo}</div>
          <div class="info">${vtr.modelo}</div>
          <div class="info placa">${vtr.placa}</div>
          <img src="${qrUrl}" class="qr" alt="QR Code" />
          <div class="instrucao">Escaneie para registrar uso da viatura</div>
          <div class="url">${url}</div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>QR Codes — Viaturas 5a CIA PM</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #fff; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px; }
          .cartao {
            border: 2px solid #003366; border-radius: 12px; padding: 16px;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            page-break-inside: avoid; text-align: center;
          }
          .header-cartao { display: flex; align-items: center; gap: 10px; width: 100%; }
          .brasao { font-size: 28px; }
          .titulo-pm { font-size: 10px; font-weight: 700; color: #003366; text-transform: uppercase; letter-spacing: 0.05em; }
          .subtitulo { font-size: 9px; color: #6b7280; }
          .prefixo { font-size: 24px; font-weight: 700; color: #003366; }
          .info { font-size: 11px; color: #374151; }
          .placa { font-family: monospace; font-size: 13px; font-weight: 700; }
          .qr { width: 160px; height: 160px; }
          .instrucao { font-size: 10px; color: #6b7280; font-style: italic; }
          .url { font-size: 8px; color: #9ca3af; word-break: break-all; }
          @media print {
            body { padding: 0; }
            .grid { padding: 10px; gap: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="grid">${cartoes}</div>
      </body>
      </html>
    `;

    const janela = window.open('', '_blank');
    janela.document.write(html);
    janela.document.close();
    setTimeout(() => janela.print(), 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controles */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          {selecionadas.length} de {VIATURAS_OPERACIONAIS.length} selecionadas
        </div>
        <button onClick={selecionarTodas} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          Selecionar Todas
        </button>
        <button onClick={limparSelecao} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          Limpar
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={imprimir} disabled={selecionadas.length === 0} style={{
          background: '#003366', color: '#fff', padding: '9px 20px', borderRadius: 8,
          border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
          opacity: selecionadas.length === 0 ? 0.5 : 1
        }}>
          Imprimir QR Codes ({selecionadas.length})
        </button>
      </div>

      {/* Grid de cartões */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {VIATURAS_OPERACIONAIS.map(vtr => (
          <CartaoVTR
            key={vtr.prefixo}
            vtr={vtr}
            selecionada={selecionadas.includes(vtr.prefixo)}
            onToggle={toggleSelecionada}
          />
        ))}
      </div>
    </div>
  );
}
