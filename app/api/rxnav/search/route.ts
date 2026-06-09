import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Search RxNav for approximate matches
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=10`,
    )

    if (!response.ok) {
      throw new Error("RxNav API request failed")
    }

    const data = await response.json()
    const candidates = data.approximateGroup?.candidate || []

    // Get detailed info for each candidate
    const results = await Promise.all(
      candidates.slice(0, 10).map(async (candidate: any) => {
        try {
          const detailResponse = await fetch(
            `https://rxnav.nlm.nih.gov/REST/rxcui/${candidate.rxcui}/allProperties.json?prop=all`,
          )
          const detailData = await detailResponse.json()

          // Get NDC codes
          const ndcResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${candidate.rxcui}/ndcs.json`)
          const ndcData = await ndcResponse.json()
          const ndcCodes = ndcData.ndcGroup?.ndcList?.ndc || []

          return {
            rxcui: candidate.rxcui,
            name: candidate.name,
            score: candidate.score,
            ndc: ndcCodes[0] || null,
            ndcCodes: ndcCodes,
          }
        } catch (error) {
          console.error("[v0] Error fetching details for", candidate.rxcui, error)
          return null
        }
      }),
    )

    return NextResponse.json({
      results: results.filter((r) => r !== null),
    })
  } catch (error) {
    console.error("[v0] RxNav search error:", error)
    return NextResponse.json({ error: "Failed to search medications" }, { status: 500 })
  }
}
