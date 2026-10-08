import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import platformService from '@/services/platform.service';
import { ApiExpectedError } from '@/types';
import { Platform } from '@/types/platform.model';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { HttpStatusCode } from 'axios';
import { Trash, X } from 'lucide-react';
import { useState } from 'react';

export default function DeletePlatform({ 
  platform 
}: { 
  platform: Platform & { _count: { animePlatforms: number } };
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await platformService.deletePlatform(platform.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['anime'],
      });
      toast.add({
        type: 'success',
        description: `Berhasil menghapus platform ${platform.name}`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.NotFound) {
          toast.add({
            type: 'error',
            description: 'Platform tidak ditemukan',
          });
        } else if (error.status === HttpStatusCode.UnprocessableContent) {
          toast.add({
            type: 'error',
            description: 'Tidak bisa menghapus platform yang masih digunakan',
          });
        } else {
          const expectedError = error.response.data as ApiExpectedError;
          toast.add({
            type: 'error',
            description: expectedError.message,
          });
        }
      } else {
        toast.add({
          type: 'error',
          description:
            'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
        });
      }
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  function handleClick() {
    if (platform._count.animePlatforms > 0) {
      toast.add({
        type: 'error',
        description: 'Tidak bisa menghapus platform yang masih digunakan',
      });
    } else {
      setIsOpen(true);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={'red'} disabled={isPending} onClick={handleClick}>
        <Trash />
      </Button>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className={'text-lg font-semibold'}>
            Hapus platform?
          </DialogTitle>
          <DialogDescription>
            Tindakan ini tidak bisa dibatalkan. Seluruh informasi terkait platform seperti nama dan icon akan ikut dihapus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            disabled={isPending}
            render={
              <Button variant={'outline'}>
                <X /> Batal
              </Button>
            }
          />
          <Button
            variant={'red'}
            disabled={isPending}
            onClick={() => mutate()}
            className={'flex-row-reverse sm:flex-row'}
          >
            Hapus
            {isPending ? (
              <Spinner />
            ) : (
              <Trash />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}