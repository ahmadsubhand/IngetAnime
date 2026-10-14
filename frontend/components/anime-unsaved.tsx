import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export default function AnimeUnsaved({
  title,
  isOpen,
  setIsOpen,
  onClick,
}: {
  title: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onClick: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className={'text-lg font-semibold'}>{title}</DialogTitle>
          <DialogDescription>
            Anda memiliki perubahan yang belum disimpan. Simpan terlebih dahulu
            jika ingin mempertahankan data yang telah diisi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant={'outline'}>
                <ArrowLeft /> Kembali
              </Button>
            }
          />
          <Button
            onClick={() => {
              setIsOpen(false);
              onClick();
            }}
            className={'flex-row-reverse sm:flex-row'}
          >
            Tetap Lanjut
            <ArrowRight />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
