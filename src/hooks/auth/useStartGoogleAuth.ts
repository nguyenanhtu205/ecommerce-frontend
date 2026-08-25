import useGetGoogleAuthorizeUrl from './useGetGoogleAuthorizeUrl';

export const PENDING_ROLE_KEY = 'pendingGoogleRole';

const useStartGoogleAuth = () => {
  const { getAuthorizeUrl, isPending, errorMessage } = useGetGoogleAuthorizeUrl();

  const startGoogleAuth = async (role: 'buyer' | 'seller') => {
    localStorage.setItem(PENDING_ROLE_KEY, role);

    const { url } = await getAuthorizeUrl();
    window.location.href = url;
  };

  return { startGoogleAuth, isPending, errorMessage };
};

export default useStartGoogleAuth;
