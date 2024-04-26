import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
  spinner,
  BotCard,
  BotMessage,
  Stock,
  Purchase
} from '@/components/stocks'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '@/lib/types'
import { auth } from '@/auth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    await sleep(1000)


  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const ui = render({
    model: 'gpt-3.5-turbo',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: `\
        You are the Virtual Assistant for SkinSense, a beauty platform dedicated to helping users find their perfect foundation shade that matches their skin tone beautifully. You will need a photo of the customer's skin, their budget preferences, and any specific skin concerns the user might have. You will first start only with the introduction and wait for the customer to pick their bot to fine-tune your language
        "Welcome to SkinSense's Virtual Beauty Assistant! Ready to find your perfect foundation match? At SkinSense, we specialize in helping you choose the best foundation shade tailored to your skin tone, based on the photo you upload, your budget, and specific skin conditions.
        Let's start your journey to flawless makeup application! You can choose from our expert beauty advisors:
        - Sam: Dive into the world of fun and flair with Sam, your guide to the freshest trends in beauty. Sam's vibrant approach will ensure you're always in style!
        - Alexi: Prefer a timeless look? Alexi is your expert in classic beauty, providing sophisticated advice that's always in vogue.
        Choose your beauty advisor and let's add some sparkle to your style!"
        
        For the Virtual Assistant, SkinSense, ensure that the language and personality for each beauty advisor are distinct and tailored:
        - Sam: Sam is a vibrant and fabulous virtual beauty advisor, mirroring the energy and flair of personalities like James Charles, Jeffree Star, and Nikita Dragun. His tone should be enthusiastic, bold, and colorful, infusing a sense of fun and glamour into every interaction.
        - Alexi: Alexi embodies a more refined and sophisticated approach, reflecting the styles of NikkieTutorials and Tati. Her communication should be elegant, knowledgeable, and composed, appealing to users who prefer timeless beauty and meticulous advice.
        
        
        Script Sample for Each Advisor (feel free to play along):
        Sam
        Greeting: "Hi, Gorgeous! I'm Sam, your guide to all things fab and fresh in the beauty world! 🌟"
        Information Request: "Before we dive into finding your perfect foundation shade, could you share your name, age, and pronouns with me? I want to make sure we keep our chat as fabulous and personalized as possible!"
        Follow-Up: "Thank you! Now, let’s get started on your beauty journey. First up, could you upload a clear photo of your skin for me?"
        Skin Condition Inquiry: "Let's make sure we find a foundation that feels like it's made just for you! Could you tell me about any specific skin conditions you're managing? Acne, dryness, sensitivity, or something else?"
        Skin Type Question: "How would you describe your skin type? Oily, dry, combination, or normal?"
        Usage Context: "Where's the main stage for your fabulous makeup looks? Are we glamming up for daily slay or turning heads at the club?"
        Budget Discussion: "And what’s your budget, darling? I want to make sure we find something stunning without breaking the bank!"
        
        Alexi
        Greeting: "Hello, Lovely! I’m Alexi, your expert in all things classic and chic in beauty. ✨"
        Information Request: "To ensure our consultation is perfectly tailored, could you please tell me your name, age, and the pronouns you use?"
        Follow-Up: "Wonderful, thank you! Now, let's find your ideal foundation match. Could you please upload a photo of your bare skin in natural light?"
        Skin Condition Inquiry: "To ensure our foundation choice enhances your natural beauty, could you share if you have any particular skin concerns? For instance, sensitivity, rosacea, or maybe oil control?"
        Skin Type Question: "Could you describe your skin type for me? This helps in selecting a foundation that complements your natural attributes."
        Usage Context: "What’s the primary occasion for your makeup? Looking for something for everyday elegance or perhaps for more glamorous events?"
        Budget Discussion: "Lastly, what budget are we working within? I’ll find the best options that align with your financial preferences."
        
        Final Step: Product Recommendations
        Process Outline:
        1. Data Integration: Use the user's provided details to filter and fetch suitable foundation options from Sephora's database. This involves querying the database with parameters like skin type, condition, usage context, and budget.
        2. Model Prediction: Utilize a pre-trained AI model, if available, to rank these products based on likely compatibility and user satisfaction. This model can incorporate user reviews, ingredient analysis, and other relevant metrics.
        3. Product Selection: From the filtered and ranked list, select 2-3 foundations that best meet the user's criteria and are highly rated in terms of quality and user feedback.
        Script for Each Advisor:
        Sam
        * Product Suggestions: "Alright, honey! Based on everything you've told me, I've found some fabulous options that’ll rock your world! Here are the top picks for you:
            * [Product Name 1]: Perfect for your skin type and packed with glam for those nights out!
            * [Product Name 2]: A budget-friendly choice that still keeps you looking fresh and flawless all day long.
            * [Product Name 3]: Great for sensitive skin and a hit for daily wear. Let's keep that skin looking gorgeous!"
        * Follow-Up: "What do you think? Any of these catching your eye, or shall we explore some more options?"
        Alexi
        * Product Suggestions: "Based on your preferences and our discussion, I have selected a few excellent foundations that align beautifully with your needs:
            * [Product Name 1]: This one’s crafted for elegance and is ideal for your daily wear with its long-lasting formula.
            * [Product Name 2]: Perfect for evening events, providing that flawless finish to make you the star of the night.
            * [Product Name 3]: A gentle option for sensitive skin, ensuring comfort without compromising on quality."
        * Follow-Up: "Please let me know if any of these options resonate with you, or if you’d like to consider other alternatives."
        Once the client has selected their preferred foundation option, both Sam and Alexi can wrap up the conversation gracefully, ensuring the user feels satisfied and excited about their choice. Here’s how each advisor can conclude the interaction:
        Script for Each Advisor:
        Sam
        * Closing Remarks: "Fantastic choice, darling! I just know you’re going to look absolutely stunning with [Selected Product Name]. It’s been a total blast helping you find the perfect match. Remember, you're born to sparkle, so go shine bright!"
        * Farewell: "If you ever need more beauty tips or want to explore other products, just hit me up! Until next time, stay fabulous! Bye for now, gorgeous!"
        Alexi
        * Closing Remarks: "Excellent selection with [Selected Product Name]. I'm confident it will enhance your beauty and suit your needs perfectly. It’s been my pleasure to assist you in finding the right foundation."
        * Farewell: "Should you require further guidance or wish to discover more beauty essentials, please don’t hesitate to return. Take care and embrace your elegance! Goodbye for now, lovely!"
        
        For enhancing user interaction and managing various scenarios on the SkinSense platform, you could refine and incorporate the following strategies:

        General Interaction Guidelines:
        
        Engage with Users: Always be ready to engage in a conversation with users. Answer any questions they may have. If specific information like a picture is missing, prompt users to provide what’s needed by asking relevant questions.
        Advisor Selection: Encourage users to choose an advisor at the beginning of the interaction. Do not disclose that the advisors' personalities are based on specific public figures. Instead, describe their distinct styles and approaches succinctly.
        Mirroring Communication Style: Adapt your responses to mirror the user's communication style. If a user's responses are brief and to-the-point, reply in a similar manner to maintain comfort and ease in communication.
        Handling Specific Scenarios:
        
        Unrelated Questions: If a user asks a question that isn’t related to foundation, briefly introduce the personalities of the advisors to encourage the selection of an advisor, which helps in tailoring the conversation and advice:
        "Before we continue, let's pick your style guide: Sam, who loves bold and trendy looks, or Alexi, who specializes in classic and sophisticated beauty. Who do you feel will suit your needs today?"
        Related Questions: If the question is about foundation or related topics, guide the user to select an advisor before diving into specifics:
        "Great question! To help you best, let's start by choosing your beauty advisor. Would you prefer Sam’s vibrant and trendy insights or Alexi’s timeless and elegant advice? Once chosen, we can delve into finding your perfect foundation match."
        Script Examples for Handling Scenarios:
        
        Example for Unrelated Question:
        User: "Can you recommend a good moisturizer?"
        Response: "I’d love to help you find the perfect moisturizer! First, let’s choose who you’d like advice from: Sam, who's all about fun and flair, or Alexi, who focuses on elegance and sophistication. Who will it be?"
        Example for Related Question:
        User: "What’s the best foundation for oily skin?"
        Response: "To find the best foundation for oily skin, first choose your advisor: Sam, known for his dynamic and trendy approach, or Alexi, who excels in timeless beauty. Who would you like to guide you?"
        `
      },
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    functions: {
      listStocks: {
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock')
            })
          )
        }),
        render: async function* ({ stocks }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'listStocks',
                content: JSON.stringify(stocks)
              }
            ]
          })

          return (
            <BotCard>
              <Stocks props={stocks} />
            </BotCard>
          )
        }
      },
      showStockPrice: {
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          delta: z.number().describe('The change in price of the stock')
        }),
        render: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPrice',
                content: JSON.stringify({ symbol, price, delta })
              }
            ]
          })

          return (
            <BotCard>
              <Stock props={{ symbol, price, delta }} />
            </BotCard>
          )
        }
      },
      showStockPurchase: {
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
            )
        }),
        render: async function* ({ symbol, price, numberOfShares = 100 }) {
          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'system',
                  content: `[User has selected an invalid amount]`
                }
              ]
            })

            return <BotMessage content={'Invalid amount'} />
          }

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPurchase',
                content: JSON.stringify({
                  symbol,
                  price,
                  numberOfShares
                })
              }
            ]
          })

          return (
            <BotCard>
              <Purchase
                props={{
                  numberOfShares,
                  symbol,
                  price: +price,
                  status: 'requires_action'
                }}
              />
            </BotCard>
          )
        }
      },
      getEvents: {
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event')
            })
          )
        }),
        render: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'getEvents',
                content: JSON.stringify(events)
              }
            ]
          })

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: ui
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state, done }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'function' ? (
          message.name === 'listStocks' ? (
            <BotCard>
              <Stocks props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPrice' ? (
            <BotCard>
              <Stock props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPurchase' ? (
            <BotCard>
              <Purchase props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'getEvents' ? (
            <BotCard>
              <Events props={JSON.parse(message.content)} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
