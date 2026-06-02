import { config } from 'dotenv'
config({ path: '.env.local' })

async function runTests() {
  console.log('=== DATA LAYER AUDIT ===')

  const [
    { getAllStories },
    { getAllRadioMoments },
    { getAllCircuits },
    { getSeasonStandings },
    { getLatestNews },
    { getF1Context },
  ] = await Promise.all([
    import('@/lib/data/stories'),
    import('@/lib/data/radio'),
    import('@/lib/data/circuits'),
    import('@/lib/data/f1'),
    import('@/lib/data/news'),
    import('@/lib/f1Calendar'),
  ])
  
  const context = await getF1Context()
  console.log('F1 Context:', JSON.stringify(context, null, 2))
  
  const stories = await getAllStories()
  console.log(`Stories: ${stories.length} (expected 17)`)
  if (stories.length !== 17) console.error('FAIL: story count mismatch')
  
  const radio = await getAllRadioMoments()
  console.log(`Radio: ${radio.length} (expected 14)`)
  if (radio.length !== 14) console.error('FAIL: radio count mismatch')
  
  const circuits = await getAllCircuits()
  console.log(`Circuits: ${circuits.length} (expected 29)`)
  
  const standings = await getSeasonStandings(2025)
  console.log(`2025 Standings drivers: ${standings?.drivers?.length || 0}`)
  
  const news = await getLatestNews(5)
  console.log(`News: ${news.length} items`)
  
  console.log('=== AUDIT COMPLETE ===')
}

runTests().catch(console.error)
