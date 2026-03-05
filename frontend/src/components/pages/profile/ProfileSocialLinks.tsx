import EditURL from '@/components/forms/EditURLS';

interface SocialField {
  label: string;
  value: string;
  setter: (v: string) => void;
}

interface Props {
  fields: SocialField[];
}

export default function ProfileSocialLinks({ fields }: Props) {
  return (
    <>
      {fields.map(({ label, value, setter }) => (
        <li key={label} className="py-6 sm:flex">
          <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-dark-txt">
            {label}
          </h4>
          <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <EditURL data={value} setData={setter} />
          </div>
        </li>
      ))}
    </>
  );
}
