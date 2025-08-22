'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import useSWR from 'swr'
import { 
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  Users,
  ChefHat,
  BookOpen,
  Utensils,
  DollarSign,
  Star
} from 'lucide-react'

interface Recipe {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number
  cookTime: number
  servings: number
  category: string
  cost: number
  instructions: string[]
  ingredients: {
    id: string
    ingredient: {
      name: string
    }
    quantity: number
    unit: string
  }[]
  menuItems: {
    id: string
    name: string
  }[]
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: recipes = [], isLoading, mutate } = useSWR<Recipe[]>('/api/admin/recipes', fetcher)

  const categories = ['all', 'appetizers', 'mains', 'desserts', 'beverages', 'sauces', 'sides']
  const difficulties = ['all', 'easy', 'medium', 'hard']

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery === '' || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'info'
    }
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    
    try {
      await fetch(`/api/admin/recipes/${recipeId}`, { method: 'DELETE' })
      mutate()
    } catch (error) {
      console.error('Failed to delete recipe:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[var(--color-background-secondary)] rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-[var(--color-background-secondary)] rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-[var(--color-background-secondary)] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="container py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                Recipe Management
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                Create and manage your restaurant's recipe collection
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Recipes</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{recipes.length}</p>
                </div>
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Avg Prep Time</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {recipes.length > 0 ? Math.round(recipes.reduce((acc, recipe) => acc + recipe.prepTime, 0) / recipes.length) : 0}m
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                  <Clock className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Easy Recipes</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {recipes.filter(r => r.difficulty === 'easy').length}
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                  <Star className="w-6 h-6 text-[var(--color-success)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Avg Cost</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    ${recipes.length > 0 ? (recipes.reduce((acc, recipe) => acc + recipe.cost, 0) / recipes.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-accent)]/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-[var(--color-border)] p-1 bg-[var(--color-background-secondary)]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    List
                  </button>
                </div>

                {/* Clear Filters */}
                {(searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('all')
                      setDifficultyFilter('all')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipes Display */}
        {filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                No recipes found
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                {searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all'
                  ? 'Try adjusting your filters' 
                  : 'Start by adding your first recipe'
                }
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  {viewMode === 'grid' ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                            {recipe.name}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                            {recipe.description}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                          getDifficultyColor(recipe.difficulty) === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]' :
                          getDifficultyColor(recipe.difficulty) === 'warning' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]' :
                          getDifficultyColor(recipe.difficulty) === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]' :
                          'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-[var(--color-text-secondary)]">
                          <Clock className="w-4 h-4 mr-2" />
                          {recipe.prepTime + recipe.cookTime}m total
                        </div>
                        <div className="flex items-center text-[var(--color-text-secondary)]">
                          <Users className="w-4 h-4 mr-2" />
                          {recipe.servings} servings
                        </div>
                        <div className="flex items-center text-[var(--color-text-secondary)]">
                          <Utensils className="w-4 h-4 mr-2" />
                          {recipe.ingredients.length} ingredients
                        </div>
                        <div className="flex items-center text-[var(--color-primary)] font-medium">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${recipe.cost.toFixed(2)}
                        </div>
                      </div>

                      {recipe.menuItems.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[var(--color-text-secondary)]">Used in:</p>
                          <div className="flex flex-wrap gap-1">
                            {recipe.menuItems.map((menuItem) => (
                              <span 
                                key={menuItem.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]"
                              >
                                {menuItem.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                        <Button variant="outline" size="sm" className="flex-1">
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Recipe
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <ChefHat className="w-6 h-6 text-[var(--color-text-muted)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                            {recipe.name}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1">
                            {recipe.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {recipe.prepTime + recipe.cookTime}m
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {recipe.servings} servings
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              getDifficultyColor(recipe.difficulty) === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
                              getDifficultyColor(recipe.difficulty) === 'warning' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]' :
                              getDifficultyColor(recipe.difficulty) === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' :
                              'bg-[var(--color-info-bg)] text-[var(--color-info)]'
                            }`}>
                              {recipe.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-[var(--color-primary)]">
                            ${recipe.cost.toFixed(2)}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            cost per serving
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}