import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { AuthGuard } from '@/components/auth/auth-guard';
import { getAppConfig } from '@/lib/utils';

export default async function Page() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return (
    <AuthGuard>
      <App appConfig={appConfig} />
    </AuthGuard>
  );
}
