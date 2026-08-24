import { LogIn } from 'lucide-react';
import { Button } from './ui/button';

export default function AppButton() {
  return (
    <Button size={'xs'}>
      <LogIn data-icon="inline-start" />
      Masuk
    </Button>
  )
}