import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CommandEmpty, CommandGroup } from 'cmdk';
import { Check, ChevronsUpDown, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLoaderData } from 'react-router-dom';
import * as z from 'zod';
import CreateQuickActionCommand from '~/commands/quick-actions/CreateQuickActionCommand';
import DeleteQuickActionCommand from '~/commands/quick-actions/DeleteQuickActionCommand';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
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
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { useToast } from '~/components/ui/use-toast';
import { ONE_MINUTES_IN_MS } from '~/constants';
import { cn } from '~/lib/utils';
import queries from '~/queries';
import { ICloudApp } from '~/renderer/types';
import {
  CloudAppType,
  CreateQuickActionCommandContext,
  DeleteByIdCommandContext,
  JiraQuickActionField,
  QuickAction,
} from '~/types';
import { JiraProject } from '~/types/jira';

const FormSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(1, {
    message: 'Name is required',
  }),
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
});

const defaultValues: Partial<z.infer<typeof FormSchema>> = {
  name: '',
  project: '',
  issueType: '',
};

type QuickActionFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

function QuickActionForm({ onCancel, onSuccess }: QuickActionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openSelectProject, setOpenSelectProject] = useState(false);
  const [selectIssueType, setSelectIssueType] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const watchProject = form.watch('project', '');
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const { name, project, issueType } = data;
      const context: CreateQuickActionCommandContext<JiraQuickActionField> = {
        name,
        shortCode: CloudAppType.JIRA,
        fields: [
          {
            type: 'project',
            humanReadableName: 'Project',
            value: project,
          },
          {
            type: 'issueType',
            humanReadableName: 'Issue Type',
            value: issueType,
          },
        ],
      };

      return window.electron.executeCommand(
        new CreateQuickActionCommand(context)
      );
    },
  });

  const { data, isLoading } = useQuery({
    ...queries.JIRA_PROJECTS_AND_ISSUES(),
    staleTime: ONE_MINUTES_IN_MS,
  });

  const onSubmit = useCallback(
    async (d: z.infer<typeof FormSchema>) => {
      return mutation.mutateAsync(d, {
        onSuccess: () => {
          toast({
            title: 'Yay!',
            description: 'Your Quick Action ⚡️ was successfully created!',
          });
          onSuccess();
          queryClient.invalidateQueries(['cloudapps', 'jira', 'quickactions']);
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: `Could not create your Quick Action ⚡️. Try again!`,
          });
        },
      });
    },
    [mutation, onSuccess, queryClient, toast]
  );

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Input placeholder="Name of your Quick Actions" {...field} />
              </FormControl>
              <FormDescription>
                Make sure you name is meaningful and easily recognizable
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
                              (project) => project.cloudId === field.value
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
                              form.setValue('project', project.cloudId);
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

        <FormField
          control={form.control}
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
                          ? data?.projectIssueTypesMap[watchProject].find(
                              (issueType) => issueType.cloudId === field.value
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
                                  form.setValue('issueType', issueType.cloudId);
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

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            variant="ghost"
            type="reset"
            disabled={form.formState.isSubmitted}
            onClick={() => {
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function QuickActions() {
  const [openQuickActionForm, setOpenQuickActionForm] = useState(false);
  const { app } = useLoaderData() as { app: ICloudApp };
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleOpenQuickActionForm = useCallback(() => {
    setOpenQuickActionForm(true);
  }, []);

  const handleOnCancelQuickActionForm = useCallback(() => {
    setOpenQuickActionForm(false);
  }, []);

  const handleOnSuccessQuickActionForm = useCallback(() => {
    setOpenQuickActionForm(false);
  }, []);

  const { data: quickActions, isLoading: quickActionsLoading } = useQuery({
    ...queries.JIRA_QUICK_ACTIONS(app),
    staleTime: ONE_MINUTES_IN_MS,
  });

  const { data: jiraProjectsAndIssues } = useQuery({
    ...queries.JIRA_PROJECTS_AND_ISSUES(),
    staleTime: ONE_MINUTES_IN_MS,
  });

  const projectsMap = useMemo(() => {
    const map: { [k: string]: JiraProject } = {};
    if (jiraProjectsAndIssues?.projects) {
      jiraProjectsAndIssues.projects.forEach((project) => {
        map[project.cloudId] = project;
      });
    }
    return map;
  }, [jiraProjectsAndIssues]);

  const getProjectName = useCallback(
    (quickAction: QuickAction<JiraQuickActionField>) => {
      const projectFieldId = quickAction.fields?.find(
        (f) => f.type === 'project'
      )?.value;
      return projectFieldId && projectsMap[projectFieldId]
        ? projectsMap[projectFieldId].name
        : '';
    },
    [projectsMap]
  );

  const getIssueTypeName = useCallback(
    (quickAction: QuickAction<JiraQuickActionField>) => {
      const projectFieldId = quickAction.fields?.find(
        (f) => f.type === 'project'
      )?.value;
      const issueTypeFieldId = quickAction.fields?.find(
        (f) => f.type === 'issueType'
      )?.value;

      if (projectFieldId && issueTypeFieldId) {
        const issueType = jiraProjectsAndIssues?.projectIssueTypesMap[
          projectFieldId
        ]?.find((it) => it.cloudId === issueTypeFieldId);

        return issueType?.name ?? '';
      }
      return '';
    },
    [jiraProjectsAndIssues]
  );

  const deleteMutation = useMutation({
    mutationFn: async (quickActionId: number) => {
      const context: DeleteByIdCommandContext = {
        id: quickActionId,
      };

      return window.electron.executeCommand(
        new DeleteQuickActionCommand(context)
      );
    },
  });

  const handleDeleteQuickAction = useCallback(
    async (quickActionId: number) => {
      return deleteMutation.mutateAsync(quickActionId, {
        onSuccess: () => {
          toast({
            title: 'Yay!',
            description: 'Your Quick Action ⚡️ was successfully deleted!',
          });
          queryClient.invalidateQueries(['cloudapps', 'jira', 'quickactions']);
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: `Could not delete your Quick Action ⚡️. Try again!`,
          });
        },
      });
    },
    [deleteMutation, queryClient, toast]
  );

  const newQuickActionForm = useMemo(() => {
    return (
      <Card className="space-y-4">
        <CardHeader className="p-2" />
        <CardContent>
          <QuickActionForm
            onCancel={handleOnCancelQuickActionForm}
            onSuccess={handleOnSuccessQuickActionForm}
          />
        </CardContent>
      </Card>
    );
  }, [handleOnCancelQuickActionForm, handleOnSuccessQuickActionForm]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">⚡️ Quick Actions</h3>
        <p className="text-sm text-muted-foreground">
          Manage your Jira quick actions. Quick actions let you quickly perform
          actions without filling out a form.
        </p>
        <p className="pt-2 text-sm text-muted-foreground">
          For example, you can quickly create bugs in a Jira project. These
          quick actions will show up in your quick finder.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-end">
        <Button onClick={handleOpenQuickActionForm}>Add Quick Action</Button>
      </div>
      {openQuickActionForm && (
        <>
          {newQuickActionForm} <Separator className="my-4" />
        </>
      )}
      {quickActionsLoading && <div>Loading...</div>}
      {!quickActionsLoading && quickActions && quickActions.length === 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              You don&rsquo;t currently have any Quick Actions ⚡️
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {!quickActionsLoading && quickActions && quickActions.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Jira Project</TableHead>
              <TableHead>Issue Type</TableHead>
              <TableHead className="w-20 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quickActions.map((quickAction) => (
              <TableRow key={quickAction.id}>
                <TableCell className="font-medium">
                  {quickAction.name}
                </TableCell>
                <TableCell>
                  {getProjectName(
                    quickAction as QuickAction<JiraQuickActionField>
                  )}
                </TableCell>
                <TableCell>
                  {getIssueTypeName(
                    quickAction as QuickAction<JiraQuickActionField>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={async () =>
                      handleDeleteQuickAction(quickAction.id)
                    }
                    size="sm"
                  >
                    <XCircle />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
