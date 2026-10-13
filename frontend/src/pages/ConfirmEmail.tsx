import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../api/auth';
import { useSeo } from '../utils/seo';

export default function ConfirmEmail() {
  useSeo({ title: 'Подтверждение email', noindex: true });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Токен не найден в ссылке');
      return;
    }
    authApi.confirmEmail(token)
      .then(() => setState('success'))
      .catch(() => {
        setState('error');
        setMessage('Ссылка недействительна или устарела. Запросите новое письмо.');
      });
  }, [token]);

  return (
    <div className="min-h-screen section-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-6 sm:p-8">
          {state === 'loading' && (
            <>
              <Loader2 size={40} className="mx-auto text-[#f97316] animate-spin mb-4" />
              <h1 className="text-lg font-bold text-white mb-2">Подтверждаем email…</h1>
            </>
          )}
          {state === 'success' && (
            <>
              <CheckCircle2 size={40} className="mx-auto text-green-400 mb-4" />
              <h1 className="text-lg font-bold text-white mb-2">Email подтверждён</h1>
              <p className="text-sm text-white/50 mb-6">Спасибо! Аккаунт полностью активирован.</p>
              <Link to="/login" className="btn-primary inline-flex px-6 py-2.5 rounded-xl text-sm">Войти</Link>
            </>
          )}
          {state === 'error' && (
            <>
              <XCircle size={40} className="mx-auto text-red-400 mb-4" />
              <h1 className="text-lg font-bold text-white mb-2">Не получилось подтвердить</h1>
              <p className="text-sm text-white/50 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-flex px-6 py-2.5 rounded-xl text-sm">К входу</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
