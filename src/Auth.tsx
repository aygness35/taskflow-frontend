import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Layers,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';
import { api, saveSession } from './api';
import { Brand, ErrorBox } from './components';
import type { User } from './types';
export function Auth({ onLogin }: { onLogin: (user: User) => void }) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (register && (!/[A-Z]/.test(password) || !/\d/.test(password))) {
      setError('Şifren en az bir büyük harf ve bir rakam içermeli.');
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError(
        'Şifren en fazla 72 UTF-8 bayt olmalı. Daha kısa bir şifre kullan.',
      );
      return;
    }
    setBusy(true);
    try {
      const tokens = await api<{ accessToken: string; refreshToken: string }>(
        register ? '/auth/register' : '/auth/login',
        {
          method: 'POST',
          body: { email, password, ...(register ? { name } : {}) },
          public: true,
        },
      );
      saveSession(tokens);
      onLogin(await api<User>('/auth/me'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="story-content">
          <span className="eyebrow">DAHA AZ KARMAŞA. DAHA ÇOK İLERLEME.</span>
          <h1>
            Büyük fikirler.
            <br />
            Küçük adımlar.
            <br />
            <span>Birlikte başaralım.</span>
          </h1>
          <p>
            Ekibin, projelerin ve bir sonraki adımın.
            <br />
            Hepsi aynı yerde, aynı akışta.
          </p>
          <div className="story-board" aria-hidden="true">
            <div className="story-board-top">
              <span>
                <Layers size={16} /> Bir fikrin yolculuğu
              </span>
              <span>•••</span>
            </div>
            <div className="story-task">
              <span className="story-check">
                <Check size={16} />
              </span>
              <div>
                Harika bir fikir bul<small>Her şey bir fikirle başlar</small>
              </div>
              <span className="story-pill">Tamamlandı</span>
            </div>
            <div className="story-task">
              <span className="story-progress" />
              <div>
                Birlikte hayata geçir<small>Bir sonraki adım senin</small>
              </div>
              <span className="story-pill warm">Devam ediyor</span>
            </div>
            <div className="story-line">
              <span />
            </div>
            <footer>
              <span>Her adım, ileriye.</span>
              <ArrowRight size={17} />
            </footer>
          </div>
        </div>
        <div className="auth-story-footer">
          <span>İşine odaklan. Akışı bize bırak.</span>
          <span>© {new Date().getFullYear()} TaskFlow</span>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-top">
          <span>
            {register ? 'Zaten hesabın var mı?' : 'TaskFlow’da yeni misin?'}
          </span>
          <button
            className="text-button"
            onClick={() => {
              setRegister(!register);
              setError('');
            }}
          >
            {register ? 'Giriş yap' : 'Hesap oluştur'} <ArrowRight size={15} />
          </button>
        </div>
        <div className="auth-form-wrap">
          <span className="little-label">HADİ BAŞLAYALIM</span>
          <h2>{register ? 'Birlikte daha fazlası.' : 'Tekrar hoş geldin.'}</h2>
          <p>
            {register
              ? 'Hesabını oluştur, ilk çalışma alanını kur.'
              : 'Kaldığın yerden devam etmeye hazır mısın?'}
          </p>
          <form onSubmit={submit}>
            {register && (
              <label>
                Adın
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder="Ad Soyad"
                />
              </label>
            )}
            <label>
              E-posta adresi
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
                placeholder="sen@ekibin.com"
              />
            </label>
            <label>
              Şifre
              <div className="password-input">
                <input
                  type={visible ? 'text' : 'password'}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="En az 8 karakter"
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {register && (
                <small>En az 8 karakter, bir büyük harf ve bir rakam.</small>
              )}
            </label>
            {error && <ErrorBox message={error} />}
            <button className="button primary auth-submit" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <>
                  {register ? 'Hesap oluştur' : 'Giriş yap'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          {!register && (
            <button
              className="demo-button"
              onClick={() => {
                setEmail('alice@example.com');
                setPassword('TaskFlowDemo1!');
                setError('');
              }}
            >
              Örnek hesabı dene <ArrowUpRightIcon />
            </button>
          )}
          <div className="auth-note">
            <ShieldCheck size={16} />
            <span>Çalışma alanın, yalnızca ekibine açık.</span>
          </div>
        </div>
        <div className="auth-bottom">Bir sonraki güzel iş, burada başlar.</div>
      </section>
    </div>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={15} style={{ transform: 'rotate(-35deg)' }} />;
}
