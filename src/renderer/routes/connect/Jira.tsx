import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as z from 'zod';
import {
  IndexCloudAppByShortCodeRendererCommand,
  UpdateCloudAppAccountCommand,
  VerifyCloudAppAccountCredentialsCommand,
} from '~/commands';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useToast } from '~/components/ui/use-toast';
import { IJiraConnectionExtraData } from '~/renderer/types';
import { CloudAppType } from '~/types';

export const FormSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email(),
  url: z.string({ required_error: 'URL is required' }).url(),
  apiKey: z
    .string({
      required_error: 'API key is required',
    })
    .min(3, {
      message: 'API Key is invalid',
    })
    .trim(),
});

// eslint-disable-next-line import/prefer-default-export
export function JiraConnect() {
  const { toast } = useToast();
  const defaultValues = { apiKey: '', url: '', email: '' };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const navigate = useNavigate();

  const {
    setError,
    setFocus,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;
  const queryClient = useQueryClient();

  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const { email, url, apiKey } = data;
      const extra: IJiraConnectionExtraData = {
        email,
        url,
      };

      await window.electron.executeCommand(
        new UpdateCloudAppAccountCommand({
          shortCode: CloudAppType.JIRA,
          token: apiKey,
          extra,
        })
      );
    },
  });

  const onCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      const { email, url, apiKey } = data;
      const extra: IJiraConnectionExtraData = {
        email,
        url,
      };
      const isValid = await window.electron.executeCommand(
        new VerifyCloudAppAccountCredentialsCommand({
          shortCode: CloudAppType.JIRA,
          token: apiKey,
          extra,
        })
      );

      if (!isValid) {
        setError('root.all', {
          type: 'global',
          message:
            'Invalid credentials. Could not connect to API. Check your email, Atlassian domain, and API key.',
        });
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: `Could not connect to Jira with the information you provided.`,
        });
        return Promise.resolve();
      }
      return mutation.mutateAsync(data, {
        onSuccess: async () => {
          // eslint-disable-next-line promise/catch-or-return
          Promise.allSettled([
            queryClient.invalidateQueries(['cloudapps']),
            queryClient.invalidateQueries(['cloudappaccounts']),
          ]);
          // Index data for jira right away
          await window.electron.executeCommand(
            new IndexCloudAppByShortCodeRendererCommand({
              shortCode: CloudAppType.JIRA,
            })
          );
          toast({
            title: 'Yay!',
            description: 'Your Jira account was successfully connected.',
          });
          navigate('/');
        },
        onError: (err) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: `There was a problem connecting your Jira account: ${err}`,
          });
        },
      });
    },
    [mutation, setError, queryClient, toast, navigate]
  );

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-border/60 pb-12">
            <h2 className="mb-2 text-base font-semibold leading-7 text-primary">
              Connect your Jira Account
            </h2>

            <Alert>
              <AlertDescription>
                Your Jira data is never sent to our servers. It is stored
                locally on your computer.
              </AlertDescription>
            </Alert>

            <p className="mt-1 pt-2 text-sm leading-6 text-primary">
              Log into your Jira account and generate an API key{' '}
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                className="underline hover:text-primary/50"
                rel="noreferrer"
              >
                here
              </a>
              .
            </p>

            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormDescription>
                          The email address you use to log into your Jira
                          account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={control}
                  name="url"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Atlassian Domain</FormLabel>
                        <FormControl>
                          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                          <Input placeholder="Atlassian Domain" {...field} />
                        </FormControl>
                        <FormDescription>
                          The domain of the Atlassian account you wish to
                          connect (eg. https://mycompany.atlassian.net)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={control}
                  name="apiKey"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                          <Input placeholder="API Key" {...field} />
                        </FormControl>
                        <FormDescription>Your Jira API key</FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {form.formState.errors.root?.all?.message && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root?.all?.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            disabled={isSubmitting}
            type="reset"
            variant="ghost"
            onClick={onCancel}
          >
            Never mind...
          </Button>
          <Button disabled={isSubmitting} type="submit">
            Connect
          </Button>
        </div>
      </form>
    </Form>
  );
}
