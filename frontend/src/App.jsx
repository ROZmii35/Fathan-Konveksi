import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, Link, useNavigate } from 'react-router-dom'
import { api, token } from './api'

export const COLORS = [['Hitam','#222'],['Navy','#26355c'],['Denim','#4f6d98'],['Maroon','#7a1f35'],['Ungu terong','#563152'],['Lilac','#b9a6d1'],
['Hijau botol','#1f5540'],['Army','#5c6338'],['Sage','#9fb09b'],['Dusty pink','#d6a5a3'],['Salem','#ebb6a2'],['Mustard','#cfa233'],
['Coksu','#bb9376'],['Mocca','#a37a5d'],['Milo','#86624f'],['Taupe','#948677'],['Abu misty','#b9bbba'],['Broken white','#eee9de']]
const hex = n => (COLORS.find(c => c[0] === n) || [0, '#ccc'])[1]
const rp = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const STAGES = ['Pesanan masuk', 'Diproses', 'Finishing', 'Selesai', 'Diserahkan']
const PRODUCTS = { 'Hijab segi empat': ['Voal ultrafine','Ceruty babydoll','Katun paris'], Pashmina: ['Ceruty babydoll','Jersey','Diamond crepe'],
  Bergo: ['Jersey premium','Wolfis'], Khimar: ['Wolfis','Ceruty babydoll','Diamond crepe'], Seragam: ['Toyobo','Katun','American drill'] }
const WA = 'https://wa.me/'

const Auth = createContext()
const useAuth = () => useContext(Auth)
function useData(path) {
  const [d, setD] = useState(null), [e, setE] = useState('')
  const load = useCallback(() => api(path).then(setD).catch(x => setE(x.message)), [path])
  useEffect(() => { load() }, [load])
  return [d, load, e]
}
const Logo = ({ light }) => <span className="serif" style={{ fontSize: 26, color: light ? '#fff' : undefined }}>FMK <i style={{ fontSize: 13, fontWeight: 500 }}>Fathan Mubina Konveksi</i></span>

function Swatches({ value, onToggle }) {
  return <div className="swatches">{COLORS.map(([n, c]) => <button type="button" key={n} className={value.includes(n) ? 'on' : ''} onClick={() => onToggle(n)}><i style={{ background: c }} />{n}</button>)}</div>
}

/* ---------- publik ---------- */
function Landing() {
  const { user } = useAuth(); const [sel, setSel] = useState('Sage')
  return <div>
    <div className="top" style={{ justifyContent: 'space-between' }}><Logo />
      <div className="row"><a href="#produk">Produk</a><a href="#cara">Cara pesan</a>
        {user ? <Link className="btn" to="/app">Buka akun</Link> : <><Link to="/masuk">Masuk</Link><Link className="btn" to="/daftar">Daftar</Link></>}</div></div>
    <section className="hero grid-bg" style={{ marginTop: 16 }}>
      <div><h1>Hijab dan seragam untuk sekolah, pesantren, dan komunitas.</h1>
        <p style={{ fontSize: 16 }}>Pilih model, bahan, dan warnanya. Kami hitungkan harga dan tenggat, lalu Anda bisa memantau setiap tahap jahitan dari akun pelanggan.</p>
        <div className="row"><Link className="btn y" to="/daftar">Mulai pesan</Link><a className="btn" style={{ background: 'transparent', borderColor: '#fff' }} href={WA}>Tanya lewat WhatsApp</a></div></div>
      <div className="card" style={{ transform: 'rotate(-2deg)' }}><div className="row sp"><h3>Kartu warna</h3><span className="muted">Pilih warna untuk melihat contohnya</span></div>
        <div style={{ height: 80, background: hex(sel), clipPath: 'polygon(0 0,100% 0,50% 100%)', margin: '12px 0' }} /><b className="serif" style={{ fontSize: 22 }}>{sel}</b>
        <p className="muted">Warna di layar bisa sedikit berbeda dari kain asli. Minta contoh kain sebelum produksi dimulai.</p>
        <Swatches value={[sel]} onToggle={setSel} /></div>
    </section>
    <section id="produk" className="page"><div className="row sp"><h2>Yang kami jahit</h2><span className="muted" style={{ maxWidth: 360 }}>Harga dihitung dari model, bahan, dan jumlah. Kirim kebutuhan Anda, admin akan membalas dengan penawaran lengkap.</span></div>
      <table style={{ marginTop: 16 }}><thead><tr><th>Produk</th><th>Bahan yang bisa dipilih</th></tr></thead>
        <tbody>{Object.entries(PRODUCTS).map(([p, m]) => <tr key={p}><td className="serif" style={{ fontSize: 18 }}>{p}</td><td>{m.join(', ')}</td></tr>)}</tbody></table></section>
    <section id="cara" className="page"><h2>Dari pesanan sampai serah terima</h2>
      <p className="muted">Lima langkah memesan di FMK. Setelah uang muka dibayar, setiap tahap jahitan bisa Anda pantau dari akun.</p><div className="ruler" />
      <div className="stats">{[['Konsultasi dan penawaran','Kirim model, bahan, warna, ukuran, dan jumlah.'],['Bayar uang muka','Pesanan mendapat nomor dan masuk antrean.'],['Potong dan jahit','Tampil sebagai Diproses di akun Anda.'],['Finishing dan pemeriksaan','Setiap potong diperiksa lalu dikemas.'],['Serah terima dan pelunasan','Sisa tagihan dilunasi dan tercatat.']].map(([t, d], i) => <div key={t}><b>{i + 1}</b><b style={{ fontFamily: 'inherit', fontSize: 15 }}>{t}</b><p className="muted">{d}</p></div>)}</div></section>
    <footer className="foot"><div className="foot-in">
      <div className="row sp" style={{ alignItems: 'flex-end' }}>
        <div><div className="foot-logo">FMK</div><i className="serif foot-sub">Fathan Mubina Konveksi</i></div>
        <a className="btn y" href={WA}>Chat admin di WhatsApp</a></div>
      <div className="foot-cols">{[['Alamat workshop', '[Alamat lengkap workshop]'], ['WhatsApp admin', '[Nomor WhatsApp]'], ['Jam kerja', '[Hari dan jam operasional]'], ['Instagram', '[Nama akun]']].map(([l, v]) => <div key={l}><div className="foot-l">{l}</div><div>{v}</div></div>)}</div>
      <p className="foot-l foot-copy">© 2026 Fathan Mubina Konveksi. Website dikembangkan bersama Tim Itenas.</p></div></footer>
  </div>
}

function AuthShell({ title, sub, children }) {
  return <div className="grid-bg" style={{ minHeight: '100vh', padding: 16 }}><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>‹ Kembali ke beranda</Link>
    <div className="tag"><div style={{ textAlign: 'center' }}><Logo /></div><hr style={{ borderStyle: 'dashed', borderColor: 'var(--line)' }} />
      <h2 style={{ textAlign: 'center', fontSize: 26 }}>{title}</h2><p className="muted" style={{ textAlign: 'center' }}>{sub}</p>{children}</div></div>
}

function Login() {
  const { setUser } = useAuth(); const nav = useNavigate(); const [f, setF] = useState({ username: '', password: '' }); const [err, setErr] = useState('')
  const go = async e => { e.preventDefault(); try { const r = await api('/auth/login', { method: 'POST', form: f }); token.set(r.access_token); setUser(r.user); nav('/app') } catch (x) { setErr(x.message) } }
  return <AuthShell title="Masuk ke akun" sub="Untuk pemilik, staf, dan pelanggan FMK."><form onSubmit={go}>
    <label>Email atau nomor WhatsApp</label><input value={f.username} onChange={e => setF({ ...f, username: e.target.value })} required />
    <label>Kata sandi</label><input type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required />
    {err && <p className="err">{err}</p>}<button className="btn" style={{ width: '100%', marginTop: 16 }}>Masuk</button></form>
    <p style={{ textAlign: 'center' }}>Belum punya akun? <Link to="/daftar">Daftar sebagai pelanggan</Link></p>
    <p className="muted" style={{ textAlign: 'center' }}>Akun staf dibuat oleh pemilik usaha.</p></AuthShell>
}

function Register() {
  const { setUser } = useAuth(); const nav = useNavigate(); const [f, setF] = useState({ name: '', org: '', wa: '', email: '', password: '', again: '', ok: false }); const [err, setErr] = useState('')
  const s = k => e => setF({ ...f, [k]: e.target.value })
  const go = async e => { e.preventDefault()
    if (f.password !== f.again) return setErr('Kata sandi tidak sama.')
    if (!f.ok) return setErr('Centang persetujuan data terlebih dulu.')
    try { const r = await api('/auth/register', { method: 'POST', body: f }); token.set(r.access_token); setUser(r.user); nav('/app') } catch (x) { setErr(x.message) } }
  return <AuthShell title="Buat akun pelanggan" sub="Dengan akun, Anda bisa mengajukan pesanan, memantau tahap jahitan, dan melihat tagihan."><form onSubmit={go}>
    <label>Nama lengkap</label><input value={f.name} onChange={s('name')} placeholder="Nama sesuai kontak WhatsApp" required />
    <label>Nama sekolah, instansi, atau komunitas (opsional)</label><input value={f.org} onChange={s('org')} placeholder="Contoh: SDIT Al-Fikri" />
    <div className="row"><div style={{ flex: 1 }}><label>Nomor WhatsApp</label><input value={f.wa} onChange={s('wa')} required /></div><div style={{ flex: 1 }}><label>Email</label><input type="email" value={f.email} onChange={s('email')} required /></div></div>
    <div className="row"><div style={{ flex: 1 }}><label>Kata sandi</label><input type="password" minLength={8} value={f.password} onChange={s('password')} required /></div><div style={{ flex: 1 }}><label>Ulangi kata sandi</label><input type="password" value={f.again} onChange={s('again')} required /></div></div>
    <label style={{ fontWeight: 400 }}><input type="checkbox" style={{ width: 'auto' }} checked={f.ok} onChange={e => setF({ ...f, ok: e.target.checked })} /> Saya setuju data ini dipakai FMK untuk mengurus pesanan dan tagihan saya.</label>
    {err && <p className="err">{err}</p>}<button className="btn" style={{ width: '100%' }}>Buat akun</button></form>
    <p style={{ textAlign: 'center' }}>Sudah punya akun? <Link to="/masuk">Masuk</Link></p></AuthShell>
}

/* ---------- area staf ---------- */
function Shell({ children }) {
  const { user, logout } = useAuth(); const own = user.role === 'owner'
  const links = [...(own ? [['ringkasan', 'Ringkasan usaha'], ['keuangan', 'Keuangan dan laporan'], ['pengguna', 'Pengguna dan hak akses']] : []),
    ['papan', 'Papan produksi'], ['catat', 'Catat pesanan'], ['stok', 'Stok bahan'], ['pelanggan', 'Pelanggan']]
  return <div className="shell"><nav className="side"><Logo light />{links.map(([p, t]) => <NavLink key={p} to={'/app/' + p}>{t}</NavLink>)}
    <div style={{ marginTop: 'auto' }}><b>{user.name}</b><div className="muted" style={{ color: '#cfe0d6' }}>{own ? 'Super admin' : 'Admin'}</div><button className="btn sm o" onClick={logout}>Keluar</button></div></nav><main className="main">{children}</main></div>
}
const Head = ({ t, sub, children }) => <div className="row sp" style={{ marginBottom: 16 }}><div><h2>{t}</h2><div className="muted">{sub}</div></div><div className="row">{children}</div></div>

function Summary() {
  const [d] = useData('/finance/summary'); if (!d) return null
  return <><Head t="Ringkasan usaha" sub="Seluruh buku kas sampai hari ini" />
    <div className="stats"><div className="card"><span className="muted">Kas masuk</span><b>{rp(d.masuk)}</b></div><div className="card"><span className="muted">Kas keluar</span><b>{rp(d.keluar)}</b></div>
      <div className="card"><span className="muted">Arus kas bersih</span><b>{rp(d.bersih)}</b></div><div className="card"><span className="muted">Pesanan aktif</span><b>{d.active}</b></div></div>
    <div className="cols" style={{ marginTop: 16 }}><div className="card"><h3>Tagihan belum lunas</h3><table><tbody>{d.receivables.map(o => <tr key={o.id}><td><b>{o.customer}</b><div className="muted">{o.no}</div></td><td className="r"><b>{rp(o.remaining)}</b><div className="muted">Tenggat {o.due}</div></td></tr>)}</tbody></table></div>
      <div className="card"><h3>Stok di bawah batas</h3>{d.low_stock.map(s => <p key={s.id}><b>{s.name}, {s.color}</b><br /><span className="err">Sisa {s.qty} {s.unit}, minimum {s.min}</span></p>)}</div></div></>
}

function Board() {
  const [os, load] = useData('/orders'); const [err, setErr] = useState(''); const nav = useNavigate()
  const go = async (o, st) => { try { await api(`/orders/${o.id}/stage`, { method: 'PATCH', body: { stage: st } }); load(); setErr('') } catch (x) { setErr(x.message) } }
  const dp = async o => { const a = prompt('Jumlah DP (Rp)'); if (a) { await api(`/orders/${o.id}/payments`, { method: 'POST', body: { amount: +a, kind: 'Uang muka' } }); load() } }
  const pay = async o => { const a = prompt(`Pembayaran (sisa ${rp(o.remaining)})`); if (a) { await api(`/orders/${o.id}/payments`, { method: 'POST', body: { amount: +a, kind: +a >= o.remaining ? 'Pelunasan' : 'Cicilan' } }); load() } }
  if (!os) return null
  return <><Head t="Papan produksi" sub="Perbarui status setiap kali tahap jahitan berubah, pelanggan langsung melihatnya di akun mereka."><button className="btn" onClick={() => nav('/app/catat')}>+ Catat pesanan</button></Head>
    {err && <p className="err">{err}</p>}
    <div className="kanban">{STAGES.map((st, i) => <div className="col" key={st}><b>{i + 1} {st} ({os.filter(o => o.stage === st).length})</b>
      {os.filter(o => o.stage === st).map(o => <div className="card" key={o.id}><div className="row sp"><b>{o.no}</b>{o.paid ? <span className="pill">DP dibayar</span> : <span className="pill w">Menunggu DP</span>}</div>
        <b>{o.customer}</b><div className="muted">{o.product} {o.material}, {o.colors.reduce((a, c) => a + c.qty, 0)} pcs</div>
        <div className="row" style={{ gap: 4 }}>{o.colors.map(c => <span key={c.color} className="sw" style={{ background: hex(c.color), width: 16, height: 16 }} title={c.color} />)}</div>
        <div className="muted">Tenggat {o.due} · Sisa {rp(o.remaining)}</div>
        <div className="row" style={{ marginTop: 8 }}>{!o.paid && <button className="btn sm o" onClick={() => dp(o)}>Catat DP</button>}
          {o.remaining > 0 && o.paid > 0 && <button className="btn sm o" onClick={() => pay(o)}>Catat bayar</button>}
          {i < 4 && o.paid > 0 && <button className="btn sm o" onClick={() => go(o, STAGES[i + 1])}>Pindah ke {STAGES[i + 1]}</button>}</div></div>)}</div>)}</div></>
}

function NewOrder() {
  const [cs] = useData('/customers'); const nav = useNavigate(); const [err, setErr] = useState('')
  const [f, setF] = useState({ customer_id: '', product: 'Hijab segi empat', material: 'Voal ultrafine', size: '115 x 115 cm', price: 38000, due: '', note: '', dp_percent: 50 })
  const [q, setQ] = useState({}); const pcs = Object.values(q).reduce((a, b) => a + (+b || 0), 0); const total = pcs * f.price
  const s = k => e => setF({ ...f, [k]: e.target.value })
  const toggle = n => setQ(p => { const x = { ...p }; n in x ? delete x[n] : (x[n] = 0); return x })
  const save = async () => { try { await api('/orders', { method: 'POST', body: { ...f, customer_id: +f.customer_id, price: +f.price, dp_percent: +f.dp_percent, colors: Object.entries(q).map(([color, qty]) => ({ color, qty: +qty })) } }); nav('/app/papan') } catch (x) { setErr(x.message) } }
  if (!cs) return null
  return <><Head t="Catat pesanan baru" sub="Nomor pesanan dibuat otomatis saat disimpan." /><div className="cols"><div>
    <div className="card"><h3>Pelanggan</h3><select value={f.customer_id} onChange={s('customer_id')}><option value="">Pilih pelanggan</option>{cs.map(c => <option key={c.id} value={c.id}>{c.org || c.name}, {c.name}</option>)}</select></div>
    <div className="card"><h3>Produk dan bahan</h3><div className="row">{Object.keys(PRODUCTS).map(p => <button key={p} className={'btn sm ' + (f.product === p ? '' : 'o')} onClick={() => setF({ ...f, product: p, material: PRODUCTS[p][0] })}>{p}</button>)}</div>
      <label>Bahan</label><select value={f.material} onChange={s('material')}>{PRODUCTS[f.product].map(m => <option key={m}>{m}</option>)}</select><label>Ukuran</label><input value={f.size} onChange={s('size')} /></div>
    <div className="card"><h3>Warna dan jumlah</h3><Swatches value={Object.keys(q)} onToggle={toggle} />
      {Object.keys(q).map(n => <div className="row" key={n} style={{ marginTop: 10 }}><span className="sw" style={{ background: hex(n) }} /><b style={{ width: 110 }}>{n}</b><input type="number" style={{ width: 100 }} value={q[n]} onChange={e => setQ({ ...q, [n]: e.target.value })} /> pcs</div>)}</div>
    <div className="card"><h3>Harga dan tenggat</h3><label>Harga per pcs (Rp)</label><input type="number" value={f.price} onChange={s('price')} /><label>Tenggat selesai</label><input type="date" value={f.due} onChange={s('due')} /><label>Catatan untuk produksi</label><textarea rows={3} value={f.note} onChange={s('note')} /></div>
    <div className="card"><h3>Pembayaran awal</h3><div className="row">{[[30, 'DP 30%'], [50, 'DP 50%'], [100, 'Lunas di awal'], [0, 'Belum bayar']].map(([v, t]) => <button key={v} className={'btn sm ' + (+f.dp_percent === v ? '' : 'o')} onClick={() => setF({ ...f, dp_percent: v })}>{t}</button>)}</div></div></div>
    <div><div className="card"><h3>Ringkasan pesanan</h3><p className="muted">{f.product} {f.material}</p><div className="row sp"><span>Total jumlah</span><b>{pcs} pcs</b></div>
      <p className="muted">Total harga</p><b className="serif" style={{ fontSize: 28 }}>{rp(total)}</b>
      <div className="row sp"><span>Uang muka {f.dp_percent}%</span><b>{rp(total * f.dp_percent / 100)}</b></div><div className="row sp"><span>Sisa tagihan</span><b>{rp(total - total * f.dp_percent / 100)}</b></div>
      {err && <p className="err">{err}</p>}<button className="btn" style={{ width: '100%', marginTop: 12 }} disabled={!f.customer_id || !f.due || !pcs} onClick={save}>Simpan pesanan</button></div></div></div></>
}

function Stock() {
  const [s, load] = useData('/stock'); if (!s) return null
  const move = async (id, dir) => { const q = prompt('Jumlah ' + dir); if (q) { try { await api('/stock/move', { method: 'POST', body: { stock_id: id, qty: +q, direction: dir } }) } catch (x) { alert(x.message) } load() } }
  const low = s.filter(x => x.low)
  return <><Head t="Stok bahan" sub="Catat setiap bahan masuk dan keluar. Bahan di bawah batas minimum ditandai supaya bisa dibeli sebelum habis." />
    {low.length > 0 && <div className="card" style={{ background: '#fbe5e8' }}><b>{low.length} bahan di bawah batas minimum.</b></div>}
    <div className="card"><table><thead><tr><th>Bahan</th><th>Warna</th><th className="r">Stok</th><th className="r">Minimum</th><th>Kondisi</th><th /></tr></thead>
      <tbody>{s.map(x => <tr key={x.id}><td>{x.name}</td><td>{x.color}</td><td className="r"><b>{x.qty} {x.unit}</b></td><td className="r">{x.min}</td>
        <td>{x.low ? <span className="pill r">Di bawah batas, beli {x.min * 2 - x.qty}</span> : <span className="pill">Aman</span>}</td>
        <td className="r"><button className="btn sm o" onClick={() => move(x.id, 'masuk')}>Masuk</button> <button className="btn sm o" onClick={() => move(x.id, 'keluar')}>Keluar</button></td></tr>)}</tbody></table></div></>
}

function Customers() {
  const [c] = useData('/customers'); if (!c) return null
  return <><Head t="Pelanggan" sub="Kontak dan riwayat pesanan setiap pelanggan." /><div className="card"><table><thead><tr><th>Pelanggan</th><th className="r">Pesanan</th><th className="r">Total belanja</th><th /></tr></thead>
    <tbody>{c.map(x => <tr key={x.id}><td><b>{x.org || x.name}</b><div className="muted">{x.name}, {x.wa}</div></td><td className="r">{x.orders}</td><td className="r">{rp(x.spent)}</td><td className="r"><a className="btn sm o" href={WA + x.wa.replace(/\D/g, '')}>Kirim pesan WhatsApp</a></td></tr>)}</tbody></table></div></>
}

function Finance() {
  const [c, load] = useData('/finance/cashbook'); const [f, setF] = useState({ desc: '', cat: 'Operasional', amount: '', direction: 'keluar' }); if (!c) return null
  const add = async e => { e.preventDefault(); await api('/finance/cashbook', { method: 'POST', body: { ...f, amount: +f.amount } }); setF({ ...f, desc: '', amount: '' }); load() }
  return <><Head t="Keuangan dan laporan" sub="Setiap pembayaran pelanggan terhubung ke nomor pesanannya." />
    <form className="card row" onSubmit={add}><input style={{ flex: 2 }} placeholder="Keterangan" value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} required />
      <input style={{ flex: 1 }} placeholder="Kategori" value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} /><input style={{ flex: 1 }} type="number" placeholder="Rp" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} required />
      <select style={{ flex: 1 }} value={f.direction} onChange={e => setF({ ...f, direction: e.target.value })}><option value="keluar">Kas keluar</option><option value="masuk">Kas masuk</option></select><button className="btn">Catat transaksi</button></form>
    <div className="card"><h3>Buku kas</h3><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>No. pesanan</th><th className="r">Masuk</th><th className="r">Keluar</th></tr></thead>
      <tbody>{c.map(x => <tr key={x.id}><td>{x.date}</td><td>{x.desc}</td><td>{x.cat}</td><td>{x.order_no || <span className="muted">Tanpa pesanan</span>}</td><td className="r" style={{ color: 'var(--g)' }}>{x.masuk ? rp(x.masuk) : ''}</td><td className="r" style={{ color: 'var(--amber)' }}>{x.keluar ? rp(x.keluar) : ''}</td></tr>)}</tbody></table></div></>
}

function Users() {
  const [u, load] = useData('/users'); const [f, setF] = useState({ name: '', email: '', wa: '', password: '' }); const [err, setErr] = useState(''); if (!u) return null
  const add = async e => { e.preventDefault(); try { await api('/users', { method: 'POST', body: f }); setF({ name: '', email: '', wa: '', password: '' }); load() } catch (x) { setErr(x.message) } }
  const peran = { owner: 'Pemilik', admin: 'Admin', customer: 'Pelanggan' }
  return <><Head t="Pengguna dan hak akses" sub="Atur siapa yang bisa masuk dan bagian mana yang bisa mereka buka." />
    <form className="card row" onSubmit={add}>{['name', 'email', 'wa', 'password'].map(k => <input key={k} style={{ flex: 1 }} type={k === 'password' ? 'password' : 'text'} placeholder={{ name: 'Nama staf', email: 'Email', wa: 'WhatsApp', password: 'Kata sandi awal' }[k]} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} required />)}<button className="btn">Tambah akun staf</button>{err && <span className="err">{err}</span>}</form>
    <div className="card"><table><thead><tr><th>Nama</th><th>Peran</th><th>Status</th><th /></tr></thead><tbody>{u.map(x => <tr key={x.id}><td><b>{x.name}</b><div className="muted">{x.org || x.wa}</div></td><td>{peran[x.role]}</td><td>{x.active ? 'Aktif' : 'Nonaktif'}</td>
      <td className="r">{x.role !== 'owner' && <button className="btn sm o" onClick={async () => { await api(`/users/${x.id}/toggle`, { method: 'PATCH' }); load() }}>{x.active ? 'Nonaktifkan' : 'Aktifkan'}</button>}</td></tr>)}</tbody></table>
      <p className="muted">Admin tidak bisa melihat saldo kas, laba, dan laporan keuangan.</p></div></>
}

/* ---------- area pelanggan ---------- */
function CustomerLayout({ children }) {
  const { user, logout } = useAuth()
  return <div><div className="top"><Logo /><NavLink to="/app/pesanan">Pesanan saya</NavLink><NavLink to="/app/ajukan">Ajukan pesanan</NavLink><span style={{ marginLeft: 'auto' }}>{user.name}</span><button className="btn sm o" onClick={logout}>Keluar</button></div><div className="page">{children}</div></div>
}

function MyOrders() {
  const { user } = useAuth(); const [os] = useData('/orders'); const [i, setI] = useState(0); if (!os) return null
  const act = os.filter(o => o.stage !== 'Diserahkan'), done = os.filter(o => o.stage === 'Diserahkan'), o = act[i]
  return <><Head t="Pesanan Anda" sub={`${user.org || user.name}. ${act.length} pesanan sedang dikerjakan.`}><Link className="btn" to="/app/ajukan">+ Ajukan pesanan baru</Link></Head>
    <div className="row">{act.map((x, k) => <button key={x.id} className={'btn sm ' + (k === i ? '' : 'o')} onClick={() => setI(k)}>{x.no} · {x.stage}</button>)}</div>
    {o && <div className="cols" style={{ marginTop: 16 }}><div className="card"><div className="row sp"><b>{o.no}</b><span className="muted">Tenggat {o.due}</span></div>
      <h2>{o.product} {o.material.toLowerCase()}</h2><p className="muted">{o.colors.map(c => `${c.qty} pcs ${c.color}`).join(', ')}{o.size && `, ukuran ${o.size}`}</p>
      <div className="ruler" style={{ '--p': (STAGES.indexOf(o.stage) + 0.5) * 20 + '%' }}><span /></div>
      <div className="stg">{STAGES.map(s => s === o.stage ? <b key={s}>{s}</b> : <span key={s}>{s}</span>)}</div>
      {o.note && <div className="card" style={{ background: '#eef1ee', marginTop: 16 }}><b>Catatan pesanan</b><p>{o.note}</p></div>}</div>
      <div className="card"><h3>Tagihan pesanan ini</h3><div className="row sp"><span>Total harga</span><b>{rp(o.total)}</b></div><div className="row sp"><span>Sudah dibayar</span><b>{rp(o.paid)}</b></div>
        <p className="muted">Sisa tagihan</p><b className="serif" style={{ fontSize: 28 }}>{rp(o.remaining)}</b><p className="muted">{Math.round(o.paid / o.total * 100)}% sudah dibayar. Dilunasi saat serah terima.</p>
        <a className="btn y" href={WA}>Kirim bukti transfer lewat WhatsApp</a></div></div>}
    <div className="card"><h3>Pesanan yang sudah selesai</h3>{done.length === 0 && <p className="muted">Belum ada pesanan selesai.</p>}
      {done.map(x => <div key={x.id} className="row sp" style={{ padding: '8px 0' }}><span><b>{x.product} {x.material}</b><br /><span className="muted">{x.no}</span></span><Link className="btn sm o" to="/app/ajukan">Pesan lagi</Link></div>)}</div></>
}

function Request() {
  const nav = useNavigate(); const [f, setF] = useState({ product: 'Hijab segi empat', material: 'Voal ultrafine', colors: [], qty: 100, size: '115 x 115 cm', needed: '', note: '' }); const [err, setErr] = useState('')
  const toggle = n => setF(p => ({ ...p, colors: p.colors.includes(n) ? p.colors.filter(c => c !== n) : [...p.colors, n] }))
  const send = async () => { try { await api('/requests', { method: 'POST', body: { ...f, qty: +f.qty, needed: f.needed || null } }); alert('Pengajuan terkirim. Admin akan membalas dengan penawaran.'); nav('/app/pesanan') } catch (x) { setErr(x.message) } }
  return <><Head t="Ajukan pesanan" sub="Ceritakan kebutuhan Anda. Admin FMK akan membalas dengan harga dan tenggat. Pesanan baru diproses setelah Anda setuju." />
    <div className="cols"><div><div className="card"><h3>Mau dibuatkan apa?</h3><div className="row">{Object.keys(PRODUCTS).map(p => <button key={p} className={'btn ' + (f.product === p ? '' : 'o')} onClick={() => setF({ ...f, product: p, material: PRODUCTS[p][0] })}>{p}</button>)}</div></div>
      <div className="card"><h3>Bahan</h3><div className="row">{PRODUCTS[f.product].map(m => <button key={m} className={'btn sm ' + (f.material === m ? '' : 'o')} onClick={() => setF({ ...f, material: m })}>{m}</button>)}</div></div>
      <div className="card"><h3>Warna</h3><p className="muted">Boleh pilih lebih dari satu.</p><Swatches value={f.colors} onToggle={toggle} /></div>
      <div className="card"><h3>Jumlah dan waktu</h3><label>Perkiraan jumlah (pcs)</label><input type="number" value={f.qty} onChange={e => setF({ ...f, qty: e.target.value })} /><label>Dibutuhkan tanggal</label><input type="date" value={f.needed} onChange={e => setF({ ...f, needed: e.target.value })} />
        <label>Catatan untuk admin (opsional)</label><textarea rows={3} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Contoh: pakai label nama komunitas, dikemas per 10 pcs" /></div></div>
      <div className="card" style={{ alignSelf: 'start' }}><h3>Pengajuan Anda</h3><p>{f.product}<br />{f.material}<br />{f.colors.join(', ') || 'Belum pilih warna'}<br /><b>{f.qty} pcs</b></p>
        {err && <p className="err">{err}</p>}<button className="btn" style={{ width: '100%' }} disabled={!f.colors.length} onClick={send}>Kirim pengajuan</button></div></div></>
}

/* ---------- root ---------- */
function Private() {
  const { user } = useAuth(); if (!user) return <Navigate to="/masuk" />
  if (user.role === 'customer') return <CustomerLayout><Routes><Route path="pesanan" element={<MyOrders />} /><Route path="ajukan" element={<Request />} /><Route path="*" element={<Navigate to="pesanan" />} /></Routes></CustomerLayout>
  const own = user.role === 'owner'
  return <Shell><Routes><Route path="papan" element={<Board />} /><Route path="catat" element={<NewOrder />} /><Route path="stok" element={<Stock />} /><Route path="pelanggan" element={<Customers />} />
    {own && <><Route path="ringkasan" element={<Summary />} /><Route path="keuangan" element={<Finance />} /><Route path="pengguna" element={<Users />} /></>}
    <Route path="*" element={<Navigate to={own ? 'ringkasan' : 'papan'} />} /></Routes></Shell>
}

export default function App() {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false)
  useEffect(() => { token.get() ? api('/auth/me').then(setUser).catch(() => token.set(null)).finally(() => setReady(true)) : setReady(true) }, [])
  const logout = () => { token.set(null); setUser(null) }
  if (!ready) return null
  return <Auth.Provider value={{ user, setUser, logout }}><BrowserRouter><Routes>
    <Route path="/" element={<Landing />} /><Route path="/masuk" element={<Login />} /><Route path="/daftar" element={<Register />} /><Route path="/app/*" element={<Private />} />
  </Routes></BrowserRouter></Auth.Provider>
}