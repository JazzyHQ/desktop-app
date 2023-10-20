import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLoaderData, useNavigate } from 'react-router-dom';

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
import { ICloudApp, IJiraConnectionExtraData } from '~/renderer/types';
import { CloudAppType } from '~/types';
import { FormSchema } from '../../connect/Jira';

export default function ConnectionSettings() {
  const { toast } = useToast();
  const { app } = useLoaderData() as { app: ICloudApp | undefined };
  const defaultValues = { apiKey: '', url: '', email: '' };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    values: app
      ? { apiKey: app.token, url: app.extra.url!, email: app.extra.email! }
      : undefined,
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
    mutationFn: (data: z.infer<typeof FormSchema>) => {
      const { email, url, apiKey } = data;
      const extra: IJiraConnectionExtraData = {
        email,
        url,
      };

      return window.electron.executeCommand(
        new UpdateCloudAppAccountCommand({
          shortCode: CloudAppType.JIRA,
          token: apiKey,
          extra,
        })
      );
    },
  });

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
          await queryClient.invalidateQueries(['cloudapps']);
          // Index data for jira right away
          window.electron.executeCommand(
            new IndexCloudAppByShortCodeRendererCommand({
              shortCode: CloudAppType.JIRA,
            })
          );
          toast({
            title: 'Yay!',
            description: 'Your Jira account was successfully updated.',
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
          <Button disabled={isSubmitting} type="reset" variant="ghost">
            Never mind...
          </Button>
          <Button disabled={isSubmitting} type="submit">
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
}
