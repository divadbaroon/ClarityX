export interface LeetCodeProblem {
  id: string
  task_id: string
  question_id: string
  difficulty: string
  tags: string[]
  problem_description: string
  starter_code: string
  prompt: string
  completion: string
  entry_point: string
  test: string
  input_output: any
  created_at: string
}

export type DifficultyFilter = "all" | "Easy" | "Medium" | "Hard"
export type TagFilter = "all" | string