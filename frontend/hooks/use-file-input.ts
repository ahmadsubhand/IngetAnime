import { toast } from '@/components/ui/toast';
import { useEffect, useRef, useState } from 'react';

export default function UseFileInput() {
  const [iconFile, setIconFile] = useState<File | undefined>();
  const [iconPreview, setIconPreview] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  function handleIconChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.add({
        type: 'error',
        description: 'File yang dipilih harus berupa gambar',
      });
      return;
    }

    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
    }
    
    const previewUrl = URL.createObjectURL(file);
    setIconFile(file);
    setIconPreview(previewUrl);
  }

  function handleIconReset() {
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(undefined);
    setIconPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function onIconSuccess() {
    setIconFile(undefined);
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
      setIconPreview(undefined);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return { iconFile, iconPreview, fileInputRef, handleIconChange, handleIconReset, onIconSuccess }
}