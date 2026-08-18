import { formatDistanceToNow, format } from 'date-fns';
import type { Complaint, ComplaintStatus } from '@/types';

export function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function timeAgo(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy • h:mm a');
  } catch {
    return '—';
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function resizeImage(file: File, maxSize = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getComplaintStats(complaints: Complaint[]) {
  return {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    assigned: complaints.filter((c) => c.status === 'Assigned').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    completed: complaints.filter((c) => c.status === 'Completed').length,
    rejected: complaints.filter((c) => c.status === 'Rejected').length,
  };
}

export function getCleanlinessScore(complaints: Complaint[]): number {
  if (complaints.length === 0) return 100;
  const completed = complaints.filter((c) => c.status === 'Completed').length;
  const pending = complaints.length - completed;
  // Score: 100 when everything resolved, decreasing with unresolved complaints
  const score = 100 - (pending / complaints.length) * 60;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function getStatusOrder(status: ComplaintStatus): number {
  const order = { Pending: 0, Assigned: 1, 'In Progress': 2, Completed: 3, Rejected: 4 };
  return order[status];
}

export function isImageFile(file: File): boolean {
  return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
}

export function initialFromName(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
