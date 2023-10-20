import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IAuthTokens } from 'renderer/types';

export default function Login() {
  const nav = useNavigate();

  const handleLogin = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    window.open(window.electron.loginUrl, '_blank');
  };

  useEffect(() => {
    const onLoginHandler = (event: any, data: IAuthTokens) => {
      localStorage.setItem('accessToken', data.accessToken!);
      localStorage.setItem('refreshToken', data.refreshToken!);
      nav('/', { replace: true });
    };
    const unsubscribe = window.electron.onLogin(onLoginHandler);

    return unsubscribe;
  }, [nav]);

  return (
    <>
      {' '}
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            You need to sign into your account to continue
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleLogin}
            >
              Sign In
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
