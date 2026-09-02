// `/auth/login?${getRedirectUrl}`
export function getRedirectUrl(redirect: string) {
  const params = new URLSearchParams({
    redirect,
  });

  return params.toString();
}