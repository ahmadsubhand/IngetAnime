import { AlertDialog, AlertDialogContent } from './ui/alert-dialog';
import { Spinner } from './ui/spinner';

export default function AnimeUpdate({ isOpen }: { isOpen: boolean }) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        className={'flex flex-col sm:flex-row items-center w-60 sm:w-fit gap-3'}
      >
        <Spinner className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-center">
          Memperbarui data ...
        </p>
      </AlertDialogContent>
    </AlertDialog>
  );
}
