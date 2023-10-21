import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

import { routes } from '../renderer/App';

describe('App', () => {
  it('should render', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });
    userEvent.setup();
    expect(render(<RouterProvider router={router} />)).toBeTruthy();
  });
});
