export type ZkLoginProofPoints = {
  a: string[]
  b: string[][]
  c: string[]
}

export type ZkLoginClaim = {
  value: string
  indexMod4: number
}

export type ZkLoginSignatureInputs = {
  proofPoints: ZkLoginProofPoints
  issBase64Details: ZkLoginClaim
  headerBase64: string
  addressSeed: string
}

type JsonRecord = Record<string, unknown>

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
}

function isStringMatrix(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every(isStringArray)
}

export function normalizeZkLoginSignatureInputs(value: unknown, addressSeed: string): ZkLoginSignatureInputs {
  const payload = value as JsonRecord
  const proofPoints = payload.proofPoints as JsonRecord
  const claim = payload.issBase64Details as JsonRecord

  if (
    !proofPoints ||
    !isStringArray(proofPoints.a) ||
    !isStringMatrix(proofPoints.b) ||
    !isStringArray(proofPoints.c) ||
    !claim ||
    typeof claim.value !== "string" ||
    typeof claim.indexMod4 !== "number" ||
    typeof payload.headerBase64 !== "string" ||
    typeof addressSeed !== "string" ||
    addressSeed.length === 0
  ) {
    throw new Error("zkLogin prover response is missing required signature inputs")
  }

  return {
    proofPoints: {
      a: proofPoints.a,
      b: proofPoints.b,
      c: proofPoints.c,
    },
    issBase64Details: {
      value: claim.value,
      indexMod4: claim.indexMod4,
    },
    headerBase64: payload.headerBase64,
    addressSeed,
  }
}
