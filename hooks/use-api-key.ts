import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * A hook for checking if the current user has an API key for a specific service
 * @param service The service name to check (e.g., "openai", "github")
 * @returns Object with loading state and boolean indicating if the key exists
 */
export function useHasApiKey(service: string) {
  const { data: session } = useSession();
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkApiKey() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/keys?service=${encodeURIComponent(service)}`, {
          method: 'PATCH',
        });

        if (response.ok) {
          setHasKey(true);
        } else {
          setHasKey(false);
        }
      } catch (error) {
        console.error(`Error checking API key for ${service}:`, error);
        setHasKey(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkApiKey();
  }, [service, session?.user?.id]);

  return { hasKey, isLoading };
}

/**
 * A hook for fetching all API services the current user has keys for
 * @returns Object with loading state and array of service names
 */
export function useApiServices() {
  const { data: session } = useSession();
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchApiServices() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/keys');
        
        if (response.ok) {
          const data = await response.json();
          setServices(data.map((key: any) => key.service));
        }
      } catch (error) {
        console.error('Error fetching API services:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApiServices();
  }, [session?.user?.id]);

  return { services, isLoading };
} 