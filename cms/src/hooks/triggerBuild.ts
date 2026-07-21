import type { GlobalAfterChangeHook } from 'payload'
import type { CollectionAfterChangeHook } from 'payload'

const triggerGitHubAction = async (docTitle: string, type: 'global' | 'collection') => {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn('No GITHUB_TOKEN provided. Skipping GitHub Actions trigger.')
    return
  }

  try {
    const res = await fetch('https://api.github.com/repos/nikisiagit/studiostonehewer/dispatches', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Payload-CMS-Hook',
      },
      body: JSON.stringify({
        event_type: 'wp_update',
        client_payload: {
          message: `Payload CMS update triggered by ${type} ${docTitle}`,
        },
      }),
    })

    if (!res.ok) {
      console.error('Failed to trigger GitHub Action:', await res.text())
    } else {
      console.log('Successfully triggered GitHub Action deploy')
    }
  } catch (error) {
    console.error('Error triggering GitHub Action:', error)
  }
}

export const triggerBuildGlobal: GlobalAfterChangeHook = async ({ doc, req }) => {
  req.payload.logger.info(`Triggering build for Global update`)
  await triggerGitHubAction('Global', 'global')
  return doc
}

export const triggerBuildCollection: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation === 'create' || operation === 'update') {
    req.payload.logger.info(`Triggering build for Collection update`)
    await triggerGitHubAction(doc?.title || doc?.filename || 'Document', 'collection')
  }
  return doc
}
