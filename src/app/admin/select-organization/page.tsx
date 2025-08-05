'use client'

import { OrganizationList } from '@clerk/nextjs'
import { ChefHat } from 'lucide-react'

export default function SelectOrganization() {
  return (
    <div className="min-h-screen bg-blueDark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-12 w-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Select Restaurant</h1>
          <p className="text-slate-400">Choose a restaurant to manage or create a new one</p>
        </div>
        
        <div className="bg-blueBase rounded-xl p-6">
          <OrganizationList 
            hidePersonal
            afterSelectOrganizationUrl="/admin"
            afterCreateOrganizationUrl="/admin"
            appearance={{
              elements: {
                organizationSwitcherTrigger: 'bg-blueDark border border-slate-600 text-white hover:bg-slate-700',
                organizationPreview: 'bg-blueDark border border-slate-600 text-white',
                card: 'bg-transparent border-0',
                headerTitle: 'text-white',
                headerSubtitle: 'text-slate-300',
                organizationListCreateOrganizationActionButton: 'text-accent hover:text-accent/90',
                formButtonPrimary: 'bg-accent hover:bg-accent/90',
                formFieldInput: 'bg-blueDark border-slate-600 text-white',
                formFieldLabel: 'text-slate-300',
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
