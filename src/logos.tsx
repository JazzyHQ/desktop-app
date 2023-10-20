/* eslint-disable import/prefer-default-export */
import React from 'react';
import jira from '../assets/apps/jira.svg';
import { cn } from './lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export function JiraLogo({ className }: LogoProps) {
  return (
    <div className={cn('mr-2 h-8 w-8', className)}>
      {' '}
      <img src={jira} alt="Jira" />
    </div>
  );
}
