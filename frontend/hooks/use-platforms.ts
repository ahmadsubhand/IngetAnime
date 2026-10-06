import { useEffect, useState } from "react";
import { toast } from '@/components/ui/toast';
import { Platform } from '@/types/platform.model';
import platformService from '@/services/platform.service';

export default function usePlatforms(): Platform[] {
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await platformService.getAllPlatform();
        setPlatforms(response.data);
      } catch (error) {
        toast.add({
          type: 'error',
          description:
            'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
        });
      }
    };

    fetchPlatforms();
  }, []);

  return platforms;
};