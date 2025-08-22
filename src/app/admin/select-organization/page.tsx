'use client'

import { useOrganization, useOrganizationList, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Building2, Plus, Users, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SelectOrganizationPage() {
  const { user } = useUser()
  const { organization, setActive } = useOrganization()
  const { organizationList, createOrganization } = useOrganizationList()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')

  useEffect(() => {
    // If user already has an organization selected, redirect to admin
    if (organization) {
      router.push('/admin')
    }
  }, [organization, router])

  const handleSelectOrganization = async (orgId: string) => {
    try {
      await setActive({ organization: orgId })
      router.push('/admin')
    } catch (error) {
      console.error('Error selecting organization:', error)
    }
  }

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return
    
    setIsCreating(true)
    try {
      const newOrg = await createOrganization({ name: newOrgName.trim() })
      if (newOrg) {
        await setActive({ organization: newOrg.id })
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
    } finally {
      setIsCreating(false)
      setNewOrgName('')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Welcome to RestaurantOS
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Select your restaurant or create a new one to get started
          </p>
        </div>

        {/* Existing Organizations */}
        {organizationList && organizationList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Your Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {organizationList.map((org) => (
                <div 
                  key={org.organization.id}
                  className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-background-secondary)] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {org.organization.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {org.membership.role} • {org.organization.membersCount} members
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectOrganization(org.organization.id)}
                    size="sm"
                  >
                    Select
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Create New Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create New Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter your restaurant name..."
                className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateOrganization()}
              />
            </div>
            <Button
              onClick={handleCreateOrganization}
              disabled={!newOrgName.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Restaurant
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              Need help getting started?
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Contact our support team for assistance setting up your restaurant management system.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}