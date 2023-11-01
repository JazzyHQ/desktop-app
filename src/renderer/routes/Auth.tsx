import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  HomeIcon,
  PlusCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { QueryClient, useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  NavLink,
  Navigate,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { IAuthTokens, IRefreshedAccessToken, IUserModel } from 'renderer/types';
import { Toaster } from '~/components/ui/toaster';
import { ONE_MINUTES_IN_MS } from '~/constants';
import { classNames } from '~/lib/utils';
import queries from '~/queries';
import logo from '../../../assets/icons/128x128.png';

interface AuthContextType {
  user: IUserModel | null;
  api: AxiosInstance;
  login: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType>(null!);
const BASE_URL = window.electron.baseAPIURL;
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const clearStoredCredentials = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const getStoredCredentials = (): IAuthTokens => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
};

// Add a request interceptor to add the JWT token to the authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // eslint-disable-next-line promise/no-promise-in-callback
  (error) => Promise.reject(error)
);

// Add a response interceptor to refresh the JWT token if it's expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken: storedRefreshToken } = getStoredCredentials();

    // If the error is a 401 and we have a refresh token, refresh the JWT token
    console.log('Error in axios request: ', error);
    if (error.response.status === 401 && storedRefreshToken) {
      const refreshToken = storedRefreshToken;

      const data = JSON.stringify({
        refresh: refreshToken,
      });

      try {
        const resp = await axios.post<IRefreshedAccessToken>(
          `${BASE_URL}/token/refresh/`,
          data,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        // eslint-disable-next-line promise/always-return
        const { data: refreshedAccessTokenResponse } = resp;
        localStorage.setItem(
          'accessToken',
          refreshedAccessTokenResponse.access
        );

        // Re-run the original request that was intercepted
        originalRequest.headers.Authorization = `Bearer ${refreshedAccessTokenResponse.access}`;

        try {
          return api(originalRequest);
        } catch (err) {
          clearStoredCredentials();
          console.log('Error from original request: ', err);
        }
        // return api(originalRequest)
      } catch (err) {
        clearStoredCredentials();
        console.log('Error from refreshing token: ', err);
      }
    }

    console.log('Returning rejected promise');
    // Return the original error if we can't handle it
    return Promise.reject(error);
  }
);

export const loader = (queryClient: QueryClient) => {
  return async () => {
    const { queryKey, queryFn } = queries.GET_USER(api);
    const data = await queryClient.fetchQuery(queryKey, queryFn);
    return data;
  };
};

export function AuthError() {
  useEffect(() => {
    window.electron.emitAuthFailed();
  }, []);
  return <Navigate to="/login" replace />;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<IUserModel | null>(null);
  const apiRef = React.useRef<AxiosInstance>(api);
  const loaderData = useLoaderData() as AxiosResponse<IUserModel>;
  const navigate = useNavigate();

  useQuery({
    ...queries.GET_USER(api),
    refetchInterval: ONE_MINUTES_IN_MS,
    onError: () => {
      navigate('/login', { replace: true });
    },
  });

  const logout = useCallback(() => {
    setUser(null);
    clearStoredCredentials();
  }, []);

  const login = useCallback(() => {
    logout();
    window.open(window.electron.loginUrl, '_blank');
  }, [logout]);

  useEffect(() => {
    if (loaderData) {
      setUser(loaderData.data);
    }
  }, [loaderData]);

  const value = useMemo(() => {
    return {
      user,
      api: apiRef.current,
      login,
      logout,
    };
  }, [login, logout, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export default function AuthenticatedLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.electron.emitAuthSuccess();
  }, []);

  useEffect(() => {
    return window.electron.onNavigate((_event, data) => {
      navigate(data.url);
    });
  }, [navigate]);

  const navigation = useMemo(() => {
    return [
      {
        name: 'Home',
        href: '/',
        icon: HomeIcon,
        current: location.pathname === '/',
      },
      {
        name: 'New Issue',
        href: '/actions/jira/new-jira-issue',
        icon: PlusCircleIcon,
        current: location.pathname === '/actions/jira/new-jira-issue',
      },
    ];
  }, [location.pathname]);

  return (
    <AuthProvider>
      <Toaster />
      <div className="min-h-full">
        <Disclosure
          as="nav"
          className="bg-slate-500"
          style={{
            WebkitAppRegion: 'drag',
            ...({} as any),
          }}
        >
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img className="h-8 w-8" src={logo} alt="Jazzy" />
                    </div>
                    <div className="hidden sm:block">
                      <div className="ml-10 flex items-baseline space-x-4" />
                    </div>
                  </div>

                  <div className="-mr-2 flex sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-slate-600 p-2 text-slate-200 hover:bg-slate-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-600">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={NavLink}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-slate-700 text-white'
                          : 'text-white hover:bg-slate-500 hover:bg-opacity-75',
                        'block rounded-md px-3 py-2 text-base font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
