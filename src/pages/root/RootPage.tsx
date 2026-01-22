// src/pages/RootPage.tsx
import { useSuspenseQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
}

const RootPage = () => {
  const { data: users } = useSuspenseQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((r) => r.json()),
  });

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <span>{user.id}</span>
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
};

export default RootPage;
