import type { GlobalAfterChangeHook } from 'payload'
import type { CollectionAfterChangeHook } from 'payload'

/** Minimum gap between GitHub deploy dispatches (per isolate). */
const DEBOUNCE_MS = 60_000
let lastTriggerAt = 0
let pendingMessage: string | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

const triggerGitHubAction = async (docTitle: string, type: 'global' | 'collection') => {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn('No GITHUB_TOKEN provided. Skipping GitHub Actions trigger.')
    return
  }

  const message = `Payload CMS update triggered by ${type} ${docTitle}`
  const now = Date.now()
  const elapsed = now - lastTriggerAt

  // Coalesce bursts into one dispatch after the debounce window
  if (lastTriggerAt > 0 && elapsed < DEBOUNCE_MS) {
    pendingMessage = message
    if (!flushTimer) {
      const wait = DEBOUNCE_MS - elapsed
      flushTimer = setTimeout(() => {
        flushTimer = null
        const queued = pendingMessage
        pendingMessage = null
        if (queued) {
          void dispatch(token, queued)
        }
      }, wait)
      if (typeof flushTimer === 'object' && flushTimer && 'unref' in flushTimer) {
        ;(flushTimer as NodeJS.Timeout).unref?.()
      }
    }
    console.log(`Build trigger debounced (${Math.round(DEBOUNCE_MS - elapsed)}ms remaining)`)
    return
  }

  await dispatch(token, message)
}

async function dispatch(token: string, message: string) {
  lastTriggerAt = Date.now()
  pendingMessage = null
  try {
    const res = await fetch('https://api.github.com/repos/nikisiagit/studiostonehewer/dispatches', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Payload-CMS-Hook',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: 'wp_update',
        client_payload: {
          message,
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
