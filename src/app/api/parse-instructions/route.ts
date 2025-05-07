import { NextRequest, NextResponse } from 'next/server'
import { ParserType, SolanaFMParser, checkIfInstructionParser } from '@solanafm/explorer-kit'
import { getProgramIdl } from '@solanafm/explorer-kit-idls'

export async function POST(request: NextRequest) {
  try {
    const { instructions } = await request.json()
    if (!Array.isArray(instructions)) {
      return NextResponse.json({ error: 'Instructions array required' }, { status: 400 })
    }

    const parsedInstructions = await Promise.all(
      instructions.map(async (ix: any) => {
        try {
          const idlItem = await getProgramIdl(ix.programId)
          if (idlItem) {
            const parser = new SolanaFMParser(idlItem, ix.programId)
            const instructionParser = parser.createParser(ParserType.INSTRUCTION)
            if (instructionParser && checkIfInstructionParser(instructionParser)) {
              const decodedData = instructionParser.parseInstructions(ix.data)
              return { ...ix, decodedData }
            }
          }
          return ix
        } catch (error) {
          console.error(`Error parsing instruction for program ${ix.programId}:`, error)
          return ix
        }
      })
    )

    return NextResponse.json({ parsedInstructions })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || 'Failed to parse instructions' }, { status: 500 })
  }
} 