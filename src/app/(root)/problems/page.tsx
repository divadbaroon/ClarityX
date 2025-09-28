"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import Link from "next/link"
import { fetchProblems } from "@/lib/actions/problems"

import { LeetCodeProblem, DifficultyFilter, TagFilter } from "@/types"

export default function LeetCodeDashboard() {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("all")
  const [selectedTag, setSelectedTag] = useState<TagFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [allTags, setAllTags] = useState<string[]>([])

  const problemsPerPage = 20

  useEffect(() => {
    loadProblems()
  }, [])

  const loadProblems = async () => {
    try {
      setLoading(true)
      const { problems: fetchedProblems, error: fetchError } = await fetchProblems()
      
      if (fetchError) {
        setError(fetchError)
        console.error('Failed to load problems:', fetchError)
        return
      }
      
      // Extract all unique tags
      const tagsSet = new Set<string>()
      fetchedProblems.forEach((problem) => {
        if (problem.tags && Array.isArray(problem.tags)) {
          problem.tags.forEach((tag) => tagsSet.add(tag))
        }
      })
      
      setProblems(fetchedProblems)
      setAllTags(Array.from(tagsSet).sort())
    } catch (err) {
      setError('Failed to load problems')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        searchTerm === "" ||
        problem.task_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.problem_description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDifficulty = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty

      const matchesTag = 
        selectedTag === "all" || 
        (problem.tags && Array.isArray(problem.tags) && problem.tags.includes(selectedTag))

      return matchesSearch && matchesDifficulty && matchesTag
    })
  }, [problems, searchTerm, selectedDifficulty, selectedTag])

  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * problemsPerPage
    return filteredProblems.slice(startIndex, startIndex + problemsPerPage)
  }, [filteredProblems, currentPage])

  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage)

  const formatTitle = (taskId: string): string => {
    return taskId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problems...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading problems: {error}</p>
          <Button onClick={loadProblems} className="bg-black text-white hover:bg-gray-800">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white mt-18">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">LeetCode Problems</h1>
              <p className="text-sm text-gray-500">Practice coding problems and improve your skills</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search problems by title or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 h-10 border-gray-300 focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={selectedDifficulty}
                onValueChange={(value: DifficultyFilter) => {
                  setSelectedDifficulty(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-36 h-10 border-gray-300 focus:ring-1 focus:ring-gray focus:border-gray">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="hover:bg-gray-100 data-[highlighted]:bg-gray-100 focus:bg-gray-100 data-[highlighted]:text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    All Difficulties
                  </SelectItem>
                  <SelectItem
                    value="Easy"
                    className="hover:bg-gray-100 data-[highlighted]:bg-gray-100 focus:bg-gray-100 data-[highlighted]:text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Easy
                  </SelectItem>
                  <SelectItem
                    value="Medium"
                    className="hover:bg-gray-100 data-[highlighted]:bg-gray-100 focus:bg-gray-100 data-[highlighted]:text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Medium
                  </SelectItem>
                  <SelectItem
                    value="Hard"
                    className="hover:bg-gray-100 data-[highlighted]:bg-gray-100 focus:bg-gray-100 data-[highlighted]:text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Hard
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedTag}
                onValueChange={(value: TagFilter) => {
                  setSelectedTag(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-40 h-10 border-gray-300 focus:ring-1 focus:ring-black focus:border-black">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="hover:bg-gray-100 data-[highlighted]:bg-gray-100 focus:bg-gray-100 data-[highlighted]:text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    All Topics
                  </SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem
                      key={tag}
                      value={tag}
                      className="hover:bg-gray-100 data-[highlighted]:bg-gray-100 focus:bg-gray-100 data-[highlighted]:text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProblems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 min-w-0">
                          <Link href={`/problems/${problem.id}`} className="block group">
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-150">
                              {problem.question_id}. {formatTitle(problem.task_id)}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {problem.problem_description.substring(0, 80)}...
                            </p>
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          problem.difficulty === "Easy"
                            ? "text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
                            : problem.difficulty === "Medium"
                              ? "text-yellow-700 border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                              : "text-red-700 border-red-300 bg-red-50 hover:bg-red-100"
                        } text-xs font-medium cursor-pointer transition-colors duration-150`}
                        onClick={() => {
                          setSelectedDifficulty(problem.difficulty as DifficultyFilter)
                          setCurrentPage(1)
                        }}
                      >
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                            onClick={() => {
                              setSelectedTag(tag)
                              setCurrentPage(1)
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {problem.tags && problem.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
                            +{problem.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Not started</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all duration-150 bg-transparent"
                        asChild
                      >
                        <Link href={`/problems/${problem.id}`}>Solve</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * problemsPerPage + 1} to{" "}
              {Math.min(currentPage * problemsPerPage, filteredProblems.length)} of {filteredProblems.length} problems
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-300 hover:border-gray-400 disabled:opacity-50 cursor-pointer"
                >
                Previous
               </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`
                            px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer
                            transition-colors duration-150
                            ${currentPage === pageNum
                            ? "bg-gray-800 text-white hover:bg-gray-900"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }
                        `}
                        >
                        {pageNum}
                        </button>
                                        )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:border-gray-400 disabled:opacity-50 cursor-pointer"
                >
                Next
                </Button>
            </div>
          </div>
        )}

        {filteredProblems.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedDifficulty("all")
                setSelectedTag("all")
                setCurrentPage(1)
              }}
              className="border-gray-300 hover:border-gray-400"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}