'use client';

import { LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoginPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export function LoginPrompt({ open, onOpenChange, action = '此操作' }: LoginPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">登录后继续</DialogTitle>
          <DialogDescription className="text-center">
            {action}需要登录后才能使用
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Link href="/login" className="w-full">
            <Button className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              登录
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <UserPlus className="h-4 w-4" />
              注册新账号
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
