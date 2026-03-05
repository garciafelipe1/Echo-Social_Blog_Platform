import EditText from '@/components/forms/EditText';

interface Props {
  username: string;
  setUsername: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
}

export default function ProfileUserForm({
  username,
  setUsername,
  firstName,
  setFirstName,
  lastName,
  setLastName,
}: Props) {
  return (
    <dl className="dark:divide-dark-third dark:border-dark-third mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
      <div className="pt-6 sm:flex">
        <dt className="dark:text-dark-txt font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
          Username
        </dt>
        <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <EditText data={username} setData={setUsername} />
        </dd>
      </div>
      <div className="pt-6 sm:flex">
        <dt className="dark:text-dark-txt font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
          First Name
        </dt>
        <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <EditText data={firstName} setData={setFirstName} />
        </dd>
      </div>
      <div className="pt-6 sm:flex">
        <dt className="dark:text-dark-txt font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
          Last Name
        </dt>
        <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <EditText data={lastName} setData={setLastName} />
        </dd>
      </div>
    </dl>
  );
}
