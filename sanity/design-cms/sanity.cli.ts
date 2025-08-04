// sanity/design-cms/sanity.cli.ts
import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId} from './env'

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset,
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
