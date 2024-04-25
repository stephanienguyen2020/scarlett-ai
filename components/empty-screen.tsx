import { UseChatHelpers } from 'ai/react'

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  }
]

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to SkinSense Virtual Assistant!
        </h1>
        <p className="leading-normal text-muted-foreground">
          Ready to find your perfect foundation match? At SkinSense, we specialize in helping you choose the best foundation shade tailored to your skin tone, based on the photo you upload, your budget, and specific skin conditions. Let&apos;s start your journey to flawless makeup application! 
        </p>
      </div>
    </div>
  )
}
