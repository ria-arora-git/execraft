import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-blueDark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Join RestaurantOS
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Start managing your restaurant more efficiently
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-accent hover:bg-accent/90',
                card: 'bg-blueBase border border-slate-700',
                headerTitle: 'text-white',
                headerSubtitle: 'text-slate-300',
                socialButtonsBlockButton: 'border-slate-600 text-white hover:bg-slate-700',
                formFieldLabel: 'text-slate-300',
                formFieldInput: 'bg-blueDark border-slate-600 text-white',
                footerActionLink: 'text-accent hover:text-accent/90',
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}