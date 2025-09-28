import { useState, useCallback } from 'react'
import { ConceptMap, ConceptMapAgentContext } from '@/types'

export function useConceptMap() {
  const [conceptMap, setConceptMap] = useState<ConceptMap>({})
  const [isUpdating, setIsUpdating] = useState(false)

  const updateConceptMap = useCallback(async (context: Partial<ConceptMapAgentContext>) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/claude/concept-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })

      if (!response.ok) throw new Error('Failed to update concept map')
      
      const data = await response.json()
      setConceptMap(data.updatedConceptMap)
      console.log('[ConceptMap] Updated:', data.updatedConceptMap)
      return data.updatedConceptMap
    } catch (error) {
      console.error('[ConceptMap] Error updating:', error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return {
    conceptMap,
    updateConceptMap,
    isUpdating
  }
}