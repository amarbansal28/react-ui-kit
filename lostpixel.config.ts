import type { CustomProjectConfig } from 'lost-pixel'

// Visual regression testing against Storybook stories, using local
// git-committed baselines (no Lost Pixel Platform account/API key needed).
// See README's "Visual regression testing" section for the workflow.
export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: 'storybook-static',
  },
  generateOnly: true,
  failOnDifference: true,
  imagePathBaseline: '.lostpixel/baseline',
  imagePathCurrent: '.lostpixel/current',
  imagePathDifference: '.lostpixel/difference',
  threshold: 0,
}
