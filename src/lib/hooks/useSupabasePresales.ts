import { useEffect, useState } from 'react';
import { PresaleService } from '../services/presale-service';
import type { Presale } from '../types/database';

export type PresaleFilter = 'all' | 'live' | 'upcoming' | 'ended';

export function useSupabasePresales(filter: PresaleFilter = 'all') {
  const [presales, setPresales] = useState<Presale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPresales() {
      try {
        setIsLoading(true);
        setError(null);

        let data: Presale[];

        switch (filter) {
          case 'live':
            data = await PresaleService.getLivePresales();
            break;
          case 'upcoming':
            data = await PresaleService.getUpcomingPresales();
            break;
          case 'ended':
            data = await PresaleService.getEndedPresales();
            break;
          case 'all':
          default:
            data = await PresaleService.getAllPresales();
            break;
        }

        setPresales(data);
      } catch (err) {
        console.error('Error fetching presales:', err);
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

      let data: Presale[];

      switch (filter) {
        case 'live':
          data = await PresaleService.getLivePresales();
          break;
        case 'upcoming':
          data = await PresaleService.getUpcomingPresales();
          break;
        case 'ended':
          data = await PresaleService.getEndedPresales();
          break;
        case 'all':
        default:
          data = await PresaleService.getAllPresales();
          break;
      }

      setPresales(data);
    } catch (err) {
      console.error('Error fetching presales:', err);
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
