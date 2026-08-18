import { useCallback, useState } from 'react';
import { Upload, X, ImagePlus, AlertCircle } from 'lucide-react';
import { resizeImage, isImageFile, classNames } from '@/lib/utils';
import { MAX_PHOTOS, MAX_PHOTO_SIZE_MB } from '@/lib/constants';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  label?: string;
}

export function PhotoUpload({ photos, onChange, max = MAX_PHOTOS, label = 'Upload Photos' }: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      setProcessing(true);
      try {
        const newPhotos: string[] = [];
        for (const file of Array.from(files)) {
          if (photos.length + newPhotos.length >= max) break;
          if (!isImageFile(file)) {
            setError('Only JPG and PNG images are allowed.');
            continue;
          }
          if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024 * 4) {
            setError(`Images should be under ${MAX_PHOTO_SIZE_MB * 4}MB. Large images will be compressed.`);
          }
          const base64 = await resizeImage(file);
          newPhotos.push(base64);
        }
        if (newPhotos.length > 0) {
          onChange([...photos, ...newPhotos]);
        }
      } catch {
        setError('Failed to process image. Please try another file.');
      } finally {
        setProcessing(false);
      }
    },
    [photos, onChange, max]
  );

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="label">{label} <span className="text-slate-400 font-normal">({photos.length}/{max})</span></label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {photos.map((photo, i) => (
          <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
            <img src={photo} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {photos.length < max && (
          <label
            className={classNames(
              'aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors',
              processing && 'opacity-50 pointer-events-none'
            )}
          >
            {processing ? (
              <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-slate-400" />
                <span className="text-xs text-slate-500">Add Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
        <Upload className="h-3 w-3" /> JPG or PNG. Images are automatically compressed.
      </p>
    </div>
  );
}
