import { useEffect, useState } from 'react';

interface ComponentProps {
  password: string;
  rePassword: string;
  username?: string;
  minPasswordLength?: number;
  maxPasswordLength?: number;
}

export default function usePasswordValidation({
  password,
  rePassword,
  username = '',
  minPasswordLength = 8,
  maxPasswordLength = 32,
}: ComponentProps) {
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);
  const [validLength, setValidLength] = useState<boolean>(false);
  const [hasNumbers, setHasNumbers] = useState<boolean>(false);
  const [hasSymbols, setHasSymbols] = useState<boolean>(false);
  const [hasLowercaseText, setHasLowercaseText] = useState<boolean>(false);
  const [hasUppercaseText, setHasUppercaseText] = useState<boolean>(false);
  const [usernameIncluded, setUsernameIncluded] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  useEffect(() => {
    queueMicrotask(() => {
      if (password.length === 0 && rePassword.length === 0) {
        setPasswordTouched(false);
      } else {
        setPasswordTouched(true);
      }

      const includesUsername = username
        ? password.toLowerCase().includes(username.toLowerCase())
        : false;
      setUsernameIncluded(includesUsername);

      const match = password === rePassword;
      setPasswordsMatch(match);

      const validPasswordLength =
        password.length >= minPasswordLength && password.length <= maxPasswordLength;
      setValidLength(validPasswordLength);

      const passwordHasNumbers = /\d/.test(password);
      setHasNumbers(passwordHasNumbers);

      const passwordHasSymbols = /[~!@#$%^&*(),.|_+":;'`?><{}[\]\\]/.test(password);
      setHasSymbols(passwordHasSymbols);

      const passwordHasLowercase = /[a-z]/.test(password);
      setHasLowercaseText(passwordHasLowercase);

      const passwordHasUppercase = /[A-Z]/.test(password);
      setHasUppercaseText(passwordHasUppercase);

      const canSubmitForm =
        match &&
        validPasswordLength &&
        passwordHasNumbers &&
        passwordHasSymbols &&
        passwordHasLowercase &&
        passwordHasUppercase &&
        (!username || !includesUsername);

      setCanSubmit(canSubmitForm);
    });
  }, [password, rePassword, username, minPasswordLength, maxPasswordLength]);

  function PasswordValidationText() {
    if (!canSubmit && passwordTouched) {
      return (
        <div className="my-2 space-y-2">
          {username && usernameIncluded && (
            <div className="flex py-1">
              <p className="text-sm text-rose-500 dark:text-rose-500">
                Tu contraseña no debe incluir tu nombre de usuario. Por favor, elija una contraseña
                diferente.
              </p>
            </div>
          )}
          {!passwordsMatch && (
            <div className="flex py-1">
              <p className="text-sm text-rose-500 dark:text-rose-500">
                ¡Las contraseñas no coinciden! Por favor, asegúrese de que su contraseña y su
                contraseña de confirmación son iguales.
              </p>
            </div>
          )}
          {!validLength && (
            <div className="flex py-1">
              <p className="text-sm text-rose-500 dark:text-rose-500">
                Tu contraseña debe tener entre {minPasswordLength} y {maxPasswordLength} caracteres.
              </p>
            </div>
          )}
          {!hasLowercaseText && (
            <div className="flex py-1">
              <p className="text-sm text-rose-500 dark:text-rose-500">
                Tu contraseña debe contener al menos una letra minúscula.
              </p>
            </div>
          )}
          {!hasUppercaseText && (
            <div className="flex py-1">
              <p className="text-sm text-rose-500 dark:text-rose-500">
                Tu contraseña debe contener al menos una letra mayúscula.
              </p>
            </div>
          )}
          {!hasNumbers && (
            <div className="flex py-1">
              <p className="text-sm text-rose-500 dark:text-rose-500">
                Tu contraseña debe contener al menos un número.
              </p>
            </div>
          )}
          {!hasSymbols && (
            <div className="flex py-1">
              <p className="text-sm text-rose-500 dark:text-rose-500">
                Tu contraseña debe contener al menos un carácter especial (por ejemplo ,!@#$%^&*).
              </p>
            </div>
          )}
        </div>
      );
    }
  }

  return {
    canSubmit,
    PasswordValidationText,
  };
}

usePasswordValidation.defaultProps = {
  username: '',
  minPasswordLength: 8,
  maxPasswordLength: 32,
};
