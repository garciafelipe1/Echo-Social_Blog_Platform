import { v4 as uuidv4 } from 'uuid';
import ReactDropzone from 'react-dropzone';
import { Line } from 'rc-progress';
import Image from 'next/image';
import { ToastError } from '../toast/toast';
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  PLACEHOLDER_IMAGE,
  PROGRESS_COLOR_INCOMPLETE,
  PROGRESS_COLOR_COMPLETE,
  PROGRESS_THRESHOLD,
} from '@/constants/uploads';

export interface ImageData {
  id: string;
  title: string;
  file: File | string;
  size: string;
  type: string;
  lastModified: number;
}

interface ComponentProps {
  encoding?: string;
  data: ImageData | string | null;
  setData: (data: ImageData) => void;
  onLoad?: ((data: ImageData) => void) | null;
  percentage?: number;
  variant?: string;
  title?: string;
  description?: string;
}

export default function EditImage({
  encoding = 'multipart',
  data,
  setData,
  onLoad = null,
  percentage = 0,
  variant = 'profile',
  title = 'File',
  description = '',
}: ComponentProps) {
  const handleDrop = (acceptedFiles: File[]) => {
    const acceptedFile = acceptedFiles[0];

    if (acceptedFile.size > MAX_IMAGE_SIZE_BYTES) {
      ToastError(`Image must be max ${MAX_IMAGE_SIZE_LABEL}`);
      return;
    }

    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(acceptedFile.type)) {
      ToastError(
        `${acceptedFile.type} is not allowed. Only ${ALLOWED_IMAGE_EXTENSIONS} extensions are allowed`,
      );
      return;
    }

    const reader = new FileReader();

    if (encoding === 'base64') {
      reader.readAsDataURL(acceptedFile);
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') return;
        const sizeInKB = acceptedFile.size / 1024;
        const fileTypeMapping: { [key: string]: string } = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
        };
        const newItem: ImageData = {
          id: uuidv4(),
          title: acceptedFile.name,
          file: result,
          size: `${sizeInKB.toFixed(2)} KB`,
          type: fileTypeMapping[acceptedFile.type] || acceptedFile.type,
          lastModified: acceptedFile.lastModified,
        };
        setData(newItem);
        if (onLoad) {
          onLoad(newItem);
        }
      };
    }

    if (encoding === 'multipart') {
      const sizeInKB = acceptedFile.size / 1024;
      const fileTypeMapping: { [key: string]: string } = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
      };
      const newItem = {
        id: uuidv4(),
        title: acceptedFile.name,
        file: acceptedFile,
        size: `${sizeInKB.toFixed(2)} KB`,
        type: fileTypeMapping[acceptedFile.type] || acceptedFile.type,
        lastModified: acceptedFile.lastModified,
      };
      setData(newItem);
      if (onLoad) {
        onLoad(newItem);
      }
    }
  };

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const getSrcUrl = (): string => {
    if (typeof data === 'string' && isValidUrl(data)) {
      return data;
    }

    if (data && typeof data === 'object' && 'file' in data) {
      if (encoding === 'base64' && typeof data.file === 'string') {
        return data.file;
      }
      if (encoding === 'multipart' && data.file instanceof File) {
        return URL.createObjectURL(data.file);
      }
    }

    return PLACEHOLDER_IMAGE;
  };
  const srcUrl = getSrcUrl();
  const imageData = data && typeof data === 'object' && 'file' in data ? data : null;

  const normalStyle = <div>Normal style</div>;

  const bannerStyle = (
    <div>
      <span className="dark:text-dark-txt block text-sm font-bold text-gray-900">{title}</span>
      <span className="dark:text-dark-txt-secondary mb-2 block text-sm text-gray-500">
        {description}
      </span>
      <div className="w-full">
        <div className="flex flex-col-reverse">
          {data && (
            <Image
              width={512}
              height={512}
              src={srcUrl}
              alt={imageData?.title || ''}
              className={`h-48 w-auto object-cover ${variant === 'profile' ? 'rounded-full object-center' : ''}`}
            />
          )}
        </div>
      </div>
      <div className="mt-2 w-full">
        <ReactDropzone onDrop={handleDrop}>
          {({ getRootProps, getInputProps }) => (
            <div
              className="form-control text-md dark:border-dark-border dark:bg-dark-second dark:text-dark-txt-secondary hover:dark:bg-dark-third m-0 block w-full flex-grow cursor-pointer rounded border-2 border-dashed border-gray-200 bg-white bg-clip-padding p-4 text-gray-700 transition ease-in-out hover:border-gray-300 hover:bg-gray-50 focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <span>
                {imageData?.file ? imageData.title : 'Drag and drop or click to upload file'}
              </span>
            </div>
          )}
        </ReactDropzone>
        <div className="mt-2">
          <Line
            percent={percentage}
            strokeWidth={2}
            strokeColor={
              percentage < PROGRESS_THRESHOLD ? PROGRESS_COLOR_INCOMPLETE : PROGRESS_COLOR_COMPLETE
            }
          />
        </div>
      </div>
    </div>
  );

  const profileStyle = (
    <div>
      <span className="dark:text-dark-txt block text-sm font-bold text-gray-900">{title}</span>
      <span className="dark:text-dark-txt-secondary mb-2 block text-sm text-gray-500">
        {description}
      </span>
      <div className="flex flex-col items-center gap-2 md:flex-row">
        <div className="flex-shrink-0">
          <div className="aspect-w-0.5 aspect-h-0.5 w-32">
            {data && (
              <Image
                width={512}
                height={512}
                src={srcUrl}
                alt=""
                className="h-32 w-auto rounded-full object-cover object-center"
              />
            )}
          </div>
        </div>
        <div className="w-full">
          <ReactDropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                className="form-control text-md dark:border-dark-border dark:bg-dark-second dark:text-dark-txt-secondary hover:dark:bg-dark-third m-0 block w-full flex-grow cursor-pointer rounded border-2 border-dashed border-gray-200 bg-white bg-clip-padding p-4 text-gray-700 transition ease-in-out hover:border-gray-300 hover:bg-gray-50 focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <span>
                  {imageData?.file ? imageData.title : 'Drag and drop or click to upload file'}
                </span>
              </div>
            )}
          </ReactDropzone>
          <div className="mt-2">
            <Line
              percent={percentage}
              strokeWidth={2}
              strokeColor={
                percentage < PROGRESS_THRESHOLD
                  ? PROGRESS_COLOR_INCOMPLETE
                  : PROGRESS_COLOR_COMPLETE
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'profile':
      return profileStyle;
    case 'normal':
      return normalStyle;
    case 'banner':
      return bannerStyle;
    default:
      return null;
  }
}

EditImage.defaultProps = {
  encoding: 'multipart',
  onLoad: null,
  percentage: 0,
  variant: 'profile',
  title: 'File',
  description: '',
};
