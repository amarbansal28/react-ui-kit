import type { Preview } from '@storybook/react'
import '../src/components/Table/table.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Runs axe-core accessibility checks against every story automatically.
      test: 'error',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f4f5fa' },
        { name: 'dark', value: '#101018' },
      ],
    },
  },
}

export default preview
