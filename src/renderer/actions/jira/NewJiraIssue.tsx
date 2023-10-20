import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CommandEmpty, CommandGroup } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as z from 'zod';
import CreateJiraIssueCommand from '~/commands/jira/CreateJiraIssueCommand';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Command, CommandInput, CommandItem } from '~/components/ui/command';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Textarea } from '~/components/ui/textarea';
import { useToast } from '~/components/ui/use-toast';
import { cn } from '~/lib/utils';
import queries from '~/queries';
import { CreateJiraIssueCommandContext } from '~/types/jira';

export const schema = z.object({
  title: z
    .string({
      required_error: 'A title for your issue is required',
    })
    .min(3, {
      message: 'The title must be at least 3 characters long',
    })
    .trim(),
  project: z
    .string({
      required_error: 'You must select a project to add the issue to',
    })
    .min(1, { message: 'You must select a project to add the issue to' }),
  issueType: z
    .string({
      required_error: 'You must select an issue type',
    })
    .min(1, { message: 'You must select an issue type' }),
  description: z.string().trim().optional(),
});

// eslint-disable-next-line import/prefer-default-export
export function NewJiraIssueForm() {
  const { toast } = useToast();

  const [openSelectProject, setOpenSelectProject] = useState(false);
  const [selectIssueType, setSelectIssueType] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      const { title, project, issueType, description } = data;
      const parsedDescription = description || '';
      const commandContext: CreateJiraIssueCommandContext = {
        title,
        description: parsedDescription,
        projectId: project,
        issueTypeId: issueType,
      };

      return window.electron.executeCommand(
        new CreateJiraIssueCommand(commandContext)
      );
    },
  });

  const { data, isLoading } = useQuery({
    ...queries.JIRA_PROJECTS_AND_ISSUES(),
    staleTime: 60 * 1000, // 1 minute
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      project: '',
      issueType: '',
    },
  });

  const {
    setFocus,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { isSubmitting },
  } = form;

  const watchProject = watch('project', '');

  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof schema>) => {
      return mutation.mutateAsync(values, {
        onSuccess: async () => {
          toast({
            title: 'Yay!',
            description: 'Your Jira issue was created successfully.',
          });
          navigate('/');
        },
        onError: (err) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: `There was a problem with creating your Jira issue: ${err}`,
          });
          setError('root.all', {
            type: 'global',
            message:
              'Could not create issue. Something went wrong. Please try again.',
          });
        },
      });
    },
    [mutation, navigate, setError, toast]
  );

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create a new Jira issue
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <FormField
                  control={control}
                  name="title"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                          <Input placeholder="Title" {...field} />
                        </FormControl>
                        <FormDescription>
                          The title of the issue
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
                  name="description"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief description of the issue"
                            className="resize-none"
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of the issue.
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
                  name="project"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Project</FormLabel>
                        <Popover
                          open={openSelectProject}
                          onOpenChange={setOpenSelectProject}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={isLoading}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-[200px] justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value
                                  ? data?.projects.find(
                                      (project) =>
                                        project.cloudId === field.value
                                    )?.name
                                  : 'Select a Project'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Select a project" />
                              <CommandEmpty>No project found</CommandEmpty>
                              <CommandGroup>
                                {data?.projects.map((project) => (
                                  <CommandItem
                                    value={project.name}
                                    key={project.cloudId}
                                    onSelect={() => {
                                      setValue('project', project.cloudId);
                                      setOpenSelectProject(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        project.cloudId === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {project.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select the project you want the issue to be created in
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
                  name="issueType"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Type</FormLabel>
                        <Popover
                          open={selectIssueType}
                          onOpenChange={setSelectIssueType}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={isLoading || !watchProject}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-[200px] justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {watchProject && field.value
                                  ? data?.projectIssueTypesMap[
                                      watchProject
                                    ].find(
                                      (issueType) =>
                                        issueType.cloudId === field.value
                                    )?.name
                                  : 'Select a Issue Type'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Select an issue type..." />
                              <CommandEmpty>No issue type found</CommandEmpty>
                              <CommandGroup>
                                {watchProject &&
                                  data?.projectIssueTypesMap[watchProject].map(
                                    (issueType) => (
                                      <CommandItem
                                        value={issueType.name}
                                        key={issueType.cloudId}
                                        onSelect={() => {
                                          setValue(
                                            'issueType',
                                            issueType.cloudId
                                          );
                                          setSelectIssueType(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            issueType.cloudId === field.value
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                        {issueType.name}
                                      </CommandItem>
                                    )
                                  )}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select the type of issue you want to create
                        </FormDescription>
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
            variant="ghost"
            type="reset"
            disabled={isSubmitting}
            onClick={() => {
              navigate('/');
            }}
          >
            Never mind...
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
