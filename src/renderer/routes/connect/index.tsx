import React from 'react';
import { useParams } from 'react-router-dom';
import { JiraConnect } from './Jira';

const connectViews: { [key: string]: () => React.JSX.Element } = {
  jira: JiraConnect,
};

export default function Connect() {
  const { app } = useParams<{ app: string }>();
  const View = connectViews[app!];
  return <View />;
}
