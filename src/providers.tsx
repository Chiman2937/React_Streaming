import { QueryProvider } from '@/providers/QueryProvider';

import { MSWProvider } from './providers/MSWProvider';

interface Props {
  children: React.ReactNode;
}
const Providers = ({ children }: Props) => {
  return (
    <MSWProvider>
      <QueryProvider>{children}</QueryProvider>
    </MSWProvider>
  );
};

export default Providers;
