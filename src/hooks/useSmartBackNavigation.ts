import { useRouter } from '@tanstack/react-router';

export const useSmartBackNavigation = (fallbackRoute: string = '/') => {
  const router = useRouter();

  return () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: fallbackRoute });
    }
  };
};
