'use server'

import { createClient } from '@/utils/supabase/server'

import { LeetCodeProblem } from "@/types"


export async function fetchProblems() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('question_id', { ascending: true })
  
  if (error) {
    console.error('Error fetching problems:', error)
    return { problems: [], error: error.message }
  }
  
  return { problems: data as LeetCodeProblem[], error: null }
}

export async function fetchProblemById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching problem:', error)
    return { problem: null, error: error.message }
  }
  
  return { problem: data as LeetCodeProblem, error: null }
}