import { useEffect, useState } from 'react';
import { LaunchpadService } from '../services/launchpad-service';
import type { LaunchpadPresale } from '../types/database';

export type LaunchpadPresaleFilter = 'all' | 'live' | 'upcoming' | 'ended';

export function useLaunchpadPresales(filter: LaunchpadPresaleFilter = 'all') {
  const [presales, setPresales] = useState<LaunchpadPresale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPresales() {
      try {
        setIsLoading(true);
        setError(null);

        let data: LaunchpadPresale[];

        switch (filter) {
          case 'live':
            data = await LaunchpadService.getLivePresales();
            break;
          case 'upcoming':
            data = await LaunchpadService.getUpcomingPresales();
            break;
          case 'ended':
            data = await LaunchpadService.getEndedPresales();
            break;
          case 'all':
          default:
            data = await LaunchpadService.getAllPresales();
            break;
        }

        setPresales(data);
      } catch (err) {
        console.error('Error fetching launchpad presales:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPresales();
  }, [filter]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data: LaunchpadPresale[];

      switch (filter) {
        case 'live':
          data = await LaunchpadService.getLivePresales();
          break;
        case 'upcoming':
          data = await LaunchpadService.getUpcomingPresales();
          break;
        case 'ended':
          data = await LaunchpadService.getEndedPresales();
          break;
        case 'all':
        default:
          data = await LaunchpadService.getAllPresales();
          break;
      }

      setPresales(data);
    } catch (err) {
      console.error('Error fetching launchpad presales:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    presales,
    isLoading,
    error,
    refetch,
  };
}
