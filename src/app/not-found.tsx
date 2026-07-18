import { Frown } from 'lucide-react';
import { cookies } from 'next/headers';
import { EmptyState } from '@/components/empty-state';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';

export default async function NotFound() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const locale: Locale = isValidLocale(raw) ? raw : 'zh';
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <EmptyState
        icon={<Frown className="h-6 w-6" />}
        title={tt('notFound')}
        description={tt('notFoundDescription')}
        action={{ label: tt('backHome'), href: '/', variant: 'default' }}
      />
    </div>
  );
}
