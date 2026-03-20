import inputClassName from '@/utils/api/inputClassName';
import { ChangeEvent, Component, ReactElement } from 'react';
import inputFormClassName from '@/utils/api/InputFormClassName';
interface ComponentsProps {
  data: string;
  setData: (value: string) => void;
  required?: boolean;
  disable: boolean;
  maxTextLength?: number;
  showmMaxTextLength?: boolean;
  placeholder?: string;
  title?: string;
  description?: string;
}

export default function EditText({
  data,
  setData,
  required = false,
  disable = false,
  maxTextLength = 120,
  showmMaxTextLength = false,
  placeholder = '',
  title = '',
  description = '',
}: ComponentsProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/^a-zA-Z0-9\s',:.?-ÁÉÍÓÚáéíóú]+$/g, '');

    setData(inputValue);
  };

  return (
    <div className="w-full">
      <span className="dark:text-dark-txt block text-sm font-bold text-gray-800">{title}</span>
      <span className="dark:text-dark-txt-secondary mb-2 block text-sm text-gray-500">
        {description}
      </span>
      <div className={`${inputFormClassName}`}>
        <input
          type="text"
          required={required}
          disabled={disable}
          placeholder={placeholder}
          value={data}
          maxLength={maxTextLength}
          className={`${inputClassName}`}
          onChange={handleInputChange}
        />
        {showmMaxTextLength && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="dark:text-dark-txt-secondary text-gray-500 sm:text-sm">
              {data?.length} of {maxTextLength}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

EditText.defaultProps = {
  required: false,
  disable: false,
  maxTextLength: 120,
  showmMaxTextLength: false,
  placeholder: '',
  tile: '', // Posible error tipográfico, podría ser "title"
  description: '',
};
