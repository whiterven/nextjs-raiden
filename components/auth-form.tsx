import Form from 'next/form';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  showNameFields = false,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  showNameFields?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {showNameFields && (
        <>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="firstName"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              className="bg-muted text-md md:text-sm"
              type="text"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="lastName"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              className="bg-muted text-md md:text-sm"
              type="text"
              required
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <div className="relative">
          <Input
            id="password"
            name="password"
            className="bg-muted text-md md:text-sm pr-10"
            type={showPassword ? "text" : "password"}
            required
          />
          <Button
            type="button"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {children}
    </Form>
  );
}
